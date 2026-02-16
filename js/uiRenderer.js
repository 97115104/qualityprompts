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

        // Plain text — render as readable paragraphs (HTML)
        const plainText = stripMarkdown(result.prompt_plain);
        document.getElementById('plain-content').innerHTML = textToParagraphs(plainText);
        // Store raw text for copy/download
        document.getElementById('plain-content').dataset.rawText = plainText;

        // Structured prompt (markdown preserved)
        document.getElementById('structured-content').textContent = result.prompt_structured;

        // JSON prompt — syntax highlighted
        const jsonObj = typeof result.prompt_json === 'string'
            ? JSON.parse(result.prompt_json)
            : result.prompt_json;
        const jsonStr = JSON.stringify(jsonObj, null, 2);
        document.getElementById('json-content').innerHTML = highlightJson(jsonStr);
        document.getElementById('json-content').dataset.rawText = jsonStr;

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

    // Convert plain text into HTML paragraphs for readable display
    function textToParagraphs(text) {
        if (!text) return '';
        // Split on double newlines into paragraph blocks
        const blocks = text.split(/\n{2,}/);
        return blocks.map(block => {
            const trimmed = block.trim();
            if (!trimmed) return '';
            // Check if block is a numbered/bulleted list
            const lines = trimmed.split('\n');
            const isList = lines.every(l => /^\s*(\d+[.)]\s|-\s)/.test(l));
            if (isList) {
                const isOrdered = lines.every(l => /^\s*\d+[.)]\s/.test(l));
                const tag = isOrdered ? 'ol' : 'ul';
                const items = lines.map(l => {
                    const content = l.replace(/^\s*(\d+[.)]\s|-\s)/, '');
                    return `<li>${escapeHtml(content)}</li>`;
                }).join('');
                return `<${tag}>${items}</${tag}>`;
            }
            // Regular paragraph — preserve single line breaks as <br>
            const html = lines.map(l => escapeHtml(l)).join('<br>');
            return `<p>${html}</p>`;
        }).join('');
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Syntax highlight JSON string
    function highlightJson(json) {
        const escaped = escapeHtml(json);
        return escaped
            // Keys — strings followed by a colon
            .replace(/"([^"\\]*(\\.[^"\\]*)*)"(\s*:)/g,
                '<span class="json-key">"$1"</span>$3')
            // Remaining strings (values)
            .replace(/"([^"\\]*(\\.[^"\\]*)*)"/g,
                '<span class="json-string">"$1"</span>')
            // Numbers
            .replace(/\b(-?\d+\.?\d*)\b/g,
                '<span class="json-number">$1</span>')
            // Booleans and null
            .replace(/\b(true|false|null)\b/g,
                '<span class="json-keyword">$1</span>');
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
                // Use raw text if stored, otherwise fall back to textContent
                const text = el.dataset.rawText || el.textContent;
                copyToClipboard(text, btn);
            });
        });
    }

    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            flashButton(btn);
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            flashButton(btn);
        });
    }

    function flashButton(btn) {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('copied');
        }, 1500);
    }

    function setupDownloadButtons() {
        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const format = btn.dataset.format;
                const el = document.getElementById(target);
                const content = el.dataset.rawText || el.textContent;
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

    function stripMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, '').replace(/```/g, ''))
            .replace(/^#{1,6}\s+/gm, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/__(.+?)__/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/_(.+?)_/g, '$1')
            .replace(/^\s*[-*+]\s+/gm, '- ')
            .replace(/`(.+?)`/g, '$1')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
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
