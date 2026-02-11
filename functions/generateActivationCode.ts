import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { household_id } = await req.json();

    if (!household_id) {
      return Response.json({ error: 'household_id is required' }, { status: 400 });
    }

    // Verify user has access to this household
    const household = await base44.entities.Household.get(household_id);
    if (!household || (household.owner_email !== user.email && !household.members?.includes(user.email))) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate activation code with 'B44-' prefix
    const activationCode = 'B44-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update household with activation code
    await base44.entities.Household.update(household_id, {
      activation_code: activationCode,
      activation_code_expires: expiresAt.toISOString()
    });

    return Response.json({ 
      success: true,
      activation_code: activationCode,
      expires_at: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Error generating activation code:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});