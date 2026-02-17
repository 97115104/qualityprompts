# Quality Prompts

Transform simple ideas into high-quality, production-ready prompts optimized for different model classes and usage contexts.

## Features

- **Subject-specific optimization** — Tailored prompt scaffolds for Development, Writing, Strategy, Product, Design, Marketing, Research, and Data Analysis
- **Development prompt styles** — Specification, Iteration, and Diagnostic sub-types that match how developers actually use prompts during development workflows
- **Model-aware generation** — Adjusts verbosity, reasoning depth, and constraints for Frontier, LLM, SLM, Paid/Premium, and Open-source models
- **Multiple output formats** — Plain text, structured markdown, and JSON for agent/API ingestion
- **Fully serverless** — Runs entirely in the browser with no backend required
- **Copy and download** — One-click copy or download for each format

## How It Works

1. Select an API provider (Puter GPT-OSS is free and requires no key)
2. Select a subject type and target model class
3. If you selected Development, optionally choose a prompt style (Specification, Iteration, or Diagnostic)
4. Type a simple idea or concept
5. Click **Generate Prompt**
6. Get back an optimized prompt in three formats

The tool sends your idea to a language model along with subject-specific scaffolds, prompt style context, and model-specific constraints. The model returns a structured, production-ready prompt with evaluation criteria, deliverables, and edge case handling.

## Development Prompt Styles

When Development is selected as the subject type, a Prompt Style dropdown appears with three options:

**Specification Prompt** — For starting something new where the model has no prior context. Generates a detailed, explicit prompt covering programming language, framework, file structure, naming conventions, dependency policy, deployment target, and all constraints. Use this when beginning a new project or feature from scratch. The cost of being explicit upfront is far lower than the cost of debugging implicit assumptions.

**Iteration Prompt** — For changing or improving existing code where the model already has context. Generates a short, surgical prompt that points to exact files, functions, and lines. It describes what is wrong and what a better result looks like without restating the full specification. Restating everything wastes tokens and can confuse the model.

**Diagnostic Prompt** — For debugging when something is broken and the cause is unknown. Generates a prompt that structures the problem with placeholders for error messages, the function that produced the error, the input that triggered it, and expected versus actual behavior. The most common mistake with diagnostic prompts is including too little context.

Selecting **General** uses the default development dimensions without a specific prompt style.

## Agentic API Usage

Quality Prompts can be used programmatically by any agent, script, or automation that can call an OpenAI-compatible chat completions endpoint. The tool itself is a static frontend — the actual prompt generation happens through the LLM API. An agent can replicate the exact same generation logic by constructing the same system and user messages and sending them to any compatible endpoint.

### Step 1: Choose Parameters

Select one value from each category:

**Subject types:** `development`, `writing`, `strategy`, `product`, `design`, `marketing`, `research`, `data-analysis`

**Model types:** `frontier`, `llm`, `slm`, `paid`, `open-source`

**Sub-types (development only, optional):** `specification`, `iteration`, `diagnostic`

### Step 2: Build the Messages

The system message and user message are constructed from scaffolds defined in `js/promptEngine.js`. An agent can either:

1. **Load the scaffolds directly** from `promptEngine.js` and call `PromptEngine.buildMetaPrompt(subjectType, idea, modelType, subType)` if running in a JavaScript environment, or
2. **Construct the messages manually** following the template below.

#### System Message Template

```
You are an expert prompt engineer specializing in software development workflows. Your task is to transform a simple idea into a high-quality, production-ready prompt that will produce correct, useful output on the first or second pass.

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
10. Ensure the prompt is self-contained — a different person reading it should understand the task without additional context

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

This works with OpenAI, OpenRouter, Anthropic (via OpenAI-compatible proxy), or any endpoint that accepts the chat completions format.

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

### Example: Agent Generating a Specification Prompt

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
        "content": "You are an expert prompt engineer specializing in software development workflows. Your task is to transform a simple idea into a high-quality, production-ready prompt that will produce correct, useful output on the first or second pass.\n\nContext for this prompt type: The user is starting a new project or feature from scratch. The target model will have zero prior context. The generated prompt must be self-contained and leave nothing to assumption. Prioritize completeness and specificity over brevity.\n\nYour goal is to produce a prompt that is specific enough to minimize follow-up corrections. Vague prompts produce vague outputs. Every instruction you include should reduce ambiguity for the target model.\n\nYou must return a valid JSON object with exactly these keys:\n\n- \"prompt_plain\": A complete, copy-paste-ready prompt written as natural plain text. NO markdown syntax, NO hashtags, NO bullet symbols (*, -), NO bold/italic markers (**, __), NO code fences. Use regular paragraphs, numbered lists with \"1.\" format, and line breaks for separation.\n\n- \"prompt_structured\": The same prompt but formatted with clear markdown sections (## headings, **bold**, bullet points, numbered steps, code fences where appropriate).\n\n- \"prompt_json\": A JSON object with keys like \"system\", \"user\", \"constraints\", \"output_format\", \"evaluation_criteria\" that could be used programmatically by an agent or API.\n\n- \"optimization_notes\": A brief explanation of what optimizations were applied and why.\n\n- \"token_estimate\": An integer estimating the token count of the plain prompt.\n\nReturn ONLY the JSON object. No markdown fences, no explanation outside the JSON."
      },
      {
        "role": "user",
        "content": "Transform this idea into a high-quality prompt:\n\n**Subject Type:** Development\n**Prompt Category:** Specification Prompt\n**Category Purpose:** For starting something new where the model has no prior context. The generated prompt should be detailed and explicit.\n\n**Base Idea:** Build a REST API for user authentication with JWT tokens\n**Target Model Class:** LLM (General)\n\n**Dimensions to Address:**\n- Programming language and framework selection with version constraints\n- Project file structure and directory layout\n- Naming conventions and code style guidelines\n- Environment constraints (serverless, containerized, edge, etc.)\n- Dependency policy (external packages allowed or restricted)\n- Technical architecture and design patterns\n- Input/output specifications with concrete examples\n- Error handling strategy and edge cases\n- Testing strategy and coverage expectations\n- Performance requirements and benchmarks\n- Security requirements and threat model\n- Deployment target and infrastructure\n\n**Output Guidance:** Generate a comprehensive specification prompt. Include explicit language, framework, file structure, naming conventions, and all constraints upfront. The prompt should be 3-4 paragraphs minimum. The cost of being explicit is far lower than the cost of debugging implicit assumptions.\n\n**Model-Specific Optimization Rules:**\n- Use balanced verbosity with clear structure.\n- Prefer structured outputs (headings, lists, sections).\n- Moderate reasoning depth — explain key steps.\n- Avoid overly abstract or ambiguous phrasing.\n\n**Verbosity Level:** medium\n**Prompt Length Guidance:** Prompts should be well-structured, moderate length (800-1500 tokens).\n\n**Prompt Improvement Checklist — the generated prompt MUST:**\n1. Clarify the objective explicitly — state what the model should produce and what \"done\" looks like\n2. Define expected deliverables with concrete examples where possible\n3. Specify the output format (files, code blocks, plain text, structured data)\n4. Add relevant constraints that eliminate ambiguity\n5. Include evaluation criteria or success conditions the user can verify\n6. Address potential edge cases and failure modes\n7. Include failure handling instructions where appropriate\n8. Add step-by-step reasoning directives if the model class supports it\n9. Separate what the model should do from what it should NOT do\n10. Ensure the prompt is self-contained — a different person reading it should understand the task without additional context\n\nGenerate the optimized prompt now. Return only the JSON object."
      }
    ]
  }'
```

### Supported API Providers

| Provider | Mode | Notes |
|----------|------|-------|
| Puter GPT-OSS | `puter` | Free, no API key, browser-only via Puter SDK |
| OpenAI Chat Completions | `chat` | Standard `/v1/chat/completions` endpoint |
| OpenAI Responses API | `responses` | Uses `/v1/responses` with `instructions` + `input` format |
| Any OpenAI-compatible endpoint | `chat` | Set a custom base URL (OpenRouter, Together, local Ollama, etc.) |

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
│   ├── promptEngine.js # Subject scaffolds, sub-types, model constraints, meta-prompt builder
│   ├── apiClient.js    # API client (Puter, OpenAI Chat Completions, OpenAI Responses)
│   └── uiRenderer.js   # DOM rendering and interactions
├── LICENSE             # MIT License
├── ATTESTATION.md      # AI collaboration disclosure
└── README.md
```

## Technical Details

- Pure HTML, CSS, and JavaScript — no frameworks or build tools
- API key stored in-session or optionally in localStorage
- Supports any OpenAI-compatible endpoint (configurable base URL and model name)
- CORS-compatible client-side fetch
- Sub-type system is extensible — add `subTypes` to any subject scaffold in `promptEngine.js`

## License

[MIT](LICENSE)

## Attestation

This project was developed with AI collaboration. See [ATTESTATION.md](ATTESTATION.md) for details.
