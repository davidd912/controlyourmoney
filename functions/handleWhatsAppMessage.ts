import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // התיקון הקריטי: שימוש ב-Request כדי לקבל הרשאות אוטומטיות
    const base44 = createClientFromRequest(req);
    
    const payload = await req.json();
    console.log('Green API Webhook received');

    if (payload.typeWebhook !== 'incomingMessageReceived') {
      return new Response("OK", { status: 200 });
    }

    const idInstance = Deno.env.get("idInstance");
    const apiTokenInstance = Deno.env.get("apiTokenInstance");

    const sender = payload.senderData?.chatId; // מגיע בפורמט 972559725996@c.us
    const messageBody = payload.messageData?.textMessageData?.textMessage;

    if (!sender || !messageBody) {
      return new Response("Missing data", { status: 200 });
    }

    // ניקוי המספר לצורך חיפוש ב-DB
    const cleanFrom = sender.replace('@c.us', '').replace('+', '');
    const trimmedMessage = messageBody.trim();

    // בדיקה מול בסיס הנתונים (Household)
    const households = await base44.asServiceRole.entities.Household.filter({
      whatsapp_number: cleanFrom
    });
    
    let household = households?.[0];
    let replyText = "";

    if (!household) {
      // בדיקה אם המשתמש שלח קוד אקטיבציה (6 ספרות)
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
      replyText = `היי! קיבלתי: "${trimmedMessage}". אני מזהה אותך כמשתמש מחובר!`;
    }

    // שליחה חזרה ל-Green API
    const greenApiUrl = `https://7103.api.greenapi.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
    
    const response = await fetch(greenApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: sender, // חשוב: שולחים חזרה בדיוק את ה-chatId שקיבלנו (כולל ה-@c.us)
        message: replyText
      })
    });

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error('Error handling Webhook:', error.message);
    return new Response("Internal Error", { status: 200 });
  }
});