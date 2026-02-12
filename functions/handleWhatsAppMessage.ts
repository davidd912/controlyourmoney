import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Twilio שולחת נתונים בפורמט Form ולא JSON
    // נקרא את ה-body כטקסט ואז נפצח אותו ידנית
    const reqBody = await req.text();
    const params = new URLSearchParams(reqBody);

    const from = params.get('From');
    const body = params.get('Body');

    if (!from || !body) {
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error: Missing From or Body</Message></Response>`, {
        headers: { "Content-Type": "text/xml" },
        status: 400
      });
    }

    const cleanFrom = from.replace('whatsapp:', '');
    const messageBody = body.trim();

    /** * אופטימיזציה למניעת 502:
     * אנחנו משתמשים ב-filter ולא ב-list. זה ההבדל בין קריסה להצלחה.
     */
    const households = await base44.asServiceRole.entities.Household.filter({ 
      whatsapp_number: cleanFrom 
    });
    
    let household = households?.[0];
    let replyText = "";

    if (!household) {
      // בדיקת אקטיבציה - בודק גם תוקף
      const activationCode = messageBody;
      
      const matchingHouseholds = await base44.asServiceRole.entities.Household.filter({
        activation_code: activationCode,
        activation_code_expires: { "$gt": new Date().toISOString() }
      });

      const potentialHousehold = matchingHouseholds?.[0];
      
      if (potentialHousehold) {
        await base44.asServiceRole.entities.Household.update(potentialHousehold.id, {
          whatsapp_number: cleanFrom,
          activation_code: null,
          activation_code_expires: null
        });
        household = potentialHousehold;

        replyText = `שלום! 👋 אני Flowli AI עוזר התקציב החכם שלך. אני כאן לעזור לך לנהל את הכספים שלך!\n\nאת התקציב בצורה חכמה, לעזור להתחסכן, ולעקוב אחר ההוצאות שלך! ועוד שלל פעולות.\n\n🔍 *מה אני יכול לעשות?*\n\n💰 *ניהול תקציב:*\n• *להוסיף הוצאות והכנסות* (לדוגמה: "הוסף הוצאה 50 שקל בסופר היום")\n• *להציג את נתוני התקציב שלך*\n📊 *לעקוב אחר ההתקדמות החודשית שלך*\n✏️ *לעדכן או למחוק פריטים מהתקציב*\n🌐 *לחפש מידע באינטרנט*\n🌍 *לחפש חדשות אקטואליות*\n\nבואו נתחיל!`;
      } else {
        replyText = `👋 שלום! אני Flowli AI העוזר החכם שלך. אני כאן לעזור לך לנהל את הכספים שלך!\n\n🔐 כדי להתחיל, עבור לאפליקציה, צור קוד הפעלה, ושלח אותו לכאן.\n\n📱 הקוד תקף ל-24 שעות בלבד.`;
      }
    } else {
      replyText = `קיבלתי: ${messageBody}. החיבור עובד!`;
    }

    // החזרת TwiML - זה מה ש-Twilio חייבת לקבל
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyText}</Message></Response>`;
    
    return new Response(twiml, {
      headers: { "Content-Type": "text/xml" }
    });

  } catch (error) {
    console.error('Error handling WhatsApp message:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>❌ שגיאה: ${error.message}</Message></Response>`, {
      headers: { "Content-Type": "text/xml" },
      status: 500
    });
  }
});