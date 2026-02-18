# Assess Prompts

Expert AI feedback on your prompts via a quality score, optimization suggestions, missing elements, and real cost estimates across frontier models.

## Features

- **Quality score and grade** — Every prompt receives a 0-100 score with a letter grade (A+ through F) from a strategic prompt engineering advisor
- **Expert assessment** — Evaluates clarity, completeness, specificity, structure, output definition, error handling, efficiency, token optimization, model alignment, and actionability
- **Strengths and issues** — Specific, referenced feedback on what the prompt does well and exactly what is wrong and why it matters
- **Missing elements** — High-impact additions that are absent from the prompt
- **Actionable suggestions** — 3-6 specific recommendations with titles and detailed explanations, not generic advice
- **Optimized version** — A rewritten, production-ready version of your prompt with all improvements applied
- **Cost estimates** — Per-run, per-100-run, and per-1,000-run cost for every major frontier model: Anthropic Claude, OpenAI GPT-4o, Google Gemini, xAI Grok, and Meta Llama, plus self-hosted inference notes
- **Multi-provider support** — Puter (free), OpenRouter, Anthropic, OpenAI, Google Gemini, Ollama (local), and any OpenAI-compatible custom endpoint
- **Four output formats** — Assessment, Suggestions, Cost Estimate, and raw JSON
- **Fully serverless** — Runs entirely in the browser with no backend required
- **Share Prompt** — Share a prefilled URL of your prompt, with or without auto-assess, via a share modal
- **Use optimized prompt** — Open the improved prompt directly in ChatGPT, Claude, Copilot, or Gemini
- **URL routing** — Prefill prompts via query parameters and optionally auto-assess on page load
- **Smart loading UX** — Preflight connection checks, progressive status updates, and slow-generation hints
- **Automatic fallback** — When Puter errors occur, a guided Ollama setup walkthrough appears

## How It Works

1. Select an API provider (Puter GPT-OSS is free and requires no key)
2. Paste the prompt you want to assess into the text area
3. Optionally add context about the prompt's intended use, target model, or expected output
4. Click **Assess Prompt**
5. Get back a structured assessment with score, strengths, issues, suggestions, an optimized version, and cost estimates

The tool sends your prompt to a language model acting as a strategic advisor specializing in prompt engineering and AI-driven software development. The advisor evaluates the prompt across 10 dimensions and returns structured, actionable feedback.

## Assessment Dimensions

Every prompt is evaluated across these 10 dimensions:

| Dimension | What It Measures |
|-----------|-----------------|
| Clarity | Is the objective unambiguous? Could a different person interpret it differently? |
| Completeness | Is all necessary context and constraints included? |
| Specificity | Are instructions precise enough to minimize guesswork? |
| Structure | Is the prompt well-organized, logical, and easy to follow? |
| Output definition | Is the expected output format, length, and type clearly specified? |
| Error handling | Are edge cases, failure modes, and fallbacks addressed? |
| Efficiency | Is the prompt optimally concise, or does it contain bloat? |
| Token optimization | Are tokens used wisely, or is there waste that inflates cost? |
| Model alignment | Is the complexity appropriate for the intended model class? |
| Actionability | Will this prompt consistently produce a useful, correct result? |

## Output Tabs

### Assessment
- Quality score (0-100) and letter grade (A+ through F)
- 2-3 sentence expert summary
- Strengths list — specific things the prompt does well
- Issues list — specific problems with explanations of why they matter
- Missing elements — high-impact additions that are absent

### Suggestions
- 3-6 actionable optimization suggestions with detailed explanations
- Optimized version — a rewritten, production-ready prompt with all improvements applied

### Cost Estimate
- Estimated input token count for the prompt
- Estimated output token count for a typical response
- Cost table: per run, per 100 runs, per 1,000 runs across all major models
- Self-hosted inference cost note (Ollama, cloud GPU)

Included models (pricing as of early 2026):

| Provider | Model | Input $/MTok | Output $/MTok |
|---------|-------|-------------|--------------|
| Anthropic | Claude Opus 4.6 | $15.00 | $75.00 |
| Anthropic | Claude Sonnet 4.6 | $3.00 | $15.00 |
| Anthropic | Claude Haiku 4.5 | $0.80 | $4.00 |
| OpenAI | GPT-4o | $2.50 | $10.00 |
| OpenAI | GPT-4o mini | $0.15 | $0.60 |
| OpenAI | o1 | $15.00 | $60.00 |
| OpenAI | o3-mini | $1.10 | $4.40 |
| Google | Gemini 2.0 Flash | $0.10 | $0.40 |
| Google | Gemini 1.5 Pro | $1.25 | $5.00 |
| Google | Gemini 2.5 Pro | $1.25 | $10.00 |
| xAI | Grok-3 | $3.00 | $15.00 |
| Meta / Groq | Llama 3.3 70B | $0.59 | $0.79 |

### JSON
Full structured response from the model, syntax-highlighted and downloadable.

## API Providers

| Provider | `apiMode` | Auth | CORS | Notes |
|----------|-----------|------|------|-------|
| Puter GPT-OSS | `puter` | None required | Yes | Free, no API key. Default provider. |
| OpenRouter | `openrouter` | Bearer token | Yes | Hundreds of models. Recommended for browser use with a key. |
| Anthropic | `anthropic` | x-api-key | With header | Uses Messages API format. |
| OpenAI | `openai` | Bearer token | No | Requires CORS proxy for browser use. |
| Google Gemini | `google` | API key in URL | Yes | Uses generateContent format. |
| Ollama | `ollama` | None required | Requires `OLLAMA_ORIGINS=*` | Local models. No API key, works from GitHub Pages. |
| Custom | `custom` | Bearer token | Varies | Any OpenAI-compatible endpoint. |

### Puter GPT-OSS (Default)

Puter is completely free with no API key required. It uses Puter's user-pays model — you as a developer pay nothing. Each user covers their own AI inference through their Puter account. Users get a free usage allowance; any usage beyond that is billed to their own account, not yours.

Models available:
- `gpt-oss-120b` — 117B parameters, best quality, slower (30-60 seconds)
- `gpt-oss-120b:exacto` — precise variant for structured output
- `gpt-oss-20b` — 21B parameters, faster, slightly lower quality

### OpenRouter

Access hundreds of models through a single CORS-friendly API. Recommended when you want to use Claude, GPT, Gemini, Llama, Mistral, or other models without CORS issues. Get a key at openrouter.ai/keys.

### Ollama (Local)

Run models locally with no API key, no usage limits, and no data leaving your machine. The default model is `gpt-oss:20b`. Start with `OLLAMA_ORIGINS=*` for browser access from GitHub Pages.

**Quick setup:**

```bash
# Install
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull gpt-oss:20b

# Start with browser access
OLLAMA_ORIGINS=* ollama serve
```

**Windows (PowerShell):**

```powershell
ollama pull gpt-oss:20b
Stop-Process -Name ollama -Force
$env:OLLAMA_ORIGINS="*"; ollama serve
```

### Anthropic, OpenAI, Google

Connect directly to provider APIs. Get keys at:
- Anthropic: console.anthropic.com
- OpenAI: platform.openai.com
- Google: aistudio.google.com

## URL Routing

Prefill the prompt via URL query parameters:

```
https://yourdomain.com/assessprompts/?prompt=Your+prompt+text+here
```

Add `&enter` to auto-assess on page load:

```
https://yourdomain.com/assessprompts/?prompt=Your+prompt+text+here&enter
```

The bare `?=` format also works:

```
https://yourdomain.com/assessprompts/?=Your+prompt+text+here
```

## Sharing and Using Prompts

### Share Prompt

The **Share Prompt** button opens a modal with two options:
- **Copy link** — prefills the prompt for the recipient
- **Copy link with auto-assess** — prefills and triggers assessment automatically on load

### Use Optimized Prompt

After assessment, the **Use optimized prompt** section lets you open the improved version in:

| Service | Behavior |
|---------|----------|
| ChatGPT | Opens with the optimized prompt via `?q=` parameter |
| Claude | Copies optimized prompt to clipboard, opens claude.ai/new |
| Copilot | Copies optimized prompt to clipboard, opens copilot.microsoft.com |
| Gemini | Copies optimized prompt to clipboard, opens gemini.google.com |

## Agentic / API Usage

Assess Prompts can be used programmatically by any agent or script. The assessment logic is a static meta-prompt sent to any LLM. Replicate it by constructing the same system and user messages from `js/assessEngine.js` and sending them to any OpenAI-compatible endpoint.

### System Message

The system message defines the strategic advisor role, the 10 evaluation dimensions, the required JSON output schema, and the current model pricing table. See `js/assessEngine.js` → `buildAssessmentPrompt()` for the exact template.

### Expected JSON Response

```json
{
  "assessment_summary": "2-3 sentence expert assessment...",
  "score": 78,
  "grade": "C+",
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "issues": ["Specific issue 1 with explanation", "Specific issue 2"],
  "missing_elements": ["Missing element 1", "Missing element 2"],
  "suggestions": [
    {
      "title": "Add output format",
      "detail": "Specify exactly what format the response should take..."
    }
  ],
  "optimized_version": "Rewritten prompt with improvements applied...",
  "token_count": 450,
  "estimated_output_tokens": 800,
  "cost_estimates": {
    "models": [
      {
        "provider": "Anthropic",
        "model_name": "Claude Sonnet 4.6",
        "input_price_per_mtok": 3.00,
        "output_price_per_mtok": 15.00,
        "cost_per_run_usd": 0.01335,
        "cost_per_100_runs_usd": 1.335,
        "cost_per_1000_runs_usd": 13.35
      }
    ],
    "self_hosted_note": "Running with Ollama costs $0 in API fees..."
  },
  "optimization_notes": "The most impactful change was adding explicit output format..."
}
```

## Deployment (GitHub Pages)

1. Fork or clone this repository
2. Go to **Settings > Pages**
3. Set source to **Deploy from a branch**, select `main`, root `/`
4. Your site will be live at `https://<username>.github.io/assessprompts/`

No build step required — it's a static site.

## Project Structure

```
assessprompts/
├── index.html              # Application shell
├── css/
│   ├── styles.css          # Layout and typography
│   └── components.css      # Buttons, tabs, panels, assessment UI
├── js/
│   ├── app.js              # Workflow orchestration and UI event handling
│   ├── assessEngine.js     # Assessment meta-prompt builder and pricing table
│   ├── apiClient.js        # Multi-provider API client (Puter, OpenRouter, Anthropic, OpenAI, Google, Ollama, Custom)
│   └── uiRenderer.js       # DOM rendering and interactions
├── assets/
│   └── favicon.svg         # Green "AP" logo icon
├── LICENSE                 # MIT License
├── ATTESTATION.md          # AI collaboration disclosure
└── README.md
```

## Technical Details

- Pure HTML, CSS, and JavaScript — no frameworks or build tools
- API key stored in-session or optionally in localStorage (prefixed `ap_`)
- Seven built-in API providers with native request format handling
- Puter and OpenRouter work directly in the browser without CORS issues
- Ollama works locally with `OLLAMA_ORIGINS=*` — no API key, no data leaves your machine
- Preflight checks verify Ollama/custom endpoint connectivity and model availability before sending requests
- Puter errors automatically trigger a guided Ollama fallback modal
- Temperature set to 0.3 for consistent, deterministic assessments
- Pricing table embedded in `assessEngine.js` and passed to the model in the system message
- Cost calculations performed by the model using the embedded pricing data
- URL routing supports `?prompt=`, bare `?=`, and `&enter` for auto-assessment
- Share Prompt modal with copy link and copy link with auto-assess options
- Use optimized prompt buttons open improved prompts directly in ChatGPT, Claude, Copilot, and Gemini
- Slow-generation hint appears after 10 seconds

## License

[MIT](LICENSE)

## Attestation

This project was developed with AI collaboration. See [ATTESTATION.md](ATTESTATION.md) for details.
