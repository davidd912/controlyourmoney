import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Normalize merchant name
function normalizeMerchantName(name) {
    return name.trim().toLowerCase()
        .replace(/[״"'\(\)\[\]]/g, '')
        .replace(/\s+/g, ' ');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            household_id,
            type,
            amount,
            merchant,
            category_id,
            subcategory,
            description,
            month,
            year,
            custom_category_name
        } = await req.json();

        // Validate required fields
        if (!household_id || !type || !amount || !category_id) {
            return Response.json({ 
                error: 'Missing required fields: household_id, type, amount, category_id' 
            }, { status: 400 });
        }

        if (!['expense', 'income'].includes(type)) {
            return Response.json({ error: 'Invalid type. Must be expense or income' }, { status: 400 });
        }

        // Verify user belongs to household
        const household = await base44.entities.Household.filter({ id: household_id });
        if (!household || household.length === 0) {
            return Response.json({ error: 'Household not found' }, { status: 404 });
        }
        
        const householdData = household[0];
        const isMember = householdData.owner_email === user.email || 
                        (householdData.members && householdData.members.includes(user.email));
        
        if (!isMember) {
            return Response.json({ error: 'Forbidden: Not a member of this household' }, { status: 403 });
        }

        // Default to current month/year if not provided
        const now = new Date();
        const txMonth = month || now.getMonth() + 1;
        const txYear = year || now.getFullYear();

        // Step 1: Create transaction record
        let transactionId;
        
        if (type === 'expense') {
            const expenseData = {
                household_id,
                month: txMonth,
                year: txYear,
                category: category_id,
                amount,
                description: description || merchant || '',
                is_current: true,
                is_budget: false,
                is_recurring: false
            };

            if (subcategory) {
                expenseData.subcategory = subcategory;
            }

            if (category_id === 'custom' && custom_category_name) {
                expenseData.custom_category_name = custom_category_name;
            }

            const expense = await base44.entities.Expense.create(expenseData);
            transactionId = expense.id;

        } else if (type === 'income') {
            const incomeData = {
                household_id,
                month: txMonth,
                year: txYear,
                category: category_id,
                amount,
                description: description || merchant || '',
                is_current: true,
                is_budget: false,
                is_recurring: false
            };

            if (subcategory) {
                incomeData.subcategory = subcategory;
            }

            const income = await base44.entities.Income.create(incomeData);
            transactionId = income.id;
        }

        // Step 2: Upsert MerchantRule
        if (merchant && merchant.trim() !== '') {
            const normalizedKey = normalizeMerchantName(merchant);
            
            // Check if rule exists
            const existingRules = await base44.entities.MerchantRule.filter({
                household_id,
                key: normalizedKey
            });

            if (existingRules && existingRules.length > 0) {
                // Update existing rule
                const rule = existingRules[0];
                await base44.entities.MerchantRule.update(rule.id, {
                    default_type: type,
                    default_category_id: category_id,
                    times_used: (rule.times_used || 0) + 1,
                    last_used_at: new Date().toISOString()
                });
            } else {
                // Create new rule
                await base44.entities.MerchantRule.create({
                    household_id,
                    key: normalizedKey,
                    default_type: type,
                    default_category_id: category_id,
                    times_used: 1,
                    last_used_at: new Date().toISOString()
                });
            }
        }

        return Response.json({
            success: true,
            transaction_id: transactionId,
            type,
            message: 'טרנזקציה נוצרה בהצלחה'
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});