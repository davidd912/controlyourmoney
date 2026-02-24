import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // בדיקת הרשאת מנהל
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // שליפת כל הנתונים במקביל לביצועים מהירים
        const [allUsers, allHouseholds, allIncomes, allExpenses, allDebts] = await Promise.all([
            base44.asServiceRole.entities.User.list(),
            base44.asServiceRole.entities.Household.list(),
            base44.asServiceRole.entities.Income.list('-created_date', 1000),
            base44.asServiceRole.entities.Expense.list('-created_date', 1000),
            base44.asServiceRole.entities.Debt.list('-created_date', 1000)
        ]);

        const isToday = (dateStr: string) => new Date(dateStr) >= startOfDay;

        // סינון פעולות מהיום
        const incomesToday = (allIncomes || []).filter(i => isToday(i.created_date));
        const expensesToday = (allExpenses || []).filter(e => isToday(e.created_date));
        const debtsToday = (allDebts || []).filter(d => isToday(d.created_date));

        // זיהוי משתמשים שביצעו פעולה היום
        const activeUserEmails = new Set([
            ...incomesToday.map(i => i.created_by),
            ...expensesToday.map(e => e.created_by),
            ...debtsToday.map(d => d.created_by)
        ]);

        return Response.json({
            summary: {
                totalUsers: allUsers.length,
                totalHouseholds: allHouseholds.length,
                activeUsersToday: activeUserEmails.size,
                totalEntriesToday: incomesToday.length + expensesToday.length + debtsToday.length,
            },
            activityBreakdown: {
                incomes: incomesToday.length,
                expenses: expensesToday.length,
                debts: debtsToday.length
            },
            newUsersToday: allUsers.filter(u => isToday(u.created_date)).map(u => ({
                full_name: u.full_name,
                email: u.email,
                created_date: u.created_date
            })),
            usersByDate: groupByDate(allUsers, 'created_date'),
            householdsByDate: groupByDate(allHouseholds, 'created_date')
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});