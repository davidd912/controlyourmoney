import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    
    let platform = 'unknown';
    let sender = '';
    let cleanFrom = '';
    let messageBody = '';

    // 1. ניתוב: מאיפה הגיעה ההודעה?
    if (payload.typeWebhook === 'incomingMessageReceived') {
      platform = 'whatsapp';
      const botNumber = payload.instanceData?.wid;
      const senderNumber = payload.senderData?.sender;
      if (senderNumber === botNumber) return new Response("OK");

      sender = payload.senderData?.chatId;
      messageBody = payload.messageData?.textMessageData?.textMessage || "";
      cleanFrom = sender.replace('@c.us', '').replace('+', '');
    } 
    else if (payload.message && payload.message.chat) {
      platform = 'telegram';
      sender = payload.message.chat.id.toString();
      messageBody = payload.message.text || "";
      cleanFrom = sender;
    } 
    else {
      return new Response("OK");
    }

    console.log(`[${platform.toUpperCase()}] Received: "${messageBody}" from ${cleanFrom}`);

    const base44 = createClientFromRequest(req);
    const idInstance = Deno.env.get("idInstance");
    const apiTokenInstance = Deno.env.get("apiTokenInstance");
    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    const replyToUser = async (text) => {
      if (platform === 'whatsapp') {
        await sendWhatsApp(sender, text, idInstance, apiTokenInstance);
      } else if (platform === 'telegram') {
        await sendTelegram(sender, text, telegramToken);
      }
    };

    // 2. זיהוי המשתמש
    const households = await base44.asServiceRole.entities.Household.filter({});
    let household = households.find(h => {
      if (platform === 'whatsapp') {
        return h.whatsapp_numbers && Array.isArray(h.whatsapp_numbers) && h.whatsapp_numbers.includes(cleanFrom);
      } else {
        return h.telegram_chat_ids && Array.isArray(h.telegram_chat_ids) && h.telegram_chat_ids.includes(cleanFrom);
      }
    });

    if (!household) {
      const extractedCode = messageBody.match(/\d{6}/)?.[0];
      if (extractedCode) {
        const matching = await base44.asServiceRole.entities.Household.filter({ activation_code: extractedCode });
        if (matching?.[0]) {
          const targetHousehold = matching[0];
          const updateData = {
            activation_code: null, activation_code_expires: null,
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          };
          if (platform === 'whatsapp') {
            updateData.whatsapp_numbers = [...new Set([...(targetHousehold.whatsapp_numbers || []), cleanFrom])];
          } else {
            updateData.telegram_chat_ids = [...new Set([...(targetHousehold.telegram_chat_ids || []), cleanFrom])];
          }
          await base44.asServiceRole.entities.Household.update(targetHousehold.id, updateData);
          await replyToUser("✅ החיבור הצליח! אני הבנקאי האישי שלכם לניהול התקציב. איך אוכל לעזור?");
          return new Response("OK");
        }
      }
      await replyToUser("👋 שלום! אני לא מזהה את החשבון. אנא שלח קוד אקטיבציה מהאפליקציה.");
      return new Response("OK");
    }

    // 3. הגדרות AI
    const categoryLabels = {
      food: "מזון ופארמה", leisure: "פנאי ובילוי", clothing: "ביגוד והנעלה", household_items: "תכולת בית", 
      home_maintenance: "אחזקת בית", grooming: "טיפוח", education: "חינוך", events: "אירועים ותרומות", 
      health: "בריאות", transportation: "תחבורה", family: "משפחה", communication: "תקשורת", 
      housing: "דיור", obligations: "התחייבויות", assets: "נכסים", finance: "פיננסים", salary: "שכר", other: "אחר"
    };

    const aiDecision = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `אתה מנהל תקציב חכם. המשתמש כתב: "${messageBody}".

      חוקי ברזל:
      1. הוצאה: אם המשתמש כתב סכום כלשהו (למשל: 50, 70, 600) לצד מילה כמו "סופר", "בגדים", "דלק", או "קפה" - חובה עליך להגדיר intent: "add_expense" ולחלץ את הסכום במדויק. בשום אופן אל תבחר "chat" אם יש סכום מובהק.
      2. קטגוריות: "סופר", "שופרסל", "רמי לוי", "מכולת" = food. "בגדים", "זארה" = clothing.
      3. סיכום: אם הוא שואל "כמה הוצאתי?", החזר intent: "get_summary_expenses" עם period ("today" או "month").
      4. שיחה: בחר "chat" רק אם זה "היי", "תודה", או שאלה כללית ללא סכום וללא פעולה.

      החזר JSON:`,
      response_json_schema: {
        type: "object",
        properties: {
          intent: { type: "string" }, amount: { type: "number" }, description: { type: "string" },
          category: { type: "string" }, period: { type: "string" }, chat_reply: { type: "string" }
        }
      }
    });

    let finalReply = "מצטער, לא הצלחתי לעבד את הבקשה. אנא נסה לכתוב את הסכום והתיאור ברור יותר.";
    const now = new Date();

    // 4. פעולות השרת
    if (aiDecision.intent === 'add_expense' || aiDecision.intent === 'add_income') {
      const entityName = aiDecision.intent === 'add_expense' ? 'Expense' : 'Income';
      let finalCategory = aiDecision.category || 'other';
      
      // המרה בטוחה למספר וחילוץ תאריכים
      const finalAmount = Number(aiDecision.amount) || 0;

      // שמירה ב-DB כולל הזרקת תאריכים מפורשת לאתר
      await base44.asServiceRole.entities[entityName].create({
        household_id: household.id,
        amount: finalAmount,
        description: aiDecision.description || messageBody,
        category: finalCategory,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        created_at: now.toISOString(),
        created_date: now.toISOString(),
        transaction_date: now.toISOString(),
        is_current: true,
        is_budget: false
      });
      
      const categoryLabel = categoryLabels[finalCategory] || finalCategory;
      let budgetInfo = '';
      
      if (aiDecision.intent === 'add_expense') {
        try {
          const budgetItems = await base44.asServiceRole.entities.Expense.filter({
            household_id: household.id, category: finalCategory, month: now.getMonth() + 1, year: now.getFullYear(), is_budget: true
          });
          
          if (budgetItems?.[0]) {
            const budgetAmount = budgetItems[0].amount || 0;
            const currentExpenses = await base44.asServiceRole.entities.Expense.filter({
              household_id: household.id, category: finalCategory, month: now.getMonth() + 1, year: now.getFullYear(), is_current: true
            });
            const totalSpent = currentExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            const remaining = budgetAmount - totalSpent;
            
            budgetInfo = remaining < 0 ? `\n⚠️ חרגת ב-₪${Math.abs(remaining).toLocaleString()} מהתקציב.` : `\n💰 נותרו ₪${remaining.toLocaleString()} בתקציב.`;
          }
        } catch (e) { console.log(e); }
      }
      
      finalReply = `✅ רשמתי ₪${finalAmount} ל-${categoryLabel}.${budgetInfo}`;
    } 
    else if (aiDecision.intent === 'chat') {
      finalReply = aiDecision.chat_reply || "שמח לעזור! ספרו לי מה קניתם וכמה זה עלה.";
    } 
    else if (aiDecision.intent === 'get_summary_expenses' || aiDecision.intent === 'get_summary_incomes') {
      const entityName = aiDecision.intent === 'get_summary_expenses' ? 'Expense' : 'Income';
      const allItems = await base44.asServiceRole.entities[entityName].filter({ 
        household_id: household.id, month: now.getMonth() + 1, year: now.getFullYear(), is_current: true 
      });
      
      if (!allItems || allItems.length === 0) {
        finalReply = `📊 אין עדיין רישומים לחודש זה.`;
      } else {
        const total = allItems.reduce((s, i) => s + (i.amount || 0), 0);
        finalReply = `📊 סיכום לחודש זה:\n\n💰 סה"כ: ₪${total.toLocaleString()}\n📝 פריטים החודש: ${allItems.length}`;
      }
    }

    await replyToUser(finalReply);
    return new Response("OK");

  } catch (e) {
    console.error("[Bot Error]:", e.message, e.stack);
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

async function sendTelegram(chatId, text, token) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}