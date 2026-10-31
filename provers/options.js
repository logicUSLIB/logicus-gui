// The options of Prover9 and Mace4 (LADR), with their defaults, ranges, groups and dependencies.
// Generated from the LADR sources by provers/build/options.py: do not edit.
const LADR_OPTIONS = {
 "prover9": {
  "options": {
   "binary_resolution": {
    "type": "flag",
    "default": false
   },
   "neg_binary_resolution": {
    "type": "flag",
    "default": false
   },
   "hyper_resolution": {
    "type": "flag",
    "default": false
   },
   "pos_hyper_resolution": {
    "type": "flag",
    "default": false
   },
   "neg_hyper_resolution": {
    "type": "flag",
    "default": false
   },
   "ur_resolution": {
    "type": "flag",
    "default": false
   },
   "pos_ur_resolution": {
    "type": "flag",
    "default": false
   },
   "neg_ur_resolution": {
    "type": "flag",
    "default": false
   },
   "paramodulation": {
    "type": "flag",
    "default": false
   },
   "eval_rewrite": {
    "type": "flag",
    "default": false
   },
   "ordered_res": {
    "type": "flag",
    "default": true
   },
   "check_res_instances": {
    "type": "flag",
    "default": false
   },
   "ordered_para": {
    "type": "flag",
    "default": true
   },
   "check_para_instances": {
    "type": "flag",
    "default": false
   },
   "para_units_only": {
    "type": "flag",
    "default": false
   },
   "para_from_vars": {
    "type": "flag",
    "default": true
   },
   "para_into_vars": {
    "type": "flag",
    "default": false
   },
   "para_from_small": {
    "type": "flag",
    "default": false
   },
   "basic_paramodulation": {
    "type": "flag",
    "default": false
   },
   "initial_nuclei": {
    "type": "flag",
    "default": false
   },
   "process_initial_sos": {
    "type": "flag",
    "default": true
   },
   "back_demod": {
    "type": "flag",
    "default": true
   },
   "lex_dep_demod": {
    "type": "flag",
    "default": true
   },
   "lex_dep_demod_sane": {
    "type": "flag",
    "default": true
   },
   "safe_unit_conflict": {
    "type": "flag",
    "default": false
   },
   "reuse_denials": {
    "type": "flag",
    "default": false
   },
   "back_subsume": {
    "type": "flag",
    "default": true
   },
   "unit_deletion": {
    "type": "flag",
    "default": false
   },
   "factor": {
    "type": "flag",
    "default": false
   },
   "cac_redundancy": {
    "type": "flag",
    "default": true
   },
   "degrade_hints": {
    "type": "flag",
    "default": true
   },
   "limit_hint_matchers": {
    "type": "flag",
    "default": false
   },
   "back_demod_hints": {
    "type": "flag",
    "default": true
   },
   "collect_hint_labels": {
    "type": "flag",
    "default": false
   },
   "dont_flip_input": {
    "type": "flag",
    "default": false
   },
   "echo_input": {
    "type": "flag",
    "default": true
   },
   "bell": {
    "type": "flag",
    "default": true
   },
   "quiet": {
    "type": "flag",
    "default": false
   },
   "print_initial_clauses": {
    "type": "flag",
    "default": true
   },
   "print_given": {
    "type": "flag",
    "default": true
   },
   "print_gen": {
    "type": "flag",
    "default": false
   },
   "print_kept": {
    "type": "flag",
    "default": false
   },
   "print_labeled": {
    "type": "flag",
    "default": false
   },
   "print_proofs": {
    "type": "flag",
    "default": true
   },
   "print_matched_hints": {
    "type": "flag",
    "default": false
   },
   "print_derivations": {
    "type": "flag",
    "default": false
   },
   "derivations_only": {
    "type": "flag",
    "default": true
   },
   "print_processed_hints": {
    "type": "flag",
    "default": false
   },
   "default_output": {
    "type": "flag",
    "default": true
   },
   "print_clause_properties": {
    "type": "flag",
    "default": false
   },
   "expand_relational_defs": {
    "type": "flag",
    "default": false
   },
   "predicate_elim": {
    "type": "flag",
    "default": true
   },
   "inverse_order": {
    "type": "flag",
    "default": true
   },
   "sort_initial_sos": {
    "type": "flag",
    "default": false
   },
   "restrict_denials": {
    "type": "flag",
    "default": false
   },
   "input_sos_first": {
    "type": "flag",
    "default": true
   },
   "breadth_first": {
    "type": "flag",
    "default": false
   },
   "lightest_first": {
    "type": "flag",
    "default": false
   },
   "random_given": {
    "type": "flag",
    "default": false
   },
   "breadth_first_hints": {
    "type": "flag",
    "default": false
   },
   "default_parts": {
    "type": "flag",
    "default": true
   },
   "auto": {
    "type": "flag",
    "default": true
   },
   "auto_setup": {
    "type": "flag",
    "default": true
   },
   "auto_limits": {
    "type": "flag",
    "default": true
   },
   "auto_denials": {
    "type": "flag",
    "default": true
   },
   "auto_inference": {
    "type": "flag",
    "default": true
   },
   "auto_process": {
    "type": "flag",
    "default": true
   },
   "auto2": {
    "type": "flag",
    "default": false
   },
   "raw": {
    "type": "flag",
    "default": false
   },
   "production": {
    "type": "flag",
    "default": false
   },
   "lex_order_vars": {
    "type": "flag",
    "default": false
   },
   "max_given": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "max_kept": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "max_proofs": {
    "type": "parm",
    "default": 1,
    "min": -1,
    "max": null
   },
   "max_megs": {
    "type": "parm",
    "default": 500,
    "min": -1,
    "max": null
   },
   "max_seconds": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "max_minutes": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "max_hours": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "max_days": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "max_nohints": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "degrade_limit": {
    "type": "parm",
    "default": 0,
    "min": -1,
    "max": null
   },
   "hint_derivations": {
    "type": "parm",
    "default": 0,
    "min": 0,
    "max": null
   },
   "new_constants": {
    "type": "parm",
    "default": 0,
    "min": -1,
    "max": null
   },
   "para_lit_limit": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "ur_nucleus_limit": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "fold_denial_max": {
    "type": "parm",
    "default": 0,
    "min": -1,
    "max": null
   },
   "pick_given_ratio": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "hints_part": {
    "type": "parm",
    "default": null,
    "min": 0,
    "max": null
   },
   "age_part": {
    "type": "parm",
    "default": 1,
    "min": 0,
    "max": null
   },
   "weight_part": {
    "type": "parm",
    "default": 0,
    "min": 0,
    "max": null
   },
   "false_part": {
    "type": "parm",
    "default": 4,
    "min": 0,
    "max": null
   },
   "true_part": {
    "type": "parm",
    "default": 4,
    "min": 0,
    "max": null
   },
   "random_part": {
    "type": "parm",
    "default": 0,
    "min": 0,
    "max": null
   },
   "random_seed": {
    "type": "parm",
    "default": 0,
    "min": -1,
    "max": null
   },
   "eval_limit": {
    "type": "parm",
    "default": 1024,
    "min": -1,
    "max": null
   },
   "eval_var_limit": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "max_depth": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "lex_dep_demod_lim": {
    "type": "parm",
    "default": 11,
    "min": -1,
    "max": null
   },
   "max_literals": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "max_vars": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "demod_step_limit": {
    "type": "parm",
    "default": 1000,
    "min": -1,
    "max": null
   },
   "demod_increase_limit": {
    "type": "parm",
    "default": 1000,
    "min": -1,
    "max": null
   },
   "backsub_check": {
    "type": "parm",
    "default": 500,
    "min": -1,
    "max": null
   },
   "variable_weight": {
    "type": "floatparm",
    "default": 1.0,
    "min": null,
    "max": null
   },
   "constant_weight": {
    "type": "floatparm",
    "default": 1.0,
    "min": null,
    "max": null
   },
   "not_weight": {
    "type": "floatparm",
    "default": 0.0,
    "min": null,
    "max": null
   },
   "or_weight": {
    "type": "floatparm",
    "default": 0.0,
    "min": null,
    "max": null
   },
   "sk_constant_weight": {
    "type": "floatparm",
    "default": 1.0,
    "min": null,
    "max": null
   },
   "prop_atom_weight": {
    "type": "floatparm",
    "default": 1.0,
    "min": null,
    "max": null
   },
   "nest_penalty": {
    "type": "floatparm",
    "default": 0.0,
    "min": 0.0,
    "max": null
   },
   "depth_penalty": {
    "type": "floatparm",
    "default": 0.0,
    "min": null,
    "max": null
   },
   "var_penalty": {
    "type": "floatparm",
    "default": 0.0,
    "min": null,
    "max": null
   },
   "default_weight": {
    "type": "floatparm",
    "default": "infinity",
    "min": null,
    "max": null
   },
   "complexity": {
    "type": "floatparm",
    "default": 0.0,
    "min": null,
    "max": null
   },
   "sos_limit": {
    "type": "parm",
    "default": 20000,
    "min": -1,
    "max": null
   },
   "sos_keep_factor": {
    "type": "parm",
    "default": 3,
    "min": 2,
    "max": 10
   },
   "min_sos_limit": {
    "type": "parm",
    "default": 0,
    "min": 0,
    "max": null
   },
   "lrs_interval": {
    "type": "parm",
    "default": 50,
    "min": 1,
    "max": null
   },
   "lrs_ticks": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "report": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "report_stderr": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "max_weight": {
    "type": "floatparm",
    "default": 100.0,
    "min": null,
    "max": null
   },
   "order": {
    "type": "stringparm",
    "default": "lpo",
    "values": [
     "lpo",
     "rpo",
     "kbo"
    ]
   },
   "eq_defs": {
    "type": "stringparm",
    "default": "unfold",
    "values": [
     "unfold",
     "fold",
     "pass"
    ]
   },
   "literal_selection": {
    "type": "stringparm",
    "default": "max_negative",
    "values": [
     "max_negative",
     "all_negative",
     "none"
    ]
   },
   "stats": {
    "type": "stringparm",
    "default": "lots",
    "values": [
     "lots",
     "some",
     "all",
     "none"
    ]
   },
   "multiple_interps": {
    "type": "stringparm",
    "default": "false_in_all",
    "values": [
     "false_in_all",
     "false_in_some"
    ]
   }
  },
  "groups": [
   {
    "name": "Basic",
    "options": [
     "max_weight",
     "pick_given_ratio",
     "order",
     "eq_defs",
     "expand_relational_defs",
     "restrict_denials"
    ]
   },
   {
    "name": "Meta",
    "options": [
     "auto",
     "auto2",
     "raw",
     "production",
     "auto_setup",
     "auto_limits",
     "auto_denials",
     "auto_inference",
     "auto_process"
    ]
   },
   {
    "name": "Limits",
    "options": [
     "max_given",
     "max_kept",
     "max_proofs",
     "max_megs",
     "max_minutes",
     "max_hours",
     "max_days",
     "max_nohints"
    ]
   },
   {
    "name": "Search prep",
    "options": [
     "process_initial_sos",
     "sort_initial_sos",
     "predicate_elim",
     "inverse_order",
     "dont_flip_input",
     "fold_denial_max",
     "new_constants",
     "lex_order_vars"
    ]
   },
   {
    "name": "Goals and denials",
    "options": [
     "reuse_denials",
     "multiple_interps"
    ]
   },
   {
    "name": "Selection",
    "options": [
     "input_sos_first",
     "breadth_first",
     "lightest_first",
     "random_given",
     "breadth_first_hints",
     "default_parts",
     "hints_part",
     "age_part",
     "weight_part",
     "false_part",
     "true_part",
     "random_part",
     "random_seed"
    ]
   },
   {
    "name": "Inference rules",
    "options": [
     "binary_resolution",
     "neg_binary_resolution",
     "hyper_resolution",
     "pos_hyper_resolution",
     "neg_hyper_resolution",
     "ur_resolution",
     "pos_ur_resolution",
     "neg_ur_resolution",
     "paramodulation",
     "ordered_res",
     "check_res_instances",
     "ordered_para",
     "check_para_instances",
     "para_units_only",
     "para_from_vars",
     "para_into_vars",
     "para_from_small",
     "basic_paramodulation",
     "initial_nuclei",
     "ur_nucleus_limit",
     "para_lit_limit",
     "literal_selection"
    ]
   },
   {
    "name": "Rewriting",
    "options": [
     "back_demod",
     "lex_dep_demod",
     "lex_dep_demod_lim",
     "lex_dep_demod_sane",
     "demod_step_limit",
     "demod_increase_limit",
     "eval_rewrite",
     "eval_limit",
     "eval_var_limit"
    ]
   },
   {
    "name": "Weighting",
    "options": [
     "default_weight",
     "variable_weight",
     "constant_weight",
     "not_weight",
     "or_weight",
     "sk_constant_weight",
     "prop_atom_weight",
     "nest_penalty",
     "depth_penalty",
     "var_penalty",
     "complexity"
    ]
   },
   {
    "name": "Process inferred",
    "options": [
     "safe_unit_conflict",
     "back_subsume",
     "unit_deletion",
     "factor",
     "cac_redundancy",
     "max_literals",
     "max_depth",
     "max_vars",
     "backsub_check",
     "sos_limit",
     "sos_keep_factor",
     "min_sos_limit",
     "lrs_interval",
     "lrs_ticks"
    ]
   },
   {
    "name": "Hints",
    "options": [
     "degrade_hints",
     "limit_hint_matchers",
     "back_demod_hints",
     "collect_hint_labels",
     "degrade_limit",
     "hint_derivations"
    ]
   },
   {
    "name": "Output",
    "options": [
     "echo_input",
     "quiet",
     "print_initial_clauses",
     "print_given",
     "print_gen",
     "print_kept",
     "print_labeled",
     "print_proofs",
     "default_output",
     "print_clause_properties",
     "print_matched_hints",
     "print_derivations",
     "derivations_only",
     "print_processed_hints",
     "stats",
     "report",
     "report_stderr",
     "bell"
    ]
   }
  ],
  "dependencies": [
   {
    "trigger": "max_minutes",
    "when": null,
    "target": "max_seconds",
    "value": 60,
    "multiply": true
   },
   {
    "trigger": "max_hours",
    "when": null,
    "target": "max_seconds",
    "value": 3600,
    "multiply": true
   },
   {
    "trigger": "max_days",
    "when": null,
    "target": "max_seconds",
    "value": 86400,
    "multiply": true
   },
   {
    "trigger": "para_units_only",
    "when": true,
    "target": "para_lit_limit",
    "value": 1
   },
   {
    "trigger": "hyper_resolution",
    "when": true,
    "target": "pos_hyper_resolution",
    "value": true
   },
   {
    "trigger": "hyper_resolution",
    "when": false,
    "target": "pos_hyper_resolution",
    "value": false
   },
   {
    "trigger": "ur_resolution",
    "when": true,
    "target": "pos_ur_resolution",
    "value": true
   },
   {
    "trigger": "ur_resolution",
    "when": true,
    "target": "neg_ur_resolution",
    "value": true
   },
   {
    "trigger": "ur_resolution",
    "when": false,
    "target": "pos_ur_resolution",
    "value": false
   },
   {
    "trigger": "ur_resolution",
    "when": false,
    "target": "neg_ur_resolution",
    "value": false
   },
   {
    "trigger": "lex_dep_demod",
    "when": false,
    "target": "lex_dep_demod_lim",
    "value": 0
   },
   {
    "trigger": "lex_dep_demod",
    "when": true,
    "target": "lex_dep_demod_lim",
    "value": 11
   },
   {
    "trigger": "pick_given_ratio",
    "when": null,
    "target": "age_part",
    "value": 1,
    "multiply": false
   },
   {
    "trigger": "pick_given_ratio",
    "when": null,
    "target": "weight_part",
    "value": 1,
    "multiply": true
   },
   {
    "trigger": "pick_given_ratio",
    "when": null,
    "target": "false_part",
    "value": 0,
    "multiply": false
   },
   {
    "trigger": "pick_given_ratio",
    "when": null,
    "target": "true_part",
    "value": 0,
    "multiply": false
   },
   {
    "trigger": "pick_given_ratio",
    "when": null,
    "target": "random_part",
    "value": 0,
    "multiply": false
   },
   {
    "trigger": "lightest_first",
    "when": true,
    "target": "weight_part",
    "value": 1
   },
   {
    "trigger": "lightest_first",
    "when": true,
    "target": "age_part",
    "value": 0
   },
   {
    "trigger": "lightest_first",
    "when": true,
    "target": "false_part",
    "value": 0
   },
   {
    "trigger": "lightest_first",
    "when": true,
    "target": "true_part",
    "value": 0
   },
   {
    "trigger": "lightest_first",
    "when": true,
    "target": "random_part",
    "value": 0
   },
   {
    "trigger": "lightest_first",
    "when": false,
    "target": "default_parts",
    "value": true
   },
   {
    "trigger": "random_given",
    "when": true,
    "target": "weight_part",
    "value": 0
   },
   {
    "trigger": "random_given",
    "when": true,
    "target": "age_part",
    "value": 0
   },
   {
    "trigger": "random_given",
    "when": true,
    "target": "false_part",
    "value": 0
   },
   {
    "trigger": "random_given",
    "when": true,
    "target": "true_part",
    "value": 0
   },
   {
    "trigger": "random_given",
    "when": true,
    "target": "random_part",
    "value": 1
   },
   {
    "trigger": "random_given",
    "when": false,
    "target": "default_parts",
    "value": true
   },
   {
    "trigger": "breadth_first",
    "when": true,
    "target": "age_part",
    "value": 1
   },
   {
    "trigger": "breadth_first",
    "when": true,
    "target": "weight_part",
    "value": 0
   },
   {
    "trigger": "breadth_first",
    "when": true,
    "target": "false_part",
    "value": 0
   },
   {
    "trigger": "breadth_first",
    "when": true,
    "target": "true_part",
    "value": 0
   },
   {
    "trigger": "breadth_first",
    "when": true,
    "target": "random_part",
    "value": 0
   },
   {
    "trigger": "breadth_first",
    "when": false,
    "target": "default_parts",
    "value": true
   },
   {
    "trigger": "default_parts",
    "when": true,
    "target": "age_part",
    "value": 1
   },
   {
    "trigger": "default_parts",
    "when": true,
    "target": "weight_part",
    "value": 0
   },
   {
    "trigger": "default_parts",
    "when": true,
    "target": "false_part",
    "value": 4
   },
   {
    "trigger": "default_parts",
    "when": true,
    "target": "true_part",
    "value": 4
   },
   {
    "trigger": "default_parts",
    "when": true,
    "target": "random_part",
    "value": 0
   },
   {
    "trigger": "default_parts",
    "when": false,
    "target": "age_part",
    "value": 0
   },
   {
    "trigger": "default_parts",
    "when": false,
    "target": "weight_part",
    "value": 0
   },
   {
    "trigger": "default_parts",
    "when": false,
    "target": "false_part",
    "value": 0
   },
   {
    "trigger": "default_parts",
    "when": false,
    "target": "true_part",
    "value": 0
   },
   {
    "trigger": "default_parts",
    "when": false,
    "target": "random_part",
    "value": 0
   },
   {
    "trigger": "default_output",
    "when": true,
    "target": "quiet",
    "value": false
   },
   {
    "trigger": "default_output",
    "when": true,
    "target": "echo_input",
    "value": true
   },
   {
    "trigger": "default_output",
    "when": true,
    "target": "print_initial_clauses",
    "value": true
   },
   {
    "trigger": "default_output",
    "when": true,
    "target": "print_given",
    "value": true
   },
   {
    "trigger": "default_output",
    "when": true,
    "target": "print_proofs",
    "value": true
   },
   {
    "trigger": "default_output",
    "when": true,
    "target": "print_matched_hints",
    "value": false
   },
   {
    "trigger": "default_output",
    "when": true,
    "target": "print_derivations",
    "value": false
   },
   {
    "trigger": "default_output",
    "when": true,
    "target": "print_processed_hints",
    "value": false
   },
   {
    "trigger": "default_output",
    "when": true,
    "target": "stats",
    "value": "lots"
   },
   {
    "trigger": "default_output",
    "when": true,
    "target": "print_kept",
    "value": false
   },
   {
    "trigger": "default_output",
    "when": true,
    "target": "print_gen",
    "value": false
   },
   {
    "trigger": "auto_setup",
    "when": true,
    "target": "predicate_elim",
    "value": true
   },
   {
    "trigger": "auto_setup",
    "when": true,
    "target": "eq_defs",
    "value": "unfold"
   },
   {
    "trigger": "auto_setup",
    "when": false,
    "target": "predicate_elim",
    "value": false
   },
   {
    "trigger": "auto_setup",
    "when": false,
    "target": "eq_defs",
    "value": "pass"
   },
   {
    "trigger": "auto_limits",
    "when": true,
    "target": "max_weight",
    "value": 100.0
   },
   {
    "trigger": "auto_limits",
    "when": true,
    "target": "sos_limit",
    "value": 20000
   },
   {
    "trigger": "auto_limits",
    "when": false,
    "target": "max_weight",
    "value": "infinity"
   },
   {
    "trigger": "auto_limits",
    "when": false,
    "target": "sos_limit",
    "value": -1
   },
   {
    "trigger": "auto",
    "when": true,
    "target": "auto_inference",
    "value": true
   },
   {
    "trigger": "auto",
    "when": true,
    "target": "auto_setup",
    "value": true
   },
   {
    "trigger": "auto",
    "when": true,
    "target": "auto_limits",
    "value": true
   },
   {
    "trigger": "auto",
    "when": true,
    "target": "auto_denials",
    "value": true
   },
   {
    "trigger": "auto",
    "when": true,
    "target": "auto_process",
    "value": true
   },
   {
    "trigger": "auto",
    "when": false,
    "target": "auto_inference",
    "value": false
   },
   {
    "trigger": "auto",
    "when": false,
    "target": "auto_setup",
    "value": false
   },
   {
    "trigger": "auto",
    "when": false,
    "target": "auto_limits",
    "value": false
   },
   {
    "trigger": "auto",
    "when": false,
    "target": "auto_denials",
    "value": false
   },
   {
    "trigger": "auto",
    "when": false,
    "target": "auto_process",
    "value": false
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "auto",
    "value": true
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "new_constants",
    "value": 1
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "fold_denial_max",
    "value": 3
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "max_weight",
    "value": 200.0
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "nest_penalty",
    "value": 1
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "sk_constant_weight",
    "value": 0
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "prop_atom_weight",
    "value": 5
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "sort_initial_sos",
    "value": true
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "sos_limit",
    "value": -1
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "lrs_ticks",
    "value": 3000
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "max_megs",
    "value": 400
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "stats",
    "value": "some"
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "echo_input",
    "value": false
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "quiet",
    "value": true
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "print_initial_clauses",
    "value": false
   },
   {
    "trigger": "auto2",
    "when": true,
    "target": "print_given",
    "value": false
   },
   {
    "trigger": "raw",
    "when": true,
    "target": "auto",
    "value": false
   },
   {
    "trigger": "raw",
    "when": true,
    "target": "ordered_res",
    "value": false
   },
   {
    "trigger": "raw",
    "when": true,
    "target": "ordered_para",
    "value": false
   },
   {
    "trigger": "raw",
    "when": true,
    "target": "para_into_vars",
    "value": true
   },
   {
    "trigger": "raw",
    "when": true,
    "target": "para_from_small",
    "value": true
   },
   {
    "trigger": "raw",
    "when": true,
    "target": "ordered_para",
    "value": false
   },
   {
    "trigger": "raw",
    "when": true,
    "target": "back_demod",
    "value": false
   },
   {
    "trigger": "raw",
    "when": true,
    "target": "cac_redundancy",
    "value": false
   },
   {
    "trigger": "raw",
    "when": true,
    "target": "backsub_check",
    "value": null
   },
   {
    "trigger": "raw",
    "when": true,
    "target": "lightest_first",
    "value": true
   },
   {
    "trigger": "raw",
    "when": true,
    "target": "literal_selection",
    "value": "none"
   },
   {
    "trigger": "production",
    "when": true,
    "target": "raw",
    "value": true
   },
   {
    "trigger": "production",
    "when": true,
    "target": "eval_rewrite",
    "value": true
   },
   {
    "trigger": "production",
    "when": true,
    "target": "hyper_resolution",
    "value": true
   },
   {
    "trigger": "production",
    "when": true,
    "target": "back_subsume",
    "value": false
   },
   {
    "trigger": "para_units_only",
    "when": false,
    "target": "para_lit_limit",
    "value": -1
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "auto",
    "value": true
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "new_constants",
    "value": 0
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "fold_denial_max",
    "value": 0
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "max_weight",
    "value": 100.0
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "nest_penalty",
    "value": 0.0
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "sk_constant_weight",
    "value": 1.0
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "prop_atom_weight",
    "value": 1.0
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "sort_initial_sos",
    "value": false
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "sos_limit",
    "value": 20000
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "lrs_ticks",
    "value": -1
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "max_megs",
    "value": 500
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "echo_input",
    "value": true
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "quiet",
    "value": false
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "print_initial_clauses",
    "value": true
   },
   {
    "trigger": "auto2",
    "when": false,
    "target": "print_given",
    "value": true
   },
   {
    "trigger": "raw",
    "when": false,
    "target": "auto",
    "value": true
   },
   {
    "trigger": "raw",
    "when": false,
    "target": "ordered_res",
    "value": true
   },
   {
    "trigger": "raw",
    "when": false,
    "target": "ordered_para",
    "value": true
   },
   {
    "trigger": "raw",
    "when": false,
    "target": "para_into_vars",
    "value": false
   },
   {
    "trigger": "raw",
    "when": false,
    "target": "para_from_small",
    "value": false
   },
   {
    "trigger": "raw",
    "when": false,
    "target": "ordered_para",
    "value": true
   },
   {
    "trigger": "raw",
    "when": false,
    "target": "back_demod",
    "value": true
   },
   {
    "trigger": "raw",
    "when": false,
    "target": "cac_redundancy",
    "value": true
   },
   {
    "trigger": "raw",
    "when": false,
    "target": "backsub_check",
    "value": 500
   },
   {
    "trigger": "raw",
    "when": false,
    "target": "lightest_first",
    "value": false
   }
  ]
 },
 "mace4": {
  "options": {
   "domain_size": {
    "type": "parm",
    "default": 0,
    "min": 0,
    "max": null
   },
   "start_size": {
    "type": "parm",
    "default": 2,
    "min": 2,
    "max": null
   },
   "end_size": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "iterate_up_to": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "max_models": {
    "type": "parm",
    "default": 1,
    "min": -1,
    "max": null
   },
   "max_seconds": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "max_seconds_per": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "selection_order": {
    "type": "parm",
    "default": 2,
    "min": 0,
    "max": 2
   },
   "selection_measure": {
    "type": "parm",
    "default": 4,
    "min": 0,
    "max": 4
   },
   "increment": {
    "type": "parm",
    "default": 1,
    "min": 1,
    "max": null
   },
   "max_megs": {
    "type": "parm",
    "default": 500,
    "min": -1,
    "max": null
   },
   "report_stderr": {
    "type": "parm",
    "default": -1,
    "min": -1,
    "max": null
   },
   "print_models": {
    "type": "flag",
    "default": true
   },
   "print_models_tabular": {
    "type": "flag",
    "default": false
   },
   "lnh": {
    "type": "flag",
    "default": true
   },
   "trace": {
    "type": "flag",
    "default": false
   },
   "negprop": {
    "type": "flag",
    "default": true
   },
   "neg_assign": {
    "type": "flag",
    "default": true
   },
   "neg_assign_near": {
    "type": "flag",
    "default": true
   },
   "neg_elim": {
    "type": "flag",
    "default": true
   },
   "neg_elim_near": {
    "type": "flag",
    "default": true
   },
   "verbose": {
    "type": "flag",
    "default": false
   },
   "integer_ring": {
    "type": "flag",
    "default": false
   },
   "order_domain": {
    "type": "flag",
    "default": false
   },
   "arithmetic": {
    "type": "flag",
    "default": false
   },
   "iterate_primes": {
    "type": "flag",
    "default": false
   },
   "iterate_nonprimes": {
    "type": "flag",
    "default": false
   },
   "skolems_last": {
    "type": "flag",
    "default": false
   },
   "return_models": {
    "type": "flag",
    "default": false
   },
   "iterate": {
    "type": "stringparm",
    "default": "all",
    "values": [
     "all",
     "evens",
     "odds",
     "primes",
     "nonprimes"
    ]
   }
  },
  "groups": [
   {
    "name": "Basic",
    "options": [
     "domain_size",
     "start_size",
     "end_size",
     "increment",
     "iterate",
     "iterate_up_to",
     "max_models",
     "max_seconds_per",
     "max_megs"
    ]
   },
   {
    "name": "Experimental",
    "options": [
     "lnh",
     "negprop",
     "neg_assign",
     "neg_assign_near",
     "neg_elim",
     "neg_elim_near",
     "selection_order",
     "selection_measure"
    ]
   },
   {
    "name": "Other",
    "options": [
     "integer_ring",
     "order_domain",
     "arithmetic",
     "skolems_last",
     "iterate_primes",
     "iterate_nonprimes",
     "print_models",
     "print_models_tabular",
     "trace",
     "verbose",
     "return_models",
     "report_stderr"
    ]
   }
  ],
  "dependencies": [
   {
    "trigger": "print_models_tabular",
    "when": true,
    "target": "print_models",
    "value": false
   },
   {
    "trigger": "print_models",
    "when": true,
    "target": "print_models_tabular",
    "value": false
   },
   {
    "trigger": "iterate_primes",
    "when": true,
    "target": "iterate_nonprimes",
    "value": false
   },
   {
    "trigger": "iterate_nonprimes",
    "when": true,
    "target": "iterate_primes",
    "value": false
   },
   {
    "trigger": "domain_size",
    "when": null,
    "target": "start_size",
    "value": 1,
    "multiply": true
   },
   {
    "trigger": "domain_size",
    "when": null,
    "target": "end_size",
    "value": 1,
    "multiply": true
   },
   {
    "trigger": "iterate_up_to",
    "when": null,
    "target": "end_size",
    "value": 1,
    "multiply": true
   },
   {
    "trigger": "iterate_primes",
    "when": true,
    "target": "iterate",
    "value": "primes"
   },
   {
    "trigger": "iterate_nonprimes",
    "when": true,
    "target": "iterate",
    "value": "nonprimes"
   },
   {
    "trigger": "integer_ring",
    "when": true,
    "target": "lnh",
    "value": false
   },
   {
    "trigger": "order_domain",
    "when": true,
    "target": "lnh",
    "value": false
   },
   {
    "trigger": "arithmetic",
    "when": true,
    "target": "lnh",
    "value": false
   },
   {
    "trigger": "arithmetic",
    "when": true,
    "target": "selection_order",
    "value": 0
   }
  ]
 }
};
