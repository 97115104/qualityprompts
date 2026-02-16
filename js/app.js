document.addEventListener('DOMContentLoaded', () => {
    // Detect file:// protocol — Puter SDK needs a web server
    if (window.location.protocol === 'file:') {
        document.getElementById('file-protocol-warning').classList.remove('hidden');
    }

    // Populate dropdowns
    populateSubjectTypes();
    populateModelTypes();

    // Restore saved settings
    restoreSettings();

    // Setup UI interactions
    UIRenderer.setupTabs();
    UIRenderer.setupCopyButtons();
    UIRenderer.setupDownloadButtons();

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

    // Generate button
    document.getElementById('generate-btn').addEventListener('click', handleGenerate);

    // Allow Ctrl/Cmd+Enter to generate
    document.getElementById('idea-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleGenerate();
        }
    });
});

function updateApiModeUI() {
    const mode = document.getElementById('api-mode').value;
    const puterSettings = document.getElementById('puter-settings');
    const openaiSettings = document.getElementById('openai-settings');

    if (mode === 'puter') {
        puterSettings.classList.remove('hidden');
        openaiSettings.classList.add('hidden');
    } else {
        puterSettings.classList.add('hidden');
        openaiSettings.classList.remove('hidden');
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
    if (savedMode) {
        document.getElementById('api-mode').value = savedMode;
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
    const { system, user } = PromptEngine.buildMetaPrompt(subjectType, idea, modelType);

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
            params.baseUrl = document.getElementById('base-url').value.trim() || undefined;
            params.model = document.getElementById('model-name').value.trim() || undefined;
        }

        const result = await ApiClient.generatePrompt(params);
        UIRenderer.renderOutput(result);
    } catch (err) {
        UIRenderer.showError(err.message);
    } finally {
        document.getElementById('generate-btn').disabled = false;
    }
}
