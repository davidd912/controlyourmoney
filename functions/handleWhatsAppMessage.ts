import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const formData = await req.formData();
    
    // ניקוי מספר הטלפון מיד בהתחלה
    const rawFrom = formData.get('From') || "";
    const cleanFrom = rawFrom.replace('whatsapp:', '');
    const body = (formData.get('Body') || "").trim();

    /** * אופטימיזציה למניעת 502:
     * אנחנו משתמשים ב-filter ולא ב-list. זה ההבדל בין קריסה להצלחה.
     */
    const households = await base44.asServiceRole.entities.Household.filter({ 
      whatsapp_number: cleanFrom 
    });
    
    const household = households?.[0];
    let replyText = "";

    if (!household) {
      // בדיקת אקטיבציה מהירה
      const activation = await base44.asServiceRole.entities.Household.filter({
        activation_code: body
      });
      if (activation?.[0]) {
        await base44.asServiceRole.entities.Household.update(activation[0].id, {
          whatsapp_number: cleanFrom,
          activation_code: null
        });
        replyText = "חוברנו! 👋";
      } else {
        replyText = "היי! שלח קוד הפעלה כדי שנתחיל.";
      }
    } else {
      // אם המשתמש קיים, פשוט תענה לו משהו פשוט כרגע לבדיקת החיבור
      replyText = `קיבלתי: ${body}. החיבור עובד!`;
    }

    // החזרת TwiML - זה מה ש-Twilio חייבת לקבל
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyText}</Message></Response>`;
    
    return new Response(twiml, {
      headers: { "Content-Type": "text/xml" }
    });

  } catch (error) {
    // במקרה של שגיאה, עדיין מחזירים XML כדי ש-Twilio לא תציג 502
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error: ${error.message}</Message></Response>`, {
      headers: { "Content-Type": "text/xml" }
    });
  }
});