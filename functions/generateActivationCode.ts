import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // שליפת הנתונים מהבקשה (למשל ה-ID של משק הבית)
    const { household_id } = await req.json();

    if (!household_id) {
      return Response.json({ error: "Missing household_id" }, { status: 400 });
    }

    // 1. יצירת קוד רנדומלי קצר (6 ספרות) - פעולה מהירה מאוד
    const activation_code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. קביעת זמן תפוגה (למשל 24 שעות מהיום)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    /**
     * אופטימיזציה קריטית:
     * אנחנו לא מושכים את כל הרשימה. אנחנו פשוט מעדכנים ישירות את משק הבית הספציפי.
     * זה חוסך המון CPU.
     */
    // חישוב תאריך expires_at - 14 יום מעכשיו
    const subscriptionExpiresAt = new Date();
    subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 14);

    await base44.asServiceRole.entities.Household.update(household_id, {
      activation_code: activation_code,
      activation_code_expires: expiresAt.toISOString(),
      expires_at: subscriptionExpiresAt.toISOString()
    });

    return Response.json({ 
      success: true, 
      activation_code: activation_code,
      expires_at: expiresAt.toISOString() 
    });

  } catch (error) {
    console.error("Error generating code:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});