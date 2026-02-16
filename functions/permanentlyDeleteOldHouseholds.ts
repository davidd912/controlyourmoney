import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all households marked as deleted
    const allHouseholds = await base44.asServiceRole.entities.Household.list();
    const deletedHouseholds = allHouseholds.filter(h => h.is_deleted && h.deleted_at);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const householdsToDelete = deletedHouseholds.filter(h => {
      const deletedDate = new Date(h.deleted_at);
      return deletedDate < thirtyDaysAgo;
    });

    let deletedCount = 0;

    for (const household of householdsToDelete) {
      // Delete related data first
      const incomes = await base44.asServiceRole.entities.Income.filter({ household_id: household.id });
      for (const income of incomes) {
        await base44.asServiceRole.entities.Income.delete(income.id);
      }

      const expenses = await base44.asServiceRole.entities.Expense.filter({ household_id: household.id });
      for (const expense of expenses) {
        await base44.asServiceRole.entities.Expense.delete(expense.id);
      }

      const debts = await base44.asServiceRole.entities.Debt.filter({ household_id: household.id });
      for (const debt of debts) {
        await base44.asServiceRole.entities.Debt.delete(debt.id);
      }

      const assets = await base44.asServiceRole.entities.Asset.filter({ household_id: household.id });
      for (const asset of assets) {
        await base44.asServiceRole.entities.Asset.delete(asset.id);
      }

      const alerts = await base44.asServiceRole.entities.Alert.filter({ household_id: household.id });
      for (const alert of alerts) {
        await base44.asServiceRole.entities.Alert.delete(alert.id);
      }

      const goals = await base44.asServiceRole.entities.Goal.filter({ household_id: household.id });
      for (const goal of goals) {
        await base44.asServiceRole.entities.Goal.delete(goal.id);
      }

      // Finally delete the household itself
      await base44.asServiceRole.entities.Household.delete(household.id);
      deletedCount++;
    }

    return Response.json({
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} households that were deleted over 30 days ago`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});