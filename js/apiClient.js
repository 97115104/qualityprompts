const ApiClient = (() => {
    const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
    const DEFAULT_MODEL = 'gpt-4o';
    const DEFAULT_PUTER_MODEL = 'openai/gpt-oss-120b';

    async function generatePrompt({ apiKey, baseUrl, model, systemMessage, userMessage, apiMode, puterModel }) {
        if (apiMode === 'puter') {
            return callPuterApi({ model: puterModel || DEFAULT_PUTER_MODEL, systemMessage, userMessage });
        }

        const base = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
        const modelName = model || DEFAULT_MODEL;

        if (apiMode === 'responses') {
            return callResponsesApi({ base, apiKey, modelName, systemMessage, userMessage });
        }
        return callChatCompletionsApi({ base, apiKey, modelName, systemMessage, userMessage });
    }

    // --- Puter GPT-OSS ---

    async function callPuterApi({ model, systemMessage, userMessage }) {
        if (typeof puter === 'undefined' || !puter.ai) {
            throw new Error('Puter SDK not loaded. Make sure the page includes the Puter script tag.');
        }

        let response;
        try {
            response = await puter.ai.chat(
                [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: userMessage }
                ],
                { model }
            );
        } catch (err) {
            const msg = err?.message || err?.toString?.() || JSON.stringify(err);
            // Surface the real error details
            if (msg.includes('content_filter') || msg.includes('moderation') || msg.includes('flagged')) {
                throw new Error(
                    'Content was flagged by the model\'s safety filter. ' +
                    'Try rephrasing sensitive content or using a different model.'
                );
            }
            if (msg.includes('context_length') || msg.includes('too long') || msg.includes('token')) {
                throw new Error(
                    'Prompt is too long for this model. Try shortening your idea or switching to gpt-oss-120b.'
                );
            }
            throw new Error(`Puter API error: ${msg}`);
        }

        const content = response?.message?.content;
        if (!content) {
            throw new Error(
                'No content returned from Puter API. The model may have refused the request. ' +
                'Full response: ' + JSON.stringify(response).substring(0, 300)
            );
        }
        return parseResponse(content);
    }

    // --- OpenAI Chat Completions ---

    async function callChatCompletionsApi({ base, apiKey, modelName, systemMessage, userMessage }) {
        const url = `${base}/chat/completions`;

        const body = {
            model: modelName,
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_completion_tokens: 4096,
            response_format: { type: 'json_object' }
        };

        const data = await doFetch(url, apiKey, body);

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('No content returned from the API.');
        }
        return parseResponse(content);
    }

    // --- OpenAI Responses API ---

    async function callResponsesApi({ base, apiKey, modelName, systemMessage, userMessage }) {
        const url = `${base}/responses`;

        const body = {
            model: modelName,
            instructions: systemMessage,
            input: userMessage,
            text: {
                format: { type: 'json_object' }
            }
        };

        const data = await doFetch(url, apiKey, body);

        const content = data.output_text
            || data.output?.[0]?.content?.[0]?.text
            || null;

        if (!content) {
            throw new Error('No content returned from the Responses API.');
        }
        return parseResponse(content);
    }

    // --- Shared fetch helper ---

    async function doFetch(url, apiKey, body) {
        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(body)
            });
        } catch (err) {
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                throw new Error(
                    'Network error — this is likely a CORS issue. ' +
                    'The OpenAI API does not allow direct browser requests. ' +
                    'Try switching to the Puter GPT-OSS provider (free, no CORS issues) ' +
                    'or use a CORS-compatible proxy.'
                );
            }
            throw new Error(`Network error: ${err.message}`);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const msg = errorData?.error?.message || response.statusText;
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your key and try again.');
            }
            if (response.status === 429) {
                throw new Error(
                    'Rate limit exceeded (429). This usually means: ' +
                    '(1) your account has insufficient credits — check billing at platform.openai.com, ' +
                    '(2) you\'ve hit your requests-per-minute limit — wait 60 seconds and retry, or ' +
                    '(3) your account is on the free tier. Consider switching to Puter GPT-OSS (free).'
                );
            }
            if (response.status === 404) {
                throw new Error(
                    `Endpoint not found (404). Check your Base URL and API mode. Tried: ${response.url}`
                );
            }
            throw new Error(`API error (${response.status}): ${msg}`);
        }

        return response.json();
    }

    // --- Response parsing ---

    function parseResponse(content) {
        const parsed = tryParseJson(content);

        if (parsed && parsed.prompt_plain) {
            return {
                prompt_plain: parsed.prompt_plain || '',
                prompt_structured: parsed.prompt_structured || '',
                prompt_json: parsed.prompt_json || {},
                optimization_notes: parsed.optimization_notes || '',
                token_estimate: parsed.token_estimate || 0
            };
        }

        // JSON parsing failed entirely — the response is just raw text
        // Use it as the plain text prompt directly
        const plainText = cleanRawResponse(content);
        return {
            prompt_plain: plainText,
            prompt_structured: plainText,
            prompt_json: { prompt: plainText },
            optimization_notes: '',
            token_estimate: Math.ceil(plainText.split(/\s+/).length * 1.3)
        };
    }

    function tryParseJson(content) {
        let text = content.trim();

        // Strategy 1: Strip markdown code fences
        text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');

        // Strategy 2: Direct parse
        try {
            return JSON.parse(text);
        } catch { /* continue */ }

        // Strategy 3: Find first { ... last } in the response
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            try {
                return JSON.parse(text.substring(firstBrace, lastBrace + 1));
            } catch { /* continue */ }
        }

        // Strategy 4: Try to fix common issues — unescaped newlines in string values
        try {
            const fixed = text.substring(
                firstBrace !== -1 ? firstBrace : 0,
                lastBrace !== -1 ? lastBrace + 1 : text.length
            );
            // Replace actual newlines inside JSON string values with \\n
            const repaired = fixed.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');
            return JSON.parse(repaired);
        } catch { /* continue */ }

        // Strategy 5: Regex extraction of prompt_plain value
        const plainMatch = content.match(/"prompt_plain"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
        if (plainMatch) {
            const plain = plainMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');

            const structuredMatch = content.match(/"prompt_structured"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
            const structured = structuredMatch
                ? structuredMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
                : plain;

            const notesMatch = content.match(/"optimization_notes"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
            const notes = notesMatch
                ? notesMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
                : '';

            const tokenMatch = content.match(/"token_estimate"\s*:\s*(\d+)/);
            const tokens = tokenMatch ? parseInt(tokenMatch[1], 10) : 0;

            // Try to extract prompt_json
            let promptJson = { prompt: plain };
            const jsonMatch = content.match(/"prompt_json"\s*:\s*(\{[\s\S]*?\})\s*[,}]/);
            if (jsonMatch) {
                try { promptJson = JSON.parse(jsonMatch[1]); } catch { /* use default */ }
            }

            return {
                prompt_plain: plain,
                prompt_structured: structured,
                prompt_json: promptJson,
                optimization_notes: notes,
                token_estimate: tokens
            };
        }

        return null;
    }

    // Clean raw response text — remove any JSON artifacts
    function cleanRawResponse(content) {
        return content
            .replace(/^```(?:json)?\s*\n?/, '')
            .replace(/\n?```\s*$/, '')
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .trim();
    }

    return { generatePrompt };
})();
