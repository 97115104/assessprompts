let slowHintTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    // Detect file:// protocol — Puter SDK needs a web server
    if (window.location.protocol === 'file:') {
        document.getElementById('file-protocol-warning').classList.remove('hidden');
    }

    // Restore saved settings
    restoreSettings();

    // Setup UI interactions
    UIRenderer.setupTabs();
    UIRenderer.setupCopyButtons();
    UIRenderer.setupDownloadButtons();
    setupSharePromptButton();
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

    // API mode toggle
    document.getElementById('api-mode').addEventListener('change', updateApiModeUI);
    updateApiModeUI();

    // Save checkbox
    document.getElementById('save-key').addEventListener('change', (e) => {
        if (!e.target.checked) {
            localStorage.removeItem('ap_api_key');
            localStorage.removeItem('ap_base_url');
            localStorage.removeItem('ap_model');
            localStorage.removeItem('ap_api_mode');
            localStorage.removeItem('ap_puter_model');
        }
    });

    // Character counter for prompt input
    const promptInput = document.getElementById('prompt-input');
    const charCount = document.getElementById('char-count');
    promptInput.addEventListener('input', () => {
        charCount.textContent = promptInput.value.length.toLocaleString();
    });

    // Assess button
    document.getElementById('assess-btn').addEventListener('click', handleAssess);

    // Ctrl/Cmd+Enter to assess
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleAssess();
        }
    });

    // URL routing
    handleUrlRouting();
});

// --- URL Routing ---

function handleUrlRouting() {
    const params = new URLSearchParams(window.location.search);

    let prompt = params.get('prompt');
    if (!prompt) {
        const raw = window.location.search;
        if (raw.startsWith('?=')) {
            prompt = decodeURIComponent(raw.substring(2).split('&')[0]);
        }
    }

    if (!prompt) return;

    const promptInput = document.getElementById('prompt-input');
    promptInput.value = prompt;
    document.getElementById('char-count').textContent = prompt.length.toLocaleString();

    const autoEnter = params.get('enter');
    const rawSearch = window.location.search;
    const hasEnter = autoEnter !== null || rawSearch.includes('&enter') || rawSearch.includes('?enter');

    if (hasEnter) {
        setTimeout(() => handleAssess(), 500);
    }
}

// --- Share Buttons ---

function setupSharePromptButton() {
    const shareModal = document.getElementById('share-modal');

    document.getElementById('btn-share-prompt').addEventListener('click', () => {
        const prompt = document.getElementById('prompt-input').value.trim();
        if (!prompt) {
            UIRenderer.showError('Enter a prompt first, then share it.');
            return;
        }
        document.getElementById('share-status').classList.add('hidden');
        shareModal.classList.remove('hidden');
    });

    document.getElementById('btn-close-share').addEventListener('click', () => {
        shareModal.classList.add('hidden');
    });
    shareModal.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            shareModal.classList.add('hidden');
        }
    });

    function buildShareUrl(includeEnter) {
        const prompt = document.getElementById('prompt-input').value.trim();
        const base = window.location.origin + window.location.pathname;
        let link = base + '?prompt=' + encodeURIComponent(prompt);
        if (includeEnter) link += '&enter';
        return link;
    }

    function showShareStatus(text) {
        const status = document.getElementById('share-status');
        status.textContent = text;
        status.classList.remove('hidden');
        setTimeout(() => { status.classList.add('hidden'); }, 2000);
    }

    document.getElementById('share-url').addEventListener('click', () => {
        navigator.clipboard.writeText(buildShareUrl(false)).then(() => {
            showShareStatus('Link copied!');
        });
    });

    document.getElementById('share-url-enter').addEventListener('click', () => {
        navigator.clipboard.writeText(buildShareUrl(true)).then(() => {
            showShareStatus('Link copied with auto-assess!');
        });
    });
}

function setupOpenInButtons() {
    document.querySelectorAll('.btn-open-in').forEach(btn => {
        btn.addEventListener('click', () => {
            const service = btn.dataset.service;
            const optimizedEl = document.getElementById('optimized-content');
            const prompt = optimizedEl.dataset.rawText || optimizedEl.textContent;

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
                navigator.clipboard.writeText(prompt).then(() => {
                    showClipboardModal(
                        'Optimized prompt copied to clipboard. When ' + config.label + ' opens, paste it into the message box.',
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

    confirmBtn.textContent = 'Open ' + label;

    function dismiss() {
        modal.classList.add('hidden');
    }

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

    modal.onclick = (e) => {
        if (e.target === modal) dismiss();
    };
}

// --- Provider Configuration ---

const PROVIDER_CONFIG = {
    puter: {},
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
        hint: 'Any OpenAI-compatible endpoint (Together, LM Studio, etc.). Uses Bearer token auth and /chat/completions format.',
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

function restoreSettings() {
    const savedKey = localStorage.getItem('ap_api_key');
    const savedUrl = localStorage.getItem('ap_base_url');
    const savedModel = localStorage.getItem('ap_model');
    const savedMode = localStorage.getItem('ap_api_mode');
    const savedPuterModel = localStorage.getItem('ap_puter_model');

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
    const savedOllamaUrl = localStorage.getItem('ap_ollama_url');
    const savedOllamaModel = localStorage.getItem('ap_ollama_model');
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
        localStorage.setItem('ap_api_mode', apiMode);
        localStorage.setItem('ap_puter_model', document.getElementById('puter-model').value);

        if (apiMode === 'ollama') {
            localStorage.setItem('ap_ollama_url', document.getElementById('ollama-url').value);
            localStorage.setItem('ap_ollama_model', document.getElementById('ollama-model').value);
        } else if (apiMode !== 'puter') {
            localStorage.setItem('ap_api_key', document.getElementById('api-key').value);
            const baseUrl = document.getElementById('base-url').value;
            const modelName = document.getElementById('model-name').value;
            if (baseUrl) localStorage.setItem('ap_base_url', baseUrl);
            else localStorage.removeItem('ap_base_url');
            if (modelName) localStorage.setItem('ap_model', modelName);
            else localStorage.removeItem('ap_model');
        }
    }
}

function setupOsTabs() {
    document.querySelectorAll('.os-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const os = btn.dataset.os;
            const container = btn.closest('.modal-body') || btn.closest('.modal');

            container.querySelectorAll('.os-tab-btn').forEach(t => t.classList.remove('active'));
            container.querySelectorAll('.os-panel').forEach(p => p.classList.remove('active'));

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

async function handleAssess() {
    const apiMode = document.getElementById('api-mode').value;
    const prompt = document.getElementById('prompt-input').value.trim();
    const context = document.getElementById('context-input').value.trim();

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

    if (!prompt) {
        UIRenderer.showError('Please enter a prompt to assess.');
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

    // Show loading
    UIRenderer.showLoading();
    document.getElementById('assess-btn').disabled = true;
    document.getElementById('share-prompt-row').classList.add('hidden');

    // Preflight check for local/custom endpoints
    if (apiMode === 'ollama' || apiMode === 'custom') {
        updateLoadingStatus('Checking connection...', 'Verifying ' + (apiMode === 'ollama' ? 'Ollama' : 'endpoint') + ' is reachable');

        const check = await ApiClient.preflightCheck(params);
        if (!check.ok) {
            UIRenderer.showError(check.error);
            document.getElementById('assess-btn').disabled = false;
            document.getElementById('share-prompt-row').classList.remove('hidden');
            return;
        }

        if (check.gptOssSuggestion && apiMode === 'ollama') {
            updateLoadingStatus('Connected to Ollama', 'Tip: You have ' + check.gptOssSuggestion + ' installed — consider using it for best results');
            await new Promise(r => setTimeout(r, 1500));
        } else {
            updateLoadingStatus('Connected', 'Model verified — building assessment request');
            await new Promise(r => setTimeout(r, 500));
        }
    }

    // Build assessment prompt
    updateLoadingStatus('Analyzing your prompt...', 'Building assessment for ' + (apiMode === 'puter' ? 'Puter' : apiMode === 'ollama' ? 'Ollama' : apiMode));
    const { system, user } = AssessEngine.buildAssessmentPrompt(prompt, context);
    params.systemMessage = system;
    params.userMessage = user;

    // Start slow-hint timer
    document.getElementById('slow-hint').classList.add('hidden');
    clearTimeout(slowHintTimer);
    slowHintTimer = setTimeout(() => {
        const loadingSection = document.getElementById('loading-section');
        if (!loadingSection.classList.contains('hidden')) {
            document.getElementById('slow-hint').classList.remove('hidden');
        }
    }, 10000);

    // Update status after short delay
    setTimeout(() => {
        const loadingSection = document.getElementById('loading-section');
        if (!loadingSection.classList.contains('hidden')) {
            updateLoadingStatus('Assessing your prompt...', 'Evaluating clarity, completeness, and cost efficiency');
        }
    }, 1000);

    setTimeout(() => {
        const loadingSection = document.getElementById('loading-section');
        if (!loadingSection.classList.contains('hidden')) {
            updateLoadingStatus('Calculating costs...', 'Estimating token costs across frontier models');
        }
    }, 4000);

    try {
        const result = await ApiClient.assess(params);
        UIRenderer.renderOutput(result);
    } catch (err) {
        if (err.puterFallback) {
            showPuterFallback(err.message);
        }
        UIRenderer.showError(err.message);
    } finally {
        clearTimeout(slowHintTimer);
        document.getElementById('slow-hint').classList.add('hidden');
        document.getElementById('assess-btn').disabled = false;
        document.getElementById('share-prompt-row').classList.remove('hidden');
        updateLoadingStatus('Analyzing your prompt...', 'Evaluating clarity, completeness, and cost efficiency');
    }
}
