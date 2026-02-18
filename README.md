# Quality Prompts

Transform simple ideas into high-quality, production-ready prompts optimized for different model classes and usage contexts.

## Features

- **Subject-specific optimization** — Tailored prompt scaffolds for Development, Writing, Strategy, Product, Design, Marketing, Research, and Data Analysis
- **Prompt styles for every category** — Each subject type has specialized sub-types that adapt the prompt for specific workflows (PRDs, diagnostic debugging, photo editing, campaign planning, and more)
- **Subject-type instructions (STI)** — Each subject type carries a domain-specific system role that tunes the prompt engineer persona for the subject at hand, producing higher-quality output than a generic role
- **Model-aware generation** — Adjusts verbosity, reasoning depth, and constraints for Frontier, LLM, SLM, Paid/Premium, and Open-source models
- **Multi-provider support** — Puter (free), OpenRouter, Anthropic, OpenAI, Google Gemini, Ollama (local), and any OpenAI-compatible custom endpoint
- **Multiple output formats** — Plain text, structured markdown, and JSON for agent/API ingestion
- **Fully serverless** — Runs entirely in the browser with no backend required
- **Share Idea** — Share a prefilled URL of your idea, with or without auto-generate, via a share modal
- **Use this prompt** — Open the generated prompt directly in ChatGPT, Claude, Copilot, or Gemini
- **Assess this prompt** — Send the generated prompt to [Assess Prompts](https://97115104.github.io/assessprompts/) for quality scoring, optimization suggestions, and cost estimates
- **Copy, download, and email** — One-click copy, download, or share the generated prompt via email
- **URL routing** — Prefill prompts via query parameters and optionally auto-generate on page load
- **Smart loading UX** — Preflight connection checks, progressive status updates, and slow-generation hints
- **Automatic fallback** — When Puter errors occur, a guided Ollama setup walkthrough appears so the tool always works

## How It Works

1. Select an API provider (Puter GPT-OSS is free and requires no key)
2. Select a subject type and optionally a prompt style
3. Select a target model class
4. Type a simple idea or concept (or prefill via URL with `?prompt=`)
5. Optionally click **Share Idea** to share a prefilled link before generating
6. Click **Generate Prompt**
7. Get back an optimized prompt in three formats — copy, download, email, or open directly in ChatGPT, Claude, Copilot, or Gemini

The tool sends your idea to a language model along with subject-specific scaffolds, a domain-tuned system role, prompt style context, and model-specific constraints. The model returns a structured, production-ready prompt with evaluation criteria, deliverables, and edge case handling.

## Prompt Styles by Subject Type

Every subject type has specialized prompt styles that adapt the generated prompt for a specific workflow. Selecting **General** uses the default dimensions for that category.

### Development

| Style | Use When |
|-------|----------|
| Specification Prompt | Starting a new project or feature from scratch with no prior context. Produces detailed prompts covering language, framework, file structure, naming conventions, dependency policy, and all constraints. |
| Iteration Prompt | Making a targeted change to existing code. Produces short, surgical prompts that point to exact files and functions without restating the full specification. |
| Diagnostic Prompt | Debugging an unknown failure. Produces prompts that structure the problem with error messages, triggering inputs, and expected versus actual behavior. |

### Writing

| Style | Use When |
|-------|----------|
| Creative Writing (Long-Form) | Writing essays, blog posts, articles, fiction, or longform nonfiction. Establishes voice, structure, pacing, and thematic depth. |
| Short-Form Copy | Writing ads, taglines, social posts, product descriptions, or UI microcopy. Optimizes for clarity, impact, and brevity with multiple variants. |
| Marketing Communications | Writing emails, newsletters, press releases, or announcements. Structures output around audience, channel, and conversion goal. |

### Strategy

| Style | Use When |
|-------|----------|
| Business Strategy | Competitive positioning, growth planning, or market entry. Produces structured strategic analysis with prioritized recommendations. |
| Go-to-Market Strategy | Product launches, pricing strategy, or channel selection. Produces phased GTM plans with budget allocation and measurable milestones. |
| Technical Strategy | Architecture decisions, technology selection, or migration planning. Produces trade-off analysis with evaluation matrices and defensible recommendations. |

### Product

| Style | Use When |
|-------|----------|
| Product Requirements Document | Writing a full PRD with problem statement, personas, requirements, acceptance criteria, and out-of-scope boundaries. |
| User Stories | Writing sprint-ready user stories in standard format with Given/When/Then acceptance criteria and edge cases. |
| Feature Specification | Specifying a single feature in detail including all states (empty, loading, error, success), business rules, and API contracts. |

### Design

| Style | Use When |
|-------|----------|
| UI/UX Design | Wireframes, interaction flows, and component specifications with responsive behavior and accessibility requirements. |
| Design Assets | Logos, icons, illustrations, and visual elements. Produces precise visual descriptions for image generation models or creative briefs. |
| Photo Editing | Image modification, retouching, compositing, or style transfer. Separates what to change from what to preserve. |

### Marketing

| Style | Use When |
|-------|----------|
| Campaign Planning | Multi-channel campaigns with timelines, creative briefs, budget allocation, and performance targets. |
| Content Strategy | Editorial calendars, content pillars, SEO plans, and distribution strategy tied to business goals. |
| Social Media | Platform-specific strategies accounting for platform conventions, posting cadence, and algorithm behavior. |

### Research

| Style | Use When |
|-------|----------|
| Literature Review | Systematic source synthesis, gap analysis, and annotated bibliographies with inclusion/exclusion criteria. |
| User Research | Interview guides, survey design, usability studies, and persona development with bias mitigation. |
| Market Research | Competitive analysis, market sizing (TAM/SAM/SOM), and industry trend analysis with source attribution. |

### Data Analysis

| Style | Use When |
|-------|----------|
| Exploratory Analysis | Initial data profiling, pattern discovery, and hypothesis generation with systematic exploration plans. |
| Dashboard & Reporting | KPI dashboards with precise metric definitions, visualization choices, and interactivity specifications. |
| Statistical Modeling | Regression, classification, hypothesis testing, and model validation with assumption checking and reproducibility. |

## Subject-Type Instructions (STI)

Each subject type carries a `systemRole` field that tunes the system message for the domain at hand. Instead of a generic "You are an expert prompt engineer" role, the system message adapts:

- **Development** — "specializing in software development workflows"
- **Writing** — "specializing in written content across creative, commercial, and communications contexts"
- **Strategy** — "specializing in business strategy, planning, and decision-making frameworks"
- **Product** — "specializing in product management, requirements definition, and product development workflows"
- **Design** — "specializing in design workflows including UI/UX, visual design, and image generation"
- **Marketing** — "specializing in marketing strategy, campaign planning, and audience engagement"
- **Research** — "specializing in research methodology, analysis, and evidence-based inquiry"
- **Data Analysis** — "specializing in data analysis, statistical methods, and data visualization"

When a prompt style (sub-type) is selected, the system message also receives a `systemContext` block that further narrows the model's focus. For example, selecting "Diagnostic Prompt" under Development adds context about structuring debugging problems, while selecting "Photo Editing" under Design adds context about separating modifications from preservation. This two-layer approach (subject role + sub-type context) produces significantly better prompts than a one-size-fits-all system message.

## Agentic API Usage

Quality Prompts can be used programmatically by any agent, script, or automation that can call an OpenAI-compatible chat completions endpoint. The tool itself is a static frontend — the actual prompt generation happens through the LLM API. An agent can replicate the exact same generation logic by constructing the same system and user messages and sending them to any compatible endpoint.

### Step 1: Choose Parameters

Select one value from each category:

**Subject types:** `development`, `writing`, `strategy`, `product`, `design`, `marketing`, `research`, `data-analysis`

**Model types:** `frontier`, `llm`, `slm`, `paid`, `open-source`

**Sub-types (optional, per subject):**

| Subject | Available Sub-Types |
|---------|-------------------|
| `development` | `specification`, `iteration`, `diagnostic` |
| `writing` | `long-form`, `short-form`, `marketing-comms` |
| `strategy` | `business`, `go-to-market`, `technical` |
| `product` | `prd`, `user-story`, `feature-spec` |
| `design` | `ui-ux`, `design-assets`, `photo-editing` |
| `marketing` | `campaign`, `content`, `social-media` |
| `research` | `literature-review`, `user-research`, `market-research` |
| `data-analysis` | `exploratory`, `dashboard`, `statistical` |

### Step 2: Build the Messages

The system message and user message are constructed from scaffolds defined in `js/promptEngine.js`. An agent can either:

1. **Load the scaffolds directly** from `promptEngine.js` and call `PromptEngine.buildMetaPrompt(subjectType, idea, modelType, subType)` if running in a JavaScript environment, or
2. **Construct the messages manually** following the template below.

#### System Message Template

```
{systemRole from subject type} Your task is to transform a simple idea into a high-quality, production-ready prompt that will produce correct, useful output on the first or second pass.

{If a sub-type is selected, insert: "Context for this prompt type: {systemContext from the sub-type}"}

Your goal is to produce a prompt that is specific enough to minimize follow-up corrections. Vague prompts produce vague outputs. Every instruction you include should reduce ambiguity for the target model.

You must return a valid JSON object with exactly these keys:

- "prompt_plain": A complete, copy-paste-ready prompt written as natural plain text. NO markdown syntax, NO hashtags, NO bullet symbols (*, -), NO bold/italic markers (**, __), NO code fences. Use regular paragraphs, numbered lists with "1." format, and line breaks for separation.

- "prompt_structured": The same prompt but formatted with clear markdown sections (## headings, **bold**, bullet points, numbered steps, code fences where appropriate).

- "prompt_json": A JSON object with keys like "system", "user", "constraints", "output_format", "evaluation_criteria" that could be used programmatically by an agent or API.

- "optimization_notes": A brief explanation of what optimizations were applied and why.

- "token_estimate": An integer estimating the token count of the plain prompt.

Return ONLY the JSON object. No markdown fences, no explanation outside the JSON.
```

#### User Message Template

```
Transform this idea into a high-quality prompt:

**Subject Type:** {subject label}
{If sub-type selected: **Prompt Category:** {sub-type label}}
{If sub-type selected: **Category Purpose:** {sub-type description}}
**Base Idea:** {user's idea}
**Target Model Class:** {model label}

**Dimensions to Address:**
- {dimension 1}
- {dimension 2}
- ...

**Output Guidance:** {outputHints from subject or sub-type}

**Model-Specific Optimization Rules:**
- {instruction 1}
- {instruction 2}
- ...

**Verbosity Level:** {model verbosity}
**Prompt Length Guidance:** {model maxPromptGuidance}

**Prompt Improvement Checklist — the generated prompt MUST:**
1. Clarify the objective explicitly — state what the model should produce and what "done" looks like
2. Define expected deliverables with concrete examples where possible
3. Specify the output format (files, code blocks, plain text, structured data)
4. Add relevant constraints that eliminate ambiguity
5. Include evaluation criteria or success conditions the user can verify
6. Address potential edge cases and failure modes
7. Include failure handling instructions where appropriate
8. Add step-by-step reasoning directives if the model class supports it
9. Separate what the model should do from what it should NOT do
10. Ensure the prompt is self-contained, a different person reading it should understand the task without additional context

Generate the optimized prompt now. Return only the JSON object.
```

### Step 3: Send the Request

Send a standard chat completions request to any OpenAI-compatible endpoint:

```json
{
  "model": "gpt-4o",
  "messages": [
    { "role": "system", "content": "<system message from step 2>" },
    { "role": "user", "content": "<user message from step 2>" }
  ],
  "temperature": 0.7,
  "max_completion_tokens": 4096,
  "response_format": { "type": "json_object" }
}
```

This example uses the OpenAI chat completions format. See the Supported API Providers section below for provider-specific request formats.

### Step 4: Parse the Response

The model returns a JSON object. Extract `choices[0].message.content` and parse it as JSON:

```json
{
  "prompt_plain": "Copy-paste ready prompt as plain text...",
  "prompt_structured": "## Objective\nThe same prompt with markdown formatting...",
  "prompt_json": {
    "system": "System instructions for the target model...",
    "user": "User message for the target model...",
    "constraints": ["constraint 1", "constraint 2"],
    "output_format": "Description of expected output...",
    "evaluation_criteria": ["criterion 1", "criterion 2"]
  },
  "optimization_notes": "Applied specification-style optimizations for zero-context development...",
  "token_estimate": 1200
}
```

**For agents:** Use `prompt_json` directly. It contains pre-separated `system` and `user` fields, plus `constraints`, `output_format`, and `evaluation_criteria` that can be injected into your agent's own prompting pipeline. This is the most useful format for programmatic consumption.

**For humans:** Use `prompt_plain` for pasting into chat interfaces or `prompt_structured` for review in a markdown renderer.

### Example: Agent Generating a PRD Prompt

```bash
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "temperature": 0.7,
    "max_completion_tokens": 4096,
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are an expert prompt engineer specializing in product management, requirements definition, and product development workflows. Your task is to transform a simple idea into a high-quality, production-ready prompt that will produce correct, useful output on the first or second pass.\n\nContext for this prompt type: The user needs a professional product requirements document that can be handed to engineering and design teams. The target model should produce a structured document with clear problem framing, prioritized requirements, and testable acceptance criteria. The prompt must enforce specificity — vague requirements produce vague products.\n\nYour goal is to produce a prompt that is specific enough to minimize follow-up corrections. Vague prompts produce vague outputs. Every instruction you include should reduce ambiguity for the target model.\n\nYou must return a valid JSON object with exactly these keys:\n\n- \"prompt_plain\": A complete, copy-paste-ready prompt written as natural plain text. NO markdown syntax.\n\n- \"prompt_structured\": The same prompt formatted with markdown.\n\n- \"prompt_json\": A JSON object with keys like \"system\", \"user\", \"constraints\", \"output_format\", \"evaluation_criteria\".\n\n- \"optimization_notes\": A brief explanation of what optimizations were applied.\n\n- \"token_estimate\": An integer estimating the token count.\n\nReturn ONLY the JSON object."
      },
      {
        "role": "user",
        "content": "Transform this idea into a high-quality prompt:\n\n**Subject Type:** Product\n**Prompt Category:** Product Requirements Document\n**Category Purpose:** For writing a full PRD with problem statement, personas, requirements, and acceptance criteria.\n\n**Base Idea:** A mobile app for tracking personal health metrics with doctor sharing\n**Target Model Class:** Frontier Model\n\n**Dimensions to Address:**\n- Product name and one-line description\n- Problem statement and evidence\n- Target user personas with behavioral context\n- Goals and success metrics\n- Feature requirements with MoSCoW prioritization\n- User stories with acceptance criteria\n- Out of scope\n- Technical constraints and dependencies\n- Design requirements and UX principles\n- Launch criteria and rollout plan\n- Open questions and assumptions to validate\n\n**Output Guidance:** Generate a prompt that produces a complete PRD ready for engineering and design review. Include explicit out-of-scope boundaries to prevent scope creep. Every feature should have acceptance criteria. A PRD without measurable success metrics is just a feature wishlist.\n\n**Verbosity Level:** high\n**Prompt Length Guidance:** Prompts can be detailed and lengthy (2000+ tokens). Use layered instructions.\n\nGenerate the optimized prompt now. Return only the JSON object."
      }
    ]
  }'
```

### Supported API Providers

| Provider | `apiMode` | Base URL | Auth | CORS | Notes |
|----------|-----------|----------|------|------|-------|
| Puter GPT-OSS | `puter` | N/A (SDK) | None required | Yes | Free, no API key. Default provider. |
| OpenRouter | `openrouter` | `https://openrouter.ai/api/v1` | `Authorization: Bearer` | Yes | Hundreds of models. Recommended for browser use with a key. |
| Anthropic | `anthropic` | `https://api.anthropic.com/v1` | `x-api-key` | With header | Uses Messages API format. Requires `anthropic-dangerous-direct-browser-access` header. |
| OpenAI | `openai` | `https://api.openai.com/v1` | `Authorization: Bearer` | No | Uses Chat Completions format. Requires CORS proxy for browser use. |
| Google Gemini | `google` | `https://generativelanguage.googleapis.com/v1beta` | API key in URL | Yes | Uses Gemini generateContent format. |
| Ollama | `ollama` | `http://localhost:11434` | None required | Requires `OLLAMA_ORIGINS=*` | Local models (default: gpt-oss:20b). No API key, works from GitHub Pages. |
| Custom | `custom` | User-defined | `Authorization: Bearer` | Varies | Any OpenAI-compatible endpoint (Together, LM Studio, etc.). |

#### Provider-specific request formats

**OpenRouter** uses the same chat completions format as OpenAI, with additional optional headers:

```bash
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "HTTP-Referer: https://qualityprompts.app" \
  -H "X-Title: Quality Prompts" \
  -d '{ "model": "anthropic/claude-sonnet-4", "messages": [...], "temperature": 0.7, "max_tokens": 4096 }'
```

**Anthropic** uses the Messages API format:

```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
    "max_tokens": 4096,
    "system": "<system message>",
    "messages": [{ "role": "user", "content": "<user message>" }]
  }'
```

Response: `content[0].text` contains the JSON output.

**Google Gemini** uses the generateContent format:

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "system_instruction": { "parts": [{ "text": "<system message>" }] },
    "contents": [{ "role": "user", "parts": [{ "text": "<user message>" }] }],
    "generationConfig": { "temperature": 0.7, "maxOutputTokens": 4096, "responseMimeType": "application/json" }
  }'
```

Response: `candidates[0].content.parts[0].text` contains the JSON output.

**Ollama** uses its OpenAI-compatible endpoint (requires `OLLAMA_ORIGINS=*` for browser access from GitHub Pages):

```bash
curl -X POST http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-oss:20b",
    "messages": [
      { "role": "system", "content": "<system message>" },
      { "role": "user", "content": "<user message>" }
    ],
    "temperature": 0.7,
    "stream": false
  }'
```

Response: Same as OpenAI format — `choices[0].message.content` contains the JSON output. No API key required.

## Ollama Fallback

If Puter encounters an error (rate limit, service unavailable, authentication issues), Quality Prompts automatically shows a guided setup modal for running locally with Ollama. This ensures the tool always works regardless of Puter's availability — including from `https://97115104.github.io/qualityprompts/`.

The default Ollama model is **gpt-oss:20b** — the same model family as Puter's free tier, running entirely on your machine.

### Quick setup

The fallback modal provides OS-specific instructions (macOS, Windows, Linux) via tabs. The core steps are:

**macOS / Linux:**

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Check existing models — if gpt-oss is listed, skip the pull
ollama list

# Pull the default model
ollama pull gpt-oss:20b

# Start with browser access enabled (required for GitHub Pages)
OLLAMA_ORIGINS=* ollama serve
```

**Windows (PowerShell):**

```powershell
# Install from ollama.com/download, then:
ollama list
ollama pull gpt-oss:20b

# Close the Ollama tray icon, then:
$env:OLLAMA_ORIGINS="*"; ollama serve
```

### Why OLLAMA_ORIGINS is required

When you use Quality Prompts from `https://97115104.github.io` (or any non-localhost URL), your browser enforces CORS security and blocks requests to `http://localhost:11434` unless Ollama explicitly allows them. Setting `OLLAMA_ORIGINS=*` tells Ollama to accept requests from any web page. This is safe because Ollama only listens on your local machine.

On localhost (`http://localhost:8000`), most browsers relax CORS for same-machine requests, which is why it works without the flag locally.

### Browser compatibility (non-localhost)

**Google Chrome is required** when accessing Quality Prompts from GitHub Pages (`https://97115104.github.io/qualityprompts/`) or any other HTTPS URL while using Ollama.

Safari, DuckDuckGo, and other WebKit-based browsers block mixed content — they refuse to let an HTTPS page (`https://...`) make requests to an HTTP endpoint (`http://localhost:11434`), even for localhost. Chrome treats localhost as a "secure context" and allows this scenario.

If you're running Quality Prompts locally on `http://localhost`, any browser works fine.

A "Switch to Ollama now" button in the modal automatically changes the API provider, sets the defaults, and opens the settings panel.

### Preflight checks

When using Ollama or a custom endpoint, Quality Prompts verifies the connection and model before sending the actual prompt request:

- **Connection check** — Confirms the server is reachable and CORS is enabled
- **Model verification** — Queries installed models via `/api/tags` and confirms the selected model exists
- **GPT-OSS detection** — If a GPT-OSS model is installed but not selected, a tip is shown suggesting it
- **Progressive status** — Loading indicators update through "Checking connection", "Connected", "Sending request", and "Generating your prompt"

If the preflight check fails, a clear error message explains exactly what to fix before any request is sent.

## URL Routing

Quality Prompts supports prefilling the prompt idea via URL query parameters. This is useful for sharing specific prompts, bookmarking common workflows, or integrating with other tools.

### Prefill a prompt

Add `?prompt=` with your URL-encoded idea:

```
https://yourdomain.com/qualityprompts/?prompt=Build%20a%20dashboard%20that%20tracks%20user%20retention%20by%20cohort
```

The bare `?=` format also works:

```
https://yourdomain.com/qualityprompts/?=Build%20a%20dashboard%20that%20tracks%20user%20retention%20by%20cohort
```

Both formats prefill the idea input field without generating.

### Auto-generate on load

Add `&enter` to automatically trigger generation when the page loads:

```
https://yourdomain.com/qualityprompts/?prompt=Build%20a%20dashboard%20that%20tracks%20user%20retention%20by%20cohort&enter
```

This prefills the idea and immediately starts generating using the user's current API settings (defaults to Puter GPT-OSS).

## Sharing and Using Prompts

### Share Idea

The **Share Idea** button (above Generate Prompt) opens a modal with two options:

- **Copy link** — copies a prefilled URL (`?prompt=...`) that prefills the idea for the recipient
- **Copy link with auto-generate** — copies a prefilled URL with `&enter` that also triggers generation automatically on page load

### Use This Prompt

After generating a prompt, the **Use this prompt** section at the bottom of the output provides one-click buttons to open the prompt in:

| Service | Behavior |
|---------|----------|
| ChatGPT | Opens with the prompt prefilled via `?q=` parameter |
| Claude | Copies prompt to clipboard, opens claude.ai/new — paste to use |
| Copilot | Copies prompt to clipboard, opens copilot.microsoft.com — paste to use |
| Gemini | Copies prompt to clipboard, opens gemini.google.com — paste to use |

For Claude, Copilot, and Gemini, a brief modal confirms the prompt was copied and reminds you to paste it when the page opens.

### Assess This Prompt

Above "Use this prompt," the **Assess this prompt** section lets you send the generated prompt to [Assess Prompts](https://97115104.github.io/assessprompts/) for expert AI feedback:

| Button | Behavior |
|--------|----------|
| Open in Assess Prompts | Prefills the prompt in Assess Prompts — click Assess to run |
| Assess now | Prefills the prompt and automatically starts assessment |

Both buttons pass the current subject type, prompt style, and target model as context to Assess Prompts, giving the assessor relevant information about the prompt's intended use.

Assess Prompts provides a quality score (0-100), letter grade, strengths, issues, missing elements, optimization suggestions, an optimized version of your prompt, and cost estimates across frontier models.

### Share via Email

The **Share via Email** button on the Plain Text tab sends the full generated prompt by email with a link back to Quality Prompts.

## Deployment (GitHub Pages)

1. Fork or clone this repository
2. Go to **Settings > Pages**
3. Set source to **Deploy from a branch**, select `main`, root `/`
4. Your site will be live at `https://<username>.github.io/qualityprompts/`

No build step required — it's a static site.

## Project Structure

```
qualityprompts/
├── index.html          # Application shell
├── css/
│   ├── styles.css      # Layout and typography
│   └── components.css  # Buttons, tabs, panels
├── js/
│   ├── app.js          # Workflow orchestration and UI event handling
│   ├── promptEngine.js # Subject scaffolds, sub-types, STI roles, model constraints, meta-prompt builder
│   ├── apiClient.js    # Multi-provider API client (Puter, OpenRouter, Anthropic, OpenAI, Google, Ollama, Custom)
│   └── uiRenderer.js   # DOM rendering and interactions
├── LICENSE             # MIT License
├── ATTESTATION.md      # AI collaboration disclosure
└── README.md
```

## Technical Details

- Pure HTML, CSS, and JavaScript — no frameworks or build tools
- API key stored in-session or optionally in localStorage
- Seven built-in API providers with native request format handling per provider
- Puter and OpenRouter work directly in the browser without CORS issues
- Ollama works locally with `OLLAMA_ORIGINS=*` — no API key, no data leaves your machine
- Preflight checks verify Ollama/custom endpoint connectivity and model availability before sending requests
- Puter errors automatically trigger a guided Ollama fallback modal with setup instructions
- Anthropic, OpenAI, and Google require either CORS proxies or non-browser usage
- Custom endpoint supports any OpenAI-compatible API with configurable base URL
- URL routing supports `?prompt=`, bare `?=`, and `&enter` for auto-generation
- Share Idea modal with copy link and copy link with auto-generate options
- Use this prompt buttons open generated prompts directly in ChatGPT, Claude, Copilot, and Gemini
- Share via Email on the plain text tab sends the full generated prompt
- Slow-generation hint appears after 10 seconds with a link to a modal explaining how to switch to a faster model
- Sub-type system is extensible, add `subTypes` to any subject scaffold in `promptEngine.js`
- STI system roles are per-subject — modify `systemRole` on any scaffold to tune the prompt engineer persona

## License

[MIT](LICENSE)

## Attestation

This project was developed with AI collaboration. See [ATTESTATION.md](ATTESTATION.md) for details.
