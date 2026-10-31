"""Write provers/options.js: the options of Prover9 and Mace4, read from the LADR sources.

For each program it lists every flag and parameter (type, default, range or values), groups them for the option
tabs of the PROVER9/MACE4 panel, and lists the dependencies between options (setting `hyper_resolution` also sets
`pos_hyper_resolution`, ...). The panel applies the dependencies itself and writes `set(ignore_option_dependencies)`
in the input, as the classic Prover9-Mace4 GUI does.

Usage: python3 provers/build/options.py <LADR source directory>
"""
import json
import pathlib
import re
import sys

LADR = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(__file__).resolve().parent.parent / "options.js"

# Tabs of the panel. Options not listed here go to "Other".
GROUPS = {
    "prover9": [
        ("Basic", ["max_weight", "pick_given_ratio", "order", "eq_defs", "expand_relational_defs", "restrict_denials"]),
        ("Meta", ["auto", "auto2", "raw", "production", "auto_setup", "auto_limits", "auto_denials", "auto_inference",
                  "auto_process"]),
        ("Limits", ["max_given", "max_kept", "max_proofs", "max_megs", "max_minutes", "max_hours", "max_days",
                    "max_nohints"]),
        ("Search prep", ["process_initial_sos", "sort_initial_sos", "predicate_elim", "inverse_order",
                         "dont_flip_input", "fold_denial_max", "new_constants", "lex_order_vars"]),
        ("Goals and denials", ["reuse_denials", "multiple_interps"]),
        ("Selection", ["input_sos_first", "breadth_first", "lightest_first", "random_given", "breadth_first_hints",
                       "default_parts", "hints_part", "age_part", "weight_part", "false_part", "true_part",
                       "random_part", "random_seed"]),
        ("Inference rules", ["binary_resolution", "neg_binary_resolution", "hyper_resolution", "pos_hyper_resolution",
                             "neg_hyper_resolution", "ur_resolution", "pos_ur_resolution", "neg_ur_resolution",
                             "paramodulation", "ordered_res", "check_res_instances", "ordered_para",
                             "check_para_instances", "para_units_only", "para_from_vars", "para_into_vars",
                             "para_from_small", "basic_paramodulation", "initial_nuclei", "ur_nucleus_limit",
                             "para_lit_limit", "literal_selection"]),
        ("Rewriting", ["back_demod", "lex_dep_demod", "lex_dep_demod_lim", "lex_dep_demod_sane", "demod_step_limit",
                       "demod_increase_limit", "eval_rewrite", "eval_limit", "eval_var_limit"]),
        ("Weighting", ["default_weight", "variable_weight", "constant_weight", "not_weight", "or_weight",
                       "sk_constant_weight", "prop_atom_weight", "nest_penalty", "depth_penalty", "var_penalty",
                       "complexity"]),
        ("Process inferred", ["safe_unit_conflict", "back_subsume", "unit_deletion", "factor", "cac_redundancy",
                              "max_literals", "max_depth", "max_vars", "backsub_check", "sos_limit",
                              "sos_keep_factor", "min_sos_limit", "lrs_interval", "lrs_ticks"]),
        ("Hints", ["degrade_hints", "limit_hint_matchers", "back_demod_hints", "collect_hint_labels", "degrade_limit",
                   "hint_derivations"]),
        ("Output", ["echo_input", "quiet", "print_initial_clauses", "print_given", "print_gen", "print_kept",
                    "print_labeled", "print_proofs", "default_output", "print_clause_properties",
                    "print_matched_hints", "print_derivations", "derivations_only", "print_processed_hints", "stats",
                    "report", "report_stderr", "bell"]),
    ],
    "mace4": [
        ("Basic", ["domain_size", "start_size", "end_size", "increment", "iterate", "iterate_up_to", "max_models",
                   "max_seconds_per", "max_megs"]),
        ("Experimental", ["lnh", "negprop", "neg_assign", "neg_assign_near", "neg_elim", "neg_elim_near",
                          "selection_order", "selection_measure"]),
        ("Other", ["integer_ring", "order_domain", "arithmetic", "skolems_last", "iterate_primes", "iterate_nonprimes",
                   "print_models", "print_models_tabular", "trace", "verbose", "return_models", "report_stderr"]),
    ],
}

# Run by the panel (time limit field), not shown in the tabs.
HIDDEN = {"max_seconds"}


def number(text):
    text = text.strip()
    if text in ("INT_MAX", "DBL_LARGE"):
        return None   # no upper bound
    if text in ("-DBL_LARGE",):
        return None
    if text in ("TRUE", "FALSE"):
        return text == "TRUE"
    return float(text) if "." in text else int(text)


def read_options(source):
    """The options declared in a C file, and the map from C field (p->x) to option name."""
    code = re.sub(r"/\*.*?\*/", "", source.read_text(), flags=re.S)
    code = re.sub(r"//[^\n]*", "", code)
    options, fields = {}, {}
    for m in re.finditer(r"(\w+->\w+|\w+)\s*=\s*init_(flag|parm|floatparm|stringparm)\s*\(([^;]*)\);", code):
        field, kind, args = m.group(1), m.group(2), m.group(3)
        parts = [a.strip() for a in re.split(r",(?![^\"]*\"\s*\))", args)]
        name = parts[0].strip('"')
        if kind == "flag":
            options[name] = {"type": "flag", "default": number(parts[1])}
        elif kind in ("parm", "floatparm"):
            default = number(parts[1]) if parts[1] != "DBL_LARGE" else None
            options[name] = {"type": kind, "default": default, "min": number(parts[2]), "max": number(parts[3])}
            if kind == "floatparm" and default is None:
                options[name]["default"] = "infinity"
        else:
            values = [p.strip().strip('"') for p in parts[2:]]
            options[name] = {"type": "stringparm", "default": values[0], "values": values}
        fields[field.split("->")[-1]] = name
    return code, options, fields


def read_dependencies(code, fields):
    def name(field):
        return fields[field.strip().split("->")[-1]]

    def value(text):
        text = text.strip().strip('"')
        if text == "DBL_LARGE":
            return "infinity"
        try:
            return number(text)
        except ValueError:
            return text

    deps = []
    for m in re.finditer(r"(flag_flag|flag_parm|flag_floatparm|flag_stringparm|parm_parm|parm_flag)_dependency\s*\(([^;]*)\);", code):
        kind, args = m.group(1), [a.strip() for a in m.group(2).split(",")]
        if kind.startswith("flag_"):
            deps.append({"trigger": name(args[0]), "when": number(args[1]), "target": name(args[2]), "value": value(args[3])})
        elif kind == "parm_parm":
            deps.append({"trigger": name(args[0]), "when": None, "target": name(args[1]), "value": value(args[2]),
                         "multiply": number(args[3])})
        else:
            deps.append({"trigger": name(args[0]), "when": None, "target": name(args[1]), "value": number(args[2])})
    for m in re.finditer(r"flag_(parm|flag|floatparm)_dep_default\s*\(([^;]*)\);", code):
        args = [a.strip() for a in m.group(2).split(",")]
        deps.append({"trigger": name(args[0]), "when": number(args[1]), "target": name(args[2]), "value": "default"})
    return deps


catalog = {}
for program, source in [("prover9", LADR / "provers.src" / "search.c"), ("mace4", LADR / "mace4.src" / "msearch.c")]:
    code, options, fields = read_options(source)
    deps = read_dependencies(code, fields)
    for d in deps:
        if d["value"] == "default":
            d["value"] = options[d["target"]]["default"]
    listed = [n for _, names in GROUPS[program] for n in names]
    missing = [n for n in listed if n not in options]
    assert not missing, f"{program}: unknown options {missing}"
    others = [n for n in options if n not in listed and n not in HIDDEN]
    groups = [{"name": g, "options": names} for g, names in GROUPS[program]]
    if others:
        if groups[-1]["name"] == "Other":
            groups[-1]["options"] += others
        else:
            groups.append({"name": "Other", "options": others})
    catalog[program] = {"options": options, "groups": groups, "dependencies": deps}

OUT.write_text(
    "// The options of Prover9 and Mace4 (LADR), with their defaults, ranges, groups and dependencies.\n"
    "// Generated from the LADR sources by provers/build/options.py: do not edit.\n"
    "const LADR_OPTIONS = " + json.dumps(catalog, indent=1) + ";\n"
)
print(f"options.js: {len(catalog['prover9']['options'])} Prover9 options, {len(catalog['mace4']['options'])} Mace4 options, "
      f"{len(catalog['prover9']['dependencies']) + len(catalog['mace4']['dependencies'])} dependencies")
