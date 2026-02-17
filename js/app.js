document.addEventListener('DOMContentLoaded', () => {
    // Detect file:// protocol — Puter SDK needs a web server
    if (window.location.protocol === 'file:') {
        document.getElementById('file-protocol-warning').classList.remove('hidden');
    }

    // Populate dropdowns
    populateSubjectTypes();
    populateModelTypes();

    // Subject type change — show/hide sub-type dropdown
    document.getElementById('subject-type').addEventListener('change', updateSubTypeDropdown);
    updateSubTypeDropdown();

    // Restore saved settings
    restoreSettings();

    // Setup UI interactions
    UIRenderer.setupTabs();
    UIRenderer.setupCopyButtons();
    UIRenderer.setupDownloadButtons();

    // How to use modal
    document.getElementById('btn-info').addEventListener('click', () => {
        document.getElementById('info-modal').classList.remove('hidden');
    });
    document.getElementById('btn-close-info').addEventListener('click', () => {
        document.getElementById('info-modal').classList.add('hidden');
    });
    document.getElementById('info-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            document.getElementById('info-modal').classList.add('hidden');
        }
    });

    // Settings toggle
    document.getElementById('settings-toggle').addEventListener('click', () => {
        const panel = document.getElementById('settings-panel');
        panel.classList.toggle('hidden');
        const btn = document.getElementById('settings-toggle');
        btn.textContent = panel.classList.contains('hidden')
            ? '\u25B6 API Settings'
            : '\u25BC API Settings';
    });

    // API mode toggle — show/hide relevant settings
    document.getElementById('api-mode').addEventListener('change', updateApiModeUI);
    updateApiModeUI();

    // Save checkbox
    document.getElementById('save-key').addEventListener('change', (e) => {
        if (!e.target.checked) {
            localStorage.removeItem('qp_api_key');
            localStorage.removeItem('qp_base_url');
            localStorage.removeItem('qp_model');
            localStorage.removeItem('qp_api_mode');
            localStorage.removeItem('qp_puter_model');
        }
    });

    // Character counter
    const ideaInput = document.getElementById('idea-input');
    const charCount = document.getElementById('char-count');
    const charCounter = document.querySelector('.char-counter');
    const charLimitHint = document.getElementById('char-limit-hint');
    ideaInput.addEventListener('input', () => {
        const len = ideaInput.value.length;
        charCount.textContent = len.toLocaleString();
        charCounter.classList.toggle('near-limit', len >= 1200 && len < 1500);
        charCounter.classList.toggle('at-limit', len >= 1500);
        charLimitHint.classList.toggle('hidden', len < 1500);
    });

    // Generate button
    document.getElementById('generate-btn').addEventListener('click', handleGenerate);

    // Allow Ctrl/Cmd+Enter to generate
    ideaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleGenerate();
        }
    });
});

// Provider configuration — placeholders, hints, and field visibility
const PROVIDER_CONFIG = {
    puter: {
        // No keyed settings needed
    },
    openrouter: {
        keyPlaceholder: 'sk-or-...',
        modelPlaceholder: 'anthropic/claude-sonnet-4',
        hint: 'CORS-friendly — works directly in the browser. Supports hundreds of models. Get a key at openrouter.ai/keys.',
        showBaseUrl: false
    },
    anthropic: {
        keyPlaceholder: 'sk-ant-...',
        modelPlaceholder: 'claude-sonnet-4-5-20250929',
        hint: 'Uses the Anthropic Messages API. Get a key at console.anthropic.com.',
        showBaseUrl: false
    },
    openai: {
        keyPlaceholder: 'sk-...',
        modelPlaceholder: 'gpt-4o',
        hint: 'Uses the OpenAI Chat Completions API. May require a CORS proxy for browser use. Get a key at platform.openai.com.',
        showBaseUrl: false
    },
    google: {
        keyPlaceholder: 'AIza...',
        modelPlaceholder: 'gemini-2.0-flash',
        hint: 'Uses the Google Gemini API. Get a key at aistudio.google.com.',
        showBaseUrl: false
    },
    custom: {
        keyPlaceholder: 'your-api-key',
        modelPlaceholder: 'gpt-4o',
        hint: 'Any OpenAI-compatible endpoint (Together, Ollama, LM Studio, etc.). Uses Bearer token auth and /chat/completions format.',
        showBaseUrl: true
    }
};

function updateApiModeUI() {
    const mode = document.getElementById('api-mode').value;
    const puterSettings = document.getElementById('puter-settings');
    const keyedSettings = document.getElementById('keyed-settings');

    if (mode === 'puter') {
        puterSettings.classList.remove('hidden');
        keyedSettings.classList.add('hidden');
    } else {
        puterSettings.classList.add('hidden');
        keyedSettings.classList.remove('hidden');

        // Configure the shared panel for this provider
        const config = PROVIDER_CONFIG[mode] || PROVIDER_CONFIG.custom;
        document.getElementById('api-key').placeholder = config.keyPlaceholder;
        document.getElementById('model-name').placeholder = config.modelPlaceholder;
        document.getElementById('provider-hint').textContent = config.hint;

        const baseUrlGroup = document.getElementById('base-url-group');
        if (config.showBaseUrl) {
            baseUrlGroup.classList.remove('hidden');
        } else {
            baseUrlGroup.classList.add('hidden');
        }
    }
}

function populateSubjectTypes() {
    const select = document.getElementById('subject-type');
    PromptEngine.getSubjectTypes().forEach(({ value, label }) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        select.appendChild(option);
    });
}

function updateSubTypeDropdown() {
    const subjectType = document.getElementById('subject-type').value;
    const subTypes = PromptEngine.getSubTypes(subjectType);
    const group = document.getElementById('sub-type-group');
    const select = document.getElementById('sub-type');

    // Clear existing options (keep the "General" default)
    select.innerHTML = '<option value="">General</option>';

    if (subTypes.length > 0) {
        subTypes.forEach(({ value, label }) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            select.appendChild(option);
        });
        group.style.display = '';
    } else {
        group.style.display = 'none';
    }
}

function populateModelTypes() {
    const select = document.getElementById('model-type');
    PromptEngine.getModelTypes().forEach(({ value, label }) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        select.appendChild(option);
    });
    select.value = 'llm';
}

function restoreSettings() {
    const savedKey = localStorage.getItem('qp_api_key');
    const savedUrl = localStorage.getItem('qp_base_url');
    const savedModel = localStorage.getItem('qp_model');
    const savedMode = localStorage.getItem('qp_api_mode');
    const savedPuterModel = localStorage.getItem('qp_puter_model');

    if (savedMode) {
        document.getElementById('api-mode').value = savedMode;
        updateApiModeUI();
    }
    if (savedKey) {
        document.getElementById('api-key').value = savedKey;
        document.getElementById('save-key').checked = true;
    }
    if (savedUrl) {
        document.getElementById('base-url').value = savedUrl;
    }
    if (savedModel) {
        document.getElementById('model-name').value = savedModel;
    }
    if (savedPuterModel) {
        document.getElementById('puter-model').value = savedPuterModel;
    }
}

function saveSettings() {
    if (document.getElementById('save-key').checked) {
        const apiMode = document.getElementById('api-mode').value;
        localStorage.setItem('qp_api_mode', apiMode);
        localStorage.setItem('qp_puter_model', document.getElementById('puter-model').value);

        if (apiMode !== 'puter') {
            localStorage.setItem('qp_api_key', document.getElementById('api-key').value);
            const baseUrl = document.getElementById('base-url').value;
            const modelName = document.getElementById('model-name').value;
            if (baseUrl) localStorage.setItem('qp_base_url', baseUrl);
            else localStorage.removeItem('qp_base_url');
            if (modelName) localStorage.setItem('qp_model', modelName);
            else localStorage.removeItem('qp_model');
        }
    }
}

async function handleGenerate() {
    const apiMode = document.getElementById('api-mode').value;
    const subjectType = document.getElementById('subject-type').value;
    const subType = document.getElementById('sub-type').value || null;
    const idea = document.getElementById('idea-input').value.trim();
    const modelType = document.getElementById('model-type').value;

    // Validate
    UIRenderer.hideError();

    if (apiMode !== 'puter') {
        const apiKey = document.getElementById('api-key').value.trim();
        if (!apiKey) {
            UIRenderer.showError('Please enter your API key in the settings panel.');
            document.getElementById('settings-panel').classList.remove('hidden');
            document.getElementById('settings-toggle').textContent = '\u25BC API Settings';
            return;
        }
    }

    if (!idea) {
        UIRenderer.showError('Please enter a prompt idea.');
        return;
    }

    // Save settings
    saveSettings();

    // Build meta-prompt
    const { system, user } = PromptEngine.buildMetaPrompt(subjectType, idea, modelType, subType);

    // Show loading
    UIRenderer.showLoading();
    document.getElementById('generate-btn').disabled = true;

    try {
        const params = {
            systemMessage: system,
            userMessage: user,
            apiMode
        };

        if (apiMode === 'puter') {
            params.puterModel = document.getElementById('puter-model').value;
        } else {
            params.apiKey = document.getElementById('api-key').value.trim();
            params.model = document.getElementById('model-name').value.trim() || undefined;
            // Only custom endpoint uses base URL override
            if (apiMode === 'custom') {
                params.baseUrl = document.getElementById('base-url').value.trim() || undefined;
            }
        }

        const result = await ApiClient.generatePrompt(params);
        UIRenderer.renderOutput(result);
    } catch (err) {
        UIRenderer.showError(err.message);
    } finally {
        document.getElementById('generate-btn').disabled = false;
    }
}
