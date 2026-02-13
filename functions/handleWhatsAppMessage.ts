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

    // 1. חיפוש משק בית ב-fetch ישיר
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
        await sendWhatsApp(sender, "✅ החיבור הצליח! איך אוכל לעזור?", idInstance, apiTokenInstance);
        return new Response("OK");
      }
    }

    if (!household) {
      await sendWhatsApp(sender, "👋 שלום! אנא שלחו קוד אקטיבציה.", idInstance, apiTokenInstance);
      return new Response("OK");
    }

    // 3. הוספת הוצאה ב-fetch ישיר (דוגמה בסיסית ללא LLM כרגע כדי לוודא שזה עובד)
    if (messageBody.includes("הוצאה")) {
      await fetch(`https://app.base44.com/api/apps/${appId}/entities/Expense`, {
        method: 'POST',
        headers: { 'api_key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          household_id: household.id,
          amount: parseFloat(messageBody.replace(/\D/g, '')) || 0,
          description: messageBody,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        })
      });
      await sendWhatsApp(sender, "✅ רשמתי את ההוצאה.", idInstance, apiTokenInstance);
    } else {
      await sendWhatsApp(sender, `היי! אני מזהה אותך. כתבת: ${messageBody}`, idInstance, apiTokenInstance);
    }

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