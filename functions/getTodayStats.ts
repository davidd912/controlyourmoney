import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Verify admin access
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Get today's date boundaries (start and end of day)
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // Get all users and households using service role
        const allUsers = await base44.asServiceRole.entities.User.list();
        const allHouseholds = await base44.asServiceRole.entities.Household.list();

        // Count users created today
        const newUsersToday = allUsers.filter(u => {
            const createdDate = new Date(u.created_date);
            return createdDate >= startOfDay && createdDate <= endOfDay;
        }).length;

        // Count households created today
        const newHouseholdsToday = allHouseholds.filter(h => {
            const createdDate = new Date(h.created_date);
            return createdDate >= startOfDay && createdDate <= endOfDay;
        }).length;

        return Response.json({
            date: startOfDay.toISOString().split('T')[0],
            newUsersToday,
            newHouseholdsToday,
            totalUsers: allUsers.length,
            totalHouseholds: allHouseholds.length
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});