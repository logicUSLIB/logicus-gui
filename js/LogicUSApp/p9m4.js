// PROVER9 / MACE4: options, input files and the panel.
//
// A configuration holds the formulas (in the LADR language), the language declarations, the options of Prover9 and of
// Mace4 that differ from their defaults, and additional input. The options and their dependencies come from
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
            additional: '',
        };
    }

    function spec(program, name) {
        return LADR_OPTIONS[program].options[name];
    }

    // A configuration: a state, plus optional bindings that keep some options somewhere else (the properties of a
    // node), as { program: { name: { get, set } } }.
    class Config {
        constructor(state, bindings = {}) {
            this.state = state;
            this.bindings = bindings;
        }

        get(program, name) {
            const binding = this.bindings[program] && this.bindings[program][name];
            if (binding) return binding.get();
            const values = this.state[program];
            return name in values ? values[name] : spec(program, name).default;
        }

        isDefault(program, name) {
            return this.get(program, name) === spec(program, name).default;
        }

        // It sets an option and, as LADR would, the options that depend on it. It returns the names of the options
        // changed by dependencies.
        set(program, name, value, changed = [], depth = 0) {
            const binding = this.bindings[program] && this.bindings[program][name];
            if (binding) {
                binding.set(value);
            } else if (value === spec(program, name).default) {
                delete this.state[program][name];
            } else {
                this.state[program][name] = value;
            }
            if (depth > 10 || this.ignoreDependencies) return changed;
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
            const seconds = this.state[program].max_seconds;
            this.state[program] = seconds === undefined ? {} : { max_seconds: seconds };
        }
    }

    function optionCommand(program, name, value) {
        const s = spec(program, name);
        if (s.type === 'flag') return `${value ? 'set' : 'clear'}(${name}).`;
        if (value === INFINITY) value = LARGE;
        return `assign(${name}, ${value}).`;
    }

    // The options, declarations and additional input of a configuration, as the start of an input file.
    function header(config) {
        const lines = ['% Written by LogicUS (Prover9/Mace4 panel)', '',
                       'set(ignore_option_dependencies). % the options below already include their dependencies'];
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
        state.assumptions = lists.assumptions.join('\n');
        state.goals = lists.goals.join('\n');
        state.language.declarations = declarations.join('\n');
        state.additional = additional.join('\n');
        return state;
    }

    return { PROGRAMS, INFINITY, newState, spec, Config, header, input, parse, formulasSection };
})();
