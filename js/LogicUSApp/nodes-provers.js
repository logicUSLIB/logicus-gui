// AUTOMATED PROVERS
//
// Nodes that send a FOL problem (assumptions A and goals G) to Prover9, Mace4 or E. The core (Elm) writes the input
// of the prover; the prover runs in the browser (provers/runner.js); for Mace4 the core reads the models back and
// evaluates the formulas in them.

function escapeHTML(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// The lines of `output` from the one that contains `start` to the one that contains `end`.
function proverSection(output, start, end) {
    const lines = output.split("\n");
    const i = lines.findIndex(l => l.includes(start));
    if (i < 0) return null;
    const j = lines.findIndex((l, k) => k > i && l.includes(end));
    return lines.slice(i, j < 0 ? undefined : j + 1).join("\n");
}

// What the run means for the problem A ⊨ G, from the output of each prover.
const PROVER_VERDICTS = {
    prover9(run, node) {
        const out = run.stdout;
        const exit = (out.match(/exit \((\w+)\)/) || [])[1];
        if (/THEOREM PROVED/.test(out)) {
            return { status: "THEOREM PROVED", text: "Prover9 found a proof: G follows from A.",
                     detail: proverSection(out, "============================== PROOF", "============================== end of proof") };
        }
        if (exit === "sos_empty") {
            return { status: "SEARCH FAILED", text: "Prover9 ran out of clauses without finding a proof. This suggests that G does "
                + "not follow from A, but it does not prove it (Prover9 may have discarded clauses): Mace4 can look for a "
                + "counter-model, and E can confirm it by saturation." };
        }
        if (exit === "max_seconds" || run.timedOut) {
            return { status: "TIME LIMIT", text: `No proof found in ${node.properties.seconds} s. This says nothing about the problem: `
                + "try a longer time, or Mace4 to look for a counter-model." };
        }
        return { status: "NO PROOF", text: `Prover9 stopped without a proof (${exit || "exit code " + run.exitCode}).` };
    },
    mace4(run, node) {
        const out = run.stdout;
        const exit = (out.match(/exit \((\w+)\)/) || [])[1];
        if (/interpretation\(/.test(out)) {
            return { status: "MODEL FOUND", models: true,
                     text: node.hasGoals ? "Mace4 found a counter-model: a model of A where G is false. So G does not follow from A."
                                         : "Mace4 found a model of A: the set A is satisfiable." };
        }
        if (exit === "exhausted" || exit === "max_size") {
            return { status: "NO MODEL", text: `Mace4 found no ${node.hasGoals ? "counter-model" : "model"} with at most `
                + `${node.properties.domain} elements. This does not prove that there is none: larger or infinite models may exist.` };
        }
        if (exit === "max_seconds" || run.timedOut) {
            return { status: "TIME LIMIT", text: `No model found in ${node.properties.seconds} s.` };
        }
        return { status: "NO MODEL", text: `Mace4 stopped without a model (${exit || "exit code " + run.exitCode}).` };
    },
    eprover(run, node) {
        const out = run.stdout;
        const szs = (out.match(/SZS status (\w+)/) || [])[1];
        const proof = proverSection(out, "SZS output start", "SZS output end");
        const texts = {
            Theorem: "E found a proof: G follows from A.",
            ContradictoryAxioms: "The assumptions A are contradictory, so G follows from A trivially.",
            Unsatisfiable: "E found a contradiction: the set A is unsatisfiable.",
            CounterSatisfiable: "E saturated the clauses without a contradiction: G does not follow from A.",
            Satisfiable: "E saturated the clauses without a contradiction: the set A is satisfiable.",
            ResourceOut: `No answer in ${node.properties.seconds} s. Try a longer time.`,
            GaveUp: "E gave up: its strategy is not complete for this problem.",
        };
        if (run.timedOut) {
            return { status: "TIME LIMIT", text: texts.ResourceOut };
        }
        return { status: szs || "NO ANSWER", text: texts[szs] || `E stopped without an answer (exit code ${run.exitCode}).`, detail: proof };
    },
};

const ProverNode = {
    // Inputs, widgets and properties shared by the prover nodes. `modes` are the provers the node can call.
    setup(node, modes, language) {
        node.language = language;
        node.addProperty("state", "init");
        node.addProperty("mode", modes[0]);
        node.addProperty("seconds", 10);
        node.addInput("A", "SetFOL");
        node.addInput("G", "SetFOL");
        if (modes.length > 1) {
            node.widget = node.addWidget("combo", "prover", modes[0], "mode", { values: modes });
        }
        node.widget5 = node.addWidget("number", "seconds", 10, "seconds", { min: 1, max: 600, step: 10, precision: 0 });
        node.widget2 = node.addWidget("button", "RUN NODE", "", function () {
            app.ports.messageReceiver.send(node.generateQuery());
        });
        node.widgets.pop();
        node.widget4 = node.addWidget("button", "SHOW RESULT", "", function () {
            openTABLESPANEL();
            displayTable(node.id);
        });
        node.widgets.pop();
        node.widget7 = node.addWidget("button", "DOWNLOAD OUTPUT", "", function () {
            if (node.lastRun) {
                const blob = new Blob([node.lastRun.stdout + (node.lastRun.stderr ? "\n" + node.lastRun.stderr : "")], { type: "text/plain;charset=utf-8" });
                saveAs(blob, `${node.properties.mode}-${node.id}.txt`);
            }
        });
        node.widgets.pop();
        node.widgets_up = true;
        node.color = LGraphCanvas.node_colors.yellow.color;
        node.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
    },

    methods: {
        hideResultWidgets() {
            for (const w of [this.widget4, this.widget7]) {
                const i = this.widgets.indexOf(w);
                if (i > -1) this.widgets.splice(i, 1);
            }
        },

        showResultWidgets() {
            for (const w of [this.widget4, this.widget7]) {
                if (!this.widgets.includes(w)) this.widgets.push(w);
            }
        },

        antecessorChange() {
            this.hideResultWidgets();
            this.setState(this.inputs.every(i => i.link != null) ? "ready" : "edited");
        },

        onConnectionsChange(connection) {
            if (connection == LiteGraph.INPUT) {
                this.antecessorChange();
            }
        },

        onPropertyChanged() {
            this.hideResultWidgets();
            this.setState(this.inputs.every(i => i.link != null) ? "ready" : "edited");
        },

        generateQuery() {
            const source = (k) => {
                const l = graph.links[this.inputs[k].link];
                return JSON.stringify({ origin_id: l.origin_id, origin_slot: l.origin_slot });
            };
            return JSON.stringify({ nodeId: this.id, nodeType: "ProverProblem",
                content: JSON.stringify({ a: source(0), g: source(1), language: this.language }) });
        },

        proverArguments() {
            const s = String(Math.max(1, Math.round(this.properties.seconds)));
            switch (this.properties.mode) {
                case "prover9": return ["-t", s];
                case "mace4": return ["-t", s, "-N", String(Math.max(2, Math.round(this.properties.domain)))];
                default: return ["--auto", "--proof-object", "-s", `--cpu-limit=${s}`];
            }
        },

        processResponse(response) {
            if (response.errorCode != 0) {
                this.fail(response.message);
                return;
            }
            const message = response.message;
            if (message.kind === "problem") {
                this.runProver(message.input);
            } else if (message.kind === "models") {
                this.finish(message.sizes.length > 0
                    ? { status: `MODEL FOUND (size ${message.sizes.join(", ")})` }
                    : {}, message.html);
            }
        },

        runProver(input) {
            const node = this;
            const mode = this.properties.mode;
            this.input = (this.properties.xopts ? this.properties.xopts.trim() + "\n\n" : "") + input;
            this.hasGoals = /formulas\(goals\)|, conjecture,/.test(input);
            this.hideResultWidgets();
            this.boxcolor = "#eb7f1a";
            this.properties["value_"] = "running…";
            graph.setDirtyCanvas(true, true);
            LogicUSProvers.run(mode, this.proverArguments(), this.input, { timeoutMs: (this.properties.seconds + 15) * 1000 })
                .then(run => {
                    node.lastRun = run;
                    node.verdict = PROVER_VERDICTS[mode](run, node);
                    if (node.verdict.models) {
                        // the core reads the models and checks the formulas in them
                        app.ports.messageReceiver.send(JSON.stringify({ nodeId: node.id, nodeType: "Mace4Models",
                            content: JSON.stringify({ output: run.stdout }) }));
                    } else {
                        node.finish({}, node.verdict.detail ? `<pre class="prover-output">${escapeHTML(node.verdict.detail)}</pre>` : "");
                    }
                })
                .catch(e => node.fail(e.message));
        },

        finish(override, detailHTML) {
            const verdict = Object.assign({}, this.verdict, override);
            const names = { prover9: "Prover9", mace4: "Mace4", eprover: "E" };
            const html = `<div class="prover-result">
                <h3>${names[this.properties.mode]}: ${escapeHTML(verdict.status)}</h3>
                <p>${escapeHTML(verdict.text)}</p>
                ${detailHTML || ""}
                <details><summary>Input</summary><pre class="prover-output">${escapeHTML(this.input)}</pre></details>
                <details><summary>Output</summary><pre class="prover-output">${escapeHTML(this.lastRun.stdout + (this.lastRun.stderr ? "\n" + this.lastRun.stderr : ""))}</pre></details>
            </div>`;
            MEMORY['Tables'][this.id] = { type: `${names[this.properties.mode]}: ${verdict.status}`, content: html };
            this.properties["value_"] = `${verdict.status}. ${verdict.text}`;
            if (ERRORS[this.id]) {
                delete ERRORS[this.id];
            }
            this.setState("uptodate");
            this.showResultWidgets();
            this.size = this.computeSize();
            graph.setDirtyCanvas(true, true);
        },

        fail(message) {
            ERRORS[this.id] = message;
            delete MEMORY['Tables'][this.id];
            this.setState("error");
        },
    },
};

function editProverOptions(node) {
    const desc_title = document.getElementById("desc-node_title");
    const desc_content = document.getElementById("desc-content");
    desc_title.innerHTML = "Prover9/Mace4 options";
    desc_content.innerHTML = "<p>LADR commands added at the start of the input, e.g. <code>assign(max_weight, 40).</code> "
        + "or <code>assign(max_models, 3).</code></p>";
    const ta = document.createElement("textarea");
    ta.value = node.properties.xopts;
    const ok = document.createElement("button");
    ok.innerHTML = "OK";
    ok.className = "btOK";
    ok.onclick = function () {
        node.properties.xopts = ta.value;
        node.onPropertyChanged();
        node.onDeselected();
    };
    const cancel = document.createElement("button");
    cancel.innerHTML = "CANCEL";
    cancel.className = "btCANCEL";
    cancel.onclick = function () { node.onDeselected(); };
    desc_title.appendChild(ok);
    desc_title.appendChild(cancel);
    desc_content.appendChild(ta);
    ta.focus();
}

// Prover9 / Mace4

function Prover9Mace4() {
    const that = this;
    ProverNode.setup(this, ["prover9", "mace4"], "ladr");
    this.addProperty("domain", 10);
    this.addProperty("xopts", "");
    this.widget6 = this.addWidget("number", "max size", 10, "domain", { min: 2, max: 100, step: 10, precision: 0 });
    this.widget3 = this.addWidget("button", "OPTIONS", "", function () { editProverOptions(that); });
    // keep RUN NODE (pushed by setState) below the options
    this.size = this.computeSize();
    this.title = "Prover9Mace4";
    this.desc = `Prover9 searches for a proof that the goals G follow from the assumptions A; Mace4 searches for a finite
    counter-model: a model of A where G is false (<a href='https://www.cs.unm.edu/~mccune/prover9/' target='_blank'>Prover9 and Mace4</a>, by William McCune).
    <br><br>The goals are proved together (their conjunction). With an empty set of goals, Prover9 looks for a
    contradiction in A and Mace4 for a model of A.
    <br><br><i>seconds</i> limits the search; <i>max size</i> is the largest universe that Mace4 tries (it starts at 2).
    The programs run in your browser.`;
}
Object.assign(Prover9Mace4.prototype, ProverNode.methods);

// E

function EProver() {
    ProverNode.setup(this, ["eprover"], "tptp");
    this.size = this.computeSize();
    this.title = "EProver";
    this.desc = `<a href='https://eprover.org' target='_blank'>E</a> (by Stephan Schulz) is a saturation prover for
    first-order logic with equality. The sets are translated to the TPTP language, with the conjunction of G as the
    conjecture. E answers with an SZS status: <i>Theorem</i> (G follows from A), <i>CounterSatisfiable</i> (it does
    not), <i>ResourceOut</i> (no answer within the time limit)...
    <br><br>The program runs in your browser.`;
}
Object.assign(EProver.prototype, ProverNode.methods);
