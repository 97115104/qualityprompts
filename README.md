# Quality Prompts

Transform simple ideas into high-quality, production-ready prompts optimized for different model classes and usage contexts.

## Features

- **Subject-specific optimization** — Tailored prompt scaffolds for Development, Writing, Strategy, Product, Design, Marketing, Research, and Data Analysis
- **Model-aware generation** — Adjusts verbosity, reasoning depth, and constraints for Frontier, LLM, SLM, Paid/Premium, and Open-source models
- **Multiple output formats** — Plain text, structured markdown, and JSON for agent/API ingestion
- **Fully serverless** — Runs entirely in the browser with no backend required
- **Copy and download** — One-click copy or download for each format

## How It Works

1. Enter your API key (OpenAI-compatible endpoint)
2. Select a subject type and target model class
3. Type a simple idea or concept
4. Click **Generate Prompt**
5. Get back an optimized prompt in three formats

The tool sends your idea to a language model along with subject-specific scaffolds and model-specific constraints. The model returns a structured, production-ready prompt with evaluation criteria, deliverables, and edge case handling.

## API Usage (Programmatic)

Quality Prompts uses a standard OpenAI-compatible chat completions endpoint. You can replicate the generation logic by sending the same system and user messages from `promptEngine.js` to any compatible API.

### Request Structure

```json
{
  "model": "gpt-4o",
  "messages": [
    { "role": "system", "content": "<system prompt from promptEngine.js>" },
    { "role": "user", "content": "<constructed from subject + idea + model type>" }
  ],
  "temperature": 0.7,
  "max_tokens": 4096
}
```

### Response Structure

The model returns JSON with:

```json
{
  "prompt_plain": "Copy-paste ready prompt...",
  "prompt_structured": "## Objective\n...",
  "prompt_json": {
    "system": "...",
    "user": "...",
    "constraints": [],
    "output_format": "...",
    "evaluation_criteria": []
  },
  "optimization_notes": "Applied frontier model optimizations...",
  "token_estimate": 1200
}
```

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
│   ├── app.js          # Workflow orchestration
│   ├── promptEngine.js # Subject scaffolds and model constraints
│   ├── apiClient.js    # OpenAI-compatible API client
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

## License

[MIT](LICENSE)

## Attestation

This project was developed with AI collaboration. See [ATTESTATION.md](ATTESTATION.md) for details.
