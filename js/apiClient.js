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

        try {
            const response = await puter.ai.chat(
                [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: userMessage }
                ],
                { model }
            );

            const content = response?.message?.content;
            if (!content) {
                throw new Error('No content returned from Puter API.');
            }
            return parseResponse(content);
        } catch (err) {
            if (err.message?.includes('No content')) throw err;
            throw new Error(`Puter API error: ${err.message || err}`);
        }
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
        let cleaned = content.trim();
        // Strip markdown code fences if present
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }

        try {
            const parsed = JSON.parse(cleaned);
            return {
                prompt_plain: parsed.prompt_plain || '',
                prompt_structured: parsed.prompt_structured || '',
                prompt_json: parsed.prompt_json || {},
                optimization_notes: parsed.optimization_notes || '',
                token_estimate: parsed.token_estimate || 0
            };
        } catch {
            return {
                prompt_plain: content,
                prompt_structured: content,
                prompt_json: { raw: content },
                optimization_notes: 'Response was not valid JSON — returned as raw text.',
                token_estimate: Math.ceil(content.split(/\s+/).length * 1.3)
            };
        }
    }

    return { generatePrompt };
})();
