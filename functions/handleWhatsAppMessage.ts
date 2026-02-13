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

    // 3. עיבוד AI
    const aiDecision = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `אתה בנקאי אישי לניהול תקציב. נתח את ההודעה: "${messageBody}". 
      החזר אך ורק JSON במבנה הבא: {"intent": "add_expense" או "add_income" או "get_summary", "amount": מספר, "description": "טקסט", "category": "קטגוריה", "period": "today" או "week"}`,
      response_json_schema: {
        type: "object",
        properties: {
          intent: { type: "string" },
          amount: { type: "number" },
          description: { type: "string" },
          category: { type: "string" },
          period: { type: "string" }
        }
      }
    });

    let finalReply = "מצטער, לא הצלחתי לעבד את הבקשה.";
    const now = new Date();

    // 4. לוגיקת ביצוע
    if (aiDecision.intent === 'add_expense' || aiDecision.intent === 'add_income') {
      const entityName = aiDecision.intent === 'add_expense' ? 'Expense' : 'Income';
      await base44.asServiceRole.entities[entityName].create({
        household_id: household.id,
        amount: aiDecision.amount || 0,
        description: aiDecision.description || messageBody,
        category: aiDecision.category || 'other',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        is_current: true,
        is_budget: false
      });
      finalReply = `✅ רשמתי ${aiDecision.intent === 'add_expense' ? 'הוצאה' : 'הכנסה'} של ₪${aiDecision.amount} עבור ${aiDecision.description}.`;
    } 
    else if (aiDecision.intent === 'get_summary') {
      const days = aiDecision.period === 'week' ? 7 : 1;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const expenses = await base44.asServiceRole.entities.Expense.filter({
        household_id: household.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        is_current: true
      });
      
      const total = expenses.reduce((s, i) => s + (i.amount || 0), 0);
      const itemsList = expenses.slice(0, 10).map(i => `- ${i.description}: ₪${i.amount}`).join('\n');
      finalReply = `📊 סיכום הוצאות החודש:\nסה"כ: ₪${total}\n\n${itemsList}`;
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