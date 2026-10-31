// ACTIVATION OF NODES



// PL

LiteGraph.registerNodeType("LogicUS-PL/FormulaPL/FormulaPL", FormulaPL);
LiteGraph.registerNodeType("LogicUS-PL/FormulaPL/ConnectivePL", ConnectivePL);
LiteGraph.registerNodeType("LogicUS-PL/FormulaPL/TransformFPL", TransformFPL);

LiteGraph.registerNodeType("LogicUS-PL/SetPL/SetPL", SetPL);
LiteGraph.registerNodeType("LogicUS-PL/SetPL/TransformSetPL", TransformSetPL);

LiteGraph.registerNodeType("LogicUS-PL/ClausesPL/ClausePL", ClausePL);
LiteGraph.registerNodeType("LogicUS-PL/ClausesPL/ClauseSetPL", ClauseSetPL);

LiteGraph.registerNodeType("LogicUS-PL/HornRS/HornFactPL", HornFactPL);
LiteGraph.registerNodeType("LogicUS-PL/HornRS/HornFactSetPL", HornFactSetPL);
LiteGraph.registerNodeType("LogicUS-PL/HornRS/HornRulePL", HornRulePL);
LiteGraph.registerNodeType("LogicUS-PL/HornRS/HornRuleSetPL", HornRuleSetPL);
LiteGraph.registerNodeType("LogicUS-PL/Algorithms/HornRS/HornFwChPL", HornFwChPL); 
LiteGraph.registerNodeType("LogicUS-PL/Algorithms/HornRS/HornBWCh", HornBWCh); 

LiteGraph.registerNodeType("LogicUS-PL/Algorithms/TruthTablePL", TruthTablePL);
LiteGraph.registerNodeType("LogicUS-PL/Algorithms/SemanticTableauPL", SemanticTableauPL);
LiteGraph.registerNodeType("LogicUS-PL/Algorithms/DPLL", DPLLGraphPL);
LiteGraph.registerNodeType("LogicUS-PL/Algorithms/Resolution/ResolutionPL", ResolutionPL); 
LiteGraph.registerNodeType("LogicUS-PL/Algorithms/Resolution/ResolutionGraphPL", ResolutionGraphPL);


// FOL

LiteGraph.registerNodeType("LogicUS-FOL/FormulaFOL/FormulaFOL", FormulaFOL);
LiteGraph.registerNodeType("LogicUS-FOL/FormulaFOL/ConnectiveFOL", ConnectiveFOL);
LiteGraph.registerNodeType("LogicUS-FOL/FormulaFOL/QuantifierFOL", QuantifierFOL);
LiteGraph.registerNodeType("LogicUS-FOL/FormulaFOL/TransformFFOL", TransformFFOL);

LiteGraph.registerNodeType("LogicUS-FOL/SetFOL/SetFOL", SetFOL);
LiteGraph.registerNodeType("LogicUS-FOL/SetFOL/TransformSetFOL", TransformSetFOL);

LiteGraph.registerNodeType("LogicUS-FOL/ClausesFOL/ClauseFOL", ClauseFOL);
LiteGraph.registerNodeType("LogicUS-FOL/ClausesFOL/ClauseSetFOL", ClauseSetFOL);

LiteGraph.registerNodeType("LogicUS-FOL/HerbrandFOL/HerbrandUniverseFOL", HerbrandUniverseFOL);
LiteGraph.registerNodeType("LogicUS-FOL/HerbrandFOL/HerbrandBaseFOL", HerbrandBaseFOL);
LiteGraph.registerNodeType("LogicUS-FOL/HerbrandFOL/HerbrandInterpretationsFOL", HerbrandInterpretationsFOL);
LiteGraph.registerNodeType("LogicUS-FOL/HerbrandFOL/HerbrandModelsFOL", HerbrandModelsFOL);
LiteGraph.registerNodeType("LogicUS-FOL/HerbrandFOL/HerbrandExtensionFOL", HerbrandExtensionFOL);

LiteGraph.registerNodeType("LogicUS-FOL/Algorithms/SemanticTableauFOL", SemanticTableauFOL);
LiteGraph.registerNodeType("LogicUS-FOL/Algorithms/Resolution/ResolutionGraphFOL", ResolutionGraphFOL);

// EXTENSIONS

LiteGraph.registerNodeType("LogicUS-EXT/CSP/CSPPL", CSPPL);
LiteGraph.registerNodeType("LogicUS-EXT/CSP/CSPPLtoDIMACS", CSPPPLtoDIMACS);
LiteGraph.registerNodeType("LogicUS-EXT/CSP/SolveDIMACS", SolveDIMACS);
LiteGraph.registerNodeType("LogicUS-EXT/Forgetting/ForeignVarsFPL", ForeignVarsFPL);
LiteGraph.registerNodeType("LogicUS-EXT/Forgetting/ForeignVarsSPL", ForeignVarsSPL);
LiteGraph.registerNodeType("LogicUS-EXT/Forgetting/ConservativeRetractFPL", ConservativeRetractFPL);
LiteGraph.registerNodeType("LogicUS-EXT/Forgetting/ConservativeRetractSPL", ConservativeRetractSPL);
LiteGraph.registerNodeType("LogicUS-EXT/Solvers/Prover9Mace4", Prover9Mace4);
LiteGraph.registerNodeType("LogicUS-EXT/Solvers/EProver", EProver);

// General behaviours 

for (var k in LiteGraph.registered_node_types) {
    var v = LiteGraph.registered_node_types[k];

    
    
    v.prototype.onSelected= function() {
        const desc_title = document.getElementById("desc-node_title");
        const desc_content = document.getElementById("desc-content");
        const desc_node = document.getElementById("desc-node");
        desc_node.classList.remove("uptodate", "error");

        desc_title.innerHTML = this.title // + ` <button onclick='openInfoNode(${this.id});'>ⓘ</button>`;
        
        if(this.properties["state"] == "uptodate" && this.properties["value_"]){
            desc_content.innerHTML = "<u>Current value</u>: " + this.properties["value_"];
            desc_node.classList.add("uptodate");
            desc_node.classList.remove("error");
        } else if (this.properties["state"] == "error") {
            desc_content.innerHTML = `<div>${ERRORS[this.id]}</div>`
            desc_node.classList.remove("uptodate");
            desc_node.classList.add("error");
        }
        else{
            desc_content.innerHTML = this.desc;
        }
    }

    v.prototype.onDeselected= function() {
        const desc_title = document.getElementById("desc-node_title");
        const desc_content = document.getElementById("desc-content");
        const desc_node = document.getElementById("desc-node");
        desc_node.classList.remove("uptodate");
        desc_node.classList.remove("error");

        desc_title.innerHTML = '';
        desc_content.innerHTML = '';
        this.is_selected = false;
        graph.setDirtyCanvas(true,true);

    }

    v.prototype.onRemoved = function() {
        query = JSON.stringify({ 
            nodeId: this.id,
             nodeType: "RemoveNode", 
             content:  ""});

        app.ports.messageReceiver.send(query);


        for (const k in MEMORY) {
            for (const key in MEMORY[k]) {
                if (`${key}` == `${this.id}` || `${key}`.split(",")[0] == `(${this.id}`) {
                    delete MEMORY[k][key];
                }
            }
        }

        v.prototype.onDeselected();
        
    }

    v.prototype.setState = function(state) {
        if(this.widget2){
            var widget2Index = this.widgets.indexOf(this.widget2);
            if(widget2Index > -1){this.widgets.splice(widget2Index, 1);};
        }
        switch (state) {
            case "edited":
                this.properties["state"] = "edited";
                this.boxcolor = "#666"; 
                if(this.widget2){
                    this.widgets.push(this.widget2);
                }
                break;
    
            case "ready":
                this.properties["state"] = "ready";
                this.boxcolor = "#666"; //"#eb7f1a"; 
                if(this.widget2){
                    this.widgets.push(this.widget2);
                }
                break;
    
            case "uptodate":
                this.properties["state"] = "uptodate";
                this.boxcolor = "#00ff00"; 
                this.onDeselected();
                break;
                
    
            case "error":
                this.properties["state"] = "error";
                this.boxcolor = "#ff0000"; 
                break;
        
            default:
                console.log(`Unkonwn state: ${state}`);
                this.setState("edited");
                break;
        } 

        const links = graph.links;
        if(this.outputs){
        for (const o of this.outputs) {
            if (o.links){
                for (const ol of o.links){
                    if (ol && links[ol]){
                        graph.getNodeById(links[ol].target_id).antecessorChange();
                    }
                }
            }
            
        }}
        this.size = this.computeSize();
        graph.setDirtyCanvas(true,true);
    } 
    
}