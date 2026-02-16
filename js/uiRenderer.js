const UIRenderer = (() => {
    function showLoading() {
        document.getElementById('loading-section').classList.remove('hidden');
        document.getElementById('output-section').classList.add('hidden');
        document.getElementById('error-section').classList.add('hidden');
    }

    function hideLoading() {
        document.getElementById('loading-section').classList.add('hidden');
    }

    function showError(message) {
        hideLoading();
        const el = document.getElementById('error-section');
        el.textContent = message;
        el.classList.remove('hidden');
    }

    function hideError() {
        document.getElementById('error-section').classList.add('hidden');
    }

    function renderOutput(result) {
        hideLoading();
        hideError();

        const section = document.getElementById('output-section');
        section.classList.remove('hidden');

        // Plain prompt
        document.getElementById('plain-content').textContent = result.prompt_plain;

        // Structured prompt
        document.getElementById('structured-content').textContent = result.prompt_structured;

        // JSON prompt
        const jsonStr = typeof result.prompt_json === 'string'
            ? result.prompt_json
            : JSON.stringify(result.prompt_json, null, 2);
        document.getElementById('json-content').textContent = jsonStr;

        // Optimization notes
        const notesEl = document.getElementById('optimization-notes');
        if (result.optimization_notes) {
            notesEl.classList.remove('hidden');
            notesEl.querySelector('span').textContent = result.optimization_notes;
        } else {
            notesEl.classList.add('hidden');
        }

        // Token estimate
        const tokenEl = document.getElementById('token-estimate');
        if (result.token_estimate) {
            tokenEl.classList.remove('hidden');
            tokenEl.textContent = `~${result.token_estimate} tokens`;
        } else {
            tokenEl.classList.add('hidden');
        }

        // Activate first tab
        activateTab('plain');
    }

    function setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activateTab(btn.dataset.tab);
            });
        });
    }

    function activateTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.tab === tabName);
        });
    }

    function setupCopyButtons() {
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const el = document.getElementById(target);
                copyToClipboard(el.textContent, btn);
            });
        });
    }

    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove('copied');
            }, 1500);
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove('copied');
            }, 1500);
        });
    }

    function setupDownloadButtons() {
        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const format = btn.dataset.format;
                const el = document.getElementById(target);
                const content = el.textContent;
                const ext = format === 'json' ? 'json' : 'txt';
                downloadFile(content, `quality-prompt.${ext}`);
            });
        });
    }

    function downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return {
        showLoading,
        hideLoading,
        showError,
        hideError,
        renderOutput,
        setupTabs,
        setupCopyButtons,
        setupDownloadButtons
    };
})();
