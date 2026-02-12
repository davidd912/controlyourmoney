import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// פונקציית עזר להחזרת תגובה בפורמט ש-Twilio מבינה (XML)
function twilioResponse(message) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${message}</Message>
</Response>`;
  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Twilio שולחת נתונים בפורמט Form
    const formData = await req.formData();
    const from = formData.get('From') || ""; 
    const body = formData.get('Body') || "";

    if (!from || !body) {
      return new Response("Missing Data", { status: 400 });
    }

    // ניקוי המספר מהקידומת whatsapp:
    const cleanFrom = from.replace('whatsapp:', '');

    // בדיקה אם המספר כבר מקושר למשק בית
    const households = await base44.asServiceRole.entities.Household.filter({ whatsapp_number: cleanFrom });
    let household = households?.[0];

    // תהליך הפעלה ראשוני (Activation)
    if (!household) {
      const code = body.trim();
      const allHouseholds = await base44.asServiceRole.entities.Household.list();
      const matchingHousehold = allHouseholds.find(h => {
        return h.activation_code === code && 
               h.activation_code_expires && 
               new Date(h.activation_code_expires) > new Date();
      });

      if (matchingHousehold) {
        await base44.asServiceRole.entities.Household.update(matchingHousehold.id, {
          whatsapp_number: cleanFrom,
          activation_code: null,
          activation_code_expires: null
        });

        return twilioResponse(`שלום! 👋 אני Flowli AI. חוברנו בהצלחה!\n\n🔍 *מה אני יכול לעשות?*\n💰 הוספת הוצאות/הכנסות\n📊 סיכום חודשי\n🌐 חימוש במידע מהרשת\n\nאיך אפשר לעזור?`);
      } else {
        return twilioResponse(`👋 שלום! אני Flowli AI.\n כדי להתחיל, שלח לי את קוד ההפעלה מהאפליקציה.`);
      }
    }

    // עיבוד ההודעה עם AI (כאן נשאר הלוגיקה שלך)
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `אתה Flowli AI, סוכן לניהול תקציב. נתח: "${body}"...`, // הפרומט המלא שלך כאן
      response_json_schema: { /* הסכימה שלך כאן */ }
    });

    let reply = "";
    const intent = aiResponse.intent;

    // כאן נכנסת הלוגיקה של add_income / add_expense וכו'
    // ... (הלוגיקה שלך שכתבת קודם)
    
    // דוגמה לתגובה סופית:
    if (intent === "add_expense") {
       // ... יצירת ההוצאה ב-DB ...
       reply = `✅ הוצאה על סך ₪${aiResponse.amount} נוספה ל-${aiResponse.category}.`;
    } else {
       reply = "בוצע בהצלחה!";
    }

    // החזרת התשובה בפורמט הנכון!
    return twilioResponse(reply);

  } catch (error) {
    console.error('Error:', error);
    return twilioResponse(`❌ תקלה טכנית: ${error.message}`);
  }
});