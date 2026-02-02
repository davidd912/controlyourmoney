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

        // Get users created today with details
        const newUsersToday = allUsers.filter(u => {
            const createdDate = new Date(u.created_date);
            return createdDate >= startOfDay && createdDate <= endOfDay;
        }).map(u => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            role: u.role,
            created_date: u.created_date
        }));

        // Get households created today with details
        const newHouseholdsToday = allHouseholds.filter(h => {
            const createdDate = new Date(h.created_date);
            return createdDate >= startOfDay && createdDate <= endOfDay;
        }).map(h => ({
            id: h.id,
            name: h.name,
            owner_email: h.owner_email,
            members_count: h.members ? h.members.length : 0,
            created_date: h.created_date
        }));

        // Group all users by date
        const usersByDate = {};
        allUsers.forEach(u => {
            const date = new Date(u.created_date).toISOString().split('T')[0];
            if (!usersByDate[date]) {
                usersByDate[date] = [];
            }
            usersByDate[date].push({
                id: u.id,
                email: u.email,
                full_name: u.full_name,
                role: u.role,
                created_date: u.created_date
            });
        });

        // Group all households by date
        const householdsByDate = {};
        allHouseholds.forEach(h => {
            const date = new Date(h.created_date).toISOString().split('T')[0];
            if (!householdsByDate[date]) {
                householdsByDate[date] = [];
            }
            householdsByDate[date].push({
                id: h.id,
                name: h.name,
                owner_email: h.owner_email,
                members_count: h.members ? h.members.length : 0,
                created_date: h.created_date
            });
        });

        return Response.json({
            date: startOfDay.toISOString().split('T')[0],
            newUsersToday,
            newHouseholdsToday,
            usersByDate,
            householdsByDate,
            totalUsers: allUsers.length,
            totalHouseholds: allHouseholds.length
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});