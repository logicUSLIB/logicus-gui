// The DEDUCTION panel: proofs in the style of Fitch, checked with the rules that the exercise allows
// (LogicUS.FOL.Deduction), and the rules that can be used at the end of the proof.
//
// The rules are written as schemas (rule NAME : premises ⊢ conclusion); the systems of the library can be loaded and
// their rules switched off or edited. The core does the work: the panel sends it requests of type "Deduction".

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
    let presets = [];        // the systems of the library
    let last = { check: null, hints: null };

    function escape(text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
                presets = response.message.presets || [];
                const first = presets[0];
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
                    <code>p -&gt; r   -&gt;I 3-5</code>; a bar <code>|</code> per open subproof</span>
                    <textarea id="ded-proof" spellcheck="false">${escape(state.proof)}</textarea>
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
                <div class="ded-system">
                    <div class="ded-row">
                        <label>Rules of the exercise
                            <select id="ded-preset" onchange="DeductionPanel.preset(this.value)">
                                ${presets.map(p => `<option${p.name === state.preset ? ' selected' : ''}>${escape(p.name)}</option>`).join('')}
                                <option${presets.some(p => p.name === state.preset) ? '' : ' selected'}>Own rules</option>
                            </select>
                        </label>
                    </div>
                    <div id="ded-rules"></div>
                    <details id="ded-edit"${state.preset === 'Own rules' ? ' open' : ''}>
                        <summary>Edit the rules</summary>
                        <span class="ded-hint">One rule per line: <code>rule NAME : A, [B] C ⊢ D</code> (a premise
                        <code>[B] C</code> is a subproof from B to C), <code>axiom NAME : A → (B → A)</code>; capital letters
                        are formulas, <code>A[x/t]</code> is a substitution, conditions: <code>if a fresh</code>,
                        <code>if x not free in A</code>.</span>
                        <textarea id="ded-rules-text" spellcheck="false">${escape(state.rules)}</textarea>
                    </details>
                </div>
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
        bind('ded-proof', 'proof', scheduleCheck);
        bind('ded-target', 'target');
        bind('ded-rules-text', 'rules', () => {
            state.preset = 'Own rules';
            scheduleCheck();
        });
        renderRules();
    }

    let timer = null;
    function scheduleCheck() {
        clearTimeout(timer);
        timer = setTimeout(check, 400);
    }

    function check() {
        askCore('Deduction', request('check'), response => {
            last.check = response.message;
            renderRules();
            renderReport();
        });
    }

    function hints() {
        askCore('Deduction', request('hints'), response => {
            last.hints = response.message;
            renderHints();
        });
    }

    function renderRules() {
        const box = document.getElementById('ded-rules');
        if (!box || !last.check) return;
        if (last.check.systemError) {
            box.innerHTML = `<div class="ded-error">${escape(last.check.systemError)}</div>`;
            return;
        }
        // every rule of the text, also the switched-off ones
        const all = state.rules.split('\n').map(ruleName).filter(n => n);
        const texts = Object.fromEntries((last.check.rules || []).map(r => [r.name, r.text]));
        const lines = Object.fromEntries(state.rules.split('\n').filter(ruleName).map(l => [ruleName(l), l.trim()]));
        box.innerHTML = all.map(name => `
            <label class="ded-rule${state.disabled.includes(name) ? ' off' : ''}">
                <input type="checkbox"${state.disabled.includes(name) ? '' : ' checked'}
                    onchange="DeductionPanel.toggle(${escape(JSON.stringify(name))}, this.checked)">
                <code>${escape(texts[name] || lines[name] || name)}</code>
            </label>`).join('');
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
        check();
    }

    function preset(name) {
        const p = presets.find(q => q.name === name);
        state.preset = name;
        if (p) {
            state.rules = p.rules;
            state.disabled = [];
        }
        render();
        check();
    }

    function toggle(name, on) {
        state.disabled = on ? state.disabled.filter(n => n !== name) : [...state.disabled, name];
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
                    state.preset = (presets.find(p => p.rules === state.rules) || { name: 'Own rules' }).name;
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

    return { open, close, check, hints, use, assume, set, preset, toggle, saveFile, loadFile,
             state: () => state, last: () => last };
})();

function openDEDUCTIONPANEL() {
    DeductionPanel.open();
}
