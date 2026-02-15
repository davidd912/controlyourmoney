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

    // 1. חיפוש משק בית לפי מספר וואטסאפ במערך whatsapp_numbers
    const allHouseholds = await base44.asServiceRole.entities.Household.list();
    let household = allHouseholds.find(h => 
      h.whatsapp_numbers && Array.isArray(h.whatsapp_numbers) && h.whatsapp_numbers.includes(cleanFrom)
    );

    // 2. אם לא נמצא משק בית - נסה לזהות קוד אקטיבציה
    if (!household) {
      const extractedCode = messageBody.match(/\d{6}/)?.[0];
      
      if (extractedCode) {
        // בדיקה אם הקוד תקין
        const matching = await base44.asServiceRole.entities.Household.filter({ activation_code: extractedCode });
        if (matching?.[0]) {
          const targetHousehold = matching[0];
          const currentNumbers = targetHousehold.whatsapp_numbers || [];
          
          // הוספת המספר החדש למערך
          await base44.asServiceRole.entities.Household.update(targetHousehold.id, {
            whatsapp_numbers: [...currentNumbers, cleanFrom],
            activation_code: null,
            expires_at: targetHousehold.expires_at || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          });
          
          await sendWhatsApp(sender, "✅ החיבור הצליח! אני הבנקאי האישי שלכם לניהול התקציב. איך אוכל לעזור?", idInstance, apiTokenInstance);
          return new Response("OK");
        }
      }
      
      // אם אין קוד או הקוד לא תקין - בקש קוד הפעלה
      await sendWhatsApp(sender, "👋 שלום! אני הבנקאי לניהול התקציב. שלחו לי את קוד ההפעלה מהאפליקציה.", idInstance, apiTokenInstance);
      return new Response("OK");
    }

    // 3. בדיקת גישה לשירות WhatsApp לפי subscription_type ו-expires_at
    const subscriptionType = household.subscription_type || 'trial';
    
    // אם manual_premium - גישה תמיד מותרת
    if (subscriptionType === 'manual_premium') {
      // המשך רגיל - אין חסימה
    } else {
      // לכל השאר - בדיקת expires_at
      const now = new Date();
      const expiresAt = household.expires_at ? new Date(household.expires_at) : null;
      
      if (!expiresAt || now > expiresAt) {
        await sendWhatsApp(
          sender,
          '⏰ תקופת הניסיון בשירות הוואטסאפ הסתיימה.\n\nתוכלו להמשיך להשתמש באפליקציה בצורה רגילה ולנהל את התקציב ידנית. רק שירות הבוט בוואטסאפ מוגבל למנויי פרימיום.\n\nמעוניינים לשדרג? צרו קשר דרך האפליקציה.',
          idInstance,
          apiTokenInstance
        );
        return new Response("OK");
      }
    }

    // 4. קטגוריות זמינות
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

    // 5. עיבוד AI
    const aiDecision = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `אתה בנקאי אישי לניהול תקציב. נתח את ההודעה: "${messageBody}".
      
קטגוריות הוצאה זמינות: ${expenseCategories.map(c => `${c} (${categoryLabels[c]})`).join(', ')}
קטגוריות הכנסה זמינות: ${incomeCategories.map(c => `${c} (${categoryLabels[c]})`).join(', ')}

הנחיות מיוחדות לזיהוי:
- אם ההודעה מכילה "סופר", "סופרמרקט", "שופרסל", "רמי לוי" - סווג כ-"food" (מזון ופארמה)
- אם ההודעה מכילה "משחק", "משחקים", "צעצוע", "צעצועים" - סווג כ-"leisure" (פנאי ובילוי)
- אם המשתמש מבקש סיכום וגם מציין קטגוריה ספציפית (לדוגמה: "הראה לי הוצאות מזון לחודש זה"), החזר את שם הקטגוריה ב-summary_category

החזר JSON בפורמט הבא:
- intent: "add_expense" (הוצאה), "add_income" (הכנסה), "get_summary_expenses" (סיכום הוצאות), "get_summary_incomes" (סיכום הכנסות)
- amount: מספר (אם רלוונטי)
- description: תיאור קצר
- category: בחר מהרשימה למעלה (הכנסה/הוצאה לפי הכוונה). אם לא בטוח - השתמש ב-"other"
- period: "today" (היום), "week" (השבוע), "month" (החודש) - רלוונטי רק לסיכומים
- merchant: שם העסק/סוחר אם מזוהה בטקסט
- summary_category: קטגוריה ספציפית לסיכום (אם רלוונטי, אחרת null)`,
      response_json_schema: {
        type: "object",
        properties: {
          intent: { type: "string" },
          amount: { type: "number" },
          description: { type: "string" },
          category: { type: "string" },
          period: { type: "string" },
          merchant: { type: "string" },
          summary_category: { type: "string" }
        }
      }
    });

    let finalReply = "מצטער, לא הצלחתי לעבד את הבקשה.";
    const now = new Date();

    // 6. לוגיקת ביצוע
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

      let filteredItems = allItems.filter(item => {
        const itemDate = new Date(item.created_date);
        return itemDate >= startDate && itemDate <= endDate;
      });

      // סינון לפי קטגוריה ספציפית אם נדרש
      if (aiDecision.summary_category) {
        filteredItems = filteredItems.filter(item => item.category === aiDecision.summary_category);
      }

      const periodLabel = aiDecision.period === 'today' ? 'היום' : aiDecision.period === 'week' ? 'השבוע' : 'החודש';
      const typeLabel = isExpense ? 'הוצאות' : 'הכנסות';
      const categoryFilter = aiDecision.summary_category ? ` בקטגוריה ${categoryLabels[aiDecision.summary_category] || aiDecision.summary_category}` : '';

      if (filteredItems.length === 0) {
        finalReply = `📊 אין ${typeLabel}${categoryFilter} ${periodLabel}`;
      } else {
        // קיבוץ לפי קטגוריות
        const byCategory = {};
        filteredItems.forEach(item => {
          const catKey = item.category;
          if (!byCategory[catKey]) {
            byCategory[catKey] = { items: [], total: 0 };
          }
          byCategory[catKey].items.push(item);
          byCategory[catKey].total += (item.amount || 0);
        });

        const total = filteredItems.reduce((s, i) => s + (i.amount || 0), 0);

        // בניית הסיכום
        let summaryText = `📊 ${typeLabel}${categoryFilter} ${periodLabel}:\n\n`;
        summaryText += `💰 סה"כ: ₪${total.toLocaleString()}\n`;
        summaryText += `📝 מספר פריטים: ${filteredItems.length}\n\n`;

        // פירוט לפי קטגוריות
        if (!aiDecision.summary_category && Object.keys(byCategory).length > 1) {
          summaryText += `📑 פירוט לפי קטגוריות:\n`;
          Object.keys(byCategory).forEach(catKey => {
            const catLabel = categoryLabels[catKey] || catKey;
            const catTotal = byCategory[catKey].total;
            const catCount = byCategory[catKey].items.length;
            summaryText += `\n${catLabel}: ₪${catTotal.toLocaleString()} (${catCount} פריטים)`;
          });
          summaryText += `\n\n`;
        }

        // רשימת פריטים בודדים (עד 10)
        summaryText += `📋 פירוט פריטים:\n`;
        const itemsList = filteredItems.slice(0, 10).map(i => {
          const cat = categoryLabels[i.category] || i.category;
          return `• ${i.description || cat}: ₪${i.amount.toLocaleString()}`;
        }).join('\n');

        summaryText += itemsList;

        if (filteredItems.length > 10) {
          summaryText += `\n\n(ועוד ${filteredItems.length - 10} פריטים...)`;
        }

        finalReply = summaryText;
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