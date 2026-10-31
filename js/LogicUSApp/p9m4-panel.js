// The PROVER9/MACE4 panel, in the spirit of the classic Prover9-Mace4 GUI by William McCune.
//
// It works on the free problem of the panel (formulas typed in the LADR language) or, opened from a Prover9Mace4 node,
// on the options of that node (whose formulas come from its sets). Prover9 and Mace4 run in the browser, and the
// results can be shown in the formats of prooftrans and interpformat.

let P9M4_FREE = P9M4.newState();   // the free problem of the panel

const P9M4Panel = (function () {
    const NAMES = { prover9: 'Prover9', mace4: 'Mace4' };
    const TABS = [['formulas', 'FORMULAS'], ['language', 'LANGUAGE'], ['prover9', 'PROVER9 OPTIONS'],
                  ['mace4', 'MACE4 OPTIONS'], ['additional', 'ADDITIONAL INPUT'], ['input', 'INPUT FILE']];
    const VIEWS = {
        prover9: [['proof', 'Proof'], ['parents_only', 'Proof, parents only (prooftrans)'], ['xml', 'Proof, XML (prooftrans)'],
                  ['ivy', 'Proof, Ivy (prooftrans)'], ['output', 'Full output'], ['input', 'Input file']],
        mace4: [['standard', 'Models (interpformat)'], ['tabular', 'Models, tabular'], ['portable', 'Models, portable'],
                ['cooked', 'Models, cooked'], ['raw', 'Models, raw'], ['xml', 'Models, XML'], ['output', 'Full output'],
                ['input', 'Input file']],
    };
    const LADR_DECLARATIONS = `op(800, infix, "<->").   op(800, infix, "->").   op(790, infix_right, "|").
op(780, infix_right, "&").   op(350, prefix, "-").   op(700, infix, "=").   op(700, infix, "!=").
(These are the defaults; write here only new or changed declarations.)`;

    let ctx = null;   // the panel as it is open

    function escape(text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // A Prover9Mace4 node keeps its options in properties.p9m4; the time limit and Mace4's largest domain are the
    // seconds and max size widgets of the node.
    function nodeConfig(node) {
        if (!node.properties.p9m4) {
            node.properties.p9m4 = { language: { prolog_style_variables: false, declarations: '' }, prover9: {},
                                     mace4: {}, additional: node.properties.xopts || '' };
        }
        const state = Object.assign({ assumptions: '', goals: '' }, node.properties.p9m4);
        const seconds = { get: () => node.properties.seconds, set: v => { node.properties.seconds = v; } };
        return new P9M4.Config(state, {
            prover9: { max_seconds: seconds },
            mace4: { max_seconds: seconds, end_size: { get: () => node.properties.domain, set: v => { node.properties.domain = v; } } },
        });
    }

    function open(node = null) {
        ctx = {
            node,
            config: node ? nodeConfig(node) : new P9M4.Config(P9M4_FREE),
            tab: ctx && ctx.node === node ? ctx.tab : 'formulas',
            group: { prover9: 'Basic', mace4: 'Basic' },
            runs: { prover9: null, mace4: null },
            controllers: {},
            changed: [],
            nodeProblem: null,
            result: { title: '', text: '', file: '' },
        };
        render();
        if (node) {
            // (the core may answer at once, so the panel must be drawn before asking)
            node.requestProblem(problem => {
                if (ctx && ctx.node === node) {
                    ctx.nodeProblem = problem;
                    renderTab();
                }
            });
        }
    }

    function close() {
        if (ctx && ctx.node) saveNode();
        Object.values(ctx ? ctx.controllers : {}).forEach(c => c.abort());
        ctx = null;
        document.getElementById('popup').style.zIndex = 0;
    }

    // after a change of the options of a node
    function saveNode() {
        const node = ctx.node, state = ctx.config.state;
        node.properties.p9m4 = { language: state.language, prover9: state.prover9, mace4: state.mace4, additional: state.additional };
        node.properties.xopts = state.additional;
        node.syncWidgets();
        node.onPropertyChanged();
    }

    function render() {
        const node = ctx.node;
        POPUP.innerHTML = `
        <div id="popup-head">
            <span id="popup-title">PROVER9 / MACE4${node ? ` &nbsp;·&nbsp; options of node [${node.id}] ${escape(node.title)}` : ''}</span>
            <button id="popup-close" onclick="P9M4Panel.close()">CLOSE</button>
        </div>
        <div id="popup-content2" class="p9m4">
            <div class="p9m4-left">
                <div class="p9m4-tabs">${TABS.map(([id, label]) =>
                    `<button data-tab="${id}" onclick="P9M4Panel.tab('${id}')">${label}</button>`).join('')}</div>
                <div class="p9m4-tab" id="p9m4-tab"></div>
                <div class="p9m4-file">
                    <button onclick="P9M4Panel.loadFile()">LOAD INPUT FILE</button>
                    <button onclick="P9M4Panel.saveFile()">SAVE INPUT FILE</button>
                </div>
            </div>
            <div class="p9m4-right">
                ${P9M4.PROGRAMS.map(runBox).join('')}
                <div class="p9m4-result">
                    <div class="p9m4-result-head"><b id="p9m4-result-title"></b>
                        <button onclick="P9M4Panel.saveResult()">SAVE</button></div>
                    <pre id="p9m4-result-text"></pre>
                </div>
            </div>
        </div>`;
        POPUP.style.zIndex = 1000;
        renderTab();
        P9M4.PROGRAMS.forEach(renderRun);
        renderResult();
    }

    function runBox(program) {
        return `
        <div class="p9m4-run" id="p9m4-run-${program}">
            <div><b>${NAMES[program]}</b> <span class="p9m4-hint">${program === 'prover9' ? 'searches for a proof' : 'searches for finite models'}</span>
                ${ctx.node ? `<span class="p9m4-hint">(runs node [${ctx.node.id}])</span>` : ''}</div>
            <div class="p9m4-run-controls">
                <label>time limit <input type="number" min="-1" step="1" data-option="max_seconds"
                    onchange="P9M4Panel.setOption('${program}', 'max_seconds', this)"> s</label>
                <button class="p9m4-start" onclick="P9M4Panel.start('${program}')">START</button>
                <button class="p9m4-stop" onclick="P9M4Panel.stop('${program}')">STOP</button>
                <span class="p9m4-state"></span>
            </div>
            <div class="p9m4-run-controls">
                <select class="p9m4-view">${VIEWS[program].map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}</select>
                <button onclick="P9M4Panel.show('${program}')">SHOW</button>
            </div>
        </div>`;
    }

    function renderRun(program) {
        const box = document.getElementById(`p9m4-run-${program}`);
        if (!box) return;
        box.querySelector('[data-option="max_seconds"]').value = ctx.config.get(program, 'max_seconds');
        const running = !!ctx.controllers[program];
        box.querySelector('.p9m4-start').disabled = running;
        box.querySelector('.p9m4-stop').disabled = !running;
        const run = ctx.runs[program];
        box.querySelector('.p9m4-state').textContent = running ? 'running…' : run ? run.summary : '';
        box.querySelector('.p9m4-state').className = 'p9m4-state ' + (run && !running ? run.kind : '');
    }

    function renderResult() {
        document.getElementById('p9m4-result-title').textContent = ctx.result.title;
        document.getElementById('p9m4-result-text').textContent = ctx.result.text;
    }

    function tab(id) {
        ctx.tab = id;
        ctx.changed = [];
        renderTab();
    }

    function renderTab() {
        if (!ctx) return;
        document.querySelectorAll('.p9m4-tabs button').forEach(b => b.classList.toggle('selected', b.dataset.tab === ctx.tab));
        const el = document.getElementById('p9m4-tab');
        if (!el) return;
        const state = ctx.config.state;
        switch (ctx.tab) {
            case 'formulas':
                el.innerHTML = ctx.node ? nodeFormulas() : `
                    <p class="p9m4-hint">Formulas in the language of Prover9 and Mace4 (LADR), each ending with a period,
                    e.g. <code>all x (man(x) -> mortal(x)).</code> Variables in clauses start with u–z
                    (or are capitalised with <i>prolog style variables</i>).</p>
                    <label class="p9m4-area">Assumptions<textarea id="p9m4-assumptions" spellcheck="false"
                        oninput="P9M4Panel.setText('assumptions', this.value)">${escape(state.assumptions)}</textarea></label>
                    <label class="p9m4-area">Goals<textarea id="p9m4-goals" spellcheck="false"
                        oninput="P9M4Panel.setText('goals', this.value)">${escape(state.goals)}</textarea></label>
                    <div><button onclick="P9M4Panel.checkSyntax()">WELL FORMED?</button>
                        <button onclick="P9M4Panel.clearFormulas()">CLEAR</button>
                        <span id="p9m4-syntax" class="p9m4-hint"></span></div>`;
                break;
            case 'language':
                el.innerHTML = `
                    <label class="p9m4-option"><input type="checkbox" ${state.language.prolog_style_variables ? 'checked' : ''}
                        onchange="P9M4Panel.setLanguage('prolog_style_variables', this.checked)">
                        <span>prolog_style_variables</span></label>
                    <p class="p9m4-hint">Variables are the symbols that start with an upper-case letter, instead of u–z.</p>
                    <label class="p9m4-area">Operator declarations (<code>op</code>, <code>redeclare</code>)
                        <textarea spellcheck="false" placeholder="${escape(LADR_DECLARATIONS)}"
                        oninput="P9M4Panel.setLanguage('declarations', this.value)">${escape(state.language.declarations)}</textarea></label>`;
                break;
            case 'prover9':
            case 'mace4':
                el.innerHTML = optionsTab(ctx.tab);
                break;
            case 'additional':
                el.innerHTML = `
                    <p class="p9m4-hint">Anything else for the input file: lists of hints, weights, demodulators,
                    or commands inside <code>if(Prover9). … end_if.</code> or <code>if(Mace4). … end_if.</code></p>
                    <label class="p9m4-area"><textarea spellcheck="false" class="tall"
                        oninput="P9M4Panel.setAdditional(this.value)">${escape(state.additional)}</textarea></label>`;
                break;
            case 'input':
                el.innerHTML = `<p class="p9m4-hint">The input file that Prover9 and Mace4 receive.</p>
                    <pre class="p9m4-input">${escape(currentInput() || '(the formulas of the node are not available yet)')}</pre>`;
                break;
        }
    }

    function nodeFormulas() {
        return `<p class="p9m4-hint">The formulas come from the sets connected to the node, translated to the LADR
            language (the goals are proved together, as their conjunction). Change them in the schema.</p>
            <pre class="p9m4-input">${escape(ctx.nodeProblem === null ? 'Waiting for the sets of the node…'
                : ctx.nodeProblem.input || ctx.nodeProblem.error)}</pre>
            <button onclick="P9M4Panel.openAsFree()" ${ctx.nodeProblem && ctx.nodeProblem.input ? '' : 'disabled'}>OPEN AS A FREE PROBLEM</button>
            <span class="p9m4-hint">(copies the formulas and the options to the free problem of the panel, to edit them)</span>`;
    }

    function optionsTab(program) {
        const catalog = LADR_OPTIONS[program];
        const group = catalog.groups.find(g => g.name === ctx.group[program]) || catalog.groups[0];
        const changedCount = g => g.options.filter(n => !ctx.config.isDefault(program, n)).length;
        return `
            <div class="p9m4-groups">${catalog.groups.map(g => `<button class="${g === group ? 'selected' : ''}"
                onclick="P9M4Panel.group('${program}', '${g.name}')">${g.name}${changedCount(g) ? ` (${changedCount(g)})` : ''}</button>`).join('')}</div>
            <div class="p9m4-options">${group.options.map(n => optionWidget(program, n)).join('')}</div>
            <p class="p9m4-hint">Options that differ from their default are highlighted; hover over an option to see
            its default. ${ctx.changed.length ? `<b>Also changed by dependencies:</b> ${ctx.changed.join(', ')}.` : ''}
            See the <a href="https://www.cs.unm.edu/~mccune/prover9/manual/2009-11A/" target="_blank">Prover9 manual</a>.</p>
            <button onclick="P9M4Panel.reset('${program}')">RESET ${NAMES[program].toUpperCase()} OPTIONS</button>`;
    }

    function optionWidget(program, name) {
        const s = P9M4.spec(program, name);
        const value = ctx.config.get(program, name);
        const on = `onchange="P9M4Panel.setOption('${program}', '${name}', this)"`;
        let control;
        if (s.type === 'flag') {
            control = `<input type="checkbox" ${value ? 'checked' : ''} ${on}>`;
        } else if (s.type === 'stringparm') {
            control = `<select ${on}>${s.values.map(v => `<option ${v === value ? 'selected' : ''}>${v}</option>`).join('')}</select>`;
        } else if (s.type === 'parm') {
            control = `<input type="number" step="1" ${s.min !== null ? `min="${s.min}"` : ''} ${s.max !== null ? `max="${s.max}"` : ''} value="${value}" ${on}>`;
        } else {
            control = `<input type="number" step="any" placeholder="∞" value="${value === P9M4.INFINITY ? '' : value}" ${on}>`;
        }
        const show = v => v === P9M4.INFINITY ? '∞ (no limit)' : v === -1 ? '-1 (no limit)' : v;
        const classes = ['p9m4-option', s.type === 'flag' ? 'flag' : '', ctx.config.isDefault(program, name) ? '' : 'changed',
                         ctx.changed.includes(name) ? 'dependency' : ''].join(' ');
        return `<label class="${classes}" title="default: ${escape(show(s.default))}">
            ${s.type === 'flag' ? control + `<span>${name}</span>` : `<span>${name}</span>` + control}</label>`;
    }

    function readValue(program, name, el) {
        const s = P9M4.spec(program, name);
        if (s.type === 'flag') return el.checked;
        if (s.type === 'stringparm') return el.value;
        if (s.type === 'floatparm') return el.value.trim() === '' ? P9M4.INFINITY : Number(el.value);
        let v = parseInt(el.value, 10);
        if (Number.isNaN(v)) v = s.default;
        if (s.min !== null) v = Math.max(s.min, v);
        if (s.max !== null) v = Math.min(s.max, v);
        return v;
    }

    function changed() {
        if (ctx.node) saveNode();
        P9M4.PROGRAMS.forEach(renderRun);
    }

    function setOption(program, name, el) {
        ctx.changed = ctx.config.set(program, name, readValue(program, name, el));
        changed();
        if (ctx.tab === program || ctx.tab === 'input') renderTab();
    }

    function setText(field, value) {
        ctx.config.state[field] = value;
    }

    function setLanguage(field, value) {
        ctx.config.state.language[field] = value;
        changed();
    }

    function setAdditional(value) {
        ctx.config.state.additional = value;
        changed();
    }

    function group(program, name) {
        ctx.group[program] = name;
        ctx.changed = [];
        renderTab();
    }

    function reset(program) {
        ctx.config.reset(program);
        ctx.changed = [];
        changed();
        renderTab();
    }

    function clearFormulas() {
        ctx.config.state.assumptions = '';
        ctx.config.state.goals = '';
        renderTab();
    }

    function currentInput() {
        if (!ctx.node) return P9M4.input(ctx.config);
        return ctx.nodeProblem && ctx.nodeProblem.input ? P9M4.header(ctx.config) + '\n' + ctx.nodeProblem.input : null;
    }

    // The lines of `output` from the first that contains `start` to the last that contains `end`.
    function section(output, start, end) {
        const lines = output.split('\n');
        const i = lines.findIndex(l => l.includes(start));
        if (i < 0) return null;
        let j = lines.length - 1;
        while (j > i && !lines[j].includes(end)) j--;
        return lines.slice(i, j + 1).join('\n');
    }

    function summarize(program, run) {
        const out = run.stdout + run.stderr;
        const exit = (out.match(/exit \((\w+)\)/) || [])[1];
        if (run.stopped) return ['Stopped.', 'none'];
        if (run.timedOut) return ['Killed: it went over the time limit.', 'none'];
        if (/Fatal error|%%ERROR/.test(out)) return ['ERROR in the input: see the full output.', 'error'];
        if (program === 'prover9') {
            const proofs = (out.match(/^=+ PROOF =+$/mg) || []).length;
            if (proofs) return [`THEOREM PROVED${proofs > 1 ? ` (${proofs} proofs)` : ''}.`, 'yes'];
            return [`SEARCH FAILED (${exit === 'max_seconds' ? 'time limit' : exit === 'sos_empty' ? 'no clauses left' : exit || 'stopped'}).`, 'no'];
        }
        const models = (out.match(/^interpretation\(/mg) || []).length;
        if (models) {
            const sizes = [...out.matchAll(/^interpretation\(\s*(\d+)/mg)].map(m => m[1]);
            return [`${models} MODEL${models > 1 ? 'S' : ''} FOUND (size ${[...new Set(sizes)].join(', ')}).`, 'yes'];
        }
        return [`NO MODEL (${exit === 'exhausted' ? 'search exhausted' : exit === 'max_seconds' ? 'time limit' : exit || 'stopped'}).`, 'no'];
    }

    function start(program) {
        if (ctx.node) {
            const node = ctx.node;
            if (!node.inputs.every(i => i.link != null)) {
                ctx.runs[program] = { summary: 'Connect the sets A and G to the node.', kind: 'error' };
                renderRun(program);
                return;
            }
            saveNode();
            node.properties.mode = program;
            node.syncWidgets();
            ctx.controllers[program] = { abort() {} };
            renderRun(program);
            node.onPanelRun = (run, input) => finished(program, run, input);
            app.ports.messageReceiver.send(node.generateQuery());
            return;
        }
        const input = P9M4.input(ctx.config);
        if (!ctx.config.state.assumptions.trim() && !ctx.config.state.goals.trim()) {
            ctx.runs[program] = { summary: 'Write some formulas first.', kind: 'error' };
            renderRun(program);
            return;
        }
        const controller = new AbortController();
        ctx.controllers[program] = controller;
        renderRun(program);
        const seconds = ctx.config.get(program, 'max_seconds');
        const myCtx = ctx;
        LogicUSProvers.run(program, [], input, { timeoutMs: seconds > 0 ? (seconds + 15) * 1000 : null, signal: controller.signal })
            .then(run => { if (myCtx === ctx) finished(program, run, input); })
            .catch(e => { if (myCtx === ctx) finished(program, { stdout: '', stderr: String(e.message || e), exitCode: null }, input); });
    }

    function finished(program, run, input) {
        delete ctx.controllers[program];
        const [summary, kind] = summarize(program, run);
        ctx.runs[program] = { run, input, summary, kind };
        renderRun(program);
        const select = document.querySelector(`#p9m4-run-${program} .p9m4-view`);
        select.value = kind === 'yes' ? VIEWS[program][0][0] : 'output';
        show(program);
    }

    function stop(program) {
        if (ctx.node && ctx.node.stopRun) ctx.node.stopRun();
        if (ctx.controllers[program]) ctx.controllers[program].abort();
    }

    // It shows the result of the last run of `program` in the view selected for it.
    async function show(program) {
        const view = document.querySelector(`#p9m4-run-${program} .p9m4-view`).value;
        const label = VIEWS[program].find(([id]) => id === view)[1];
        const last = ctx.runs[program];
        const set = (text, file) => {
            ctx.result = { title: `${NAMES[program]}: ${label}`, text, file };
            renderResult();
        };
        if (!last || !last.run) return set(`Run ${NAMES[program]} first.`, '');
        const output = last.run.stdout + (last.run.stderr ? '\n' + last.run.stderr : '');
        const file = `${program}-${view}.${view === 'xml' ? 'xml' : view === 'input' ? 'in' : 'txt'}`;
        if (view === 'output') return set(output, file);
        if (view === 'input') return set(last.input, file);
        if (view === 'proof') {
            return set(section(output, '============================== PROOF', '============================== end of proof') || 'There is no proof in the output.', file);
        }
        if (program === 'prover9' && !/THEOREM PROVED/.test(output)) return set('There is no proof in the output.', file);
        if (program === 'mace4' && !/interpretation\(/.test(output)) return set('There are no models in the output.', file);
        set('…', file);
        const tool = program === 'prover9' ? 'prooftrans' : 'interpformat';
        try {
            const r = await LogicUSProvers.run(tool, [view], last.run.stdout, { timeoutMs: 30000 });
            set(r.stdout + (r.stderr ? '\n' + r.stderr : ''), file);
        } catch (e) {
            set(`${tool}: ${e.message || e}`, file);
        }
    }

    function download(text, name) {
        saveAs(new Blob([text], { type: 'text/plain;charset=utf-8' }), name);
    }

    function saveResult() {
        if (ctx.result.text) download(ctx.result.text, ctx.result.file || 'result.txt');
    }

    function saveFile() {
        const input = currentInput();
        if (input) download(input, ctx.node ? `node-${ctx.node.id}.in` : 'problem.in');
    }

    function loadFile() {
        const element = document.createElement('input');
        element.type = 'file';
        element.accept = '.in,.txt,text/plain';
        element.onchange = () => {
            const file = element.files[0];
            if (!file) return;
            file.text().then(text => {
                const state = P9M4.parse(text);
                if (ctx.node) {
                    // the formulas of a node come from its sets: take only the options
                    const config = ctx.config;
                    config.state.language = state.language;
                    config.state.additional = state.additional;
                    for (const program of P9M4.PROGRAMS) {
                        config.reset(program);
                        config.ignoreDependencies = true;
                        for (const [name, value] of Object.entries(state[program])) config.set(program, name, value);
                        config.ignoreDependencies = false;
                    }
                    saveNode();
                } else {
                    P9M4_FREE = state;
                    ctx.config = new P9M4.Config(P9M4_FREE);
                }
                render();
            });
        };
        element.click();
    }

    function openAsFree() {
        if (!ctx.nodeProblem || !ctx.nodeProblem.input) return;
        const state = P9M4.parse(P9M4.header(ctx.config) + '\n' + ctx.nodeProblem.input);
        saveNode();
        P9M4_FREE = state;
        open(null);
    }

    async function checkSyntax() {
        const msg = document.getElementById('p9m4-syntax');
        msg.textContent = 'checking…';
        const input = P9M4.input(ctx.config) + '\nassign(max_given, 0). % only read the input\n';
        try {
            const run = await LogicUSProvers.run('prover9', [], input, { timeoutMs: 20000 });
            const out = run.stdout + run.stderr;
            const errors = out.split('\n').filter(l => /%%ERROR|%%START ERROR|Fatal error/.test(l));
            msg.textContent = errors.length ? errors.join('  ') : 'The input is well formed.';
            msg.className = errors.length ? 'p9m4-hint error' : 'p9m4-hint yes';
        } catch (e) {
            msg.textContent = String(e.message || e);
        }
    }

    // called by a node when a run that the panel started has finished
    function nodeFinished(node, run, input) {
        if (ctx && ctx.node === node && node.onPanelRun) {
            const callback = node.onPanelRun;
            node.onPanelRun = null;
            callback(run, input);
        }
    }

    return { open, close, tab, group, setOption, setText, setLanguage, setAdditional, reset, clearFormulas, start,
             stop, show, saveResult, saveFile, loadFile, openAsFree, checkSyntax, nodeFinished, nodeConfig };
})();

function openP9M4PANEL() {
    P9M4Panel.open(null);
}
