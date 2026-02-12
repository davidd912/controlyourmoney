import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // קריאת הנתונים מ-Green API
    const payload = await req.json();
    console.log('Green API Webhook:', JSON.stringify(payload));

    // סינון אירועים שאינם הודעות נכנסות
    if (payload.typeWebhook !== 'incomingMessageReceived') {
      return new Response("OK", { status: 200 });
    }

    const idInstance = Deno.env.get("idInstance");
    const apiTokenInstance = Deno.env.get("apiTokenInstance");

    const sender = payload.senderData?.chatId;
    const messageBody = payload.messageData?.textMessageData?.textMessage;

    if (!sender || !messageBody) {
      return new Response("Missing data", { status: 200 });
    }

    const cleanFrom = sender.replace('@c.us', '').replace('+', '');
    const trimmedMessage = messageBody.trim();

    // בדיקה מול בסיס הנתונים (Household)
    const households = await base44.asServiceRole.entities.Household.filter({
      whatsapp_number: cleanFrom
    });
    
    let household = households?.[0];
    let replyText = "";

    if (!household) {
      // לוגיקת אקטיבציה
      const matching = await base44.asServiceRole.entities.Household.filter({
        activation_code: trimmedMessage
      });
      
      if (matching?.[0]) {
        await base44.asServiceRole.entities.Household.update(matching[0].id, {
          whatsapp_number: cleanFrom,
          activation_code: null,
          activation_code_expires: null
        });
        replyText = "✅ *החיבור הצליח!* שלום, אני Flowli AI. איך אוכל לעזור?";
      } else {
        replyText = "👋 שלום! אני Flowli AI. כדי להתחיל, שלח לי את קוד ההפעלה מהאפליקציה.";
      }
    } else {
      // כאן ה-AI מעבד את ההודעה (הוספת הוצאה/שאילתה)
      // לבינתיים, לצורך בדיקה ראשונית:
      replyText = `היי! קיבלתי את ההודעה: "${trimmedMessage}". הסוכן שלך ב-Base44 מחובר ומזהה אותך!`;
    }

    // --- התיקון הקריטי עם ה-API URL שלך ---
    const greenApiUrl = `https://7103.api.greenapi.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
    
    const response = await fetch(greenApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: sender,
        message: replyText
      })
    });

    if (!response.ok) {
      console.error('Green API error:', await response.text());
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error('Error handling Webhook:', error);
    return new Response("Internal Error", { status: 200 });
  }
});