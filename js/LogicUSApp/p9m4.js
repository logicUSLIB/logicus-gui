// PROVER9 / MACE4 / E: options, input files and the panel.
//
// A configuration holds the formulas (in the LADR language), the language declarations, the options of Prover9, Mace4
// and E that differ from their defaults, and additional input; the free problem can also be written directly in TPTP
// for E. E receives the formulas translated to TPTP by LADR's ladr_to_tptp (or the TPTP problem), and its options on
// the command line (E_OPTIONS, provers/eoptions.js, generated from E's sources). The options and their dependencies come from
// provers/options.js (LADR_OPTIONS), generated from the LADR sources. As in the classic Prover9-Mace4 GUI, the panel
// applies the dependencies itself (setting hyper_resolution also sets pos_hyper_resolution...) and writes
// set(ignore_option_dependencies) in the input, so the file says exactly what the panel shows.

const P9M4 = (function () {
    const PROGRAMS = ['prover9', 'mace4'];
    const INFINITY = 'infinity';          // a floatparm with no limit (LADR's DBL_LARGE)
    const LARGE = 2147483647;             // how that limit is written in an input file

    function newState() {
        return {
            assumptions: '',
            goals: '',
            language: { prolog_style_variables: false, declarations: '' },
            prover9: { max_seconds: 60 },
            mace4: { max_seconds: 60 },
            eprover: { 'cpu-limit': 60 },
            eprover_extra: '',      // more command-line options for E
            additional: '',
            e_language: 'ladr',     // what E reads in the free problem: the LADR formulas translated, or `tptp`
            tptp: '',               // the problem written directly in TPTP
        };
    }

    function spec(program, name) {
        return LADR_OPTIONS[program].options[name];
    }

    // The default value of an option of E: a flag is on or off (some are on in LogicUS: --auto, --silent,
    // --proof-object), an option with an argument has '' (not given), and cpu-limit is the time limit.
    function eDefault(name) {
        if (name === 'cpu-limit') return -1;
        const o = E_OPTIONS.options[name];
        return o.arg === 'required' ? '' : !!o.on;
    }

    function defaultOf(program, name) {
        return program === 'eprover' ? eDefault(name) : spec(program, name).default;
    }

    // A configuration: a state, plus optional bindings that keep some options somewhere else (the properties of a
    // node), as { program: { name: { get, set } } }.
    class Config {
        constructor(state, bindings = {}, withE = true) {
            this.state = state;
            this.bindings = bindings;
            this.withE = withE;      // whether the input file records the options of E
        }

        get(program, name) {
            const binding = this.bindings[program] && this.bindings[program][name];
            if (binding) return binding.get();
            const values = this.state[program] || (this.state[program] = {});
            return name in values ? values[name] : defaultOf(program, name);
        }

        isDefault(program, name) {
            return this.get(program, name) === defaultOf(program, name);
        }

        // It sets an option and, as LADR would, the options that depend on it. It returns the names of the options
        // changed by dependencies.
        set(program, name, value, changed = [], depth = 0) {
            const binding = this.bindings[program] && this.bindings[program][name];
            if (!this.state[program]) this.state[program] = {};
            if (binding) {
                binding.set(value);
            } else if (value === defaultOf(program, name)) {
                delete this.state[program][name];
            } else {
                this.state[program][name] = value;
            }
            if (program === 'eprover' || depth > 10 || this.ignoreDependencies) return changed;
            for (const dep of LADR_OPTIONS[program].dependencies) {
                if (dep.trigger !== name || (dep.when !== null && dep.when !== value)) continue;
                const target = dep.multiply && typeof value === 'number' ? dep.value * value : dep.value;
                if (this.get(program, dep.target) !== target) {
                    changed.push(dep.target);
                    this.set(program, dep.target, target, changed, depth + 1);
                }
            }
            return changed;
        }

        // All the options of a program back to their defaults, except the time limit and the bound options.
        reset(program) {
            const time = program === 'eprover' ? 'cpu-limit' : 'max_seconds';
            const seconds = (this.state[program] || {})[time];
            this.state[program] = seconds === undefined ? {} : { [time]: seconds };
            if (program === 'eprover') this.state.eprover_extra = '';
        }
    }

    // The command-line options of E for a configuration (the time limit last).
    function eArgs(config) {
        const args = [];
        for (const [name, o] of Object.entries(E_OPTIONS.options)) {
            if (name === 'cpu-limit') continue;
            const v = config.get('eprover', name);
            if (o.arg === 'none') {
                if (v) args.push(`--${name}`);
            } else if (o.arg === 'optional') {
                if (v === true) args.push(`--${name}`);
                else if (typeof v === 'string' && v !== '') args.push(`--${name}=${v}`);
            } else if (v !== '') {
                args.push(`--${name}=${v}`);
            }
        }
        args.push(...(config.state.eprover_extra || '').split(/\s+/).filter(a => a));
        const seconds = config.get('eprover', 'cpu-limit');
        if (seconds > 0) args.push(`--cpu-limit=${seconds}`);
        return args;
    }

    // It reads command-line options of E into a configuration (unknown ones go to the extra options).
    function setEArgs(config, args) {
        for (const [name, o] of Object.entries(E_OPTIONS.options)) {
            if (o.on) config.set('eprover', name, false);   // the line lists every option that is on
        }
        const extra = [];
        for (const arg of args) {
            const m = arg.match(/^--([\w-]+)(?:=(.*))?$/);
            const o = m && E_OPTIONS.options[m[1]];
            if (!o) { extra.push(arg); continue; }
            if (m[1] === 'cpu-limit') config.set('eprover', 'cpu-limit', Number(m[2]));
            else if (o.arg === 'none') config.set('eprover', m[1], true);
            else config.set('eprover', m[1], m[2] === undefined ? (o.arg === 'optional' ? true : '') : m[2]);
        }
        config.state.eprover_extra = extra.join(' ');
    }

    const E_LINE = '% LogicUS E options:';

    function optionCommand(program, name, value) {
        const s = spec(program, name);
        if (s.type === 'flag') return `${value ? 'set' : 'clear'}(${name}).`;
        if (value === INFINITY) value = LARGE;
        return `assign(${name}, ${value}).`;
    }

    // The options of E that differ from the defaults, as a comment line of an input file (LADR or TPTP), or ''.
    function eOptionsLine(config) {
        const line = eArgs(config).join(' ');
        return line && line !== eArgs(new Config(newState())).join(' ') ? `${E_LINE} ${line}` : '';
    }

    // It reads the options of E of an input file, if it has them. It says whether it had them.
    function readEOptions(config, text) {
        const line = text.split('\n').find(l => l.startsWith(E_LINE));
        if (line) setEArgs(config, line.slice(E_LINE.length).trim().split(/\s+/).filter(a => a));
        return !!line;
    }

    // An input file without the line of the options of E.
    function withoutEOptions(text) {
        return text.split('\n').filter(l => !l.startsWith(E_LINE)).join('\n').replace(/^\n+/, '');
    }

    // The options, declarations and additional input of a configuration, as the start of an input file.
    function header(config) {
        const lines = ['% Written by LogicUS (Prover9/Mace4 panel)'];
        // the options of E travel as a comment (only for the free problem and E nodes, see Config.withE)
        const eLine = config.withE ? eOptionsLine(config) : '';
        if (eLine) lines.push(eLine);
        lines.push('', 'set(ignore_option_dependencies). % the options below already include their dependencies');
        const lang = config.state.language;
        if (lang.prolog_style_variables) lines.push('set(prolog_style_variables).');
        if (lang.declarations.trim()) lines.push('', lang.declarations.trim());
        for (const program of PROGRAMS) {
            const commands = Object.keys(LADR_OPTIONS[program].options)
                .filter(name => !config.isDefault(program, name))
                .map(name => '  ' + optionCommand(program, name, config.get(program, name)));
            if (commands.length) {
                lines.push('', `if(${program === 'prover9' ? 'Prover9' : 'Mace4'}). % options for ${program === 'prover9' ? 'Prover9' : 'Mace4'}`,
                           ...commands, 'end_if.');
            }
        }
        if (config.state.additional.trim()) lines.push('', config.state.additional.trim());
        return lines.join('\n') + '\n';
    }

    function formulasSection(name, text) {
        const body = text.trim();
        return `formulas(${name}).\n${body ? body + '\n' : ''}end_of_list.\n`;
    }

    // The whole input file of a configuration (with the formulas of the state).
    function input(config) {
        let text = header(config) + '\n' + formulasSection('assumptions', config.state.assumptions);
        if (config.state.goals.trim()) text += '\n' + formulasSection('goals', config.state.goals);
        return text;
    }

    // The statements of an input file: [text, statement] pairs, where text keeps the original spelling (and the
    // comments in front of the statement).
    function statements(text) {
        const result = [];
        let start = 0, i = 0, inQuote = false;
        while (i < text.length) {
            const c = text[i];
            if (c === '"') inQuote = !inQuote;
            else if (!inQuote && c === '%') {
                const end = text.indexOf('\n', i);
                i = end < 0 ? text.length : end;
                continue;
            } else if (!inQuote && c === '.' && (i + 1 === text.length || /\s/.test(text[i + 1]))) {
                const raw = text.slice(start, i + 1);
                const clean = raw.replace(/%[^\n]*/g, '').trim();
                result.push([raw, clean]);
                start = i + 1;
            }
            i++;
        }
        const rest = text.slice(start);
        if (rest.replace(/%[^\n]*/g, '').trim()) result.push([rest, rest.replace(/%[^\n]*/g, '').trim()]);
        return result;
    }

    function inBlock(block, statement) {
        return block ? `if(${block === 'prover9' ? 'Prover9' : 'Mace4'}). ${statement} end_if.` : statement;
    }

    // It reads an input file into a new state: the formulas, the declarations, the options it recognises (also inside
    // if(Prover9) and if(Mace4)), and everything else as additional input.
    function parse(text) {
        const state = newState();
        state.prover9 = {};
        state.mace4 = {};
        const config = new Config(state);
        const additional = [], declarations = [];
        const lists = { assumptions: [], goals: [] };
        let list = null, block = null, listRaw = null;
        for (const [raw, s] of statements(text)) {
            const compact = s.replace(/\s+/g, '');
            if (list !== null) {
                if (compact === 'end_of_list.') {
                    if (list in lists) lists[list].push(...listRaw);
                    else additional.push(`formulas(${list}).\n${listRaw.join('\n')}\nend_of_list.`);
                    list = null;
                } else {
                    listRaw.push(s);
                }
                continue;
            }
            let m;
            if ((m = compact.match(/^formulas\((\w+)\)\.$/))) {
                list = m[1] === 'sos' ? 'assumptions' : m[1];
                listRaw = [];
            } else if ((m = compact.match(/^if\((Prover9|Mace4)\)\.$/))) {
                block = m[1].toLowerCase();
            } else if (compact === 'end_if.') {
                block = null;
            } else if ((m = compact.match(/^(set|clear)\((\w+)\)\.$/))) {
                const name = m[2], value = m[1] === 'set';
                if (name === 'ignore_option_dependencies') { config.ignoreDependencies = value; continue; }
                if (name === 'prolog_style_variables') { state.language.prolog_style_variables = value; continue; }
                const programs = (block ? [block] : PROGRAMS).filter(p => spec(p, name) && spec(p, name).type === 'flag');
                if (programs.length) programs.forEach(p => config.set(p, name, value));
                else additional.push(inBlock(block, s));
            } else if ((m = compact.match(/^assign\((\w+),(.+)\)\.$/))) {
                const name = m[1];
                const programs = (block ? [block] : PROGRAMS).filter(p => spec(p, name) && spec(p, name).type !== 'flag');
                if (!programs.length) { additional.push(inBlock(block, s)); continue; }
                for (const p of programs) {
                    const t = spec(p, name).type;
                    let value = t === 'stringparm' ? m[2] : Number(m[2]);
                    if (t === 'floatparm' && value >= LARGE) value = INFINITY;
                    config.set(p, name, value);
                }
            } else if (/^(op|redeclare)\(/.test(compact)) {
                declarations.push(s);
            } else {
                additional.push(inBlock(block, s));
            }
        }
        config.ignoreDependencies = false;
        readEOptions(config, text);
        state.assumptions = lists.assumptions.join('\n');
        state.goals = lists.goals.join('\n');
        state.language.declarations = declarations.join('\n');
        state.additional = additional.join('\n');
        return state;
    }

    // E's problem: the input file translated to TPTP by ladr_to_tptp.
    async function tptp(config) {
        const run = await LogicUSProvers.run('ladr_to_tptp', [], input(config), { timeoutMs: 30000 });
        if (!/^\s*(fof|cnf)\(/m.test(run.stdout)) {
            throw new Error('ladr_to_tptp could not translate the formulas:\n' + run.stdout + run.stderr);
        }
        return run.stdout;
    }

    // A TPTP problem as a state (through tptp_to_ladr).
    async function fromTPTP(text) {
        const run = await LogicUSProvers.run('tptp_to_ladr', [], text, { timeoutMs: 30000 });
        if (!/formulas\(/.test(run.stdout)) throw new Error('tptp_to_ladr could not read the problem:\n' + run.stdout + run.stderr);
        return parse(run.stdout);
    }

    function isTPTP(text) {
        return /^\s*(fof|cnf|tff)\(/m.test(text) && !/^\s*formulas\(/m.test(text);
    }

    return { PROGRAMS, INFINITY, newState, spec, Config, header, input, parse, formulasSection, eArgs, eOptionsLine,
             readEOptions, withoutEOptions, tptp, fromTPTP, isTPTP };
})();
