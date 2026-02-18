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
        el.innerHTML = '';
        message.split('\n').forEach((line, i) => {
            if (i > 0) el.appendChild(document.createElement('br'));
            el.appendChild(document.createTextNode(line));
        });
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

        renderAssessmentTab(result);
        renderSuggestionsTab(result);
        renderCostTab(result);
        renderJsonTab(result);

        activateTab('assessment');
    }

    // --- Assessment Tab ---

    function renderAssessmentTab(result) {
        // Score badge
        const badge = document.getElementById('score-badge');
        const score = typeof result.score === 'number' ? result.score : 0;
        const grade = result.grade || '?';

        document.getElementById('score-value').textContent = score;
        document.getElementById('score-grade').textContent = grade;

        badge.className = 'score-badge';
        const gradeLetter = grade.charAt(0).toUpperCase();
        if (gradeLetter === 'A') badge.classList.add('grade-a');
        else if (gradeLetter === 'B') badge.classList.add('grade-b');
        else if (gradeLetter === 'C') badge.classList.add('grade-c');
        else if (gradeLetter === 'D') badge.classList.add('grade-d');
        else badge.classList.add('grade-f');

        // Summary
        document.getElementById('assessment-summary').textContent = result.assessment_summary || '';

        // Strengths
        renderItemList('strengths-list', result.strengths || [], 'strength-icon', '✓');

        // Issues
        renderItemList('issues-list', result.issues || [], 'issue-icon', '✗');

        // Missing elements
        renderItemList('missing-list', result.missing_elements || [], 'missing-icon', '△');

        // Store raw text for copying
        const rawText = buildAssessmentText(result);
        document.getElementById('assessment-raw').value = rawText;
    }

    function renderItemList(containerId, items, iconClass, iconChar) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (!items || items.length === 0) {
            const empty = document.createElement('p');
            empty.style.cssText = 'color:#999;font-size:13px;padding:8px 0;';
            empty.textContent = 'None identified.';
            container.appendChild(empty);
            return;
        }

        items.forEach(text => {
            const item = document.createElement('div');
            item.className = 'assessment-item';

            const icon = document.createElement('span');
            icon.className = `item-icon ${iconClass}`;
            icon.textContent = iconChar;

            const content = document.createElement('span');
            content.textContent = text;

            item.appendChild(icon);
            item.appendChild(content);
            container.appendChild(item);
        });
    }

    function buildAssessmentText(result) {
        const lines = [];
        lines.push(`ASSESSMENT RESULTS`);
        lines.push(`Score: ${result.score}/100 (${result.grade})`);
        lines.push('');
        lines.push(result.assessment_summary || '');
        lines.push('');

        if (result.strengths && result.strengths.length > 0) {
            lines.push('STRENGTHS');
            result.strengths.forEach(s => lines.push(`✓ ${s}`));
            lines.push('');
        }

        if (result.issues && result.issues.length > 0) {
            lines.push('ISSUES');
            result.issues.forEach(i => lines.push(`✗ ${i}`));
            lines.push('');
        }

        if (result.missing_elements && result.missing_elements.length > 0) {
            lines.push('MISSING ELEMENTS');
            result.missing_elements.forEach(m => lines.push(`△ ${m}`));
            lines.push('');
        }

        return lines.join('\n');
    }

    // --- Suggestions Tab ---

    function renderSuggestionsTab(result) {
        // Suggestions list
        const suggContainer = document.getElementById('suggestions-list');
        suggContainer.innerHTML = '';

        const suggestions = result.suggestions || [];
        if (suggestions.length === 0) {
            const empty = document.createElement('p');
            empty.style.cssText = 'color:#999;font-size:13px;';
            empty.textContent = 'No suggestions returned.';
            suggContainer.appendChild(empty);
        } else {
            suggestions.forEach((sugg, idx) => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';

                const title = document.createElement('div');
                title.className = 'suggestion-title';
                title.textContent = `${idx + 1}. ${sugg.title || 'Suggestion'}`;

                const detail = document.createElement('div');
                detail.className = 'suggestion-detail';
                detail.textContent = sugg.detail || '';

                item.appendChild(title);
                item.appendChild(detail);
                suggContainer.appendChild(item);
            });
        }

        // Optimized version — strip any markdown the model may have included, render as clean paragraphs
        const optimizedRaw = result.optimized_version || '';
        const optimizedText = stripMarkdown(optimizedRaw);
        const optimizedEl = document.getElementById('optimized-content');
        optimizedEl.innerHTML = textToParagraphs(optimizedText);
        optimizedEl.dataset.rawText = optimizedText;

        // Optimization notes
        const notesEl = document.getElementById('optimization-notes');
        if (result.optimization_notes) {
            notesEl.classList.remove('hidden');
            notesEl.querySelector('span').textContent = result.optimization_notes;
        } else {
            notesEl.classList.add('hidden');
        }
    }

    // --- Cost Estimate Tab ---

    function renderCostTab(result) {
        const tokenCount = result.token_count || 0;
        const outputTokens = result.estimated_output_tokens || 0;

        // Token summary badges
        const summaryEl = document.getElementById('token-summary');
        summaryEl.innerHTML = '';
        summaryEl.appendChild(makeBadge(`~${tokenCount.toLocaleString()} input tokens`));
        summaryEl.appendChild(makeBadge(`~${outputTokens.toLocaleString()} est. output tokens`));

        // Cost table
        const tbody = document.getElementById('cost-table-body');
        tbody.innerHTML = '';

        const models = result.cost_estimates?.models || [];
        let lastProvider = '';

        models.forEach(m => {
            if (m.provider !== lastProvider) {
                lastProvider = m.provider;
                const groupRow = document.createElement('tr');
                groupRow.className = 'cost-table-group-header';
                const groupCell = document.createElement('td');
                groupCell.colSpan = 5;
                groupCell.textContent = m.provider;
                groupRow.appendChild(groupCell);
                tbody.appendChild(groupRow);
            }

            const row = document.createElement('tr');

            const providerCell = document.createElement('td');
            providerCell.className = 'cost-provider';
            providerCell.textContent = '';
            row.appendChild(providerCell);

            const modelCell = document.createElement('td');
            modelCell.className = 'cost-model';
            modelCell.textContent = m.model_name || '';
            row.appendChild(modelCell);

            const perRunCell = document.createElement('td');
            perRunCell.className = 'cost-value';
            perRunCell.textContent = formatCost(m.cost_per_run_usd || 0);
            row.appendChild(perRunCell);

            const per100Cell = document.createElement('td');
            per100Cell.className = 'cost-value';
            per100Cell.textContent = formatCost(m.cost_per_100_runs_usd || 0);
            row.appendChild(per100Cell);

            const per1000Cell = document.createElement('td');
            per1000Cell.className = 'cost-value';
            per1000Cell.textContent = formatCost(m.cost_per_1000_runs_usd || 0);
            row.appendChild(per1000Cell);

            tbody.appendChild(row);
        });

        // Self-hosted note
        const noteEl = document.getElementById('self-hosted-note');
        const note = result.cost_estimates?.self_hosted_note;
        if (note) {
            noteEl.classList.remove('hidden');
            noteEl.textContent = note;
        } else {
            noteEl.classList.add('hidden');
        }
    }

    function makeBadge(text) {
        const span = document.createElement('span');
        span.className = 'token-badge';
        span.textContent = text;
        return span;
    }

    function formatCost(usd) {
        if (usd === 0) return '$0.00';
        if (usd < 0.0001) return '< $0.0001';
        if (usd < 0.01) return '$' + usd.toFixed(5).replace(/0+$/, '').replace(/\.$/, '0');
        if (usd < 1) return '$' + usd.toFixed(4).replace(/0+$/, '').replace(/\.$/, '0');
        return '$' + usd.toFixed(2);
    }

    // --- JSON Tab ---

    function renderJsonTab(result) {
        const jsonStr = JSON.stringify(result, null, 2);
        document.getElementById('json-content').innerHTML = highlightJson(escapeHtml(jsonStr));
        document.getElementById('json-content').dataset.rawText = jsonStr;
    }

    // --- Tabs ---

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

    // --- Copy buttons ---

    function setupCopyButtons() {
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const el = document.getElementById(target);
                const text = el.dataset.rawText || el.value || el.textContent;
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

    // --- Download buttons ---

    function setupDownloadButtons() {
        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const format = btn.dataset.format;
                const el = document.getElementById(target);
                const content = el.dataset.rawText || el.textContent;
                const ext = format === 'json' ? 'json' : 'txt';
                downloadFile(content, `assessment.${ext}`);
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

    // --- Helpers ---

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

    function textToParagraphs(text) {
        if (!text) return '';
        const blocks = text.split(/\n{2,}/);
        return blocks.map(block => {
            const trimmed = block.trim();
            if (!trimmed) return '';
            const lines = trimmed.split('\n');
            const isList = lines.every(l => /^\s*(\d+[.)]\s|-\s|\*\s)/.test(l));
            if (isList) {
                const isOrdered = lines.every(l => /^\s*\d+[.)]\s/.test(l));
                const tag = isOrdered ? 'ol' : 'ul';
                const items = lines.map(l => {
                    const content = l.replace(/^\s*(\d+[.)]\s|-\s|\*\s)/, '');
                    return `<li>${escapeHtml(content)}</li>`;
                }).join('');
                return `<${tag}>${items}</${tag}>`;
            }
            const html = lines.map(l => escapeHtml(l)).join('<br>');
            return `<p>${html}</p>`;
        }).join('');
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function highlightJson(escaped) {
        return escaped
            .replace(/"([^"\\]*(\\.[^"\\]*)*)"(\s*:)/g, '<span class="json-key">"$1"</span>$3')
            .replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="json-string">"$1"</span>')
            .replace(/\b(-?\d+\.?\d*)\b/g, '<span class="json-number">$1</span>')
            .replace(/\b(true|false|null)\b/g, '<span class="json-keyword">$1</span>');
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
