const PromptEngine = (() => {
    // Shared tech stack definitions for extensibility and composability
    // Each stack can be used in both Development and Build Based On contexts
    const techStacks = {
        'serverless-app': {
            key: 'serverless-app',
            label: 'Serverless (Multi-Cloud)',
            dimensions: [
                'Cloud provider (AWS Lambda, Google Cloud Functions, Azure Functions, Cloudflare Workers)',
                'Runtime and language (Node.js, Python, Go, Rust, etc.)',
                'Trigger type (HTTP, schedule, queue, event, webhook)',
                'Managed services to integrate (DynamoDB, S3, Firestore, Supabase, PlanetScale, etc.)',
                'Authentication and authorization approach (JWT, API keys, OAuth, Cognito, Auth0)',
                'Environment variables and secrets management',
                'Cold start considerations and optimization',
                'Infrastructure as Code (Serverless Framework, SAM, CDK, Pulumi, Terraform)',
                'Local development and testing setup',
                'Deployment pipeline and CI/CD integration',
                'Monitoring, logging, and observability',
                'Cost considerations and scaling limits'
            ],
            development: {
                description: 'For building serverless applications on any major cloud provider (AWS, GCP, Azure, Cloudflare). Choose your provider, configure IaC, and deploy cloud functions with managed services.',
                outputHints: 'Generate a prompt that instructs the model to BUILD working serverless code. Specify the cloud provider and IaC tool, then ask for complete function handlers, configuration files, and deployment templates — not a specification.',
                systemContext: 'The user wants to build a multi-cloud serverless application. The generated prompt must instruct the target model to produce working serverless code — function handlers, IaC configuration (serverless.yml, SAM template, CDK, etc.), and deployment scripts — not a specification.'
            },
            buildBasedOn: {
                labelPrefix: 'As ',
                description: 'For creating a multi-cloud serverless application based on an existing site. Choose your cloud provider and IaC tooling.',
                outputHints: 'Generate a prompt that instructs the model to BUILD a working serverless application based on the source URL. Specify the cloud provider and IaC tool, then ask for working function code, configuration files, and deployment templates.',
                systemContext: 'The user wants to create a multi-cloud serverless application based on an existing website. The generated prompt must instruct the target model to produce working serverless code — function handlers, IaC configuration, and deployment templates — not a specification.',
                additionalDimensions: ['URL to analyze', 'Features from source site to preserve']
            }
        },
        'vercel': {
            key: 'vercel',
            label: 'Vercel (Next.js/Edge)',
            dimensions: [
                'Framework selection (Next.js, SvelteKit, Nuxt, Astro, Remix, or vanilla)',
                'Runtime (Node.js or Edge Runtime)',
                'API routes structure (/api directory or app router)',
                'Serverless function configuration (memory, timeout, regions)',
                'Edge functions vs serverless functions trade-offs',
                'Environment variables in Vercel dashboard',
                'Vercel KV, Blob, Postgres, or external data stores',
                'Incremental Static Regeneration (ISR) strategy',
                'Middleware for auth, redirects, and rewrites',
                'Preview deployments and branch configuration',
                'Vercel CLI and local development (vercel dev)',
                'vercel.json configuration options',
                'Analytics and Web Vitals integration',
                'Deployment regions and edge network'
            ],
            development: {
                description: 'For building applications deployed on Vercel with Next.js, SvelteKit, Astro, or other frameworks. Leverages Vercel-specific features like Edge Runtime, ISR, middleware, and preview deployments.',
                outputHints: 'Generate a prompt that instructs the model to BUILD a working Vercel application. Specify framework and runtime, then ask for complete files including API routes, vercel.json, and Vercel-specific configuration.',
                systemContext: 'The user wants to build an application for Vercel deployment using Vercel-specific features. The generated prompt must instruct the target model to produce working code — API routes, serverless/edge functions, and vercel.json configuration — not a specification.'
            },
            buildBasedOn: {
                labelPrefix: 'As ',
                description: 'For creating a Vercel-deployed application based on an existing site. Uses Vercel-specific features like Edge Runtime, ISR, and middleware.',
                outputHints: 'Generate a prompt that instructs the model to BUILD a working Vercel application based on the source URL. Analyze the source, then ask for complete files including API routes and vercel.json.',
                systemContext: 'The user wants to create a Vercel application based on an existing website using Vercel-specific features. The generated prompt must instruct the target model to produce working Vercel-compatible code — not a specification.',
                additionalDimensions: ['URL to analyze', 'Features from source site to preserve']
            }
        },
        'blockchain-web3': {
            key: 'blockchain-web3',
            label: 'Blockchain / Web3',
            dimensions: [
                'Blockchain network (Ethereum, Polygon, Solana, Base, Arbitrum, etc.)',
                'Smart contract language (Solidity, Rust, Move)',
                'Development framework (Hardhat, Foundry, Anchor)',
                'Contract architecture (upgradeable, proxy patterns, diamond)',
                'Token standards (ERC-20, ERC-721, ERC-1155, SPL)',
                'Frontend Web3 library (ethers.js, viem, wagmi, web3.js)',
                'Wallet integration (MetaMask, WalletConnect, Coinbase Wallet)',
                'RPC provider (Alchemy, Infura, QuickNode, public RPC)',
                'Testing strategy (local node, forking, fuzzing)',
                'Gas optimization techniques',
                'Security considerations (reentrancy, access control, oracle manipulation)',
                'Deployment and verification (Etherscan, Sourcify)',
                'IPFS/Arweave for decentralized storage',
                'Indexing (The Graph, custom indexer)'
            ],
            development: {
                description: 'For building blockchain and Web3 applications with smart contracts and decentralized frontends. The generated prompt should instruct the model to build working Web3 code.',
                outputHints: 'Generate a prompt that instructs the model to BUILD working Web3 code. Specify the chain and stack, then ask for complete smart contracts, deployment scripts, and frontend integration — not a specification.',
                systemContext: 'The user wants to build a blockchain/Web3 application. The generated prompt must instruct the target model to produce working code — smart contracts, tests, deployment scripts, and frontend — not a specification.'
            },
            buildBasedOn: {
                labelPrefix: 'As ',
                description: 'For creating a Web3 application based on an existing site or dApp. The generated prompt should instruct the model to build a working blockchain implementation.',
                outputHints: 'Generate a prompt that instructs the model to BUILD a working Web3 application based on the source. Analyze the source functionality, then ask for smart contracts, deployment scripts, and frontend code.',
                systemContext: 'The user wants to create a Web3 application based on an existing site. The generated prompt must instruct the target model to produce working blockchain code — not a specification.',
                additionalDimensions: ['URL to analyze', 'Features from source to implement on-chain']
            }
        },
        'jekyll-site': {
            key: 'jekyll-site',
            label: 'Jekyll Blog Site',
            dimensions: [
                'Ruby version and installation method (rbenv, rvm, system Ruby)',
                'Jekyll installation steps (gem install jekyll bundler)',
                'Project initialization (jekyll new or manual setup)',
                'Theme selection (minima, minimal-mistakes, just-the-docs, custom)',
                '_config.yml configuration (title, description, baseurl, url, plugins)',
                'Directory structure (_posts, _layouts, _includes, _data, _sass, assets)',
                'Front matter requirements for posts and pages',
                'Liquid template syntax and custom includes',
                'Plugins to enable (jekyll-feed, jekyll-seo-tag, jekyll-sitemap)',
                'Local development server (bundle exec jekyll serve)',
                'GitHub Pages deployment configuration',
                'Custom domain setup and HTTPS',
                'Build and deployment workflow'
            ],
            development: {
                description: 'For building Jekyll static sites with Ruby, Liquid templates, and GitHub Pages. The generated prompt should instruct the model to build a working Jekyll site.',
                outputHints: 'Generate a prompt that instructs the model to BUILD a working Jekyll site. Include installation steps, then ask for complete Jekyll files — _config.yml, layouts, includes, posts, and stylesheets — not a specification.',
                systemContext: 'The user wants to build a Jekyll site. The generated prompt must instruct the target model to produce working Jekyll files — configuration, templates, posts, and assets — not a specification document.'
            },
            buildBasedOn: {
                labelPrefix: 'As ',
                description: 'For creating a Jekyll static blog based on an existing site. The generated prompt should instruct the model to build a working Jekyll site.',
                outputHints: 'Generate a prompt that instructs the model to BUILD a working Jekyll site based on the source URL. Include installation steps, then ask for complete Jekyll files — _config.yml, layouts, includes, posts, and stylesheets.',
                systemContext: 'The user wants to create a Jekyll static site based on an existing website. The generated prompt must instruct the target model to produce working Jekyll files — configuration, templates, posts, and assets — not a specification.',
                additionalDimensions: ['URL to analyze', 'Content migration approach from source site']
            }
        },
        'html-css-js': {
            key: 'html-css-js',
            label: 'HTML/CSS/JS (GitHub Pages)',
            dimensions: [
                'Project file structure (index.html, css/, js/, assets/)',
                'HTML5 semantic structure (header, main, nav, section, footer)',
                'CSS approach (single file, component files, CSS variables)',
                'JavaScript organization (vanilla JS, ES modules, single file)',
                'Responsive design strategy (mobile-first, breakpoints)',
                'No build tools required (no npm, no bundler, no transpiler)',
                'Browser compatibility targets',
                'Accessibility requirements (semantic HTML, ARIA, keyboard navigation)',
                'Asset optimization (image formats, lazy loading)',
                'GitHub Pages deployment (push to main or gh-pages branch)',
                'Custom domain configuration (CNAME file)',
                'Relative paths for all assets (for GitHub Pages subpath compatibility)'
            ],
            development: {
                description: 'For building simple static websites using only HTML, CSS, and JavaScript. The generated prompt should instruct the model to build working files.',
                outputHints: 'Generate a prompt that instructs the model to BUILD complete HTML, CSS, and JS files. No build step, no dependencies — just working files that open directly in a browser.',
                systemContext: 'The user wants a static website with only HTML, CSS, and JavaScript. The generated prompt must instruct the target model to produce complete, working files — not a specification. The files should work by opening index.html directly in a browser.'
            },
            buildBasedOn: {
                labelPrefix: 'As ',
                description: 'For creating a static site inspired by an existing site using only HTML, CSS, and JavaScript. The generated prompt should instruct the model to build working files based on the source.',
                outputHints: 'Generate a prompt that instructs the model to BUILD complete HTML, CSS, and JS files inspired by the source URL. Analyze the source for patterns, then ask for original working files — not a specification.',
                systemContext: 'The user wants to create a static site inspired by an existing website using only HTML, CSS, and JavaScript. The generated prompt must instruct the target model to produce complete, working files — not a specification. The files should work by opening index.html directly.',
                additionalDimensions: ['URL to analyze', 'Features from source site to preserve']
            }
        },
        'toy-app': {
            key: 'toy-app',
            label: 'Toy Application',
            dimensions: [
                'Specific friction point or workflow inefficiency to solve',
                'Input format and data transformation required',
                'Output format and expected deliverables',
                'Single-purpose utility focus (one tool, one job)',
                'Static hosting approach (GitHub Pages preferred)',
                'No server dependencies unless API functionality is required',
                'Minimal UI — functional over beautiful',
                'Instant usability (no setup, no auth, no onboarding)',
                'File structure (index.html, css/, js/, assets/)',
                'Browser-only execution where possible',
                'Optional: Vercel serverless function for API exposure',
                'Optional: Integration with other tools or agents'
            ],
            development: {
                description: 'For building small, single-purpose utility tools that solve specific workflow friction. Toy apps are quick to build, easy to host, and turn recurring manual tasks into automated micro-utilities. Ideal for format converters, data transformers, prompt improvers, and other developer productivity tools.',
                outputHints: 'Generate a prompt that instructs the model to BUILD a complete, working toy application. The app should be self-contained, require no setup, and immediately solve the specified friction point. Prefer static HTML/CSS/JS for GitHub Pages hosting. Include all files needed to deploy and use immediately.',
                systemContext: 'The user wants to build a toy application — a small, single-purpose utility tool that solves a specific workflow friction point. Toy apps are common in AI-assisted development workflows where recurring friction (format conversions, data transformations, prompt improvements) is turned into hosted micro-utilities. The generated prompt must instruct the target model to produce a complete, working application that can be deployed to GitHub Pages or similar static hosting. The app should be instantly usable with no setup required.'
            },
            buildBasedOn: {
                labelPrefix: 'As ',
                description: 'For creating a toy application inspired by or derived from an existing tool. Analyze the source to extract the core utility, then build a simplified, single-purpose version optimized for your specific workflow.',
                outputHints: 'Generate a prompt that instructs the model to analyze the source URL, identify the core utility function, and BUILD a simplified toy application version. The app should be self-contained and deployable to GitHub Pages.',
                systemContext: 'The user wants to create a toy application based on an existing tool or website. Analyze the source to identify the core utility function, then instruct the target model to build a simplified, single-purpose version optimized for the user\'s specific workflow. The output should be a complete, working application deployable to static hosting.',
                additionalDimensions: ['URL to analyze', 'Specific functionality to extract and simplify']
            }
        }
    };

    // Helper functions to create subTypes from shared techStacks
    const createDevSubType = (stackKey) => {
        const stack = techStacks[stackKey];
        return {
            label: stack.label,
            description: stack.development.description,
            dimensions: [...stack.dimensions],
            outputHints: stack.development.outputHints,
            systemContext: stack.development.systemContext
        };
    };

    const createBuildSubType = (stackKey) => {
        const stack = techStacks[stackKey];
        return {
            label: (stack.buildBasedOn.labelPrefix || '') + stack.label,
            description: stack.buildBasedOn.description,
            requiresUrl: true,
            dimensions: [...(stack.buildBasedOn.additionalDimensions || []), ...stack.dimensions],
            outputHints: stack.buildBasedOn.outputHints,
            systemContext: stack.buildBasedOn.systemContext
        };
    };

    const subjectScaffolds = {
        development: {
            label: 'Development',
            systemRole: 'You are an expert prompt engineer specializing in software development. You create prompts that instruct models to build working software using JSON objects for configuration, state, and data structures — promoting composability and extensibility.',
            dimensions: [
                'Technical architecture and design patterns',
                'Input/output specifications',
                'Error handling and edge cases',
                'Testing strategy',
                'Performance considerations',
                'Security implications',
                'Code quality and maintainability',
                'JSON-based configuration and data structures'
            ],
            outputHints: 'Generate a prompt that instructs the model to BUILD the software — produce working code, complete files, and implementation. Emphasize using JSON objects for configuration, state management, and data structures. Not a specification document.',
            subTypes: {
                specification: {
                    label: 'Specification Prompt',
                    description: 'For starting something new where the model has no prior context. The generated prompt should instruct the model to build the complete implementation.',
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
                    outputHints: 'Generate a comprehensive prompt that instructs the model to BUILD the software. The prompt should specify language, framework, file structure, and constraints — then ask for working code, not a spec. Include explicit instructions to produce complete, runnable files.',
                    systemContext: 'The user is starting a new project or feature from scratch. The generated prompt must instruct the target model to produce working code and complete files, not a specification document. The prompt specifies what to build and how, then asks for the implementation.'
                },
                iteration: {
                    label: 'Iteration Prompt',
                    description: 'For changing or improving existing code where the model already has context. The generated prompt should instruct the model to make specific code changes.',
                    dimensions: [
                        'Exact file, function, and line location of the change',
                        'What is currently wrong or needs improvement',
                        'What the correct or improved behavior looks like',
                        'Scope boundary (what should NOT be changed)',
                        'Impact on related components or imports',
                        'Verification criteria for the change'
                    ],
                    outputHints: 'Generate a short, surgical prompt that instructs the model to MAKE the code changes. Point to exact files, functions, and lines. Ask for the updated code, not a description of what to change.',
                    systemContext: 'The user has existing code and needs a targeted change. The generated prompt must instruct the target model to produce the actual code changes — not describe them. The prompt should be concise and ask for implementation, not explanation.'
                },
                diagnostic: {
                    label: 'Diagnostic Prompt',
                    description: 'For debugging when something is broken and the cause is unknown. The generated prompt should instruct the model to diagnose and fix the issue.',
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
                    outputHints: 'Generate a diagnostic prompt that asks the model to identify the root cause AND provide the fix. Include placeholders for error messages and context, then ask for working corrected code.',
                    systemContext: 'The user has a bug and needs it fixed. The generated prompt must instruct the target model to diagnose the issue and produce working corrected code — not just explain what might be wrong.'
                },
                // Tech stack subTypes generated from shared techStacks object
                'serverless-app': createDevSubType('serverless-app'),
                'vercel': createDevSubType('vercel'),
                'blockchain-web3': createDevSubType('blockchain-web3'),
                'jekyll-site': createDevSubType('jekyll-site'),
                'html-css-js': createDevSubType('html-css-js'),
                'toy-app': createDevSubType('toy-app')
            }
        },
        writing: {
            label: 'Writing',
            systemRole: 'You are an expert prompt engineer specializing in written content across creative, commercial, and communications contexts.',
            dimensions: [
                'Audience and tone',
                'Structure and flow',
                'Key messages and themes',
                'Voice and style guidelines',
                'Length and format constraints',
                'Call to action or conclusion goal'
            ],
            outputHints: 'Specify tone, word count range, and structural format.',
            subTypes: {
                'long-form': {
                    label: 'Creative Writing (Long-Form)',
                    description: 'For essays, blog posts, articles, fiction, memoir, or longform nonfiction. The generated prompt should establish voice, structure, pacing, and thematic depth.',
                    dimensions: [
                        'Genre, form, and narrative style (essay, fiction, memoir, article, etc.)',
                        'Target audience and their expectations',
                        'Voice, tone, and point of view',
                        'Structural arc (introduction, development, climax, resolution or argument flow)',
                        'Thematic depth and key ideas to explore',
                        'Pacing and rhythm (sentence variety, paragraph length, section breaks)',
                        'Word count target and section breakdown',
                        'References, influences, or style models to emulate',
                        'What to avoid (cliches, filler, over-explanation, AI-sounding prose)'
                    ],
                    outputHints: 'Generate a prompt that establishes voice and structure before content. Specify the arc, pacing expectations, and word count range. Include guidance on what makes the piece feel authentic versus generic. Long-form writing prompts should describe the reading experience, not just the topic.',
                    systemContext: 'The user needs long-form written content where voice, structure, and depth matter. The target model must understand pacing, narrative arc, and tonal consistency across a longer piece. The prompt should prevent the model from producing flat, formulaic output by giving it clear stylistic direction.'
                },
                'short-form': {
                    label: 'Short-Form Copy',
                    description: 'For ads, taglines, social posts, product descriptions, UI microcopy, and headlines. The generated prompt should optimize for clarity, impact, and brevity.',
                    dimensions: [
                        'Format and platform (ad copy, tagline, product description, UI text, headline)',
                        'Character or word count constraints',
                        'Brand voice and tone (casual, authoritative, playful, urgent, etc.)',
                        'Target audience and what motivates them',
                        'Core value proposition or single key message',
                        'Call to action (explicit or implied)',
                        'Variants requested (number of options, A/B variations)',
                        'What to avoid (jargon, passive voice, vague claims)'
                    ],
                    outputHints: 'Generate a prompt optimized for brevity and impact. Every word counts in short-form copy. Specify exact character limits, the single message that must land, and the desired emotional response. Request multiple variants so the user can choose the strongest option.',
                    systemContext: 'The user needs short, high-impact copy where every word must earn its place. The target model should produce multiple variations and understand that short-form copy is about precision, not compression. The prompt must specify platform constraints, brand voice, and the single message that needs to land.'
                },
                'marketing-comms': {
                    label: 'Marketing Communications',
                    description: 'For emails, newsletters, press releases, announcements, and outreach. The generated prompt should structure the communication for audience, channel, and conversion goal.',
                    dimensions: [
                        'Communication type (email, newsletter, press release, announcement, outreach)',
                        'Audience segment and relationship stage (cold, warm, existing customer)',
                        'Primary goal (inform, convert, retain, re-engage)',
                        'Subject line or headline requirements',
                        'Key message hierarchy (what matters most, second, third)',
                        'Tone and formality level',
                        'Call to action and desired next step',
                        'Personalization variables and merge fields',
                        'Length constraints and scanability requirements',
                        'Compliance considerations (CAN-SPAM, unsubscribe, disclosures)'
                    ],
                    outputHints: 'Generate a prompt that structures the communication around the conversion goal. Specify the audience relationship stage, message hierarchy, and exact CTA. Marketing communications live or die on subject lines and first sentences — the prompt should emphasize these. Include compliance requirements where relevant.',
                    systemContext: 'The user needs a marketing communication optimized for a specific audience, channel, and conversion goal. The target model must understand that marketing comms are structured around action, not just information. The prompt should produce output with clear message hierarchy, strong subject lines, and explicit CTAs.'
                }
            }
        },
        strategy: {
            label: 'Strategy',
            systemRole: 'You are an expert prompt engineer specializing in business strategy, planning, and decision-making frameworks.',
            dimensions: [
                'Current state assessment',
                'Goals and success metrics',
                'Stakeholder analysis',
                'Risk assessment and mitigation',
                'Timeline and milestones',
                'Resource requirements',
                'Competitive landscape'
            ],
            outputHints: 'Include frameworks, decision matrices, and actionable recommendations.',
            subTypes: {
                business: {
                    label: 'Business Strategy',
                    description: 'For competitive positioning, growth planning, market entry, and organizational strategy. The generated prompt should produce structured strategic analysis.',
                    dimensions: [
                        'Current business state and market position',
                        'Strategic objective and time horizon',
                        'Competitive landscape and differentiation',
                        'Target market segments and customer analysis',
                        'Revenue model and unit economics',
                        'Growth levers and scalability',
                        'Resource constraints (capital, team, time)',
                        'Risk factors and mitigation strategies',
                        'Key assumptions that need validation',
                        'Success metrics and decision checkpoints'
                    ],
                    outputHints: 'Generate a prompt that produces structured strategic analysis with clear frameworks (SWOT, Porter\'s Five Forces, Jobs-to-be-Done, etc.). The output should include prioritized recommendations, not just analysis. Strategy without action items is just commentary.',
                    systemContext: 'The user needs strategic business analysis that leads to actionable decisions. The target model should apply established strategy frameworks and produce prioritized recommendations with clear reasoning. The prompt must prevent generic advice by requiring specific context about the business, market, and constraints.'
                },
                'go-to-market': {
                    label: 'Go-to-Market Strategy',
                    description: 'For product launches, market entry plans, pricing strategy, and channel selection. The generated prompt should produce a launch-ready GTM plan.',
                    dimensions: [
                        'Product or service being launched',
                        'Target customer profile and ideal customer persona (ICP)',
                        'Market size and opportunity (TAM/SAM/SOM)',
                        'Positioning and messaging framework',
                        'Pricing strategy and competitive pricing context',
                        'Distribution channels and channel priorities',
                        'Launch timeline and phase gates',
                        'Sales enablement and collateral needs',
                        'Success metrics for first 30/60/90 days',
                        'Budget allocation across channels'
                    ],
                    outputHints: 'Generate a prompt that produces an actionable GTM plan with specific phases, channel priorities, and measurable milestones. Include pricing rationale and positioning statements. A GTM plan without a timeline and budget allocation is just a wishlist.',
                    systemContext: 'The user needs a go-to-market plan that can be executed, not just a strategic overview. The target model should produce phased plans with specific channel recommendations, pricing rationale, and measurable success criteria. The prompt must anchor on the target customer and work outward from there.'
                },
                technical: {
                    label: 'Technical Strategy',
                    description: 'For architecture decisions, technology selection, migration planning, and technical roadmaps. The generated prompt should produce defensible technical recommendations.',
                    dimensions: [
                        'Current technical landscape and stack',
                        'Strategic technical objective',
                        'Options under consideration with trade-offs',
                        'Evaluation criteria (performance, cost, team skill, ecosystem)',
                        'Migration path and backward compatibility',
                        'Team capabilities and hiring implications',
                        'Vendor lock-in and portability concerns',
                        'Security and compliance requirements',
                        'Scalability requirements and growth projections',
                        'Decision timeline and reversibility assessment'
                    ],
                    outputHints: 'Generate a prompt that produces a technical decision document with clear trade-off analysis. Include an evaluation matrix, migration considerations, and a recommendation with explicit reasoning. Technical strategy prompts should ask the model to consider what is reversible versus irreversible.',
                    systemContext: 'The user needs a technical strategy recommendation backed by trade-off analysis. The target model should evaluate options against explicit criteria and produce a defensible recommendation. The prompt must surface reversibility, migration cost, and team capability constraints — not just feature comparisons.'
                }
            }
        },
        product: {
            label: 'Product',
            systemRole: 'You are an expert prompt engineer specializing in product management, requirements definition, and product development workflows.',
            dimensions: [
                'User personas and needs',
                'Problem statement',
                'Feature requirements (MoSCoW)',
                'Success metrics and KPIs',
                'Technical feasibility',
                'Go-to-market considerations',
                'Iteration and feedback loops'
            ],
            outputHints: 'Include user stories, acceptance criteria, and prioritization.',
            subTypes: {
                prd: {
                    label: 'Product Requirements Document',
                    description: 'For writing a full PRD with problem statement, personas, requirements, and acceptance criteria. The generated prompt should produce a complete, stakeholder-ready document.',
                    dimensions: [
                        'Product name and one-line description',
                        'Problem statement and evidence (user pain, market gap, data)',
                        'Target user personas with behavioral context',
                        'Goals and success metrics (quantitative where possible)',
                        'Feature requirements with MoSCoW prioritization',
                        'User stories with acceptance criteria',
                        'Out of scope (what this version explicitly does NOT include)',
                        'Technical constraints and dependencies',
                        'Design requirements and UX principles',
                        'Launch criteria and rollout plan',
                        'Open questions and assumptions to validate'
                    ],
                    outputHints: 'Generate a prompt that produces a complete PRD ready for engineering and design review. Include explicit out-of-scope boundaries to prevent scope creep. Every feature should have acceptance criteria. A PRD without measurable success metrics is just a feature wishlist.',
                    systemContext: 'The user needs a professional product requirements document that can be handed to engineering and design teams. The target model should produce a structured document with clear problem framing, prioritized requirements, and testable acceptance criteria. The prompt must enforce specificity — vague requirements produce vague products.'
                },
                'user-story': {
                    label: 'User Stories',
                    description: 'For writing individual user stories with acceptance criteria, edge cases, and technical notes. The generated prompt should produce stories ready for sprint planning.',
                    dimensions: [
                        'User persona and their goal',
                        'Story format (As a [user], I want [action], so that [benefit])',
                        'Acceptance criteria (Given/When/Then format)',
                        'Edge cases and error states',
                        'Dependencies on other stories or systems',
                        'Design and UX requirements',
                        'Technical implementation notes',
                        'Story point estimation guidance',
                        'Definition of done'
                    ],
                    outputHints: 'Generate a prompt that produces well-formed user stories with testable acceptance criteria in Given/When/Then format. Include edge cases that developers would otherwise discover mid-sprint. Stories should be small enough to complete in a single sprint.',
                    systemContext: 'The user needs user stories that are ready for sprint planning and engineering pickup. The target model should produce stories in standard format with complete acceptance criteria that QA can test against. The prompt must prevent stories that are too large or too vague to estimate.'
                },
                'feature-spec': {
                    label: 'Feature Specification',
                    description: 'For specifying a single feature in detail including behavior, states, interactions, and technical requirements. The generated prompt should produce an implementation-ready spec.',
                    dimensions: [
                        'Feature name and purpose',
                        'User flow and interaction sequence',
                        'All possible states (empty, loading, error, success, partial)',
                        'Input validation and constraints',
                        'Business rules and conditional logic',
                        'API contracts and data models',
                        'Error handling and fallback behavior',
                        'Performance requirements (latency, throughput)',
                        'Accessibility requirements',
                        'Analytics events and tracking',
                        'Migration and backward compatibility'
                    ],
                    outputHints: 'Generate a prompt that produces a feature spec covering every state and interaction. The most common gap in feature specs is missing states — loading, empty, error, and partial states are where most bugs live. The prompt should explicitly require the model to enumerate all states.',
                    systemContext: 'The user needs a detailed feature specification that an engineer can implement without ambiguity. The target model should enumerate all states, define business rules precisely, and specify error handling. The prompt must surface the states and edge cases that are easy to overlook — these are where implementation bugs concentrate.'
                }
            }
        },
        design: {
            label: 'Design',
            systemRole: 'You are an expert prompt engineer specializing in design workflows including UI/UX, visual design, and image generation.',
            dimensions: [
                'User research and personas',
                'Information architecture',
                'Visual hierarchy and layout',
                'Interaction patterns',
                'Accessibility requirements',
                'Brand alignment',
                'Responsive considerations'
            ],
            outputHints: 'Describe visual specs, interaction flows, and component structure.',
            subTypes: {
                'ui-ux': {
                    label: 'UI/UX Design',
                    description: 'For wireframes, interaction flows, component design, and user experience specifications. The generated prompt should produce design-ready specifications.',
                    dimensions: [
                        'Target user persona and their context of use',
                        'User flow and task completion sequence',
                        'Page or screen layout and information hierarchy',
                        'Component inventory (buttons, forms, modals, navigation, etc.)',
                        'Interaction patterns (hover, click, drag, swipe, keyboard)',
                        'State management across the UI (loading, empty, error, success)',
                        'Responsive breakpoints and mobile adaptations',
                        'Accessibility requirements (WCAG level, screen readers, keyboard nav)',
                        'Design system or component library constraints',
                        'Micro-interactions and transition animations'
                    ],
                    outputHints: 'Generate a prompt that produces UI/UX specifications an engineer or designer can act on. Include all interactive states, responsive behavior, and accessibility requirements. UI design prompts that only describe the happy path produce designs that break on edge cases.',
                    systemContext: 'The user needs UI/UX design specifications that cover the full interaction lifecycle. The target model should describe layouts, components, states, and responsive behavior with enough precision to build from. The prompt must prevent happy-path-only designs by requiring error, empty, and loading state definitions.'
                },
                'design-assets': {
                    label: 'Design Assets',
                    description: 'For logos, icons, illustrations, brand elements, and visual assets. The generated prompt should produce precise visual descriptions for image generation models or designers.',
                    dimensions: [
                        'Asset type (logo, icon, illustration, banner, badge, etc.)',
                        'Visual style (flat, 3D, hand-drawn, minimalist, photorealistic)',
                        'Color palette and brand colors',
                        'Dimensions, aspect ratio, and resolution requirements',
                        'Composition and focal point',
                        'Typography requirements (if text is included)',
                        'Background treatment (transparent, solid, gradient)',
                        'Output format (SVG, PNG, JPG, WebP)',
                        'Usage context (website header, app icon, social media, print)',
                        'What to avoid (specific styles, colors, elements, cliches)'
                    ],
                    outputHints: 'Generate a prompt optimized for visual asset creation. Be extremely specific about style, composition, and dimensions. Image generation models default to generic aesthetics — the prompt must override those defaults with precise visual direction. Include negative constraints (what NOT to generate) to prevent common model defaults.',
                    systemContext: 'The user needs a visual asset and the prompt will likely be sent to an image generation model or used as a creative brief for a designer. The target model must produce precise visual descriptions, not vague aesthetic direction. The prompt should specify style, dimensions, colors, and composition explicitly — image models interpret ambiguity poorly.'
                },
                'photo-editing': {
                    label: 'Photo Editing',
                    description: 'For image modification, retouching, compositing, background changes, and style transfer. The generated prompt should produce precise editing instructions for image models.',
                    dimensions: [
                        'Source image description (what the input looks like)',
                        'Specific modification requested',
                        'Areas to preserve unchanged',
                        'Areas to modify and how',
                        'Style or aesthetic target for the edit',
                        'Color grading or lighting adjustments',
                        'Resolution and quality requirements',
                        'Output format',
                        'Reference images or style examples (if applicable)',
                        'What should NOT change (explicit preservation list)'
                    ],
                    outputHints: 'Generate a prompt for image editing that separates what to change from what to preserve. The most common failure with photo editing prompts is the model changing elements that should stay untouched. The prompt must include an explicit preservation list alongside the modification instructions.',
                    systemContext: 'The user needs to modify an existing image. The target model must understand which parts of the image to change and which to preserve. The prompt should be structured as: describe the source, describe what to change, describe what to keep. Editing prompts that only describe the desired output without anchoring on the source produce inconsistent results.'
                }
            }
        },
        marketing: {
            label: 'Marketing',
            systemRole: 'You are an expert prompt engineer specializing in marketing strategy, campaign planning, and audience engagement.',
            dimensions: [
                'Target audience segments',
                'Channel strategy',
                'Budget tiers and allocation',
                'Timeline and campaign phases',
                'KPIs and measurement plan',
                'Messaging and positioning',
                'A/B testing and experimentation plan'
            ],
            outputHints: 'Include audience profiles, channel recommendations, and metrics.',
            subTypes: {
                campaign: {
                    label: 'Campaign Planning',
                    description: 'For multi-channel marketing campaigns with timelines, creative briefs, and performance targets. The generated prompt should produce an executable campaign plan.',
                    dimensions: [
                        'Campaign objective and type (awareness, acquisition, retention, launch)',
                        'Target audience segments with behavioral profiles',
                        'Channel mix and priority ranking',
                        'Creative brief and messaging framework',
                        'Content calendar and publishing cadence',
                        'Budget allocation by channel',
                        'Campaign phases and milestones',
                        'A/B testing plan and variables to test',
                        'KPIs by channel and overall campaign metrics',
                        'Reporting cadence and optimization triggers'
                    ],
                    outputHints: 'Generate a prompt that produces an actionable campaign plan with specific phases, channel allocation, and measurable KPIs. Include creative brief elements so the output can be handed to a creative team. A campaign plan without a testing framework is just a guess.',
                    systemContext: 'The user needs a marketing campaign plan that can be executed across channels. The target model should produce phased plans with budget allocation, creative direction, and measurable goals. The prompt must enforce specificity — campaigns fail when objectives, audiences, and success metrics are vague.'
                },
                content: {
                    label: 'Content Strategy',
                    description: 'For editorial calendars, content pillars, SEO content plans, and content marketing frameworks. The generated prompt should produce a strategic content plan.',
                    dimensions: [
                        'Business goals the content supports',
                        'Target audience and their information needs',
                        'Content pillars and topic clusters',
                        'Content formats (blog, video, podcast, social, email)',
                        'Publishing cadence and editorial calendar structure',
                        'SEO strategy and keyword targets',
                        'Distribution and amplification channels',
                        'Content repurposing and cross-channel adaptation',
                        'Performance metrics by content type',
                        'Competitive content gaps and differentiation'
                    ],
                    outputHints: 'Generate a prompt that produces a content strategy tied to business goals, not just a topic list. Include content pillars, publishing cadence, and distribution plan. Content strategy without distribution strategy is just a blog nobody reads.',
                    systemContext: 'The user needs a content strategy that drives measurable business outcomes. The target model should connect content themes to audience needs and business goals, then specify formats, cadence, and distribution. The prompt must prevent the model from producing a generic topic list by requiring strategic rationale for each content pillar.'
                },
                'social-media': {
                    label: 'Social Media',
                    description: 'For platform-specific social media strategies, post creation, and engagement planning. The generated prompt should account for platform conventions and algorithm behavior.',
                    dimensions: [
                        'Platform(s) and their specific conventions',
                        'Account positioning and brand voice on social',
                        'Target audience behavior on each platform',
                        'Content types (static, carousel, video, stories, threads, polls)',
                        'Posting frequency and optimal timing',
                        'Hashtag and discoverability strategy',
                        'Engagement and community management approach',
                        'Paid amplification strategy (if applicable)',
                        'Platform-specific metrics and benchmarks',
                        'Competitor social presence and gaps to exploit'
                    ],
                    outputHints: 'Generate a prompt that accounts for platform-specific conventions. What works on LinkedIn does not work on TikTok. The prompt should specify the platform first and derive content format, tone, and length from platform norms. Include posting cadence and engagement strategy, not just content creation.',
                    systemContext: 'The user needs social media strategy or content tailored to specific platforms. The target model must understand that each platform has different conventions, audiences, and algorithmic preferences. The prompt should produce platform-native recommendations, not generic social media advice that ignores channel differences.'
                }
            }
        },
        research: {
            label: 'Research',
            systemRole: 'You are an expert prompt engineer specializing in research methodology, analysis, and evidence-based inquiry.',
            dimensions: [
                'Research question and hypothesis',
                'Methodology and approach',
                'Data sources and collection',
                'Analysis framework',
                'Limitations and bias considerations',
                'Expected deliverables',
                'Literature and prior work context'
            ],
            outputHints: 'Specify methodology, data requirements, and analysis approach.',
            subTypes: {
                'literature-review': {
                    label: 'Literature Review',
                    description: 'For academic reviews, source synthesis, gap analysis, and annotated bibliographies. The generated prompt should produce systematic review methodology.',
                    dimensions: [
                        'Research question or topic being reviewed',
                        'Scope and boundaries (time period, disciplines, geographies)',
                        'Search strategy and databases to query',
                        'Inclusion and exclusion criteria for sources',
                        'Synthesis framework (thematic, chronological, methodological)',
                        'Key debates and competing perspectives to address',
                        'Gap identification criteria',
                        'Citation and formatting requirements',
                        'Expected length and section structure',
                        'Audience (academic, professional, general)'
                    ],
                    outputHints: 'Generate a prompt that produces a systematic literature review, not just a summary of sources. The review should synthesize findings, identify patterns across studies, and surface gaps. Include explicit inclusion/exclusion criteria to keep the review focused and defensible.',
                    systemContext: 'The user needs a structured literature review that synthesizes existing research. The target model should organize sources thematically, identify consensus and disagreement, and surface gaps in the literature. The prompt must prevent the model from producing a list of summaries by requiring synthesis and critical analysis across sources.'
                },
                'user-research': {
                    label: 'User Research',
                    description: 'For interview guides, survey design, usability studies, and persona development. The generated prompt should produce research instruments and analysis plans.',
                    dimensions: [
                        'Research objective and key questions to answer',
                        'Target participant profile and recruitment criteria',
                        'Research method (interviews, surveys, usability tests, diary studies)',
                        'Interview guide or survey instrument design',
                        'Sample size and statistical significance considerations',
                        'Bias mitigation (leading questions, selection bias, confirmation bias)',
                        'Data collection and recording procedures',
                        'Analysis methodology (thematic analysis, affinity mapping, etc.)',
                        'Deliverable format (personas, journey maps, insight reports)',
                        'Ethical considerations and informed consent'
                    ],
                    outputHints: 'Generate a prompt that produces research instruments (interview guides, surveys) with proper methodology, not just a topic list. Include bias mitigation, sample size guidance, and analysis plans. User research without a clear analysis framework produces anecdotes, not insights.',
                    systemContext: 'The user needs user research methodology and instruments. The target model should produce properly structured research plans with bias mitigation, clear protocols, and analysis frameworks. The prompt must prevent the model from generating leading questions or producing research designs that confirm existing assumptions.'
                },
                'market-research': {
                    label: 'Market Research',
                    description: 'For competitive analysis, market sizing, industry trends, and opportunity assessment. The generated prompt should produce structured market intelligence.',
                    dimensions: [
                        'Market or industry being analyzed',
                        'Research objective (sizing, competitive analysis, trend identification)',
                        'Market segmentation framework',
                        'TAM/SAM/SOM estimation methodology',
                        'Competitive landscape and key players',
                        'Data sources (public filings, industry reports, surveys, web data)',
                        'Trend analysis time horizon',
                        'SWOT or competitive positioning framework',
                        'Key assumptions and confidence levels',
                        'Deliverable format and audience'
                    ],
                    outputHints: 'Generate a prompt that produces market research with explicit methodology and data source requirements. Market sizing should include the estimation approach, not just numbers. Include confidence levels for estimates and document key assumptions that could invalidate the analysis.',
                    systemContext: 'The user needs structured market intelligence for decision-making. The target model should produce research grounded in identifiable data sources with explicit methodology. The prompt must prevent the model from fabricating statistics by requiring source attribution and confidence levels for all quantitative claims.'
                }
            }
        },
        'data-analysis': {
            label: 'Data Analysis',
            systemRole: 'You are an expert prompt engineer specializing in data analysis, statistical methods, and data visualization.',
            dimensions: [
                'Data sources and formats',
                'Cleaning and preprocessing needs',
                'Analysis techniques and models',
                'Visualization requirements',
                'Statistical rigor and validation',
                'Insights and recommendations format',
                'Reproducibility and documentation'
            ],
            outputHints: 'Include data specs, analysis steps, and visualization descriptions.',
            subTypes: {
                exploratory: {
                    label: 'Exploratory Analysis',
                    description: 'For initial data exploration, pattern discovery, hypothesis generation, and data profiling. The generated prompt should produce a systematic exploration plan.',
                    dimensions: [
                        'Dataset description (source, size, format, fields)',
                        'Business context and what decisions the analysis informs',
                        'Data profiling requirements (distributions, missing values, outliers)',
                        'Correlation and relationship discovery approach',
                        'Segmentation and grouping hypotheses',
                        'Visualization plan for key distributions and relationships',
                        'Anomaly and outlier detection methodology',
                        'Initial hypotheses to investigate',
                        'Data quality checks and validation steps',
                        'Output format (notebook, report, presentation)'
                    ],
                    outputHints: 'Generate a prompt that produces a systematic exploration plan, not just "look at the data." Include specific profiling steps, visualization types for different data relationships, and hypothesis generation. Exploratory analysis without a structured approach produces cherry-picked findings.',
                    systemContext: 'The user needs to explore a dataset systematically before deeper analysis. The target model should produce a structured exploration plan that profiles the data, discovers patterns, and generates testable hypotheses. The prompt must prevent the model from jumping to conclusions by enforcing systematic profiling before interpretation.'
                },
                dashboard: {
                    label: 'Dashboard & Reporting',
                    description: 'For KPI dashboards, automated reports, and data visualization design. The generated prompt should produce a dashboard specification with metrics, layout, and interactivity.',
                    dimensions: [
                        'Dashboard purpose and primary audience',
                        'Key metrics and KPIs with calculation definitions',
                        'Data sources and refresh frequency',
                        'Time periods and comparison baselines',
                        'Layout and visual hierarchy of metrics',
                        'Chart types and visualization choices per metric',
                        'Filters, drill-downs, and interactivity',
                        'Alerting thresholds and conditional formatting',
                        'Mobile and responsive considerations',
                        'Tool or platform constraints (Tableau, Looker, Grafana, custom)'
                    ],
                    outputHints: 'Generate a prompt that produces a dashboard specification with metric definitions, not just a list of things to show. Every metric should have a precise calculation definition and a reason for its inclusion. Dashboards without clear metric definitions produce vanity metrics that drive no action.',
                    systemContext: 'The user needs a dashboard or report specification that drives decision-making. The target model should define every metric precisely (including calculation method), specify visualization types with rationale, and design the information hierarchy for the target audience. The prompt must prevent dashboards full of data but empty of insight.'
                },
                statistical: {
                    label: 'Statistical Modeling',
                    description: 'For regression, classification, hypothesis testing, A/B test analysis, and model validation. The generated prompt should produce a rigorous analytical methodology.',
                    dimensions: [
                        'Research question or prediction target',
                        'Dataset description and feature inventory',
                        'Statistical method selection and justification',
                        'Assumptions to check (normality, independence, homoscedasticity)',
                        'Feature engineering and variable selection approach',
                        'Training/validation/test split strategy',
                        'Model evaluation metrics and success criteria',
                        'Significance levels and power analysis',
                        'Cross-validation and robustness checks',
                        'Interpretation guidelines and limitations',
                        'Reproducibility requirements (random seeds, environment, versioning)'
                    ],
                    outputHints: 'Generate a prompt that produces rigorous statistical methodology with assumption checking, validation strategy, and interpretation guidelines. Include specific evaluation metrics and significance thresholds. Statistical modeling prompts that skip assumption checking produce results that look precise but are not valid.',
                    systemContext: 'The user needs a statistical modeling approach with proper rigor. The target model should specify methods, validate assumptions, define evaluation criteria, and document limitations. The prompt must enforce methodological discipline — the model should check assumptions before running models and report confidence intervals, not just point estimates.'
                }
            }
        },
        build: {
            label: 'Build Based On',
            systemRole: 'You are an expert prompt engineer specializing in analyzing existing websites and creating prompts that instruct models to build working implementations based on them. Implementations should use JSON objects for configuration and data structures — promoting composability and extensibility.',
            requiresUrl: true,
            dimensions: [
                'URL to analyze',
                'Target tech stack for the build',
                'Core functionality to preserve or implement',
                'Visual design elements to match',
                'Content structure and information architecture',
                'Interactive features and behavior',
                'Performance and accessibility requirements',
                'Deployment target',
                'JSON-based configuration and data structures'
            ],
            outputHints: 'Generate a prompt that instructs the model to BUILD a working implementation based on the source URL. Emphasize using JSON objects for configuration and data. The prompt should analyze the source, then ask for complete working code — not a specification.',
            subTypes: {
                replicate: {
                    label: 'Replicate',
                    description: 'For building a new site inspired by an existing reference. Use the source as a design reference to create original implementation with similar patterns and functionality.',
                    requiresUrl: true,
                    dimensions: [
                        'URL to analyze as reference',
                        'Design patterns and layout concepts to learn from',
                        'Layout and responsive behavior to implement',
                        'Color palette, typography, and spacing inspiration',
                        'Interactive patterns and their behavior',
                        'Content structure and hierarchy patterns',
                        'Original assets to create (not copied from source)',
                        'Target tech stack selection',
                        'Deployment target (GitHub Pages, Vercel, etc.)',
                        'Original content requirements'
                    ],
                    outputHints: 'Generate a prompt that instructs the model to BUILD an original implementation inspired by the source site. Analyze the reference for patterns and design language, then create new working code that captures the essence without copying.',
                    systemContext: 'The user wants to build a new site inspired by an existing reference. The generated prompt must instruct the target model to analyze the source for design patterns and create original working code — not copy the source. Emphasize learning from the reference to build something new.'
                },
                extend: {
                    label: 'Extend',
                    description: 'For adding new features or sections to an existing site while maintaining design consistency. The generated prompt should instruct the model to build the new additions.',
                    requiresUrl: true,
                    dimensions: [
                        'URL to analyze for existing patterns',
                        'New feature or section to add',
                        'Design system elements to extract and reuse',
                        'Component patterns to follow',
                        'Navigation and IA integration',
                        'Consistency requirements with existing site',
                        'New functionality requirements',
                        'Target tech stack selection',
                        'API or data integration needs',
                        'Testing approach for new additions'
                    ],
                    outputHints: 'Generate a prompt that instructs the model to BUILD new features that integrate with the existing site. Analyze the source for patterns, then ask for working code that extends it.',
                    systemContext: 'The user wants to extend an existing website with new features. The generated prompt must instruct the target model to produce working code for the new additions — not a specification. The prompt should guide pattern extraction from the source, then ask for implementation.'
                },
                improve: {
                    label: 'Improve',
                    description: 'For analyzing an existing site and implementing improvements for design, performance, accessibility, or UX. The generated prompt should instruct the model to analyze and then implement fixes.',
                    requiresUrl: true,
                    dimensions: [
                        'URL to analyze',
                        'Improvement focus areas (design, performance, accessibility, UX, SEO)',
                        'Current pain points or known issues',
                        'Target metrics or standards to achieve',
                        'Budget and effort constraints',
                        'Priority ranking of improvements',
                        'Implementation approach (incremental vs redesign)',
                        'Target tech stack for improvements',
                        'Measurement and validation approach'
                    ],
                    outputHints: 'Generate a prompt that instructs the model to analyze the source site, identify improvements, AND produce the improved code. Ask for working files that implement the fixes, not just recommendations.',
                    systemContext: 'The user wants to improve an existing website. The generated prompt must instruct the target model to analyze the source, identify issues, and produce working code that implements the improvements \u2014 not just recommendations.'
                },
                // Tech stack subTypes generated from shared techStacks object
                'serverless-app': createBuildSubType('serverless-app'),
                'vercel': createBuildSubType('vercel'),
                'blockchain-web3': createBuildSubType('blockchain-web3'),
                'jekyll-site': createBuildSubType('jekyll-site'),
                'html-css-js': createBuildSubType('html-css-js'),
                'toy-app': createBuildSubType('toy-app')
            }
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

    function buildMetaPrompt(subjectType, idea, modelType, subType, options = {}) {
        const subject = subjectScaffolds[subjectType];
        const model = modelConstraints[modelType] || modelConstraints.llm;
        const { includeAttestation = false } = options;

        // Resolve sub-type dimensions and hints if applicable
        const activeSubType = (subject.subTypes && subType) ? subject.subTypes[subType] : null;
        const dimensions = activeSubType ? activeSubType.dimensions : subject.dimensions;
        const outputHints = activeSubType ? activeSubType.outputHints : subject.outputHints;
        const subTypeContext = activeSubType ? activeSubType.systemContext : '';

        // Use subject-specific system role instead of hardcoded role
        const systemRole = subject.systemRole || 'You are an expert prompt engineer.';

        const systemMessage = `${systemRole} Your task is to transform a simple idea into a high-quality, production-ready prompt that will produce correct, useful output on the first or second pass.

${subTypeContext ? `Context for this prompt type: ${subTypeContext}\n\n` : ''}Your goal is to produce a prompt that is specific enough to minimize follow-up corrections. Vague prompts produce vague outputs. Every instruction you include should reduce ambiguity for the target model.

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

        // AI Attestation instructions for Development and Build Based On prompts
        const attestationInstructions = includeAttestation ? `

**AI Attestation Workflow (REQUIRED):**
The generated prompt MUST instruct the model to include an AI attestation workflow using attest.ink. This provides transparency about AI collaboration in the codebase. Include these requirements:

1. Create an ATTESTATION.md file in the project root with this structure:
   - Version: 2.0
   - Content name: [project name]
   - Timestamp: ISO 8601 format
   - Platform: attest.ink
   - Model: [model used, e.g., claude-opus-4]
   - Role: One of "generated" (AI created most content), "assisted" (human-AI collaboration), or "reviewed" (AI reviewed human work)
   - A brief description of what AI assistance was used for

2. Add a verification badge in the footer of any HTML pages:
   - Small "built with ai" or "ai assisted" text link
   - Link to attest.ink/verify with the attestation data as a base64-encoded JSON parameter
   - Badge should be subtle (small font, muted color) but visible

3. The attestation data structure for the verification link:
   {
     "version": "2.0",
     "id": "[date]-[short-id]",
     "content_name": "[project name]",
     "timestamp": "[ISO 8601 timestamp]",
     "platform": "attest.ink",
     "model": "[model name]",
     "role": "[generated|assisted|reviewed]"
   }

This attestation is free to create and verify via attest.ink. It builds trust by being transparent about AI collaboration.` : '';

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
**Prompt Length Guidance:** ${model.maxPromptGuidance}${attestationInstructions}

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

    function subTypeRequiresUrl(subjectType, subType) {
        const subject = subjectScaffolds[subjectType];
        if (!subject) return false;
        // Check if subject type itself requires URL
        if (subject.requiresUrl === true) return true;
        // Check if sub-type requires URL
        if (!subject.subTypes || !subType) return false;
        const sub = subject.subTypes[subType];
        return sub && sub.requiresUrl === true;
    }

    return { buildMetaPrompt, getSubjectTypes, getModelTypes, getSubTypes, subTypeRequiresUrl };
})();
