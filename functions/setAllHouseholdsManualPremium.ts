import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const households = await base44.asServiceRole.entities.Household.list();

    let updated = 0;
    for (const household of households) {
      if (household.subscription_type !== 'manual_premium') {
        await base44.asServiceRole.entities.Household.update(household.id, {
          subscription_type: 'manual_premium'
        });
        updated++;
      }
    }

    return Response.json({
      success: true,
      total: households.length,
      updated
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});