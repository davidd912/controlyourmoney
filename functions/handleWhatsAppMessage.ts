import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    if (payload.typeWebhook !== 'incomingMessageReceived') {
      return new Response("OK", { status: 200 });
    }

    const idInstance = Deno.env.get("idInstance");
    const apiTokenInstance = Deno.env.get("apiTokenInstance");
    const sender = payload.senderData?.chatId;
    const messageBody = payload.messageData?.textMessageData?.textMessage || "";
    const cleanFrom = sender.replace('@c.us', '').replace('+', '');

    // 1. זיהוי משק בית
    const households = await base44.asServiceRole.entities.Household.filter({
      whatsapp_number: cleanFrom
    });
    let household = households?.[0];

    // 2. טיפול באקטיבציה (אם המשתמש לא מזוהה)
    const extractedCode = messageBody.match(/\d{6}/)?.[0];
    if (!household && extractedCode) {
      const matching = await base44.asServiceRole.entities.Household.filter({ activation_code: extractedCode });
      if (matching?.[0]) {
        await base44.asServiceRole.entities.Household.update(matching[0].id, {
          whatsapp_number: cleanFrom,
          activation_code: null
        });
        return await sendWhatsApp(sender, "✅ החיבור הצליח! שלום, אני הבנקאי האישי שלכם לניהול התקציב המשפחתי. איך אוכל לעזור?", idInstance, apiTokenInstance);
      }
    }

    if (!household) {
      return await sendWhatsApp(sender, "👋 שלום! אני הבנקאי לניהול התקציב שלכם. כדי להתחיל, שלחו לי את קוד ההפעלה מהאפליקציה.", idInstance, apiTokenInstance);
    }

    // 3. עיבוד AI מתקדם - זיהוי כוונה (Intent)
    const aiDecision = await base44.integrations.Core.InvokeLLM({
      prompt: `אתה בנקאי אישי לניהול תקציב משפחתי. נתח את ההודעה: "${messageBody}".
      בחר את הכוונה המתאימה:
      - add_transaction: הוספת הוצאה/הכנסה (זהה סכום, קטגוריה, ותיאור. אם הוצאה עסקית/מוכרת סמן is_business: true).
      - query_budget: שאלות על מצב הכסף או חיפוש הוצאות קודמות.
      - web_search: חיפוש בגוגל או חדשות כלכליות.
      - browse_url: קריאת תוכן מקישור שנשלח.
      החזר JSON בלבד עם intent ופרטים רלוונטיים.`,
    });

    let finalReply = "מצטער, לא הצלחתי לעבד את הבקשה.";

    // לוגיקה לפי כוונה
    switch (aiDecision.intent) {
      case 'add_transaction':
        await base44.asServiceRole.entities.Expense.create({
          household_id: household.id,
          amount: aiDecision.amount,
          description: aiDecision.description,
          category: aiDecision.category || 'other',
          is_business: aiDecision.is_business || false,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        });
        finalReply = `✅ רשמתי ${aiDecision.amount} ש"ח עבור ${aiDecision.description}. ${aiDecision.is_business ? "(הוצאה מוכרת)" : ""}`;
        break;

      case 'web_search':
        const searchResults = await base44.integrations.Core.GoogleSearch({ query: aiDecision.search_query || messageBody });
        finalReply = `🔍 הנה מה שמצאתי בגוגל:\n\n${searchResults.slice(0, 3).map(r => `${r.title}: ${r.url}`).join('\n\n')}`;
        break;

      case 'browse_url':
        const webContent = await base44.integrations.Core.WebBrowser({ url: aiDecision.url });
        const summary = await base44.integrations.Core.InvokeLLM({ prompt: `סכם את התוכן הבא ב-3 משפטים: ${webContent}` });
        finalReply = `📄 סיכום הדף ששלחת:\n${summary}`;
        break;

      case 'query_budget':
        // כאן ניתן להוסיף שליפה מה-DB של סיכומי הוצאות
        finalReply = "אני בודק את הנתונים שלך... (כאן יופיע סיכום התקציב)";
        break;
    }

    await sendWhatsApp(sender, finalReply, idInstance, apiTokenInstance);
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error('Error:', error.message);
    return new Response("OK", { status: 200 });
  }
});

// פונקציית עזר לשליחת הודעה
async function sendWhatsApp(chatId, text, id, token) {
  const url = `https://7103.api.greenapi.com/waInstance${id}/sendMessage/${token}`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message: text })
  });
}