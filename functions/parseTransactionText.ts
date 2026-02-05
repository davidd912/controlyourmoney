import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Normalize merchant name for matching
function normalizeMerchantName(text) {
    return text.trim().toLowerCase()
        .replace(/[״"'\(\)\[\]]/g, '') // Remove quotes and brackets
        .replace(/\s+/g, ' '); // Normalize spaces
}

// Extract amount and currency using regex
function extractAmountAndCurrency(text) {
    // Match patterns like: 100₪, 100 ש"ח, ₪100, 100 שקל, 100 שקלים
    const patterns = [
        /(\d+(?:[.,]\d+)?)\s*(?:₪|ש"ח|שקל(?:ים)?)/i,
        /(?:₪|ש"ח)\s*(\d+(?:[.,]\d+)?)/i,
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const amount = parseFloat(match[1].replace(',', '.'));
            return { amount, currency: 'ILS' };
        }
    }
    
    return null;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text, household_id } = await req.json();

        if (!text || !household_id) {
            return Response.json({ error: 'Missing text or household_id' }, { status: 400 });
        }

        // Verify user belongs to this household
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

        // Step 1: Extract amount and currency using Regex
        const extracted = extractAmountAndCurrency(text);
        const amountFromRegex = extracted?.amount || null;
        const currency = extracted?.currency || 'ILS';

        // Step 2: Check for existing MerchantRule
        const normalizedText = normalizeMerchantName(text);
        const merchantRules = await base44.entities.MerchantRule.filter({ 
            household_id,
        });
        
        let matchedRule = null;
        for (const rule of merchantRules) {
            if (normalizedText.includes(rule.key) || rule.key.includes(normalizedText)) {
                matchedRule = rule;
                break;
            }
        }

        // Step 3: Fetch available categories from DB
        // Since categories are enums in Expense/Income, we'll map them manually
        const expenseCategories = [
            { id: 'food', name: 'מזון', type: 'expense' },
            { id: 'leisure', name: 'פנאי ובילויים', type: 'expense' },
            { id: 'clothing', name: 'ביגוד והנעלה', type: 'expense' },
            { id: 'household_items', name: 'ציוד לבית', type: 'expense' },
            { id: 'home_maintenance', name: 'תחזוקת בית', type: 'expense' },
            { id: 'grooming', name: 'טיפוח', type: 'expense' },
            { id: 'education', name: 'חינוך', type: 'expense' },
            { id: 'events', name: 'אירועים', type: 'expense' },
            { id: 'health', name: 'בריאות', type: 'expense' },
            { id: 'transportation', name: 'תחבורה', type: 'expense' },
            { id: 'family', name: 'משפחה', type: 'expense' },
            { id: 'communication', name: 'תקשורת', type: 'expense' },
            { id: 'housing', name: 'דיור', type: 'expense' },
            { id: 'obligations', name: 'התחייבויות', type: 'expense' },
            { id: 'assets', name: 'נכסים', type: 'expense' },
            { id: 'finance', name: 'פיננסים', type: 'expense' },
            { id: 'custom', name: 'מותאם אישית', type: 'expense' },
            { id: 'other', name: 'אחר', type: 'expense' },
        ];

        const incomeCategories = [
            { id: 'salary', name: 'משכורת', type: 'income' },
            { id: 'allowance', name: 'קצבה', type: 'income' },
            { id: 'other', name: 'אחר', type: 'income' },
        ];

        const allCategories = [...expenseCategories, ...incomeCategories];

        // Step 4: Build LLM prompt
        const prompt = `אתה מנתח טרנזקציות פיננסיות בעברית. המשימה שלך היא להמיר טקסט חופשי לנתוני טרנזקציה מובנים.

קלט מהמשתמש: "${text}"

${amountFromRegex ? `סכום שזוהה (Regex): ${amountFromRegex} ${currency}` : 'לא זוהה סכום'}
${matchedRule ? `חוק קיים נמצא: עסק "${matchedRule.key}", ברירת מחדל: ${matchedRule.default_type}, קטגוריה: ${matchedRule.default_category_id}` : 'לא נמצא חוק קיים'}

קטגוריות זמינות:
${allCategories.map(c => `- ${c.id} (${c.name}) [${c.type}]`).join('\n')}

הוראות קפדניות:
1. החזר **אך ורק** JSON תקין ללא טקסט נוסף
2. השתמש בסכום מה-Regex אם קיים ואמין
3. אם יש חוק קיים - **העדף** את הקטגוריה והסוג שלו, אלא אם הטקסט מצביע באופן מפורש על משהו אחר
4. החזר **רק** category_id מהרשימה למעלה (או null אם לא בטוח)
5. type יכול להיות "expense", "income", או "unknown"
6. confidence: מספר בין 0-100
7. merchant: שם העסק המנורמל (lowercase, ללא תווים מיוחדים)
8. אם חסר מידע או confidence נמוך - החזר רשימה ריקה ב-questions (השרת יחשב את השאלות)

פורמט תשובה (JSON בלבד):
{
  "amount": number | null,
  "merchant": "string" | null,
  "type": "expense" | "income" | "unknown",
  "category_id": "string" | null,
  "confidence": number,
  "raw_text": "${text}",
  "currency": "${currency}"
}`;

        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    amount: { type: ["number", "null"] },
                    merchant: { type: ["string", "null"] },
                    type: { type: "string", enum: ["expense", "income", "unknown"] },
                    category_id: { type: ["string", "null"] },
                    confidence: { type: "number" },
                    raw_text: { type: "string" },
                    currency: { type: "string" }
                }
            }
        });

        const parsed = llmResponse;

        // Step 5: Calculate missing_fields and questions on server
        const missing_fields = [];
        const questions = [];

        if (!parsed.amount || parsed.amount <= 0) {
            missing_fields.push('amount');
            questions.push('מה הסכום של הטרנזקציה?');
        }

        if (!parsed.merchant || parsed.merchant.trim() === '') {
            missing_fields.push('merchant');
            questions.push('מהו שם העסק או התיאור?');
        }

        if (parsed.type === 'unknown') {
            missing_fields.push('type');
            questions.push('האם זו הוצאה או הכנסה?');
        }

        if (!parsed.category_id || parsed.category_id === 'null') {
            missing_fields.push('category_id');
            const typeLabel = parsed.type === 'expense' ? 'הוצאה' : parsed.type === 'income' ? 'הכנסה' : 'טרנזקציה';
            questions.push(`לאיזו קטגוריה שייכת ה${typeLabel}?`);
        }

        // Step 6: Return enriched response
        return Response.json({
            ...parsed,
            missing_fields,
            questions,
            matched_rule: matchedRule ? {
                key: matchedRule.key,
                default_type: matchedRule.default_type,
                default_category_id: matchedRule.default_category_id
            } : null
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});