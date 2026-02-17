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
            outputHints: 'Include code examples, file structure, and implementation steps.',
            subTypes: {
                specification: {
                    label: 'Specification Prompt',
                    description: 'For starting something new where the model has no prior context. The generated prompt should be detailed and explicit.',
                    dimensions: [
                        'Programming language and framework selection with version constraints',
                        'Project file structure and directory layout',
                        'Naming conventions and code style guidelines',
                        'Environment constraints (serverless, containerized, edge, etc.)',
                        'Dependency policy (external packages allowed or restricted)',
                        'Technical architecture and design patterns',
                        'Input/output specifications with concrete examples',
                        'Error handling strategy and edge cases',
                        'Testing strategy and coverage expectations',
                        'Performance requirements and benchmarks',
                        'Security requirements and threat model',
                        'Deployment target and infrastructure'
                    ],
                    outputHints: 'Generate a comprehensive specification prompt. Include explicit language, framework, file structure, naming conventions, and all constraints upfront. The prompt should be 3-4 paragraphs minimum. The cost of being explicit is far lower than the cost of debugging implicit assumptions.',
                    systemContext: 'The user is starting a new project or feature from scratch. The target model will have zero prior context. The generated prompt must be self-contained and leave nothing to assumption. Prioritize completeness and specificity over brevity.'
                },
                iteration: {
                    label: 'Iteration Prompt',
                    description: 'For changing or improving existing code where the model already has context. The generated prompt should be short and surgical.',
                    dimensions: [
                        'Exact file, function, and line location of the change',
                        'What is currently wrong or needs improvement',
                        'What the correct or improved behavior looks like',
                        'Scope boundary (what should NOT be changed)',
                        'Impact on related components or imports',
                        'Verification criteria for the change'
                    ],
                    outputHints: 'Generate a short, surgical prompt. Point to exact files, functions, and lines. Describe what is wrong and what a better result looks like. Do NOT restate the full specification. Assume the model has project context from files or previous state. Restating everything wastes tokens and can confuse the model.',
                    systemContext: 'The user has existing code and needs a targeted change. The target model will already have project context. The generated prompt should be concise and precise — avoid restating the full specification. Focus on the delta.'
                },
                diagnostic: {
                    label: 'Diagnostic Prompt',
                    description: 'For debugging when something is broken and the cause is unknown. The generated prompt should structure the problem for maximum diagnostic accuracy.',
                    dimensions: [
                        'Error message or stack trace (exact text)',
                        'The function or module that produced the error',
                        'The input or conditions that triggered the failure',
                        'Expected behavior versus actual behavior',
                        'Environment details (OS, runtime, versions)',
                        'What has already been tried and ruled out',
                        'Relevant code context surrounding the failure',
                        'Reproduction steps'
                    ],
                    outputHints: 'Generate a diagnostic prompt that structures the debugging problem clearly. Include placeholders for error messages, the function that produced the error, and the input that triggered it. Including too little context is the most common mistake — the prompt should instruct the user to provide the error, the function, AND the input. Just pasting an error and saying "fix this" leads to wrong guesses.',
                    systemContext: 'The user has a bug or failure and does not know the root cause. The target model needs structured diagnostic context to reason accurately. The generated prompt must elicit error messages, relevant code, inputs, and expected vs actual behavior. Completeness of context directly correlates with diagnostic accuracy.'
                }
            }
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

    function buildMetaPrompt(subjectType, idea, modelType, subType) {
        const subject = subjectScaffolds[subjectType];
        const model = modelConstraints[modelType] || modelConstraints.llm;

        // Resolve sub-type dimensions and hints if applicable
        const activeSubType = (subject.subTypes && subType) ? subject.subTypes[subType] : null;
        const dimensions = activeSubType ? activeSubType.dimensions : subject.dimensions;
        const outputHints = activeSubType ? activeSubType.outputHints : subject.outputHints;
        const subTypeContext = activeSubType ? activeSubType.systemContext : '';

        const systemMessage = `You are an expert prompt engineer specializing in software development workflows. Your task is to transform a simple idea into a high-quality, production-ready prompt that will produce correct, useful output on the first or second pass.

${subTypeContext ? `Context for this prompt type: ${subTypeContext}\n` : ''}Your goal is to produce a prompt that is specific enough to minimize follow-up corrections. Vague prompts produce vague outputs. Every instruction you include should reduce ambiguity for the target model.

You must return a valid JSON object with exactly these keys:

- "prompt_plain": A complete, copy-paste-ready prompt written as natural plain text. NO markdown syntax, NO hashtags, NO bullet symbols (*, -), NO bold/italic markers (**, __), NO code fences. Use regular paragraphs, numbered lists with "1." format, and line breaks for separation. This should read like a clean document someone would paste into any chat interface.

- "prompt_structured": The same prompt but formatted with clear markdown sections (## headings, **bold**, bullet points, numbered steps, code fences where appropriate). Make it scannable and well-organized for display in a markdown renderer.

- "prompt_json": A JSON object with keys like "system", "user", "constraints", "output_format", "evaluation_criteria" that could be used programmatically by an agent or API.

- "optimization_notes": A brief explanation of what optimizations were applied and why.

- "token_estimate": An integer estimating the token count of the plain prompt.

Return ONLY the JSON object. No markdown fences, no explanation outside the JSON.`;

        let subTypeInstruction = '';
        if (activeSubType) {
            subTypeInstruction = `\n**Prompt Category:** ${activeSubType.label}\n**Category Purpose:** ${activeSubType.description}\n`;
        }

        const userMessage = `Transform this idea into a high-quality prompt:

**Subject Type:** ${subject.label}${subTypeInstruction}
**Base Idea:** ${idea}
**Target Model Class:** ${model.label}

**Dimensions to Address:**
${dimensions.map(d => `- ${d}`).join('\n')}

**Output Guidance:** ${outputHints}

**Model-Specific Optimization Rules:**
${model.instructions.map(i => `- ${i}`).join('\n')}

**Verbosity Level:** ${model.verbosity}
**Prompt Length Guidance:** ${model.maxPromptGuidance}

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

    function getSubTypes(subjectType) {
        const subject = subjectScaffolds[subjectType];
        if (!subject || !subject.subTypes) return [];
        return Object.entries(subject.subTypes).map(([key, val]) => ({
            value: key,
            label: val.label
        }));
    }

    return { buildMetaPrompt, getSubjectTypes, getModelTypes, getSubTypes };
})();
