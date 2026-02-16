const PromptEngine = (() => {
    const subjectScaffolds = {
        development: {
            label: 'Development',
            dimensions: [
                'Technical architecture and design patterns',
                'Input/output specifications',
                'Error handling and edge cases',
                'Testing strategy',
                'Performance considerations',
                'Security implications',
                'Code quality and maintainability'
            ],
            outputHints: 'Include code examples, file structure, and implementation steps.'
        },
        writing: {
            label: 'Writing',
            dimensions: [
                'Audience and tone',
                'Structure and flow',
                'Key messages and themes',
                'Voice and style guidelines',
                'Length and format constraints',
                'Call to action or conclusion goal'
            ],
            outputHints: 'Specify tone, word count range, and structural format.'
        },
        strategy: {
            label: 'Strategy',
            dimensions: [
                'Current state assessment',
                'Goals and success metrics',
                'Stakeholder analysis',
                'Risk assessment and mitigation',
                'Timeline and milestones',
                'Resource requirements',
                'Competitive landscape'
            ],
            outputHints: 'Include frameworks, decision matrices, and actionable recommendations.'
        },
        product: {
            label: 'Product',
            dimensions: [
                'User personas and needs',
                'Problem statement',
                'Feature requirements (MoSCoW)',
                'Success metrics and KPIs',
                'Technical feasibility',
                'Go-to-market considerations',
                'Iteration and feedback loops'
            ],
            outputHints: 'Include user stories, acceptance criteria, and prioritization.'
        },
        design: {
            label: 'Design',
            dimensions: [
                'User research and personas',
                'Information architecture',
                'Visual hierarchy and layout',
                'Interaction patterns',
                'Accessibility requirements',
                'Brand alignment',
                'Responsive considerations'
            ],
            outputHints: 'Describe visual specs, interaction flows, and component structure.'
        },
        marketing: {
            label: 'Marketing',
            dimensions: [
                'Target audience segments',
                'Channel strategy',
                'Budget tiers and allocation',
                'Timeline and campaign phases',
                'KPIs and measurement plan',
                'Messaging and positioning',
                'A/B testing and experimentation plan'
            ],
            outputHints: 'Include audience profiles, channel recommendations, and metrics.'
        },
        research: {
            label: 'Research',
            dimensions: [
                'Research question and hypothesis',
                'Methodology and approach',
                'Data sources and collection',
                'Analysis framework',
                'Limitations and bias considerations',
                'Expected deliverables',
                'Literature and prior work context'
            ],
            outputHints: 'Specify methodology, data requirements, and analysis approach.'
        },
        'data-analysis': {
            label: 'Data Analysis',
            dimensions: [
                'Data sources and formats',
                'Cleaning and preprocessing needs',
                'Analysis techniques and models',
                'Visualization requirements',
                'Statistical rigor and validation',
                'Insights and recommendations format',
                'Reproducibility and documentation'
            ],
            outputHints: 'Include data specs, analysis steps, and visualization descriptions.'
        }
    };

    const modelConstraints = {
        frontier: {
            label: 'Frontier Model',
            instructions: [
                'Use extended context and multi-step reasoning chains.',
                'Include tool-use instructions where relevant.',
                'Allow higher abstraction and nuanced directives.',
                'Leverage system, developer, and user message segments.',
                'Include meta-reasoning and self-evaluation steps.'
            ],
            verbosity: 'high',
            maxPromptGuidance: 'Prompts can be detailed and lengthy (2000+ tokens). Use layered instructions.'
        },
        llm: {
            label: 'LLM (General)',
            instructions: [
                'Use balanced verbosity with clear structure.',
                'Prefer structured outputs (headings, lists, sections).',
                'Moderate reasoning depth — explain key steps.',
                'Avoid overly abstract or ambiguous phrasing.'
            ],
            verbosity: 'medium',
            maxPromptGuidance: 'Prompts should be well-structured, moderate length (800-1500 tokens).'
        },
        slm: {
            label: 'SLM (Small Model)',
            instructions: [
                'Keep prompts short and explicit.',
                'Use simple, direct language.',
                'Provide clear step-by-step sequences.',
                'Minimize branching logic and conditionals.',
                'Avoid ambiguity — be very literal.'
            ],
            verbosity: 'low',
            maxPromptGuidance: 'Prompts should be concise (under 600 tokens). Every word must count.'
        },
        paid: {
            label: 'Paid / Premium Model',
            instructions: [
                'Maximize token utilization with rich context.',
                'Include advanced instruction layering.',
                'Add contextual framing and background.',
                'Use sophisticated reasoning directives.',
                'Include evaluation and self-correction steps.'
            ],
            verbosity: 'high',
            maxPromptGuidance: 'Prompts can be extensive. Leverage premium capabilities fully.'
        },
        'open-source': {
            label: 'Open-source Model',
            instructions: [
                'Use simpler syntax and direct instructions.',
                'Keep token footprint low.',
                'Include explicit formatting instructions.',
                'Avoid complex nested reasoning.',
                'Be very specific about expected output format.'
            ],
            verbosity: 'low',
            maxPromptGuidance: 'Prompts should be straightforward (under 800 tokens). Explicit formatting.'
        }
    };

    function buildMetaPrompt(subjectType, idea, modelType) {
        const subject = subjectScaffolds[subjectType];
        const model = modelConstraints[modelType] || modelConstraints.llm;

        const systemMessage = `You are an expert prompt engineer. Your task is to transform a simple idea into a high-quality, production-ready prompt.

You must return a valid JSON object with exactly these keys:

- "prompt_plain": A complete, copy-paste-ready prompt written as natural plain text. NO markdown syntax, NO hashtags, NO bullet symbols (*, -), NO bold/italic markers (**, __), NO code fences. Use regular paragraphs, numbered lists with "1." format, and line breaks for separation. This should read like a clean document someone would paste into any chat interface.

- "prompt_structured": The same prompt but formatted with clear markdown sections (## headings, **bold**, bullet points, numbered steps, code fences where appropriate). Make it scannable and well-organized for display in a markdown renderer.

- "prompt_json": A JSON object with keys like "system", "user", "constraints", "output_format", "evaluation_criteria" that could be used programmatically by an agent or API.

- "optimization_notes": A brief explanation of what optimizations were applied and why.

- "token_estimate": An integer estimating the token count of the plain prompt.

Return ONLY the JSON object. No markdown fences, no explanation outside the JSON.`;

        const userMessage = `Transform this idea into a high-quality prompt:

**Subject Type:** ${subject.label}
**Base Idea:** ${idea}
**Target Model Class:** ${model.label}

**Subject-Specific Dimensions to Address:**
${subject.dimensions.map(d => `- ${d}`).join('\n')}

**Output Hints:** ${subject.outputHints}

**Model-Specific Optimization Rules:**
${model.instructions.map(i => `- ${i}`).join('\n')}

**Verbosity Level:** ${model.verbosity}
**Prompt Length Guidance:** ${model.maxPromptGuidance}

**Prompt Improvement Checklist — the generated prompt MUST:**
1. Clarify the objective explicitly
2. Define expected deliverables
3. Specify the output format
4. Add relevant constraints
5. Include evaluation criteria or success conditions
6. Address potential edge cases
7. Include failure handling instructions where appropriate
8. Add step-by-step reasoning directives if the model class supports it

Generate the optimized prompt now. Return only the JSON object.`;

        return {
            system: systemMessage,
            user: userMessage
        };
    }

    function getSubjectTypes() {
        return Object.entries(subjectScaffolds).map(([key, val]) => ({
            value: key,
            label: val.label
        }));
    }

    function getModelTypes() {
        return Object.entries(modelConstraints).map(([key, val]) => ({
            value: key,
            label: val.label
        }));
    }

    return { buildMetaPrompt, getSubjectTypes, getModelTypes };
})();
