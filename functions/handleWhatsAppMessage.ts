import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    
    let platform = 'unknown';
    let sender = '';
    let cleanFrom = '';
    let messageBody = '';
    let isCallback = false;
    let callbackQueryId = null;

    // 1. ניתוב: מאיפה הגיעה ההודעה ואיזה סוג היא?
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
    else if (payload.callback_query) {
      platform = 'telegram';
      isCallback = true;
      callbackQueryId = payload.callback_query.id;
      sender = payload.callback_query.message.chat.id.toString();
      cleanFrom = sender;
      
      const data = payload.callback_query.data;
      if (data === 'get_monthly_summary') messageBody = "סיכום חודשי";
      else if (data === 'undo_last_expense') messageBody = "ביטול הוצאה";
    }
    else {
      return new Response("OK");
    }

    console.log(`[${platform.toUpperCase()}] Received: "${messageBody}" from ${cleanFrom}`);

    const base44 = createClientFromRequest(req);
    const idInstance = Deno.env.get("idInstance");
    const apiTokenInstance = Deno.env.get("apiTokenInstance");
    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (isCallback && telegramToken) {
      await fetch(`https://api.telegram.org/bot${telegramToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQueryId })
      }).catch(e => console.log("Failed to stop Telegram spinner"));
    }

    const replyToUser = async (text, telegramButtons = null) => {
      if (platform === 'whatsapp') {
        await sendWhatsApp(sender, text, idInstance, apiTokenInstance);
      } else if (platform === 'telegram') {
        await sendTelegram(sender, text, telegramToken, telegramButtons);
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
      await replyToUser("👋 שלום! אני לא מזהה את החשבון. אנא שלח קוד אקטיבציה בן 6 ספרות מהאפליקציה.");
      return new Response("OK");
    }

    // 3. הגדרות AI - שדרוג עם סינון קטגוריות לסיכומים!
    const categoryLabels = {
      food: "מזון ופארמה", leisure: "פנאי ובילוי", clothing: "ביגוד והנעלה", household_items: "תכולת בית", 
      home_maintenance: "אחזקת בית", grooming: "טיפוח", education: "חינוך", events: "אירועים ותרומות", 
      health: "בריאות", transportation: "תחבורה", family: "משפחה", communication: "תקשורת", 
      housing: "דיור", obligations: "התחייבויות", assets: "נכסים", finance: "פיננסים", salary: "שכר", other: "אחר"
    };

    const aiDecision = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `אתה מנהל תקציב גאון. המשתמש כתב: "${messageBody}".

      דוגמאות חובה ללמידה:
      - "סופר 50 שקל" -> intent: "add_expense", amount: 50, category: "food"
      - "כמה הוצאתי?" -> intent: "get_summary_expenses", period: "month"
      - "כמה הוצאתי היום על בגדים?" -> intent: "get_summary_expenses", period: "today", summary_category: "clothing"
      - "כמה הוצאתי השבוע על סופר?" -> intent: "get_summary_expenses", period: "week", summary_category: "food"
      - "סיכום חודשי" -> intent: "get_summary_expenses", period: "month"
      - "ביטול הוצאה" -> intent: "undo_expense"

      חוקים: 
      1. אם מופיע "היום" או "החודש" בשאלה על סיכום, עדכן את ה-period בהתאם.
      2. אם המשתמש שואל בסיכום על תחום ספציפי (בגדים, אוכל, דלק), הוסף את השדה summary_category.

      החזר JSON:`,
      response_json_schema: {
        type: "object",
        properties: {
          intent: { type: "string" }, amount: { type: "number" }, description: { type: "string" },
          category: { type: "string" }, period: { type: "string" }, summary_category: { type: "string" }, chat_reply: { type: "string" }
        }
      }
    });

    let finalReply = "מצטער, לא הצלחתי להבין. אפשר לכתוב שוב?";
    let optionalTelegramButtons = null;
    const now = new Date();

    // 4. פעולות ב-DB
    if (aiDecision.intent === 'add_expense' || aiDecision.intent === 'add_income') {
      const entityName = aiDecision.intent === 'add_expense' ? 'Expense' : 'Income';
      let finalCategory = aiDecision.category || 'other';
      const finalAmount = Number(aiDecision.amount) || 0;

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
      finalReply = `✅ רשמתי ₪${finalAmount} ל-${categoryLabel}.`;
      
      if (platform === 'telegram') {
        optionalTelegramButtons = {
          inline_keyboard: [
            [
              { text: "📊 סיכום חודשי", callback_data: "get_monthly_summary" },
              { text: "✏️ בטל הוצאה", callback_data: "undo_last_expense" }
            ]
          ]
        };
      }
    } 
    else if (aiDecision.intent === 'undo_expense') {
      const allExpenses = await base44.asServiceRole.entities.Expense.filter({ household_id: household.id });
      if (allExpenses && allExpenses.length > 0) {
         allExpenses.sort((a, b) => new Date(b.created_at || b.created_date) - new Date(a.created_at || a.created_date));
         const lastExpense = allExpenses[0];
         
         await base44.asServiceRole.entities.Expense.delete(lastExpense.id);
         
         const catName = categoryLabels[lastExpense.category] || lastExpense.category;
         finalReply = `🗑️ ההוצאה האחרונה בוטלה בהצלחה!\n(הוסרו ₪${lastExpense.amount} מ-${catName})`;
      } else {
         finalReply = `לא מצאתי הוצאות קודמות לביטול במערכת.`;
      }
    }
    else if (aiDecision.intent === 'chat') {
      finalReply = aiDecision.chat_reply || "שמח לעזור! ספרו לי מה קניתם וכמה זה עלה.";
    } 
    else if (aiDecision.intent === 'get_summary_expenses' || aiDecision.intent === 'get_summary_incomes') {
      const entityName = aiDecision.intent === 'get_summary_expenses' ? 'Expense' : 'Income';
      
      const startDate = new Date();
      if (aiDecision.period === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (aiDecision.period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
      } else {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      }

      const allItems = await base44.asServiceRole.entities[entityName].filter({ 
        household_id: household.id, month: now.getMonth() + 1, year: now.getFullYear(), is_current: true 
      });
      
      let filteredItems = allItems.filter(item => {
        const itemDate = new Date(item.created_at || item.created_date || item._createdDate);
        return itemDate >= startDate;
      });

      // סינון לפי קטגוריה אם המשתמש ביקש
      if (aiDecision.summary_category) {
        filteredItems = filteredItems.filter(item => item.category === aiDecision.summary_category);
      }
      
      // יצירת התאריך והיום בעברית
      const daysHebrew = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
      const currentDayName = daysHebrew[now.getDay()];
      const formattedDate = `${now.getDate()}/${now.getMonth() + 1}`;
      
      let periodLabel = '';
      if (aiDecision.period === 'today') periodLabel = `היום (יום ${currentDayName}, ${formattedDate})`;
      else if (aiDecision.period === 'week') periodLabel = `השבוע האחרון`;
      else periodLabel = `החודש`;

      const typeLabel = aiDecision.intent === 'get_summary_expenses' ? 'הוצאות' : 'הכנסות';
      const categoryLabelForText = aiDecision.summary_category ? ` על ${categoryLabels[aiDecision.summary_category] || aiDecision.summary_category}` : '';

      if (!filteredItems || filteredItems.length === 0) {
        finalReply = `📊 לא מצאתי ${typeLabel}${categoryLabelForText} עבור ${periodLabel}.`;
      } else {
        const total = filteredItems.reduce((s, i) => s + (i.amount || 0), 0);
        finalReply = `📊 סיכום ${typeLabel}${categoryLabelForText} עבור ${periodLabel}:\n\n💰 סה"כ: ₪${total.toLocaleString()}\n📝 פריטים: ${filteredItems.length}`;
        
        // הוספת פירוט קצר של הפריטים כדי שזה יהיה חכם
        const itemsList = filteredItems.slice(-5).reverse().map(i => {
          const cat = categoryLabels[i.category] || i.category;
          return `• ${i.description || cat}: ₪${(i.amount || 0).toLocaleString()}`;
        }).join('\n');
        
        if (itemsList) {
          finalReply += `\n\n📋 פירוט הפריטים:\n${itemsList}`;
        }
      }
    }

    await replyToUser(finalReply, optionalTelegramButtons);
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

async function sendTelegram(chatId, text, token, replyMarkup = null) {
  const body = { chat_id: chatId, text: text };
  if (replyMarkup) {
    body.reply_markup = replyMarkup; 
  }
  
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}