import { createClient } from 'npm:@base44/sdk@0.8.6';

// פונקציית עזר לניקוי והכנת המספר לשליחה
const formatChatId = (number) => {
  let clean = number.replace(/\D/g, ''); // מסיר הכל חוץ ממספרים
  if (clean.startsWith('0')) {
    clean = '972' + clean.slice(1); // הופך 054 ל-97254
  }
  return clean.includes('@') ? number : `${clean}@c.us`;
};

Deno.serve(async (req) => {
  try {
    // Use service role for external webhooks
    const base44 = createClient(
      Deno.env.get("BASE44_APP_ID") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // קריאת הנתונים מ-Green API
    const payload = await req.json();
    console.log('Green API Webhook:', JSON.stringify(payload));

    // סינון אירועים שאינם הודעות נכנסות
    if (payload.typeWebhook !== 'incomingMessageReceived') {
      return new Response("OK", { status: 200 });
    }

    const idInstance = Deno.env.get("idInstance");
    const apiTokenInstance = Deno.env.get("apiTokenInstance");
    console.log('Secrets loaded:', { 
      hasIdInstance: !!idInstance, 
      hasApiToken: !!apiTokenInstance,
      idInstance: idInstance ? `${idInstance.substring(0, 4)}...` : 'missing'
    });

    const sender = payload.senderData?.chatId;
    const messageBody = payload.messageData?.textMessageData?.textMessage;
    console.log('Message details:', { sender, messageBody });

    if (!sender || !messageBody) {
      console.log('Missing sender or message body');
      return new Response("Missing data", { status: 200 });
    }

    // ניקוי המספר לשמירה ב-DB (מחיקת @c.us ו-+, אבל שמירה על הפורמט הבינלאומי)
    let cleanFrom = sender.replace('@c.us', '').replace('+', '');
    // אם המספר מתחיל ב-0, המר ל-972
    if (cleanFrom.startsWith('0')) {
      cleanFrom = '972' + cleanFrom.slice(1);
    }
    const trimmedMessage = messageBody.trim();
    console.log('Cleaned data:', { cleanFrom, trimmedMessage });

    // בדיקה מול בסיס הנתונים (Household)
    const households = await base44.entities.Household.filter({
      whatsapp_number: cleanFrom
    });
    console.log('Household search result:', { found: !!households?.[0], cleanFrom });
    
    let household = households?.[0];
    let replyText = "";

    if (!household) {
      // לוגיקת אקטיבציה
      const matching = await base44.entities.Household.filter({
        activation_code: trimmedMessage
      });
      
      if (matching?.[0]) {
        await base44.entities.Household.update(matching[0].id, {
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

    // --- שליחת תשובה חזרה דרך Green API ---
    const greenApiUrl = `https://7103.api.greenapi.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
    const formattedChatId = formatChatId(sender);
    console.log('Sending reply:', { replyText, to: sender, formattedChatId });
    
    const response = await fetch(greenApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: formattedChatId,
        message: replyText
      })
    });

    const responseText = await response.text();
    console.log('Green API response:', { status: response.status, body: responseText });

    if (!response.ok) {
      console.error('Green API error - failed to send message');
    } else {
      console.log('✅ Message sent successfully!');
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error('Error handling Webhook:', error);
    return new Response("Internal Error", { status: 200 });
  }
});