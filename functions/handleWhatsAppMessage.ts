import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    if (payload.typeWebhook !== 'incomingMessageReceived') return new Response("OK");

    const base44 = createClientFromRequest(req);
    const idInstance = Deno.env.get("idInstance");
    const apiTokenInstance = Deno.env.get("apiTokenInstance");

    const sender = payload.senderData?.chatId;
    const messageBody = payload.messageData?.textMessageData?.textMessage || "";
    const cleanFrom = sender.replace('@c.us', '').replace('+', '');

    // 1. חיפוש משק בית
    const households = await base44.asServiceRole.entities.Household.filter({ whatsapp_number: cleanFrom });
    let household = households?.[0];

    // 2. אקטיבציה
    const extractedCode = messageBody.match(/\d{6}/)?.[0];
    if (!household && extractedCode) {
      const matching = await base44.asServiceRole.entities.Household.filter({ activation_code: extractedCode });
      if (matching?.[0]) {
        await base44.asServiceRole.entities.Household.update(matching[0].id, {
          whatsapp_number: cleanFrom,
          activation_code: null
        });
        await sendWhatsApp(sender, "✅ החיבור הצליח! אני הבנקאי האישי שלכם לניהול התקציב. איך אוכל לעזור?", idInstance, apiTokenInstance);
        return new Response("OK");
      }
    }

    if (!household) {
      await sendWhatsApp(sender, "👋 שלום! אני הבנקאי לניהול התקציב. שלחו לי את קוד ההפעלה מהאפליקציה.", idInstance, apiTokenInstance);
      return new Response("OK");
    }

    // 3. קטגוריות זמינות
    const expenseCategories = ["food", "leisure", "clothing", "household_items", "home_maintenance", 
      "grooming", "education", "events", "health", "transportation", "family", "communication", 
      "housing", "obligations", "assets", "finance", "other"];
    const incomeCategories = ["salary", "allowance", "other"];
    
    const categoryLabels = {
      food: "מזון ופארמה", leisure: "פנאי ובילוי", clothing: "ביגוד והנעלה",
      household_items: "תכולת בית", home_maintenance: "אחזקת בית", grooming: "טיפוח",
      education: "חינוך", events: "אירועים ותרומות", health: "בריאות",
      transportation: "תחבורה", family: "משפחה", communication: "תקשורת",
      housing: "דיור", obligations: "התחייבויות", assets: "נכסים", finance: "פיננסים",
      salary: "שכר", allowance: "קצבאות", other: "אחר"
    };

    // 4. עיבוד AI
    const aiDecision = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `אתה בנקאי אישי לניהול תקציב. נתח את ההודעה: "${messageBody}".
      
קטגוריות הוצאה זמינות: ${expenseCategories.map(c => `${c} (${categoryLabels[c]})`).join(', ')}
קטגוריות הכנסה זמינות: ${incomeCategories.map(c => `${c} (${categoryLabels[c]})`).join(', ')}

החזר JSON בפורמט הבא:
- intent: "add_expense" (הוצאה), "add_income" (הכנסה), "get_summary_expenses" (סיכום הוצאות), "get_summary_incomes" (סיכום הכנסות)
- amount: מספר (אם רלוונטי)
- description: תיאור קצר
- category: בחר מהרשימה למעלה (הכנסה/הוצאה לפי הכוונה). אם לא בטוח - השתמש ב-"other"
- period: "today" (היום), "week" (השבוע), "month" (החודש) - רלוונטי רק לסיכומים
- merchant: שם העסק/סוחר אם מזוהה בטקסט`,
      response_json_schema: {
        type: "object",
        properties: {
          intent: { type: "string" },
          amount: { type: "number" },
          description: { type: "string" },
          category: { type: "string" },
          period: { type: "string" },
          merchant: { type: "string" }
        }
      }
    });

    let finalReply = "מצטער, לא הצלחתי לעבד את הבקשה.";
    const now = new Date();

    // 5. לוגיקת ביצוע
    if (aiDecision.intent === 'add_expense' || aiDecision.intent === 'add_income') {
      const entityName = aiDecision.intent === 'add_expense' ? 'Expense' : 'Income';
      const validCategories = aiDecision.intent === 'add_expense' ? expenseCategories : incomeCategories;
      
      // בדיקת חוק סוחר (MerchantRule)
      let finalCategory = aiDecision.category || 'other';
      if (aiDecision.merchant) {
        const merchantKey = aiDecision.merchant.toLowerCase().trim();
        const merchantRules = await base44.asServiceRole.entities.MerchantRule.filter({
          household_id: household.id,
          key: merchantKey
        });
        if (merchantRules?.[0]) {
          finalCategory = merchantRules[0].default_category_id || finalCategory;
          // עדכון שימוש
          await base44.asServiceRole.entities.MerchantRule.update(merchantRules[0].id, {
            times_used: (merchantRules[0].times_used || 0) + 1,
            last_used_at: now.toISOString()
          });
        }
      }
      
      // וידוא שהקטגוריה תקינה
      if (!validCategories.includes(finalCategory)) {
        finalCategory = 'other';
      }
      
      await base44.asServiceRole.entities[entityName].create({
        household_id: household.id,
        amount: aiDecision.amount || 0,
        description: aiDecision.description || messageBody,
        category: finalCategory,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        is_current: true,
        is_budget: false
      });
      
      const categoryLabel = categoryLabels[finalCategory] || finalCategory;
      finalReply = `✅ רשמתי ${aiDecision.intent === 'add_expense' ? 'הוצאה' : 'הכנסה'} של ₪${aiDecision.amount}\nקטגוריה: ${categoryLabel}\nתיאור: ${aiDecision.description}`;
    } 
    else if (aiDecision.intent === 'get_summary_expenses' || aiDecision.intent === 'get_summary_incomes') {
      const isExpense = aiDecision.intent === 'get_summary_expenses';
      const entityName = isExpense ? 'Expense' : 'Income';
      
      // חישוב טווח תאריכים
      const startDate = new Date();
      const endDate = new Date();
      
      if (aiDecision.period === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (aiDecision.period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        // חודש - מתחילת החודש
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      }
      
      // שליפת כל הפריטים של החודש ואז סינון לפי תאריך יצירה
      const allItems = await base44.asServiceRole.entities[entityName].filter({
        household_id: household.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        is_current: true
      });
      
      const filteredItems = allItems.filter(item => {
        const itemDate = new Date(item.created_date);
        return itemDate >= startDate && itemDate <= endDate;
      });
      
      const total = filteredItems.reduce((s, i) => s + (i.amount || 0), 0);
      const periodLabel = aiDecision.period === 'today' ? 'היום' : aiDecision.period === 'week' ? 'השבוע' : 'החודש';
      const typeLabel = isExpense ? 'הוצאות' : 'הכנסות';
      
      if (filteredItems.length === 0) {
        finalReply = `📊 אין ${typeLabel} ${periodLabel}`;
      } else {
        const itemsList = filteredItems.slice(0, 15).map(i => {
          const cat = categoryLabels[i.category] || i.category;
          return `• ${i.description || cat}: ₪${i.amount}`;
        }).join('\n');
        
        const moreText = filteredItems.length > 15 ? `\n\n(ועוד ${filteredItems.length - 15} פריטים...)` : '';
        finalReply = `📊 ${typeLabel} ${periodLabel}:\n\nסה"כ: ₪${total.toLocaleString()}\nמספר פריטים: ${filteredItems.length}\n\n${itemsList}${moreText}`;
      }
    }

    await sendWhatsApp(sender, finalReply, idInstance, apiTokenInstance);
    return new Response("OK");

  } catch (e) {
    console.error("Error:", e.message);
    return new Response("OK");
  }
});

async function sendWhatsApp(chatId, text, id, token) {
  await fetch(`https://7103.api.greenapi.com/waInstance${id}/sendMessage/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message: text })
  });
}