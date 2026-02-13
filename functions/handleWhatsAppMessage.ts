import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// פונקציית עזר לניקוי והכנת מספר לשליחה
const formatChatId = (number) => {
  let clean = number.replace(/\D/g, ''); // מסיר הכל חוץ ממספרים
  if (clean.startsWith('0')) {
    clean = '972' + clean.slice(1); // הופך 054 ל-97254
  }
  return clean.includes('@') ? number : `${clean}@c.us`;
};

// פונקציית עזר לשליחת הודעה
async function sendWhatsApp(chatId, text, id, token) {
  const formattedChatId = formatChatId(chatId);
  const url = `https://7103.api.greenapi.com/waInstance${id}/sendMessage/${token}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: formattedChatId, message: text })
  });
  return response;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    console.log('📨 Received webhook:', JSON.stringify(payload, null, 2));

    // בדיקת סוג ההודעה
    if (payload.typeWebhook !== 'incomingMessageReceived') {
      console.log('⏭️ Skipping non-message webhook');
      return new Response("OK", { status: 200 });
    }

    const idInstance = Deno.env.get("idInstance");
    const apiTokenInstance = Deno.env.get("apiTokenInstance");
    const sender = payload.senderData?.chatId;
    const messageBody = payload.messageData?.textMessageData?.textMessage || "";
    
    // ניקוי המספר לשמירה ב-DB
    let cleanFrom = sender.replace('@c.us', '').replace('+', '');
    if (cleanFrom.startsWith('0')) {
      cleanFrom = '972' + cleanFrom.slice(1);
    }
    
    console.log('📞 From:', cleanFrom, '💬 Message:', messageBody);

    // 1. זיהוי משק בית
    const households = await base44.asServiceRole.entities.Household.filter({
      whatsapp_number: cleanFrom
    });
    let household = households?.[0];
    console.log('🏠 Household found:', household ? household.id : 'none');

    // 2. טיפול באקטיבציה (אם המשתמש לא מזוהה)
    const extractedCode = messageBody.match(/\d{6}/)?.[0];
    if (!household && extractedCode) {
      console.log('🔑 Activation code detected:', extractedCode);
      const matching = await base44.asServiceRole.entities.Household.filter({ activation_code: extractedCode });
      if (matching?.[0]) {
        console.log('✅ Matching household found, updating...');
        await base44.asServiceRole.entities.Household.update(matching[0].id, {
          whatsapp_number: cleanFrom,
          activation_code: null
        });
        await sendWhatsApp(sender, "✅ החיבור הצליח! שלום, אני הבנקאי האישי שלכם לניהול התקציב המשפחתי. איך אוכל לעזור?", idInstance, apiTokenInstance);
        return new Response("OK", { status: 200 });
      } else {
        console.log('❌ No matching household for code');
      }
    }

    if (!household) {
      console.log('⚠️ No household found, sending activation prompt');
      await sendWhatsApp(sender, "👋 שלום! אני הבנקאי לניהול התקציב שלכם. כדי להתחיל, שלחו לי את קוד ההפעלה מהאפליקציה.", idInstance, apiTokenInstance);
      return new Response("OK", { status: 200 });
    }

    // 3. עיבוד AI מתקדם - זיהוי כוונה (Intent)
    console.log('🤖 Analyzing message with AI...');
    const aiDecision = await base44.integrations.Core.InvokeLLM({
      prompt: `אתה בנקאי אישי לניהול תקציב משפחתי. נתח את ההודעה: "${messageBody}".
      
      בחר את הכוונה המתאימה והחזר JSON עם המבנה הבא:
      {
        "intent": "add_expense" | "add_income" | "query_budget" | "general_chat",
        "amount": מספר (אם רלוונטי),
        "description": תיאור ההוצאה/הכנסה,
        "category": קטגוריה מתאימה מהרשימה
      }
      
      קטגוריות אפשריות להוצאות:
      food, leisure, clothing, household_items, home_maintenance, grooming, education, events, health, transportation, family, communication, housing, obligations, assets, finance, other
      
      קטגוריות אפשריות להכנסות:
      salary, allowance, other
      
      דוגמאות:
      - "300 שקל סופר" → {"intent": "add_expense", "amount": 300, "description": "קניות בסופר", "category": "food"}
      - "קיבלתי משכורת 8000" → {"intent": "add_income", "amount": 8000, "description": "משכורת", "category": "salary"}
      - "מה ההוצאות שלי החודש?" → {"intent": "query_budget"}
      `,
      response_json_schema: {
        type: "object",
        properties: {
          intent: { type: "string" },
          amount: { type: "number" },
          description: { type: "string" },
          category: { type: "string" }
        },
        required: ["intent"]
      }
    });

    console.log('🎯 AI Decision:', JSON.stringify(aiDecision));
    let finalReply = "מצטער, לא הצלחתי להבין את הבקשה.";

    // לוגיקה לפי כוונה
    switch (aiDecision.intent) {
      case 'add_expense':
        if (aiDecision.amount && aiDecision.description) {
          await base44.asServiceRole.entities.Expense.create({
            household_id: household.id,
            amount: aiDecision.amount,
            description: aiDecision.description,
            category: aiDecision.category || 'other',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            priority: 3,
            is_current: true,
            is_budget: false
          });
          finalReply = `✅ רשמתי הוצאה של ${aiDecision.amount} ש"ח עבור ${aiDecision.description}`;
          console.log('💰 Expense created successfully');
        } else {
          finalReply = "לא הצלחתי לזהות את הסכום או התיאור. אנא נסה שוב, למשל: '300 שקל סופר'";
        }
        break;

      case 'add_income':
        if (aiDecision.amount && aiDecision.description) {
          await base44.asServiceRole.entities.Income.create({
            household_id: household.id,
            amount: aiDecision.amount,
            description: aiDecision.description,
            category: aiDecision.category || 'other',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            is_current: true,
            is_budget: false
          });
          finalReply = `✅ רשמתי הכנסה של ${aiDecision.amount} ש"ח עבור ${aiDecision.description}`;
          console.log('💵 Income created successfully');
        } else {
          finalReply = "לא הצלחתי לזהות את הסכום או התיאור. אנא נסה שוב.";
        }
        break;

      case 'query_budget':
        // שליפת סיכום תקציב
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
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
        const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        
        finalReply = `📊 סיכום תקציב לחודש ${currentMonth}/${currentYear}:\n\n` +
          `💰 הכנסות: ${totalIncome.toLocaleString()} ש"ח\n` +
          `💸 הוצאות: ${totalExpenses.toLocaleString()} ש"ח\n` +
          `${balance >= 0 ? '✅' : '⚠️'} יתרה: ${balance.toLocaleString()} ש"ח`;
        console.log('📈 Budget query completed');
        break;

      default:
        finalReply = "👋 אני הבנקאי האישי שלכם! אני יכול לעזור לכם:\n\n" +
          "• לרשום הוצאות - למשל: '300 שקל סופר'\n" +
          "• לרשום הכנסות - למשל: 'קיבלתי 8000 משכורת'\n" +
          "• לבדוק מצב תקציב - למשל: 'מה ההוצאות שלי?'\n\n" +
          "מה תרצו לעשות?";
        console.log('💬 General chat response');
    }

    console.log('📤 Sending reply:', finalReply);
    await sendWhatsApp(sender, finalReply, idInstance, apiTokenInstance);
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error('❌ Error:', error.message, error.stack);
    return new Response("OK", { status: 200 });
  }
});