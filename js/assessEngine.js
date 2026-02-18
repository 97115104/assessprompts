const AssessEngine = (() => {

    // Current per-token pricing table (USD per million tokens, input / output)
    // Updated: early 2026
    const PRICING_TABLE = [
        {
            provider: 'Anthropic',
            model_name: 'Claude Opus 4.6',
            input_price_per_mtok: 15.00,
            output_price_per_mtok: 75.00
        },
        {
            provider: 'Anthropic',
            model_name: 'Claude Sonnet 4.6',
            input_price_per_mtok: 3.00,
            output_price_per_mtok: 15.00
        },
        {
            provider: 'Anthropic',
            model_name: 'Claude Haiku 4.5',
            input_price_per_mtok: 0.80,
            output_price_per_mtok: 4.00
        },
        {
            provider: 'OpenAI',
            model_name: 'GPT-4o',
            input_price_per_mtok: 2.50,
            output_price_per_mtok: 10.00
        },
        {
            provider: 'OpenAI',
            model_name: 'GPT-4o mini',
            input_price_per_mtok: 0.15,
            output_price_per_mtok: 0.60
        },
        {
            provider: 'OpenAI',
            model_name: 'o1',
            input_price_per_mtok: 15.00,
            output_price_per_mtok: 60.00
        },
        {
            provider: 'OpenAI',
            model_name: 'o3-mini',
            input_price_per_mtok: 1.10,
            output_price_per_mtok: 4.40
        },
        {
            provider: 'Google',
            model_name: 'Gemini 2.0 Flash',
            input_price_per_mtok: 0.10,
            output_price_per_mtok: 0.40
        },
        {
            provider: 'Google',
            model_name: 'Gemini 1.5 Pro',
            input_price_per_mtok: 1.25,
            output_price_per_mtok: 5.00
        },
        {
            provider: 'Google',
            model_name: 'Gemini 2.5 Pro',
            input_price_per_mtok: 1.25,
            output_price_per_mtok: 10.00
        },
        {
            provider: 'xAI',
            model_name: 'Grok-3',
            input_price_per_mtok: 3.00,
            output_price_per_mtok: 15.00
        },
        {
            provider: 'Meta / Groq',
            model_name: 'Llama 3.3 70B',
            input_price_per_mtok: 0.59,
            output_price_per_mtok: 0.79
        }
    ];

    function buildAssessmentPrompt(prompt, context) {
        const pricingLines = PRICING_TABLE.map(m =>
            `- ${m.provider} ${m.model_name}: $${m.input_price_per_mtok.toFixed(2)} input / $${m.output_price_per_mtok.toFixed(2)} output per million tokens`
        ).join('\n');

        const systemMessage = `You are a strategic advisor and expert in designing prompts and building software using AI tools. Your role is to critically evaluate prompts and provide actionable feedback that helps users improve their prompt engineering skills and understand the real operational cost of running their prompts at scale.

You evaluate prompts across these 10 dimensions:
1. Clarity — Is the objective unambiguous? Could a different person interpret it differently?
2. Completeness — Is all necessary context and constraints included?
3. Specificity — Are instructions precise enough to minimize guesswork by the model?
4. Structure — Is the prompt well-organized, logical, and easy to follow?
5. Output definition — Is the expected output format, length, and type clearly specified?
6. Error handling — Are edge cases, failure modes, and fallbacks addressed?
7. Efficiency — Is the prompt optimally concise, or does it contain redundancy and bloat?
8. Token optimization — Are tokens used wisely, or is there waste that inflates cost?
9. Model alignment — Is the complexity, tone, and structure appropriate for the intended model class?
10. Actionability — Will this prompt consistently produce a useful, correct, and actionable result?

You must return a valid JSON object with exactly these keys:

- "assessment_summary": A 2-3 sentence expert assessment of the prompt. Be direct, specific, and candid. Identify the most important quality characteristic and the most critical weakness.

- "score": An integer from 0 to 100 representing overall prompt quality. Use the full range — a perfect prompt is rare.

- "grade": A letter grade matching the score: A+ (97-100), A (93-96), A- (90-92), B+ (87-89), B (83-86), B- (80-82), C+ (77-79), C (73-76), C- (70-72), D+ (67-69), D (60-66), F (0-59).

- "strengths": An array of 2-5 strings listing specific things the prompt does well. Be specific — reference actual content in the prompt, not generic praise.

- "issues": An array of 2-6 strings listing specific problems, ambiguities, or errors. For each issue, explain exactly what is wrong and why it matters for model output quality.

- "missing_elements": An array of 1-5 strings listing things that are absent but would meaningfully improve the prompt. Focus on high-impact omissions, not wishlist items.

- "suggestions": An array of 3-6 objects. Each object has "title" (a short 3-6 word label) and "detail" (a specific, actionable recommendation of 1-3 sentences). Every suggestion must be concrete — tell the user exactly what to change or add, not just that something should change.

- "optimized_version": A rewritten version of the prompt with all your suggestions applied. Preserve the original intent completely. The optimized version should be production-ready and demonstrably better than the original.

- "token_count": An integer estimating the token count of the INPUT prompt provided (not the optimized version). Rule of thumb: 1 token ≈ 0.75 words, or approximately 4 characters per token.

- "estimated_output_tokens": An integer estimating how many output tokens a typical high-quality model response would require, based on the scope and output requirements implied by the prompt.

- "cost_estimates": An object with two keys:
  - "models": An array of cost objects. For each model in the pricing table, include: provider (string), model_name (string), input_price_per_mtok (number), output_price_per_mtok (number), cost_per_run_usd (calculated as (token_count / 1000000 * input_price_per_mtok) + (estimated_output_tokens / 1000000 * output_price_per_mtok)), cost_per_100_runs_usd (cost_per_run_usd * 100), cost_per_1000_runs_usd (cost_per_run_usd * 1000).
  - "self_hosted_note": A string explaining self-hosted cost for this prompt size, covering: 7B models via Ollama (effectively $0 in API fees, limited quality), 70B models on cloud GPU at ~$3.20/hr with ~1,500 tok/sec throughput, and the rough per-million-token cost for cloud GPU inference.

Use these current pricing rates (USD per million tokens, input / output):
${pricingLines}

- "optimization_notes": 1-2 sentences summarizing the most impactful change applied in the optimized version and why it matters.

Return ONLY the JSON object. No markdown fences, no preamble, no explanation outside the JSON.`;

        const userMessage = `Assess this prompt and provide strategic feedback:
${context ? `\nContext about this prompt's intended use: ${context}\n` : ''}
--- PROMPT TO ASSESS ---
${prompt}
--- END PROMPT ---

Evaluate the prompt against all 10 dimensions listed in your instructions. Calculate cost estimates precisely using the token count you estimate and the pricing rates provided. Return only the JSON object.`;

        return {
            system: systemMessage,
            user: userMessage
        };
    }

    return { buildAssessmentPrompt, PRICING_TABLE };
})();
