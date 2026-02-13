import { createClient } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // השתמשתי בערכים שהשגת מה-API קודם לכן בצורה ישירה
    const appId = "69628532ec7ea1d144f840c5";
    const apiKey = "29ddbdb7bfe34e8a8272da12d544ef9e";
    
    // אתחול ישיר ללא הסתמכות על Secrets לזיהוי האפליקציה
    const base44 = createClient(appId, apiKey);
    
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
    const households = await base44.entities.Household.filter({
      whatsapp_number: cleanFrom
    });
    let household = households?.[0];

    // 2. אקטיבציה
    const extractedCode = messageBody.match(/\d{6}/)?.[0];
    if (!household && extractedCode) {
      const matching = await base44.entities.Household.filter({ activation_code: extractedCode });
      if (matching?.[0]) {
        await base44.entities.Household.update(matching[0].id, {
          whatsapp_number: cleanFrom,
          activation_code: null
        });
        await sendWhatsApp(sender, "✅ החיבור הצליח! אני הבנקאי לניהול התקציב המשפחתי. איך אוכל לעזור?", idInstance, apiTokenInstance);
        return new Response("OK", { status: 200 });
      }
    }

    if (!household) {
      await sendWhatsApp(sender, "👋 שלום! אני הבנקאי לניהול התקציב. שלחו לי את קוד ההפעלה מהאפליקציה.", idInstance, apiTokenInstance);
      return new Response("OK", { status: 200 });
    }

    // 3. עיבוד AI (הוצאות, הכנסות, סיכומים)
    const aiDecision = await base44.integrations.Core.InvokeLLM({
      prompt: `נתח: "${messageBody}". 
      כוונות: add_expense, add_income, get_summary (period: today/week), web_search. 
      החזר JSON בלבד.`,
    });

    let finalReply = "מצטער, לא הצלחתי לעבד את הבקשה.";
    const now = new Date();

    switch (aiDecision.intent) {
      case 'add_expense':
      case 'add_income':
        const isExpense = aiDecision.intent === 'add_expense';
        const entity = isExpense ? base44.entities.Expense : base44.entities.Income;
        await entity.create({
          household_id: household.id,
          amount: aiDecision.amount,
          description: aiDecision.description,
          category: aiDecision.category || 'other',
          month: now.getMonth() + 1,
          year: now.getFullYear()
        });
        finalReply = `✅ רשמתי ${isExpense ? 'הוצאה' : 'הכנסה'} של ${aiDecision.amount} ש"ח עבור ${aiDecision.description}.`;
        break;

      case 'get_summary':
        const days = aiDecision.period === 'week' ? 7 : 1;
        const startDate = new Date(now.setDate(now.getDate() - days)).toISOString();
        const expenses = await base44.entities.Expense.filter({
          household_id: household.id,
          created_at: { "$gte": startDate }
        });
        const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        finalReply = `📊 סיכום הוצאות ${aiDecision.period === 'week' ? 'שבועי' : 'יומי'}:\nסך הכל: ₪${total}`;
        break;
        
      case 'web_search':
        const results = await base44.integrations.Core.GoogleSearch({ query: messageBody });
        finalReply = `🔍 הנה מה שמצאתי בגוגל:\n${results.slice(0, 2).map(r => r.url).join('\n')}`;
        break;
    }

    await sendWhatsApp(sender, finalReply, idInstance, apiTokenInstance);
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error('Base44 Error:', error.message);
    return new Response("OK", { status: 200 });
  }
});

async function sendWhatsApp(chatId, text, id, token) {
  await fetch(`https://7103.api.greenapi.com/waInstance${id}/sendMessage/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message: text })
  });
}