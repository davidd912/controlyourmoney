import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all debts with monthly payments
    const allDebts = await base44.asServiceRole.entities.Debt.list();
    const debtsToUpdate = allDebts.filter(debt => 
      debt.is_recurring && 
      debt.monthly_payment > 0 && 
      debt.remaining_balance > 0
    );

    const updates = [];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    for (const debt of debtsToUpdate) {
      // Check if already updated this month
      if (debt.last_deduction_month === currentMonth && debt.last_deduction_year === currentYear) {
        continue;
      }

      const newBalance = Math.max(0, debt.remaining_balance - debt.monthly_payment);
      const remainingPayments = debt.remaining_payments > 0 ? debt.remaining_payments - 1 : 0;

      await base44.asServiceRole.entities.Debt.update(debt.id, {
        remaining_balance: newBalance,
        remaining_payments: remainingPayments,
        last_deduction_month: currentMonth,
        last_deduction_year: currentYear
      });

      updates.push({
        id: debt.id,
        creditor: debt.creditor_name,
        oldBalance: debt.remaining_balance,
        newBalance: newBalance,
        payment: debt.monthly_payment
      });
    }

    return Response.json({
      success: true,
      message: `עודכנו ${updates.length} חובות`,
      updates: updates
    });

  } catch (error) {
    console.error('Error updating debts:', error);
    return Response.json({ 
      error: 'Failed to update debts', 
      details: error.message 
    }, { status: 500 });
  }
});