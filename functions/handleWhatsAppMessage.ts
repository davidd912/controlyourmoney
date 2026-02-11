import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Twilio שולחת נתונים בפורמט Form ולא JSON
    const formData = await req.formData();
    const from = formData.get('From'); // מספר הטלפון של השולח (למשל whatsapp:+972...)
    const body = formData.get('Body'); // תוכן ההודעה ששלחת

    if (!from || !body) {
      return Response.json({ error: 'Missing From or Body' }, { status: 400 });
    }

    // ניקוי המספר כדי שיכיל רק ספרות (לפעמים מגיע עם הקידומת whatsapp:)
    const cleanFrom = from.replace('whatsapp:', '');

    // Check if WhatsApp number is already linked to a household
    const households = await base44.asServiceRole.entities.Household.filter({ whatsapp_number: cleanFrom });
    
    let household = households?.[0];

    // If no household found, check if this is an activation code
    if (!household) {
      const code = body.trim();
      
      // Find household with this activation code
      const allHouseholds = await base44.asServiceRole.entities.Household.list();
      const matchingHousehold = allHouseholds.find(h => {
        if (h.activation_code !== code) return false;
        if (!h.activation_code_expires) return false;
        const expiresAt = new Date(h.activation_code_expires);
        return expiresAt > new Date();
      });

      if (matchingHousehold) {
        // Link WhatsApp number to household
        await base44.asServiceRole.entities.Household.update(matchingHousehold.id, {
          whatsapp_number: cleanFrom,
          activation_code: null,
          activation_code_expires: null
        });

        return Response.json({ 
          reply: `שלום! 👋 אני Flowli AI עוזר התקציב החכם שלך. אני כאן לעזור לך לנהל את הכספים שלך!\n\nאת התקציב בצורה חכמה, לעזור להתחסכן, ולעקוב אחר ההוצאות שלך! ועוד שלל פעולות. אני אוכל לעזור לך רחוק?\n\n🔍 *מה אני יכול לעשות?*\n\n💰 *ניהול תקציב:*\n• *להוסיף הוצאות והכנסות* (לדוגמה: "הוסף הוצאה 50 שקל בסופר היום")\n• *להציג את נתוני התקציב שלך* (כמה הוצאה, כמה נכנס וכו')\n📊 *לעקוב אחר ההתקדמות החודשית שלך*\n✏️ *לעדכן או למחוק פריטים מהתקציב*\n🌐 *לחפש מידע באינטרנט*\n🌍 *לחפש חדשות אקטואליות*\n\nאין תרגיע שאתחיל?`
        });
      } else {
        return Response.json({ 
          reply: `👋 שלום! אני Flowli AI העוזר החכם שלך. אני כאן לעזור לך לנהל את הכספים שלך!\n\n🔐 כדי להתחיל, עבור לאפליקציה, צור קוד הפעלה, ושלח אותו לכאן.\n\n📱 הקוד תקף ל-24 שעות בלבד.`
        });
      }
    }

    // Household is linked - process the message
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Use AI to analyze the message
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `אתה Flowli AI, סוכן חכם לניהול תקציב משפחתי. נתח את ההודעה הבאה וזהה מה המשתמש רוצה:

הודעה: "${body}"

החזר JSON בפורמט הבא:
{
  "intent": "add_income" | "add_expense" | "query" | "edit" | "delete" | "search_web" | "help",
  "type": "income" | "expense" (רלוונטי רק ל-add),
  "amount": מספר (אם רלוונטי),
  "description": תיאור קצר (אם רלוונטי),
  "category": קטגוריה מתאימה מהרשימה הקיימת (אם רלוונטי),
  "query_type": "monthly_summary" | "total_expenses" | "total_income" | "balance" (רק אם intent=query),
  "search_term": מילת חיפוש (רק אם intent=delete או edit),
  "new_amount": סכום חדש (רק אם intent=edit),
  "search_query": שאילתת חיפוש (רק אם intent=search_web)
}

קטגוריות הכנסה: salary, allowance, other
קטגוריות הוצאה: food, leisure, clothing, household_items, home_maintenance, grooming, education, events, health, transportation, family, communication, housing, obligations, assets, finance, other

כללי זיהוי:
- מילים כמו "קיבלתי", "הופקד", "משכורת", "הכנסה" = add_income
- מילים כמו "קניתי", "שילמתי", "הוצאה", "הוסף" = add_expense
- שאלות כמו "כמה הוצאתי", "מה המצב", "יתרה" = query
- מילים כמו "תמחק", "מחק" = delete
- מילים כמו "תעדכן", "שנה" = edit
- מילים כמו "חפש בגוגל", "חפש", "מה חדש", "חדשות" = search_web
- מילים כמו "עזרה", "מה אתה יכול", "תסביר" = help`,
      response_json_schema: {
        type: "object",
        properties: {
          intent: { type: "string" },
          type: { type: "string" },
          amount: { type: "number" },
          description: { type: "string" },
          category: { type: "string" },
          query_type: { type: "string" },
          search_term: { type: "string" },
          new_amount: { type: "number" },
          search_query: { type: "string" }
        }
      }
    });

    const intent = aiResponse.intent;
    let reply = "";

    // Handle different intents
    if (intent === "add_income") {
      await base44.asServiceRole.entities.Income.create({
        household_id: household.id,
        month: currentMonth,
        year: currentYear,
        category: aiResponse.category || "other",
        amount: aiResponse.amount,
        description: aiResponse.description,
        is_current: true,
        is_budget: false
      });
      reply = `✅ הכנסה נוספה בהצלחה!\n\n💰 סכום: ₪${aiResponse.amount}\n📝 תיאור: ${aiResponse.description}\n📊 קטגוריה: ${aiResponse.category}`;

    } else if (intent === "add_expense") {
      await base44.asServiceRole.entities.Expense.create({
        household_id: household.id,
        month: currentMonth,
        year: currentYear,
        category: aiResponse.category || "other",
        amount: aiResponse.amount,
        description: aiResponse.description,
        is_current: true,
        is_budget: false,
        priority: 2
      });
      reply = `✅ הוצאה נוספה בהצלחה!\n\n💸 סכום: ₪${aiResponse.amount}\n📝 תיאור: ${aiResponse.description}\n📊 קטגוריה: ${aiResponse.category}`;

    } else if (intent === "query") {
      const incomes = await base44.asServiceRole.entities.Income.filter({
        household_id: household.id,
        month: currentMonth,
        year: currentYear,
        is_current: true
      });
      const expenses = await base44.asServiceRole.entities.Expense.filter({
        household_id: household.id,
        month: currentMonth,
        year: currentYear,
        is_current: true
      });

      const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
      const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const balance = totalIncome - totalExpense;

      if (aiResponse.query_type === "total_income") {
        reply = `💰 סך הכנסות החודש: ₪${totalIncome.toLocaleString()}`;
      } else if (aiResponse.query_type === "total_expenses") {
        reply = `💸 סך הוצאות החודש: ₪${totalExpense.toLocaleString()}`;
      } else {
        reply = `📊 סיכום החודש:\n\n💰 הכנסות: ₪${totalIncome.toLocaleString()}\n💸 הוצאות: ₪${totalExpense.toLocaleString()}\n${balance >= 0 ? '✅' : '⚠️'} יתרה: ₪${balance.toLocaleString()}`;
      }

    } else if (intent === "delete") {
      const expenses = await base44.asServiceRole.entities.Expense.filter({
        household_id: household.id,
        is_current: true
      });
      
      const matchingExpense = expenses
        .filter(e => e.description?.toLowerCase().includes(aiResponse.search_term?.toLowerCase()))
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

      if (matchingExpense) {
        await base44.asServiceRole.entities.Expense.delete(matchingExpense.id);
        reply = `🗑️ ההוצאה נמחקה בהצלחה!\n\n📝 "${matchingExpense.description}" - ₪${matchingExpense.amount}`;
      } else {
        reply = `❌ לא נמצאה הוצאה מתאימה לחיפוש "${aiResponse.search_term}"`;
      }

    } else if (intent === "edit") {
      const expenses = await base44.asServiceRole.entities.Expense.filter({
        household_id: household.id,
        is_current: true
      });
      
      const matchingExpense = expenses
        .filter(e => e.description?.toLowerCase().includes(aiResponse.search_term?.toLowerCase()))
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

      if (matchingExpense) {
        await base44.asServiceRole.entities.Expense.update(matchingExpense.id, {
          amount: aiResponse.new_amount
        });
        reply = `✏️ ההוצאה עודכנה בהצלחה!\n\n📝 "${matchingExpense.description}"\n💸 סכום חדש: ₪${aiResponse.new_amount}`;
      } else {
        reply = `❌ לא נמצאה הוצאה מתאימה לחיפוש "${aiResponse.search_term}"`;
      }

    } else {
      reply = `🤔 לא הבנתי את הבקשה. נסה שוב או שלח "עזרה" להסבר.`;
    }

    return Response.json({ reply });

  } catch (error) {
    console.error('Error handling WhatsApp message:', error);
    return Response.json({ 
      reply: `❌ אופס! משהו השתבש. נסה שוב מאוחר יותר.\n\nשגיאה: ${error.message}`
    }, { status: 500 });
  }
});