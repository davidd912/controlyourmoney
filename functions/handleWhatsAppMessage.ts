import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    console.log('Green API Webhook received:', JSON.stringify(payload));

    // Extract message data from Green API webhook
    const typeWebhook = payload?.typeWebhook;
    const messageData = payload?.messageData;
    const senderData = payload?.senderData;

    if (typeWebhook !== 'incomingMessageReceived' || !messageData || !senderData) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'Not an incoming message' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const sender = senderData.chatId;
    const messageBody = messageData.textMessageData?.textMessage;

    if (!sender || !messageBody) {
      console.error('Missing sender or message body');
      return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
    }

    // Clean phone number format
    const cleanFrom = sender.replace('@c.us', '').replace('+', '');
    const trimmedMessage = messageBody.trim();

    const idInstance = Deno.env.get("idInstance");
    const apiTokenInstance = Deno.env.get("apiTokenInstance");

    if (!idInstance || !apiTokenInstance) {
      console.error('Green API credentials not configured');
      return new Response(JSON.stringify({ error: 'Configuration error' }), { status: 500 });
    }

    let replyText = "";
    let household = null;

    // Try to find household linked to this WhatsApp number
    const householdsByNumber = await base44.asServiceRole.entities.Household.filter({
      whatsapp_number: cleanFrom
    });
    household = householdsByNumber?.[0];

    if (!household) {
      // Check if this is an activation code (6 digits)
      const activationCode = trimmedMessage;
      const matchingHouseholds = await base44.asServiceRole.entities.Household.filter({
        activation_code: activationCode,
        activation_code_expires: { "$gt": new Date().toISOString() }
      });

      const potentialHousehold = matchingHouseholds?.[0];

      if (potentialHousehold) {
        // Link household to this WhatsApp number
        await base44.asServiceRole.entities.Household.update(potentialHousehold.id, {
          whatsapp_number: cleanFrom,
          activation_code: null,
          activation_code_expires: null
        });
        household = potentialHousehold;
        replyText = `✅ *חיבור הצליח!*\n\nשלום! 👋 אני Flowli AI עוזר התקציב החכם שלך.\n\n🔍 *מה אני יכול לעשות?*\n\n💰 *להוסיף הוצאות והכנסות*\nלדוגמה: "שילמתי 50 שקל בסופר"\n\n📊 *לעקוב אחר התקציב*\n"כמה בזבזתי החודש?"\n\n✨ בואו נתחיל!`;
      } else {
        replyText = `👋 *שלום! אני Flowli AI*\n\nאני העוזר החכם לניהול התקציב שלך 💰\n\n🔐 *כדי להתחיל:*\n1️⃣ היכנס לאפליקציה\n2️⃣ צור קוד הפעלה\n3️⃣ שלח אותו לכאן\n\n📱 הקוד תקף ל-24 שעות בלבד.`;
      }
    } else {
      // Household is linked - process the message with AI
      try {
        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `אתה סוכן חכם לניהול תקציב משפחתי. תפקידך לנתח הודעות משתמש מוואטסאפ ולהחזיר אך ורק אובייקט JSON תקין.

🎯 המטרה שלך:
לזהות את כוונת המשתמש (Intent) ולחלץ נתונים פיננסיים (סכום, תיאור וקטגוריה).

📊 קטגוריות מותרות (חובה להשתמש רק בהן):
הוצאות: food, leisure, clothing, household_items, home_maintenance, grooming, education, events, health, transportation, family, communication, housing, obligations, assets, finance, other.

הכנסות: salary, allowance, other.

🛠️ לוגיקת זיהוי:
- add_expense: כשהמשתמש מדווח על קנייה או הוצאה (למשל: "שילמתי 50 שח בסופר").
- add_income: כשהמשתמש מדווח על כסף שנכנס (למשל: "קיבלתי משכורת").
- query: כשהמשתמש שואל שאלות על מצב החשבון (למשל: "כמה בזבזתי החודש?").

⚠️ הנחיות פורמט:
עליך להחזיר JSON נקי בלבד. מבנה הפלט:
{
  "intent": "add_expense" | "add_income" | "query",
  "amount": number (או null אם אין),
  "description": "string",
  "category": "string" (מהרשימה המותרת)
}

🔍 הודעת המשתמש:
"${trimmedMessage}"

נתח את ההודעה והחזר JSON תקין בלבד.`,
          response_json_schema: {
            type: "object",
            properties: {
              intent: { 
                type: "string",
                enum: ["add_expense", "add_income", "query"]
              },
              amount: { 
                type: ["number", "null"]
              },
              description: { 
                type: "string"
              },
              category: { 
                type: "string"
              }
            },
            required: ["intent", "description"]
          }
        });

        console.log('AI Response:', JSON.stringify(aiResponse));

        const { intent, amount, description, category } = aiResponse;

        // Get current date for month/year
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        if (intent === 'add_expense' && amount && category) {
          // Add expense to database
          await base44.asServiceRole.entities.Expense.create({
            household_id: household.id,
            month: currentMonth,
            year: currentYear,
            category: category,
            amount: amount,
            description: description,
            is_current: true,
            is_budget: false,
            priority: 3
          });

          replyText = `✅ *הוצאה נוספה בהצלחה!*\n\n💸 סכום: ₪${amount.toLocaleString()}\n📝 תיאור: ${description}\n🏷️ קטגוריה: ${getCategoryLabel(category)}`;
        } else if (intent === 'add_income' && amount && category) {
          // Add income to database
          await base44.asServiceRole.entities.Income.create({
            household_id: household.id,
            month: currentMonth,
            year: currentYear,
            category: category,
            amount: amount,
            description: description,
            is_current: true,
            is_budget: false
          });

          replyText = `✅ *הכנסה נוספה בהצלחה!*\n\n💰 סכום: ₪${amount.toLocaleString()}\n📝 תיאור: ${description}\n🏷️ קטגוריה: ${getCategoryLabel(category)}`;
        } else if (intent === 'query') {
          // Query budget information
          const expenses = await base44.asServiceRole.entities.Expense.filter({
            household_id: household.id,
            month: currentMonth,
            year: currentYear,
            is_current: true
          });

          const incomes = await base44.asServiceRole.entities.Income.filter({
            household_id: household.id,
            month: currentMonth,
            year: currentYear,
            is_current: true
          });

          const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
          const totalIncomes = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
          const balance = totalIncomes - totalExpenses;

          replyText = `📊 *סיכום תקציב חודשי*\n\n💰 הכנסות: ₪${totalIncomes.toLocaleString()}\n💸 הוצאות: ₪${totalExpenses.toLocaleString()}\n📈 יתרה: ₪${balance.toLocaleString()}${balance < 0 ? ' ⚠️' : ' ✅'}`;
        } else {
          replyText = `❓ לא הבנתי לגמרי את הבקשה.\n\n💡 *דוגמאות לשימוש:*\n• "שילמתי 50 שקל בסופר"\n• "קיבלתי משכורת 8000 שקל"\n• "כמה בזבזתי החודש?"`;
        }
      } catch (error) {
        console.error('Error processing message with AI:', error);
        replyText = `❌ אירעה שגיאה בעיבוד ההודעה.\n\n💡 נסה שוב או פנה לתמיכה.`;
      }
    }

    // Send reply via Green API
    const greenApiUrl = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
    const sendResponse = await fetch(greenApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chatId: sender,
        message: replyText
      })
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      console.error('Failed to send message via Green API:', errorData);
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error handling Green API webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Helper function to get Hebrew category labels
function getCategoryLabel(category) {
  const labels = {
    // Expenses
    food: "מזון ופארמה",
    leisure: "פנאי ובילוי",
    clothing: "ביגוד והנעלה",
    household_items: "תכולת בית",
    home_maintenance: "אחזקת בית",
    grooming: "טיפוח",
    education: "חינוך",
    events: "אירועים ותרומות",
    health: "בריאות",
    transportation: "תחבורה",
    family: "משפחה",
    communication: "תקשורת",
    housing: "דיור",
    obligations: "התחייבויות",
    assets: "נכסים",
    finance: "פיננסים",
    other: "אחר",
    // Incomes
    salary: "שכר",
    allowance: "קצבאות"
  };
  return labels[category] || category;
}