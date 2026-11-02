# LogicUS GUI

LogicUS is a visual environment for learning and practising propositional and first-order logic, developed at the
Department of Computer Science and Artificial Intelligence of the University of Seville. Formulas, sets, clauses and
the algorithms that work on them (normal forms, truth tables, semantic tableaux, resolution, DPLL, Herbrand models...)
are nodes of a graph: students build a *schema*, run it, and look at every intermediate result.

![A propositional schema: from formulas to clauses, refuted with resolution and DPLL](docs/screenshot-schema.jpg)

The algorithms are those of the Elm packages [logicus-pl](https://package.elm-lang.org/packages/logicUSLIB/logicus-pl/latest/)
and [logicus-fol](https://package.elm-lang.org/packages/logicUSLIB/logicus-fol/latest/), written to show how each step
is done. For problems too large for them, LogicUS also runs the automated provers Prover9, Mace4 and E, compiled to
WebAssembly so that they run in the browser: Mace4 counter-models are shown as tables, with the value of every
formula in them.

![A counter-model found by Mace4: a non-commutative group where x·x·x·x = e](docs/screenshot-mace4.jpg)

The **PROVER9/MACE4** panel is a workbench in the spirit of the classic Prover9-Mace4 GUI, with E as another prover:
the user chooses Prover9 and Mace4, or E, and the panel shows only the tabs and options of that choice (the formulas
are kept when it changes). Prover9 and Mace4 read formulas in the LADR language, with all their options (and their
dependencies), and the proofs and models can be shown in the formats of prooftrans and interpformat. E reads the LADR
formulas translated to TPTP, or a problem written directly in TPTP (checked with `eprover --syntax-only`), with the
main options of E (and the descriptions of `eprover --help`). Input files can be saved and loaded (LADR, or TPTP
problems). Opened from a `Prover9Mace4` or `EProver` node (its OPTIONS button), it sets the options of that node.

The **DEDUCTION** panel checks proofs in the style of Fitch (natural deduction, or an axiomatic system), propositional
or first order, with the rules that each exercise allows: in EDIT they are chosen from the systems of the libraries
(LogicUS.PL.Deduction and LogicUS.FOL.Deduction), switched off one by one or written as schemas
(`rule →I : [A] B ⊢ A → B`), and they are read when they are saved; a propositional rule that is not valid is marked
with a counterexample. The rules of the exercise are shown with their schemas, and a click on one adds a line with
it to the proof, to be completed. Each wrong line says why, and the panel gives the rules that can be used at the end of the proof (from the
lines, closing the current subproof, or towards the goal), and adds the suggested line. Exercises can be saved and
loaded as files.

## Using it

LogicUS is a static web page: nothing is installed and nothing is sent to a server. Download this folder and open
`LogicUS.html` in a recent browser. It can also be served by any web server, as
GitHub Pages does.

Press the logo at the bottom right to show the menu. **EXAMPLES** opens ready-made schemas; drag nodes from the
right-click menu of the canvas (*Add Node*), connect them, and press **RUN NODE** on a node or **RUN SCHEMA** for all of them.
The panels show the tables and graphs produced by the nodes. **SAVE SCHEMA** and **LOAD SCHEMA** keep schemas as
JSON files.

| Group | Nodes |
|-------|-------|
| `LogicUS-PL` | formulas, sets, connectives, transformations and normal forms, clauses, Horn knowledge bases (forward and backward chaining), truth tables, semantic tableaux, resolution (several strategies), DPLL |
| `LogicUS-FOL` | formulas, sets, connectives and quantifiers, transformations (closures, prenex, Skolem, NNF, CNF, DNF), clauses, Herbrand universe, base, interpretations, models and extensions, semantic tableaux (ground, with equality, and with free variables and unification), resolution |
| `LogicUS-EXT` | propositional constraint satisfaction problems (to DIMACS and a SAT solver), variable forgetting, Prover9/Mace4 and E |

## Development

```
LogicUS.html            the page
js/LogicUSApp/          the nodes (LiteGraph) and the panels (p9m4.js and p9m4-panel.js: the PROVER9/MACE4 panel;
                        deduction-panel.js: the DEDUCTION panel)
js/LogicUSApp/AppCore.js  the Elm core, built from logicus-app-core/
logicus-app-core/       Elm application: runs the algorithms of logicus-pl and logicus-fol for the nodes
provers/                Prover9, Mace4, prooftrans, interpformat and E in WebAssembly, the options of Prover9
                        and Mace4, and how to rebuild them (see provers/README.md)
examples/               example schemas, listed in examples/index.json for the EXAMPLES panel
tests/                  browser tests
```

The JavaScript side sends each node's request to the Elm core through a port and draws the answer.
`AppCore.js` is committed so that the page runs without a build step; after changing the Elm code, rebuild it with
[Elm 0.19.1](https://github.com/elm/compiler/releases/tag/0.19.1):

```sh
scripts/build-core.sh
```

The examples panel reads `examples/examples.js`, which bundles the example schemas so that the panel also works from
a local file. After adding or changing an example (and its entry in `examples/index.json`), regenerate it:

```sh
python3 scripts/build-examples.py
```

The browser tests use [Playwright](https://playwright.dev):

```sh
npm install
npx playwright install
npm test
```

GitHub Actions checks that the generated files (`AppCore.js`, `examples/examples.js`, the provers) match their
sources, runs the tests in Chromium, Firefox and WebKit, and
publishes the page on GitHub Pages (enable it in *Settings → Pages → Source: GitHub Actions*).

## Third-party components

| Component | Use | License |
|-----------|-----|---------|
| [LiteGraph.js](https://github.com/jagenjo/litegraph.js) | node graph editor | MIT |
| [MathJax](https://www.mathjax.org) 3.2.2 | formulas | Apache-2.0 |
| [D3](https://d3js.org) v3, [dagre-d3](https://github.com/dagrejs/dagre-d3), [graphlib-dot](https://github.com/dagrejs/graphlib-dot) | trees and graphs | BSD-3-Clause, MIT, MIT |
| [jQuery](https://jquery.com) 3.6.0 | | MIT |
| [FileSaver.js](https://github.com/eligrey/FileSaver.js) | downloads | MIT |
| sat.js | SAT solver of the CSP nodes | GPL-3.0-or-later |
| [Prover9 and Mace4](https://www.cs.unm.edu/~mccune/prover9/) (LADR) | provers, run as separate programs | GPL-2.0 |
| [E](https://eprover.org) | prover, run as a separate program | GPL-2.0-or-later |

## Credits

LogicUS is developed by the research group TIC-137 with the Department of Computer Science and Artificial
Intelligence of the University of Seville, supported by the Spanish State Research Agency (Agencia Estatal de
Investigación), project PID2019-109152GB-I00/AEI/10.13039/501100011033. Official site:
<https://logicus-es.github.io/>.
