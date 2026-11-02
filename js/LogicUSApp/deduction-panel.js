// The DEDUCTION panel: proofs in the style of Fitch, checked with the rules that the exercise allows
// (LogicUS.PL.Deduction for propositional exercises, LogicUS.FOL.Deduction for first-order ones), and the rules that
// can be used at the end of the proof.
//
// The rules are written as schemas (rule NAME : premises ⊢ conclusion). The rules that the exercise allows are listed
// with their schemas (in LaTeX, drawn by MathJax), each with a button that adds a line with the rule to the proof; EDIT chooses a system of the libraries, switches rules off and
// edits them, and nothing changes until SAVE, which reads the rules first. The core does the work: the panel sends it
// requests of type "Deduction".

let CORE_CALLBACKS = {};       // answers of the core for the panels, by request id (negative node ids)
let CORE_REQUEST_ID = -1000;

function askCore(nodeType, request, callback) {
    const id = CORE_REQUEST_ID--;
    CORE_CALLBACKS[id] = callback;
    app.ports.messageReceiver.send(JSON.stringify({ nodeId: id, nodeType, content: JSON.stringify(request) }));
}

const DeductionPanel = (function () {
    const EXAMPLE = {
        lang: 'PL',
        premises: 'p -> q\nq -> r',
        goal: 'p -> r',
        proof: `p -> q        premise
q -> r        premise
| p           assumption
| q           ->E 1, 3
`,
    };

    let state = null;        // the exercise: language, rules, switched-off rules, premises, goal, proof, target
    let presets = {};        // the systems of the libraries, by language: { PL: [...], FOL: [...] }
    let last = { check: null, hints: null };
    let draft = null;        // the rules being edited (EDIT): { preset, rules, disabled, error }, or null
    let cursorSet = false;   // whether the user has put the cursor in the proof (the rules are added after its line)

    function escape(text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function presetsOf(lang) {
        return presets[lang || state.lang] || [];
    }

    function ruleName(line) {
        const m = /^\s*(?:rule|axiom)\s+(\S+)\s*:/.exec(line) || /^\s*(\S+)\s*:/.exec(line);
        return m && !/^\s*(#|--)/.test(line) ? m[1] : null;
    }

    // The rules that the exercise allows: the text without the switched-off rules.
    function activeRules() {
        return state.rules.split('\n').filter(l => !state.disabled.includes(ruleName(l))).join('\n');
    }

    function request(action) {
        return { action, lang: state.lang, rules: activeRules(), premises: state.premises, goal: state.goal,
                 proof: state.proof, target: state.target };
    }

    function open() {
        if (!state) {
            askCore('Deduction', { action: 'presets' }, response => {
                presets = response.message.presets || {};
                const first = presetsOf('PL')[0];
                state = Object.assign({ preset: first.name, rules: first.rules, disabled: [], target: '' }, EXAMPLE);
                render();
                check();
            });
        } else {
            render();
            check();
        }
    }

    function render() {
        POPUP.innerHTML = `
        <div id="popup-head">
            <span id="popup-title">DEDUCTION</span>
            <button id="popup-close" onclick="DeductionPanel.close()">CLOSE</button>
        </div>
        <div id="popup-content2" class="deduction">
            <div class="ded-left">
                <div class="ded-row">
                    <label>Language
                        <select id="ded-lang" onchange="DeductionPanel.set('lang', this.value)">
                            <option value="PL"${state.lang === 'PL' ? ' selected' : ''}>propositional (p, q, ¬, &amp;, |, -&gt;, &lt;-&gt;)</option>
                            <option value="FOL"${state.lang === 'FOL' ? ' selected' : ''}>first order (P(X), !A[X], !E[X], =)</option>
                        </select>
                    </label>
                </div>
                <div class="ded-row ded-problem">
                    <label>Premises <span class="ded-hint">(a formula per line)</span>
                        <textarea id="ded-premises" rows="3" spellcheck="false">${escape(state.premises)}</textarea></label>
                    <label>Goal
                        <input id="ded-goal" type="text" spellcheck="false" value="${escape(state.goal)}"></label>
                </div>
                <label class="ded-proof-label">Proof
                    <span class="ded-hint">a line per formula: <code>| p   assumption</code>, <code>q   -&gt;E 1, 3</code>,
                    <code>p -&gt; r   -&gt;I 3-5</code>; a bar <code>|</code> per open subproof. On the left, the number of
                    each line, as the rules cite it (empty lines are not counted).</span>
                    <div class="ded-editor">
                        <div class="ded-gutter" aria-hidden="true"><div id="ded-gutter"></div></div>
                        <textarea id="ded-proof" spellcheck="false" wrap="off">${escape(state.proof)}</textarea>
                    </div>
                </label>
                <div class="ded-buttons">
                    <button onclick="DeductionPanel.check()">CHECK</button>
                    <button onclick="DeductionPanel.hints()">RULES THAT CAN BE USED</button>
                    <button onclick="DeductionPanel.loadFile()">LOAD EXERCISE</button>
                    <button onclick="DeductionPanel.saveFile()">SAVE EXERCISE</button>
                </div>
                <div id="ded-report"></div>
            </div>
            <div class="ded-right">
                <div class="ded-system">${draft ? editorHTML() : paletteHTML()}</div>
                <div class="ded-hints">
                    <div class="ded-row">
                        <label>Target <span class="ded-hint">(optional; by default, the goal when no subproof is open)</span>
                            <input id="ded-target" type="text" spellcheck="false" value="${escape(state.target)}"></label>
                    </div>
                    <div id="ded-hints-list" class="ded-hint">Press RULES THAT CAN BE USED.</div>
                </div>
            </div>
        </div>`;
        POPUP.style.zIndex = 1000;
        const bind = (id, key, after) => {
            document.getElementById(id).addEventListener('input', e => {
                state[key] = e.target.value;
                if (after) after();
            });
        };
        bind('ded-premises', 'premises', scheduleCheck);
        bind('ded-goal', 'goal', scheduleCheck);
        bind('ded-proof', 'proof', () => {
            renderGutter();
            scheduleCheck();
        });
        document.getElementById('ded-proof').addEventListener('scroll', renderGutter);
        ['focus', 'click', 'keyup'].forEach(e => document.getElementById('ded-proof').addEventListener(e, () => { cursorSet = true; }));
        cursorSet = false;
        bind('ded-target', 'target');
        if (draft) {
            document.getElementById('ded-rules-text').addEventListener('input', e => {
                draft.rules = e.target.value;
                draft.preset = 'Own rules';
                document.getElementById('ded-preset').value = 'Own rules';
                clearTimeout(draftTimer);
                draftTimer = setTimeout(renderDraftRules, 300);
            });
            renderDraftRules();
        }
        renderRules();
        renderGutter();
    }

    // The rules of the exercise: a row per rule that the exercise allows, a button with its name and its schema.
    function paletteHTML() {
        return `
            <div class="ded-system-head"><b>Rules of the exercise</b>
                <span class="ded-system-name">${escape(state.preset)}</span>
                <button onclick="DeductionPanel.edit()">EDIT</button></div>
            <div class="ded-hint">Click a rule to add a line with it to the proof, after the line of the cursor; then
            write the formula and the lines that it uses.</div>
            <div id="ded-rules" class="ded-palette"></div>`;
    }

    // EDIT: the system, the rules that are switched on, and their text. Nothing changes until SAVE.
    function editorHTML() {
        return `
            <div class="ded-system-head"><b>Rules of the exercise</b></div>
            <label class="ded-inline">System
                <select id="ded-preset" onchange="DeductionPanel.draftPreset(this.value)">
                    ${presetsOf().map(p => `<option${p.name === draft.preset ? ' selected' : ''} title="${escape(p.description)}">${escape(p.name)}</option>`).join('')}
                    <option${presetsOf().some(p => p.name === draft.preset) ? '' : ' selected'}>Own rules</option>
                </select></label>
            <div class="ded-hint">Switch off the rules that the exercise does not allow:</div>
            <div id="ded-draft-rules"></div>
            <label>The rules
                <span class="ded-hint">One rule per line: <code>rule NAME : A, [B] C ⊢ D</code> (a premise
                <code>[B] C</code> is a subproof from B to C), <code>axiom NAME : A → (B → A)</code>; capital letters
                are formulas${state.lang === 'FOL' ? `, <code>A[x/t]</code> is a substitution, conditions:
                <code>if a fresh</code>, <code>if x not free in A</code>` : `; a rule that is not valid is
                marked with a counterexample`}. An empty line separates groups of rules.</span>
                <textarea id="ded-rules-text" spellcheck="false">${escape(draft.rules)}</textarea></label>
            <div class="ded-buttons">
                <button onclick="DeductionPanel.save()">SAVE</button>
                <button onclick="DeductionPanel.cancel()">CANCEL</button>
            </div>
            <div id="ded-draft-error" class="ded-error">${escape(draft.error || '')}</div>`;
    }

    let draftTimer = null;

    // The rules of the text being edited, with a box to switch each one off.
    function renderDraftRules() {
        const box = document.getElementById('ded-draft-rules');
        if (!box || !draft) return;
        box.innerHTML = draft.rules.split('\n').filter(ruleName).map(line => {
            const name = ruleName(line);
            const off = draft.disabled.includes(name);
            return `<label class="ded-rule${off ? ' off' : ''}">
                <input type="checkbox"${off ? '' : ' checked'}
                    onchange="DeductionPanel.draftToggle(${escape(JSON.stringify(name))}, this.checked)">
                <code>${escape(line.trim())}</code></label>`;
        }).join('');
    }

    function edit() {
        draft = { preset: state.preset, rules: state.rules, disabled: [...state.disabled], error: '' };
        render();
        check();
    }

    function draftPreset(name) {
        const p = presetsOf().find(q => q.name === name);
        draft.preset = name;
        if (p) {
            draft.rules = p.rules;
            draft.disabled = [];
        }
        draft.error = '';
        render();
        check();
    }

    function draftToggle(name, on) {
        draft.disabled = on ? draft.disabled.filter(n => n !== name) : [...draft.disabled, name];
        renderDraftRules();
    }

    // The rules are read (all of them, also the switched-off ones) before they replace those of the exercise.
    function save() {
        const rules = draft.rules;
        askCore('Deduction', { action: 'rules', lang: state.lang, rules }, response => {
            if (!draft || draft.rules !== rules) return;
            const m = response.message;
            if (m.systemError) {
                draft.error = 'The rules cannot be saved: ' + m.systemError;
                document.getElementById('ded-draft-error').textContent = draft.error;
                return;
            }
            const names = (m.rules || []).map(r => r.name);
            const p = presetsOf().find(q => q.rules === rules);
            state.rules = rules;
            state.preset = p ? p.name : 'Own rules';
            state.disabled = draft.disabled.filter(n => names.includes(n));
            draft = null;
            render();
            check();
        });
    }

    function cancel() {
        draft = null;
        render();
        check();
    }

    // The numbers of the lines of the proof, next to the text: the lines that are not empty, in order (as readProof
    // numbers them). The wrong lines are marked once the text has been checked.
    function renderGutter() {
        const gutter = document.getElementById('ded-gutter');
        const text = document.getElementById('ded-proof');
        if (!gutter || !text) return;
        const checked = last.check && last.checkedProof === state.proof ? last.check.lines || [] : [];
        const bad = new Set(checked.filter(l => !l.ok).map(l => l.number));
        let k = 0;
        gutter.innerHTML = state.proof.split('\n').map(line => {
            if (!line.trim()) return '<div>&nbsp;</div>';
            k++;
            return `<div${bad.has(k) ? ' class="bad"' : ''}>${k}</div>`;
        }).join('');
        // the numbers move with the text (the gutter does not set the height of the editor)
        gutter.style.transform = `translateY(${-text.scrollTop}px)`;
    }

    let timer = null;
    function scheduleCheck() {
        clearTimeout(timer);
        timer = setTimeout(check, 400);
    }

    function check() {
        const proof = state.proof;
        askCore('Deduction', request('check'), response => {
            last.check = response.message;
            last.checkedProof = proof;
            renderRules();
            renderReport();
            renderGutter();
        });
    }

    function hints() {
        askCore('Deduction', request('hints'), response => {
            last.hints = response.message;
            renderHints();
        });
    }

    // The rules that the exercise allows (a button with the name, and the schema), in the groups of the text
    // (separated by empty lines).
    function renderRules() {
        const box = document.getElementById('ded-rules');
        if (!box || !last.check) return;
        if (last.check.systemError) {
            box.innerHTML = `<div class="ded-error">The rules cannot be read: ${escape(last.check.systemError)}. Press EDIT to correct them.</div>`;
            return;
        }
        const rules = last.check.rules || [];
        const group = {};
        let g = 0;
        activeRules().split('\n').forEach(line => {
            if (!line.trim()) g++;
            else if (ruleName(line)) group[ruleName(line)] = g;
        });
        const groups = [];
        rules.forEach((r, i) => {
            const k = group[r.name] !== undefined ? group[r.name] : g + 1;
            if (!groups.length || groups[groups.length - 1].k !== k) groups.push({ k, items: [] });
            groups[groups.length - 1].items.push([r, i]);
        });
        // the same rules are not drawn again (MathJax would redraw them at every check)
        const key = JSON.stringify([rules, groups.map(x => x.items.length)]);
        if (box.dataset.key === key) return;
        box.dataset.key = key;
        box.innerHTML = groups.map(({ items }) => `<div class="ded-palette-group">${items.map(([r, i]) => {
            const values = r.counterexample ? r.counterexample.map(([m, b]) => `${m} ${b ? 'true' : 'false'}`).join(', ') : '';
            const schema = schemaText(r);
            return `<div class="ded-rule-row" data-rule="${escape(r.name)}" data-schema="${escape(schema)}">
                <button class="ded-rule-button${values ? ' warn' : ''}" data-rule="${escape(r.name)}"
                    title="Add a line with ${escape(r.name)}" onclick="DeductionPanel.useRule(${i})"><span
                    data-tex="${escape(nameToTeX(r.name))}" data-text="${escape(r.name)}">${escape(r.name)}</span></button>
                <span class="ded-schema" data-tex="${escape(schemaToTeX(schema))}" data-text="${escape(schema)}">${escape(schema)}</span>
                ${values ? `<span class="ded-warn" title="With ${escape(values)}, the premises are true and the conclusion is false">⚠ not valid (${escape(values)})</span>` : ''}
            </div>`;
        }).join('')}</div>`).join('') || '<span class="ded-hint">The exercise allows no rule.</span>';
        typeset(box);
    }

    // The rules in LaTeX, drawn by MathJax when it is available (otherwise they stay as text).
    function typeset(box) {
        const mj = window.MathJax;
        if (!mj || !mj.startup || !mj.typesetPromise) return;
        const key = box.dataset.key;
        mj.startup.promise
            .then(() => {
                if (box.dataset.key !== key) return null;
                box.querySelectorAll('[data-tex]').forEach(el => { el.textContent = `\\(${el.dataset.tex}\\)`; });
                return mj.typesetPromise([box]);
            })
            .catch(() => box.querySelectorAll('[data-tex]').forEach(el => { el.textContent = el.dataset.text; }));
    }

    const TEX = { '∧': '\\land ', '∨': '\\lor ', '→': '\\to ', '↔': '\\leftrightarrow ', '¬': '\\neg ', '⊥': '\\bot ',
                  '⊤': '\\top ', '⊢': '\\vdash ', '∀': '\\forall ', '∃': '\\exists ', '≠': '\\neq ' };

    function texChar(c) {
        if (TEX[c]) return TEX[c];
        if (c === '\\') return '\\backslash ';
        if (c === '~') return '\\sim ';
        if (c === '^') return '\\hat{}';
        return '#$%&_{}'.includes(c) ? '\\' + c : c;
    }

    // The name of a rule in LaTeX: its letters upright, the digits at the end as a subscript (∧E1: \land\mathrm{E}_{1}).
    function nameToTeX(name) {
        const m = /^(.*?)(\d+)$/.exec(name);
        const base = m && m[1] ? m[1] : name;
        let out = '', run = '';
        const flush = () => { if (run) out += `\\mathrm{${run}}`; run = ''; };
        for (const c of base) {
            if (/[A-Za-z]/.test(c)) run += c;
            else { flush(); out += `{${texChar(c).trim()}}`; }   // braces: no space around → in →I
        }
        flush();
        return out + (m && m[1] ? `_{${m[2]}}` : '');
    }

    // A schema in LaTeX: the letters of formulas with their digits as subscripts (C1: C_{1}), a thin space between
    // juxtaposed parts (∀x A, [A] B), and the side conditions in text.
    function schemaToTeX(schema) {
        const [main, ...conds] = schema.split(/\s+if\s+/);
        let out = '', prev = '', space = false;
        for (const [, word, digits, symbol, blank] of main.matchAll(/([A-Za-z][A-Za-z']*)(\d*)|(\S)|(\s+)/g)) {
            if (blank) { space = true; continue; }
            const operator = symbol && '⊢∧∨→↔,=≠)]/'.includes(symbol);
            if (space && (prev === 'word' || prev === ']') && !operator) out += prev === ']' ? '\\;' : '\\,';
            out += word ? word + (digits ? `_{${digits}}` : '') : texChar(symbol);
            prev = word ? 'word' : symbol;
            space = false;
        }
        if (conds.length) {
            const text = conds.join(', ').split(/\s*,\s*/).map(c => c
                .replace(/^(\S+) fresh$/, '$1\\ \\text{fresh}')
                .replace(/^(\S+) not free in (\S+)$/, '$1\\ \\text{not free in}\\ $2'));
            out += `\\quad\\text{if }${text.join(',\\ ')}`;
        }
        return out;
    }

    // The schema of a rule, without its name: `A → B, A ⊢ B`, `⊢ A → (B → A)` for an axiom.
    function schemaText(rule) {
        const text = rule.text.replace(/^\s*(rule|axiom)\s+/, '');
        const body = text.slice(text.indexOf(':') + 1).trim();
        return /^\s*axiom\s/.test(rule.text) ? '⊢ ' + body : body;
    }

    // The number of bars of a line of the proof.
    function barsOf(line) {
        const m = /^\s*(\d+\.?\s+)?((\|\s*)*)/.exec(line);
        return (m[2].match(/\|/g) || []).length;
    }

    // It adds a line with a rule after the line of the cursor (or at the end), with the bars of that line, or one bar
    // less when the rule closes a subproof; the cursor goes where the formula is written.
    function useRule(i) {
        const rule = (last.check.rules || [])[i];
        const text = document.getElementById('ded-proof');
        if (!rule || !text) return;
        const lines = state.proof.split('\n');
        let at = cursorSet ? state.proof.slice(0, text.selectionStart).split('\n').length - 1 : lines.length - 1;
        let ref = at;
        while (ref >= 0 && !lines[ref].trim()) ref--;
        const bars = ref >= 0 ? barsOf(lines[ref]) : 0;
        const depth = Math.max(0, bars - (rule.closes && bars > 0 ? 1 : 0));
        const prefix = '| '.repeat(depth);
        const line = prefix.padEnd(Math.max(14, prefix.length + 3)) + rule.name + ' ';
        if (lines[at] !== undefined && !lines[at].trim()) lines[at] = line;   // an empty line is used
        else lines.splice(++at, 0, line);
        state.proof = lines.join('\n');
        text.value = state.proof;
        const pos = lines.slice(0, at).reduce((n, l) => n + l.length + 1, 0) + prefix.length;
        text.focus();
        text.setSelectionRange(pos, pos);
        cursorSet = true;
        renderGutter();
        scheduleCheck();
    }

    // The proof as a table, with the subproofs drawn as boxes and the verdict on each line.
    function renderReport() {
        const box = document.getElementById('ded-report');
        if (!box || !last.check) return;
        const c = last.check;
        if (c.systemError) {
            box.innerHTML = `<div class="ded-error">The rules cannot be read: ${escape(c.systemError)}</div>`;
            return;
        }
        const errors = (c.formulaErrors || []).map(e => `<div class="ded-error">${escape(e)}</div>`).join('');
        const rows = (c.lines || []).map(l => {
            const bars = Array.from({ length: l.depth }, (_, i) =>
                `<span class="ded-bar${isAssumption(l) && i === l.depth - 1 ? ' first' : ''}"></span>`).join('');
            return `<tr class="${l.ok ? 'ok' : 'bad'}">
                <td class="ded-num">${l.number}</td>
                <td class="ded-formula">${bars}<span class="ded-f${isAssumption(l) ? ' assumption' : ''}">${escape(l.formula)}</span></td>
                <td class="ded-just">${escape((l.rule + ' ' + l.refs).trim())}</td>
                <td class="ded-mark">${l.ok ? '✓' : '✗'}</td>
                <td class="ded-msg">${l.ok ? '' : escape(l.message)}</td>
            </tr>`;
        }).join('');
        box.innerHTML = `${errors}
            <div class="ded-status ${c.complete ? 'yes' : 'no'}">${escape(c.message || '')}</div>
            <table class="ded-table">${rows}</table>`;
    }

    function isAssumption(l) {
        return ['assumption', 'supuesto', 'a', 'hyp', 'hip', 'hipótesis', 'hipotesis', 'sup'].includes(l.rule.toLowerCase()) && !l.refs.trim();
    }

    function renderHints() {
        const box = document.getElementById('ded-hints-list');
        if (!box || !last.hints) return;
        const h = last.hints;
        if (h.systemError) {
            box.innerHTML = `<div class="ded-error">${escape(h.systemError)}</div>`;
            return;
        }
        const all = h.hints || [];
        const group = (kind, title) => {
            const items = all.map((x, i) => [x, i]).filter(([x]) => x.kind === kind);
            if (!items.length) return '';
            return `<div class="ded-group"><b>${title}</b>${items.map(([x, i]) => `
                <div class="ded-item">
                    <span>${escape(x.text)}</span>
                    ${x.kind !== 'backward' && x.input ? `<button onclick="DeductionPanel.use(${i})">ADD</button>` : ''}
                    ${x.kind === 'backward' ? x.assumptions.map((a, j) =>
                        `<button onclick="DeductionPanel.assume(${i}, ${j})">ASSUME ${escape(a)}</button>`).join('') : ''}
                </div>`).join('')}</div>`;
        };
        box.classList.remove('ded-hint');
        box.innerHTML = (group('close', 'Close the subproof') + group('backward', 'To reach the target')
            + group('forward', 'From the lines'))
            || `<span class="ded-hint">${last.check && last.check.complete ? 'The proof is complete.' : 'No rule of the exercise can be used here.'}</span>`;
    }

    // The depth (number of open subproofs) at the end of the proof.
    function currentDepth() {
        const lines = state.proof.split('\n').filter(l => l.trim());
        if (!lines.length) return 0;
        const m = /^\s*(\d+\.?\s+)?((\|\s*)*)/.exec(lines[lines.length - 1]);
        return (m[2].match(/\|/g) || []).length;
    }

    function appendLine(depth, formula, justification) {
        const text = state.proof.replace(/\s*$/, '');
        const line = `${'| '.repeat(Math.max(0, depth))}${formula}`;
        state.proof = (text ? text + '\n' : '') + line.padEnd(Math.max(14, line.length + 3)) + justification + '\n';
        document.getElementById('ded-proof').value = state.proof;
        renderGutter();
        check();
        hints();
    }

    function use(i) {
        const x = last.hints.hints[i];
        const depth = currentDepth() - (x.kind === 'close' ? 1 : 0);
        appendLine(depth, x.input, `${x.rule} ${x.refs}`.trim());
    }

    function assume(i, j) {
        const x = last.hints.hints[i];
        appendLine(currentDepth() + 1, x.assumptions[j], 'assumption');
    }

    function set(key, value) {
        state[key] = value;
        if (key === 'lang') {
            // the same system in the other language (the rules of the connectives are the same)
            const p = presetsOf().find(q => q.name === state.preset);
            if (p) state.rules = p.rules;
            draft = null;
            render();
        }
        check();
    }

    function saveFile() {
        const data = JSON.stringify({ logicus: 'deduction', lang: state.lang, rules: state.rules, disabled: state.disabled,
                                      premises: state.premises, goal: state.goal, proof: state.proof }, null, 2);
        saveAs(new Blob([data], { type: 'application/json;charset=utf-8' }), 'exercise.deduction.json');
    }

    function loadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = () => {
            const file = input.files[0];
            if (!file) return;
            file.text().then(text => {
                try {
                    const d = JSON.parse(text);
                    state = Object.assign(state, {
                        lang: d.lang === 'FOL' ? 'FOL' : 'PL', rules: d.rules || '', disabled: d.disabled || [],
                        premises: d.premises || '', goal: d.goal || '', proof: d.proof || '', target: '',
                    });
                    state.preset = (presetsOf().find(p => p.rules === state.rules) || { name: 'Own rules' }).name;
                    draft = null;
                    render();
                    check();
                } catch (e) {
                    document.getElementById('ded-report').innerHTML = `<div class="ded-error">The file is not an exercise: ${escape(e.message)}</div>`;
                }
            });
        };
        input.click();
    }

    function close() {
        POPUP.style.zIndex = 0;
    }

    return { open, close, check, hints, use, assume, set, edit, draftPreset, draftToggle, save, cancel, useRule,
             saveFile, loadFile, state: () => state, last: () => last };
})();

function openDEDUCTIONPANEL() {
    DeductionPanel.open();
}
