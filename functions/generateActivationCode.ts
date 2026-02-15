import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { household_id } = await req.json();

    if (!household_id) {
      return Response.json({ error: "Missing household_id" }, { status: 400 });
    }

    // יצירת קוד רנדומלי קצר (6 ספרות)
    const activation_code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // קביעת זמן תפוגה (24 שעות מהיום)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // עדכון רק את קוד ההפעלה ותוקפו - לא נוגעים ב-expires_at
    await base44.asServiceRole.entities.Household.update(household_id, {
      activation_code: activation_code,
      activation_code_expires: expiresAt.toISOString()
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