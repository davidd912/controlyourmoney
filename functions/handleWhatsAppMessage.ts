import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    
    let platform = 'unknown';
    let sender = '';
    let cleanFrom = '';
    let messageBody = '';

    // 1. זיהוי הפלטפורמה (WhatsApp דרך Green API או Telegram)
    if (payload.typeWebhook === 'incomingMessageReceived') {
      platform = 'whatsapp';
      const botNumber = payload.instanceData?.wid;
      const senderNumber = payload.senderData?.sender;
      if (senderNumber === botNumber) return new Response("OK"); // מניעת לולאה

      sender = payload.senderData?.chatId;
      messageBody = payload.messageData?.textMessageData?.textMessage || "";
      cleanFrom = sender.replace('@c.us', '').replace('+', '');
    } 
    else if (payload.message && payload.message.chat) {
      platform = 'telegram';
      sender = payload.message.chat.id.toString(); // בטלגרם ה-ID הוא מספר
      messageBody = payload.message.text || "";
      cleanFrom = sender;
    } 
    else {
      return new Response("OK"); // חסימת בקשות לא קשורות
    }

    console.log(`[${platform.toUpperCase()}] Received message from ${cleanFrom}: "${messageBody}"`);

    const base44 = createClientFromRequest(req);
    const idInstance = Deno.env.get("idInstance");
    const apiTokenInstance = Deno.env.get("apiTokenInstance");
    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    // פונקציית עזר פנימית לשליחת תשובה לפי פלטפורמה
    const replyToUser = async (text) => {
      if (platform === 'whatsapp') {
        await sendWhatsApp(sender, text, idInstance, apiTokenInstance);
      } else if (platform === 'telegram') {
        await sendTelegram(sender, text, telegramToken);
      }
    };

    // 2. זיהוי (Identify): חיפוש משק בית מתאים לפי הפלטפורמה
    const households = await base44.asServiceRole.entities.Household.filter({});
    let household = households.find(h => {
      if (platform === 'whatsapp') {
        return h.whatsapp_numbers && Array.isArray(h.whatsapp_numbers) && h.whatsapp_numbers.includes(cleanFrom);
      } else {
        return h.telegram_chat_ids && Array.isArray(h.telegram_chat_ids) && h.telegram_chat_ids.includes(cleanFrom);
      }
    });

    // 3. טיפול במספר חדש - בדיקת קוד אקטיבציה
    if (!household) {
      console.log(`[${platform}] No household found for ${cleanFrom}. Checking for activation code.`);
      const extractedCode = messageBody.match(/\d{6}/)?.[0];
      
      if (extractedCode) {
        const matching = await base44.asServiceRole.entities.Household.filter({ activation_code: extractedCode });
        
        if (matching?.[0]) {
          const targetHousehold = matching[0];
          
          // בדיקת תוקף
          const activationCodeExpires = targetHousehold.activation_code_expires ? new Date(targetHousehold.activation_code_expires) : null;
          if (!activationCodeExpires || activationCodeExpires < new Date()) {
            await replyToUser("⏰ קוד ההפעלה ששלחת פג תוקפו או כבר שומש. בבקשה צור קוד חדש באפליקציה ונסה שוב.");
            return new Response("OK");
          }

          // הוספה למערך הנכון לפי הפלטפורמה
          const updateData = {
            activation_code: null,
            activation_code_expires: null,
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          };

          if (platform === 'whatsapp') {
            const currentNumbers = targetHousehold.whatsapp_numbers || [];
            updateData.whatsapp_numbers = [...new Set([...currentNumbers, cleanFrom])];
          } else {
            const currentChats = targetHousehold.telegram_chat_ids || [];
            updateData.telegram_chat_ids = [...new Set([...currentChats, cleanFrom])];
          }

          await base44.asServiceRole.entities.Household.update(targetHousehold.id, updateData);
          await replyToUser("✅ החיבור הצליח! אני הבנקאי האישי שלכם לניהול התקציב. איך אוכל לעזור?");
          return new Response("OK");
        }
      }
      
      await replyToUser("👋 שלום! אני לא מזהה את החשבון. אנא שלח קוד אקטיבציה מהאפליקציה.");
      return new Response("OK");
    }

    // בדיקת גישה לשירות (רלוונטי לשתי הפלטפורמות)
    const subscriptionType = household.subscription_type || 'trial';
    if (subscriptionType !== 'manual_premium') {
      const now = new Date();
      const expiresAt = household.expires_at ? new Date(household.expires_at) : null;
      if (!expiresAt || now > expiresAt) {
        await replyToUser('⏰ תקופת הניסיון בשירות הבוט הסתיימה.\n\nתוכלו להמשיך להשתמש באפליקציה כרגיל. שירות הבוט מוגבל למנויי פרימיום. צרו קשר דרך האפליקציה לשדרוג.');
        return new Response("OK");
      }
    }

    // --- מכאן והלאה הלוגיקה זהה לחלוטין - המוח של ה-AI ---
    
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

    const aiDecision = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `אתה בנקאי אישי חכם עבור אפליקציית ניהול התקציב המשפחתי "Control Your Money". תפקידך לנתח את הודעת המשתמש: "${messageBody}".

    קטגוריות הוצאה זמינות: ${expenseCategories.map(c => `${c} (${categoryLabels[c]})`).join(', ')}
    קטגוריות הכנסה זמינות: ${incomeCategories.map(c => `${c} (${categoryLabels[c]})`).join(', ')}

    🚨 חוקי ברזל (Guardrails) - חובה לציית:
    1. מיקוד מוחלט באפליקציה: אתה עונה *רק* על נושאי תקציב.
    2. בקשות עריכה ומחיקה: אם מבקשים למחוק או לערוך, קבע intent: "chat" והחזר ב-chat_reply שעריכה מתבצעת רק באתר controlyourmoney.info.
    3. נתונים חסרים: אם חסר סכום, קבע intent: "chat" ושאל "כמה עלתה הקנייה?".

    🎯 הנחיות לזיהוי נתונים:
    - period: "today", "week", "month" (היום/השבוע/החודש בהתאמה לסיכומים).
    - שייך לקטגוריה קיימת בצורה הגיונית.

    החזר JSON: intent, amount, description, category, period, merchant, summary_category, transaction_date, chat_reply.`,
      response_json_schema: {
        type: "object",
        properties: {
          intent: { type: "string" }, amount: { type: "number" }, description: { type: "string" },
          category: { type: "string" }, period: { type: "string" }, merchant: { type: "string" },
          summary_category: { type: "string" }, transaction_date: { type: "string" }, chat_reply: { type: "string" }
        }
      }
    });

    let finalReply = "מצטער, לא הצלחתי לעבד את הבקשה.";
    const now = new Date();

    if (aiDecision.intent === 'add_expense' || aiDecision.intent === 'add_income') {
      const entityName = aiDecision.intent === 'add_expense' ? 'Expense' : 'Income';
      const validCategories = aiDecision.intent === 'add_expense' ? expenseCategories : incomeCategories;
      
      let transactionDate = now;
      if (aiDecision.transaction_date) {
        try {
          transactionDate = new Date(aiDecision.transaction_date);
          if (isNaN(transactionDate.getTime())) transactionDate = now;
        } catch { transactionDate = now; }
      }
      
      let finalCategory = aiDecision.category || 'other';
      if (!validCategories.includes(finalCategory)) finalCategory = 'other';
      
      await base44.asServiceRole.entities[entityName].create({
        household_id: household.id,
        amount: aiDecision.amount || 0,
        description: aiDecision.description || messageBody,
        category: finalCategory,
        month: transactionDate.getMonth() + 1,
        year: transactionDate.getFullYear(),
        is_current: true,
        is_budget: false
      });
      
      const categoryLabel = categoryLabels[finalCategory] || finalCategory;
      finalReply = `✅ רשמתי ₪${aiDecision.amount} ל-${categoryLabel}.`;
      
    } else if (aiDecision.intent === 'chat') {
      finalReply = aiDecision.chat_reply || "שמח לעזור! ספרו לי על הוצאה או הכנסה וארשום אותה.";
    } else if (aiDecision.intent === 'get_summary_expenses' || aiDecision.intent === 'get_summary_incomes') {
      const isExpense = aiDecision.intent === 'get_summary_expenses';
      const entityName = isExpense ? 'Expense' : 'Income';

      const startDate = new Date();
      const endDate = new Date();

      if (aiDecision.period === 'today') {
        startDate.setHours(0, 0, 0, 0); endDate.setHours(23, 59, 59, 999);
      } else if (aiDecision.period === 'week') {
        startDate.setDate(startDate.getDate() - 7); startDate.setHours(0, 0, 0, 0); endDate.setHours(23, 59, 59, 999);
      } else {
        startDate.setDate(1); startDate.setHours(0, 0, 0, 0); endDate.setHours(23, 59, 59, 999);
      }

      const allItems = await base44.asServiceRole.entities[entityName].filter({ household_id: household.id, is_current: true });
      let filteredItems = allItems.filter(item => {
        const itemDate = new Date(item.created_at || item.created_date || item._createdDate);
        return itemDate >= startDate && itemDate <= endDate;
      });

      if (aiDecision.summary_category) {
        filteredItems = filteredItems.filter(item => item.category === aiDecision.summary_category);
      }

      if (filteredItems.length === 0) {
        finalReply = `📊 אין נתונים בטווח זה.`;
      } else {
        const total = filteredItems.reduce((s, i) => s + (i.amount || 0), 0);
        finalReply = `📊 סיכום לתקופה:\n💰 סה"כ: ₪${total.toLocaleString()}\n📝 מספר פריטים: ${filteredItems.length}`;
      }
    }

    // שליחת התשובה בחזרה לפלטפורמה ממנה הגיעה!
    await replyToUser(finalReply);
    return new Response("OK");

  } catch (e) {
    console.error("[Bot Error]:", e.message, e.stack);
    return new Response("OK");
  }
});

// פונקציות השליחה
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