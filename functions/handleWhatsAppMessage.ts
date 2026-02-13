Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    if (payload.typeWebhook !== 'incomingMessageReceived') return new Response("OK");

    const appId = "69628532ec7ea1d144f840c5";
    const apiKey = "29ddbdb7bfe34e8a8272da12d544ef9e";
    const idInstance = Deno.env.get("idInstance");
    const apiTokenInstance = Deno.env.get("apiTokenInstance");

    const sender = payload.senderData?.chatId;
    const messageBody = payload.messageData?.textMessageData?.textMessage || "";
    const cleanFrom = sender.replace('@c.us', '').replace('+', '');

    // 1. חיפוש משק בית
    const hResponse = await fetch(`https://app.base44.com/api/apps/${appId}/entities/Household?whatsapp_number=${cleanFrom}`, {
      headers: { 'api_key': apiKey }
    });
    const households = await hResponse.json();
    let household = households?.[0];

    // 2. אקטיבציה
    const extractedCode = messageBody.match(/\d{6}/)?.[0];
    if (!household && extractedCode) {
      const matchResp = await fetch(`https://app.base44.com/api/apps/${appId}/entities/Household?activation_code=${extractedCode}`, {
        headers: { 'api_key': apiKey }
      });
      const matching = await matchResp.json();
      if (matching?.[0]) {
        await fetch(`https://app.base44.com/api/apps/${appId}/entities/Household/${matching[0].id}`, {
          method: 'PUT',
          headers: { 'api_key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ whatsapp_number: cleanFrom, activation_code: null })
        });
        await sendWhatsApp(sender, "✅ החיבור הצליח! אני הבנקאי האישי שלכם לניהול התקציב. איך אוכל לעזור?", idInstance, apiTokenInstance);
        return new Response("OK");
      }
    }

    if (!household) {
      await sendWhatsApp(sender, "👋 שלום! אני הבנקאי לניהול התקציב. שלחו לי את קוד ההפעלה מהאפליקציה.", idInstance, apiTokenInstance);
      return new Response("OK");
    }

    // 3. עיבוד AI - תיקון פיונח ה-JSON
    const aiResp = await fetch(`https://app.base44.com/api/apps/${appId}/integrations/core/invoke_llm`, {
      method: 'POST',
      headers: { 'api_key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `אתה בנקאי אישי לניהול תקציב. נתח את ההודעה: "${messageBody}". 
        החזר אך ורק JSON במבנה הבא: {"intent": "add_expense" או "add_income" או "get_summary", "amount": מספר, "description": "טקסט", "category": "קטגוריה", "period": "today" או "week"}`
      })
    });
    
    const aiResult = await aiResp.json();
    // חילוץ האובייקט מתוך התשובה של Base44
    const aiDecision = typeof aiResult === 'string' ? JSON.parse(aiResult) : aiResult;

    let finalReply = "מצטער, לא הצלחתי לעבד את הבקשה.";
    const now = new Date();

    // 4. לוגיקת ביצוע
    if (aiDecision.intent === 'add_expense' || aiDecision.intent === 'add_income') {
      const entityName = aiDecision.intent === 'add_expense' ? 'Expense' : 'Income';
      await fetch(`https://app.base44.com/api/apps/${appId}/entities/${entityName}`, {
        method: 'POST',
        headers: { 'api_key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          household_id: household.id,
          amount: aiDecision.amount || 0,
          description: aiDecision.description || messageBody,
          category: aiDecision.category || 'other',
          month: now.getMonth() + 1,
          year: now.getFullYear()
        })
      });
      finalReply = `✅ רשמתי ${aiDecision.intent === 'add_expense' ? 'הוצאה' : 'הכנסה'} של ₪${aiDecision.amount} עבור ${aiDecision.description}.`;
    } 
    else if (aiDecision.intent === 'get_summary') {
      const days = aiDecision.period === 'week' ? 7 : 1;
      const startDate = new Date(now.setDate(now.getDate() - days)).toISOString();
      const sResp = await fetch(`https://app.base44.com/api/apps/${appId}/entities/Expense?household_id=${household.id}&created_at_gte=${startDate}`, {
        headers: { 'api_key': apiKey }
      });
      const items = await sResp.json();
      const total = items.reduce((s, i) => s + (i.amount || 0), 0);
      finalReply = `📊 סיכום הוצאות ${aiDecision.period === 'week' ? 'שבועי' : 'מהיום'}:\nסה"כ: ₪${total}\n\n${items.map(i => `- ${i.description}: ₪${i.amount}`).join('\n')}`;
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