"""Write provers/eoptions.js: the command-line options of E, with their descriptions, read from E's sources.

E_OPTIONS lists every option of PROVER/e_options.h (name, short name, argument, default argument, description) and
the groups shown in the E OPTIONS tab of the PROVER9/MACE4 panel. Options not in a group can still be given in the
panel as extra command-line options.

Usage: python3 provers/build/eoptions.py <E source directory>
"""
import json
import pathlib
import re
import sys

E = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(__file__).resolve().parent.parent / "eoptions.js"

# Options that LogicUS gives by default (the user can turn them off).
DEFAULT_ON = ["auto", "silent", "proof-object"]

GROUPS = [
    ("Basic", ["auto", "proof-object", "print-saturated", "silent", "output-level", "print-statistics",
               "answers", "conjectures-are-questions"]),
    ("Limits", ["soft-cpu-limit", "processed-clauses-limit", "processed-set-limit", "unprocessed-limit",
                "total-clause-set-limit", "generated-limit", "tb-insert-limit"]),
    ("Preprocessing", ["no-preprocessing", "definitional-cnf", "sine", "split-clauses", "free-numbers",
                       "eq-unfold-limit", "no-eq-unfolding", "prefer-initial-clauses"]),
    ("Search (without --auto)", ["term-ordering", "order-weight-generation", "order-precedence-generation",
                                 "literal-selection-strategy", "expert-heuristic", "delete-bad-limit",
                                 "simul-paramod", "destructive-er", "forward-context-sr", "strong-rw-inst",
                                 "restrict-literal-comparisons"]),
]

# Run by the panel (time limit field) or meaningless in the browser (files, processes, memory).
HIDDEN = {"help", "version", "output-file", "cpu-limit", "memory-limit", "auto-schedule", "satauto-schedule",
          "serialize-schedule", "print-pid", "resources-info", "print-version", "training-examples", "pcl-terms-compressed"}


def c_strings(text):
    return "".join(re.findall(r'"((?:[^"\\]|\\.)*)"', text)).replace('\\"', '"').replace("\\n", " ")


# string macros used as default arguments (e.g. DEFAULT_OUTPUT_DESCRIPTOR)
macros = {}
for header in E.glob("*/*.h"):
    for m in re.finditer(r'#define\s+(\w+)\s+"([^"]*)"', header.read_text(errors="replace")):
        macros[m.group(1)] = m.group(2)

source = (E / "PROVER" / "e_options.h").read_text(errors="replace")
table = source[source.index("OptCell opts[]"):]
options = {}
for m in re.finditer(r"\{\s*(OPT_\w+)\s*,\s*'((?:\\.|[^'])*)'\s*,\s*\"([^\"]*)\"\s*,\s*(NoArg|OptArg|ReqArg)\s*,\s*(NULL|\"[^\"]*\"|\w+)\s*,(.*?)\}\s*,",
                     table, re.S):
    code, short, name, arg, default, desc = m.groups()
    if code == "OPT_NOOPT" or not name:
        continue
    options[name] = {
        "short": "" if short in ("\\0", "") else short,
        "arg": {"NoArg": "none", "OptArg": "optional", "ReqArg": "required"}[arg],
        "default": None if default == "NULL" else macros.get(default, default.strip('"')),
        "description": re.sub(r"\s+", " ", c_strings(desc)).strip(),
        "on": name in DEFAULT_ON,
    }

listed = [n for _, names in GROUPS for n in names]
missing = [n for n in listed if n not in options]
assert not missing, f"unknown E options {missing}"
catalog = {"options": options, "groups": [{"name": g, "options": names} for g, names in GROUPS],
           "hidden": sorted(HIDDEN & set(options))}
OUT.write_text(
    "// The command-line options of E, with their descriptions, and the groups of the E OPTIONS tab.\n"
    "// Generated from the E sources by provers/build/eoptions.py: do not edit.\n"
    "const E_OPTIONS = " + json.dumps(catalog, indent=1, ensure_ascii=False) + ";\n"
)
print(f"eoptions.js: {len(options)} E options, {len(listed)} in the tabs")
