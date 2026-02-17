let slowHintTimer = null;

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
    setupShareIdeaButton();
    setupOpenInButtons();
    setupOsTabs();

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

    // Speed tip modal
    document.getElementById('slow-hint-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('speed-modal').classList.remove('hidden');
    });
    document.getElementById('btn-close-speed').addEventListener('click', () => {
        document.getElementById('speed-modal').classList.add('hidden');
    });
    document.getElementById('speed-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            document.getElementById('speed-modal').classList.add('hidden');
        }
    });

    // Ollama instructions modal
    document.getElementById('btn-ollama-help').addEventListener('click', () => {
        document.getElementById('ollama-modal').classList.remove('hidden');
    });
    document.getElementById('btn-close-ollama').addEventListener('click', () => {
        document.getElementById('ollama-modal').classList.add('hidden');
    });
    document.getElementById('ollama-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            document.getElementById('ollama-modal').classList.add('hidden');
        }
    });

    // Puter fallback modal
    document.getElementById('btn-close-fallback').addEventListener('click', () => {
        document.getElementById('puter-fallback-modal').classList.add('hidden');
    });
    document.getElementById('puter-fallback-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            document.getElementById('puter-fallback-modal').classList.add('hidden');
        }
    });
    document.getElementById('btn-switch-ollama').addEventListener('click', () => {
        document.getElementById('puter-fallback-modal').classList.add('hidden');
        document.getElementById('api-mode').value = 'ollama';
        updateApiModeUI();
        document.getElementById('settings-panel').classList.remove('hidden');
        document.getElementById('settings-toggle').textContent = '\u25BC API Settings';
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

    // URL routing — prefill and auto-generate from query params
    handleUrlRouting();
});

// --- URL Routing ---

function handleUrlRouting() {
    const params = new URLSearchParams(window.location.search);

    // Support ?prompt=... or the bare ?=... format
    let prompt = params.get('prompt');
    if (!prompt) {
        // Check for bare ?=value format (key is empty string)
        const raw = window.location.search;
        if (raw.startsWith('?=')) {
            prompt = decodeURIComponent(raw.substring(2).split('&')[0]);
        }
    }

    if (!prompt) return;

    // Prefill the idea input
    const ideaInput = document.getElementById('idea-input');
    ideaInput.value = prompt;
    // Update char counter
    const charCount = document.getElementById('char-count');
    charCount.textContent = prompt.length.toLocaleString();

    // Check for auto-enter
    const autoEnter = params.get('enter');
    const rawSearch = window.location.search;
    const hasEnter = autoEnter !== null || rawSearch.includes('&enter') || rawSearch.includes('?enter');

    if (hasEnter) {
        // Small delay to let Puter SDK initialize
        setTimeout(() => handleGenerate(), 500);
    }
}

// --- Share Buttons ---

function setupShareIdeaButton() {
    const shareModal = document.getElementById('share-modal');

    // Open modal
    document.getElementById('btn-share-idea').addEventListener('click', () => {
        const idea = document.getElementById('idea-input').value.trim();
        if (!idea) {
            UIRenderer.showError('Enter an idea first, then share it.');
            return;
        }
        document.getElementById('share-status').classList.add('hidden');
        shareModal.classList.remove('hidden');
    });

    // Close modal
    document.getElementById('btn-close-share').addEventListener('click', () => {
        shareModal.classList.add('hidden');
    });
    shareModal.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            shareModal.classList.add('hidden');
        }
    });

    function buildShareUrl(includeEnter) {
        const idea = document.getElementById('idea-input').value.trim();
        const base = window.location.origin + window.location.pathname;
        let link = base + '?prompt=' + encodeURIComponent(idea);
        if (includeEnter) link += '&enter';
        return link;
    }

    function showShareStatus(text) {
        const status = document.getElementById('share-status');
        status.textContent = text;
        status.classList.remove('hidden');
        setTimeout(() => { status.classList.add('hidden'); }, 2000);
    }

    // Copy link (no auto-generate)
    document.getElementById('share-url').addEventListener('click', () => {
        navigator.clipboard.writeText(buildShareUrl(false)).then(() => {
            showShareStatus('Link copied!');
        });
    });

    // Copy link with &enter
    document.getElementById('share-url-enter').addEventListener('click', () => {
        navigator.clipboard.writeText(buildShareUrl(true)).then(() => {
            showShareStatus('Link copied with auto-generate!');
        });
    });

    // Share via Email (on generated output)
    document.getElementById('btn-share-email').addEventListener('click', () => {
        const plainEl = document.getElementById('plain-content');
        const text = plainEl.dataset.rawText || plainEl.textContent;
        const pageUrl = window.location.origin + window.location.pathname;
        const url = 'mailto:?subject=' + encodeURIComponent('Prompt from Quality Prompts')
            + '&body=' + encodeURIComponent(text + '\n\n---\nGenerated with Quality Prompts: ' + pageUrl);
        window.open(url, '_blank', 'noopener,noreferrer');
    });
}

function setupOpenInButtons() {
    document.querySelectorAll('.btn-open-in').forEach(btn => {
        btn.addEventListener('click', () => {
            const service = btn.dataset.service;
            const plainEl = document.getElementById('plain-content');
            const prompt = plainEl.dataset.rawText || plainEl.textContent;

            const services = {
                chatgpt: {
                    url: 'https://chatgpt.com/?q=' + encodeURIComponent(prompt),
                    direct: true
                },
                claude: {
                    url: 'https://claude.ai/new',
                    label: 'Claude',
                    direct: false
                },
                copilot: {
                    url: 'https://copilot.microsoft.com/',
                    label: 'Copilot',
                    direct: false
                },
                gemini: {
                    url: 'https://gemini.google.com/app',
                    label: 'Gemini',
                    direct: false
                }
            };

            const config = services[service];
            if (!config) return;

            if (config.direct) {
                window.open(config.url, '_blank', 'noopener,noreferrer');
            } else {
                // Copy prompt to clipboard, show modal, wait for user to confirm
                navigator.clipboard.writeText(prompt).then(() => {
                    showClipboardModal(
                        'Prompt copied to clipboard. When ' + config.label + ' opens, just paste it into the message box.',
                        config.label,
                        () => {
                            window.open(config.url, '_blank', 'noopener,noreferrer');
                        }
                    );
                });
            }
        });
    });
}

function showClipboardModal(message, label, onConfirm) {
    const modal = document.getElementById('clipboard-modal');
    const confirmBtn = document.getElementById('clipboard-modal-confirm');
    const cancelBtn = document.getElementById('clipboard-modal-cancel');
    const closeBtn = document.getElementById('clipboard-modal-close');

    document.getElementById('clipboard-modal-text').textContent = message;
    modal.classList.remove('hidden');

    // Set button text to "Open Claude" etc.
    confirmBtn.textContent = 'Open ' + label;

    function dismiss() {
        modal.classList.add('hidden');
    }

    // Replace listeners to avoid stacking
    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    newConfirm.addEventListener('click', () => {
        dismiss();
        if (onConfirm) onConfirm();
    });

    const newCancel = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    newCancel.addEventListener('click', dismiss);

    const newClose = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newClose, closeBtn);
    newClose.addEventListener('click', dismiss);

    // Click outside to dismiss
    modal.onclick = (e) => {
        if (e.target === modal) dismiss();
    };
}

// --- Provider Configuration ---

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
    const ollamaSettings = document.getElementById('ollama-settings');
    const keyedSettings = document.getElementById('keyed-settings');

    puterSettings.classList.add('hidden');
    ollamaSettings.classList.add('hidden');
    keyedSettings.classList.add('hidden');

    if (mode === 'puter') {
        puterSettings.classList.remove('hidden');
    } else if (mode === 'ollama') {
        ollamaSettings.classList.remove('hidden');
    } else {
        keyedSettings.classList.remove('hidden');

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
    const savedOllamaUrl = localStorage.getItem('qp_ollama_url');
    const savedOllamaModel = localStorage.getItem('qp_ollama_model');
    if (savedOllamaUrl) {
        document.getElementById('ollama-url').value = savedOllamaUrl;
    }
    if (savedOllamaModel) {
        document.getElementById('ollama-model').value = savedOllamaModel;
    }
}

function saveSettings() {
    if (document.getElementById('save-key').checked) {
        const apiMode = document.getElementById('api-mode').value;
        localStorage.setItem('qp_api_mode', apiMode);
        localStorage.setItem('qp_puter_model', document.getElementById('puter-model').value);

        if (apiMode === 'ollama') {
            localStorage.setItem('qp_ollama_url', document.getElementById('ollama-url').value);
            localStorage.setItem('qp_ollama_model', document.getElementById('ollama-model').value);
        } else if (apiMode !== 'puter') {
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

function setupOsTabs() {
    document.querySelectorAll('.os-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const os = btn.dataset.os;
            const container = btn.closest('.modal-body') || btn.closest('.modal');

            // Deactivate all tabs and panels in this container
            container.querySelectorAll('.os-tab-btn').forEach(t => t.classList.remove('active'));
            container.querySelectorAll('.os-panel').forEach(p => p.classList.remove('active'));

            // Activate selected
            btn.classList.add('active');
            container.querySelector(`.os-panel[data-os="${os}"]`).classList.add('active');
        });
    });
}

function updateLoadingStatus(text, status) {
    const textEl = document.getElementById('loading-text');
    const statusEl = document.getElementById('loading-status');
    if (text) textEl.textContent = text;
    if (status) statusEl.textContent = status;
}

function showPuterFallback(reason) {
    document.getElementById('puter-fallback-reason').textContent = reason;
    document.getElementById('puter-fallback-modal').classList.remove('hidden');
}

async function handleGenerate() {
    const apiMode = document.getElementById('api-mode').value;
    const subjectType = document.getElementById('subject-type').value;
    const subType = document.getElementById('sub-type').value || null;
    const idea = document.getElementById('idea-input').value.trim();
    const modelType = document.getElementById('model-type').value;

    // Validate
    UIRenderer.hideError();

    if (apiMode !== 'puter' && apiMode !== 'ollama') {
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

    // Build params
    const params = {
        systemMessage: null,
        userMessage: null,
        apiMode
    };

    if (apiMode === 'puter') {
        params.puterModel = document.getElementById('puter-model').value;
    } else if (apiMode === 'ollama') {
        params.ollamaUrl = document.getElementById('ollama-url').value.trim() || undefined;
        params.ollamaModel = document.getElementById('ollama-model').value.trim() || undefined;
    } else {
        params.apiKey = document.getElementById('api-key').value.trim();
        params.model = document.getElementById('model-name').value.trim() || undefined;
        if (apiMode === 'custom') {
            params.baseUrl = document.getElementById('base-url').value.trim() || undefined;
        }
    }

    // Show loading, hide share idea row
    UIRenderer.showLoading();
    document.getElementById('generate-btn').disabled = true;
    document.getElementById('share-idea-row').classList.add('hidden');

    // Preflight check for local/custom endpoints
    if (apiMode === 'ollama' || apiMode === 'custom') {
        updateLoadingStatus('Checking connection...', 'Verifying ' + (apiMode === 'ollama' ? 'Ollama' : 'endpoint') + ' is reachable');

        const check = await ApiClient.preflightCheck(params);
        if (!check.ok) {
            UIRenderer.showError(check.error);
            document.getElementById('generate-btn').disabled = false;
            document.getElementById('share-idea-row').classList.remove('hidden');
            return;
        }

        // If they have gpt-oss installed but aren't using it, suggest it
        if (check.gptOssSuggestion && apiMode === 'ollama') {
            updateLoadingStatus('Connected to Ollama', 'Tip: You have ' + check.gptOssSuggestion + ' installed — consider using it for best results');
            await new Promise(r => setTimeout(r, 1500));
        } else {
            updateLoadingStatus('Connected', 'Model verified — building prompt');
            await new Promise(r => setTimeout(r, 500));
        }
    }

    // Build meta-prompt
    updateLoadingStatus('Sending request...', 'Building optimized prompt for ' + (apiMode === 'puter' ? 'Puter' : apiMode === 'ollama' ? 'Ollama' : apiMode));
    const { system, user } = PromptEngine.buildMetaPrompt(subjectType, idea, modelType, subType);
    params.systemMessage = system;
    params.userMessage = user;

    // Start slow-hint timer (show after 10 seconds if still loading)
    document.getElementById('slow-hint').classList.add('hidden');
    clearTimeout(slowHintTimer);
    slowHintTimer = setTimeout(() => {
        const loadingSection = document.getElementById('loading-section');
        if (!loadingSection.classList.contains('hidden')) {
            document.getElementById('slow-hint').classList.remove('hidden');
        }
    }, 10000);

    // Short delay then update status
    setTimeout(() => {
        const loadingSection = document.getElementById('loading-section');
        if (!loadingSection.classList.contains('hidden')) {
            updateLoadingStatus('Generating your prompt...', 'Waiting for model response');
        }
    }, 1500);

    try {
        const result = await ApiClient.generatePrompt(params);
        UIRenderer.renderOutput(result);
    } catch (err) {
        if (err.puterFallback) {
            showPuterFallback(err.message);
        }
        UIRenderer.showError(err.message);
    } finally {
        clearTimeout(slowHintTimer);
        document.getElementById('slow-hint').classList.add('hidden');
        document.getElementById('generate-btn').disabled = false;
        document.getElementById('share-idea-row').classList.remove('hidden');
        // Reset loading text for next time
        updateLoadingStatus('Generating your prompt...', 'Analyzing subject type, optimizing for target model');
    }
}
