
// CSP 

function CSPPL() {
    var that = this;
    this.addProperty("state", "init");
    this.addProperty("formulas", []);
    this.addOutput("", "BSPL")
    this.widget4 = this.addWidget("button", "VIEW/EDIT CSP", "", function(){
        if(!MEMORY["CSPs"][that.id]){
            MEMORY["CSPs"][that.id] = that.properties.formulas;
        }
        openCSPPANEL();
        displayCSP(that.id);
    });
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "CSPPL";
    this.desc = `It allows defining CSP with parametrized formulas. To do this, a series of rules are established:<ul>

    <li> Atomic formulas (propositional variables) correspond to propositional variables, made up of alpha strings, and can optionally be sub-indexed by a series of indices that correspond to arithmetic expressions. Said indices are specified between the symbols '_{' and '}'; and separated by commas. Examples of atomic formulas are: 'P', 'q', 'q_{i, j}','AL_{i+k, i-k}'.</li>
  
    <li> An arithmetic expression can correspond to an integer, to a parameter specified as a string of characters in lowercase followed, optionally, by some numeric digits (x, i1, y33), or the binary combination of two arithmetic expressions through the infix operators: '+' (sum), '-' (subtraction), '*' (product), '//' (integer division), '%' (modulus).</li>
  
    <li> The formulas can be defined as atomic formulas or as associations of them through infix binary connectives: '&' (conjunction), '|' (disjubation), '->' (implication), '<->' (equivalence ); the unitary connective: '¬' or '-' (negation); or two big connectives that follow the format: BIGOP + '_{' + PARAM + '\\in' + VALUES + (',' + PARAM + '\\in' + VALUES)* + (':' + CONDITION)? + '}' + BigFPL, where:<ul>
        <li> The BigOp can correspond to '/\\' (BigAnd) or '\\/' (BigOr).</li>
  
        <li> he PARAM constitutes a parameter as in arithmetic expression, VALUES specifies the values over the PARAM iterates and it can correspond to a set of integer values, expressed between braces and separated by commas, for example 'i {1,2,3,4,5,6,7,8}'; Or as a range expressed as '(ll..ul)' in the way 'll' corresponds to the lower limit, and'ul' to the upper limit, both included in the range, equivalent to the previous example 'i (1..8)'</li>
  
        <li> The condition (optionally, by defalut True) is established from a Boolean expression expressed between braces and that can correspond to: a comparison between arithmetic expressions (in which parameters defined in the operator itself or in predecessor, more external operators). These comparative expressions are expressed in brackets and can correspond to the comparative ones: '=' (equal), '!=' (Different), '>=' (greater or equal), '<=' (less or equal), '>'(major strict),'<'(minor strict); or with Boolean expressions created from Boolean operators 'AND','OR', 'NOT'.</li>
    </ul></li>
    </ul>
  
  As a final example, the restriction of the absence of two queens on the same secondary diagonal, in the 8 Queens problem, could be expressed as:\n
  
  '/\\_{i (0..7), j (0..7)} ( p_{i,j} -> /\\_{k (-7..7) : [k != 0] AND [i + k >= 0] AND [j-k >= 0] AND [i + k <= 7] AND [j-k <= 7]} (¬ p_{i + k, j-k} ) )'`
    
  this.color = LGraphCanvas.node_colors.pale_blue.color;
  this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

CSPPL.prototype.generateQuery = function() {
    var query = JSON.stringify({ nodeId: this.id, nodeType: "CSPPL", 
                content: JSON.stringify({option:"readCSP", index:-1, input:JSON.stringify(this.properties.formulas)})});
            app.ports.messageReceiver.send(query);   
}

CSPPL.prototype.processResponse = function(response){
    console.log(response);
    ERRORS[this.id] = "";
    switch (response.message.option) {
                case "checkBFPL": 
                    bfplTexDisplay = document.querySelector(`.bfpl[data-index="${response.message.index}"] .bfpl__result__texDisplay`);
                    if(response.message.errorState != 0){
                        bfplTexDisplay.innerHTML = `<div><span>${response.message.outputFormula}</span></div>`;
                        bfplTexDisplay.classList.add("error");
                        ERRORS[this.id] += response.message.outputFormula;

                    }else{
                        bfplTexDisplay.classList.remove("error");
                        bfplTexDisplay.innerHTML = `<div><span>\\(${response.message.outputFormula}\\)</span></div><div><span>\\(${response.message.outputConditions}\\)</span></div>`;
                        window.MathJax.typesetPromise([bfplTexDisplay]); 
                    }
                    break;
                
                case "saveCSP":
                    response.message.formulas.forEach(
                        o => {
                            bfplDiv =  document.querySelector(`.bfpl[data-index="${o.index}"]`)

                            if (bfplDiv == undefined){
                                const new_bfpl = document.createElement('div');
                                new_bfpl.className = "bfpl";
                                new_bfpl.dataset["index"] = o.index;
                                new_bfpl.innerHTML = `
                                <div class="bfpl__input">
                                    <textarea></textarea>
                                </div>
                                <div class="bfpl__result">
                                    <div class="bfpl__result__buttons"> 
                                    <button onclick="checkBFPL(this);">RUN</button><button onclick="clearBFPL(this);">CLEAR</button> <button onclick="removeBFPL(this);">REMOVE</button>
                                    </div>
                                    <div class="bfpl__result__texDisplay"></div>
                                </div>`
                            }

                            bfplInput = document.querySelector(`.bfpl[data-index="${o.index}"] textarea`);
                            bfplInput.value = o.input;
                            bfplTexDisplay = document.querySelector(`.bfpl[data-index="${o.index}"] .bfpl__result__texDisplay`);
                            if(o.errorState != 0){
                                bfplTexDisplay.innerHTML = `<div><span>${o.outputFormula}</span></div>`;
                                bfplTexDisplay.classList.add("error");
                                ERRORS[this.id] += o.outputFormula;
                            }else{
                                bfplTexDisplay.classList.remove("error");
                                bfplTexDisplay.innerHTML = `<div><span>\\(${o.outputFormula}\\)</span></div><div><span>\\(${o.outputConditions}\\)</span></div>`;
                                window.MathJax.typesetPromise([bfplTexDisplay]); 
                            }
                        }
                    )


                    if (ERRORS[this.id] == ""){
                        this.setState("uptodate");
                    }
                    document.getElementById('popup').style.zIndex = 0;
            }
            if (ERRORS[this.id] == ""){
                delete ERRORS[this.id];
            } else {
                this.setState("error");
            }
    }



    function checkBFPL(event) {
        var bfplDiv = event.parentElement.parentElement.parentElement;
        var nodeId = parseInt(document.querySelector("#select-by-id-csp button.selected").innerHTML);
        graph.getNodeById(nodeId).setState("ready");
        var bfplIndex = parseInt(bfplDiv.dataset.index);
        const textareaEl = bfplDiv.querySelector("textarea");
        var textInput = textareaEl.value.replace(/(\t|\r\n|\n|\s+)/gm, "");
        var query = JSON.stringify({ nodeId: nodeId, nodeType: "CSPPL", 
            content: JSON.stringify({option:"checkBFPL", index:bfplIndex, input:textInput})});
        console.log(query);
        app.ports.messageReceiver.send(query);   
        

    }

    function clearBFPL(event){
        var bfplDiv = event.parentElement.parentElement.parentElement;
        bfplDiv.querySelector("textarea").value = "";
        bfplDiv.querySelector(".bfpl__result__texDisplay").innerHTML = "";
        var nodeId = parseInt(document.querySelector("#select-by-id-csp button.selected").innerHTML);
        graph.getNodeById(nodeId).setState("ready");
    }

    function removeBFPL(event){
        var bfplDiv = event.parentNode.parentNode.parentNode;
        var index = parseInt(bfplDiv.dataset.index);
        var cspDisplayDiv = document.querySelector("#csp-display");
        for (let i = index + 1; i < cspDisplayDiv.childElementCount-1; i++){
            document.querySelector(`.bfpl[data-index='${i}']`).dataset["index"] -= 1 ;             
        }
        bfplDiv.remove();
        var nodeId = parseInt(document.querySelector("#select-by-id-csp button.selected").innerHTML);
        graph.getNodeById(nodeId).setState("ready");
        
    }

    function addBFPL() {
        var newBFPLDiv = document.createElement("div");
        newBFPLDiv.className = "bfpl";
        var cspDisplayDiv = document.getElementById("csp-display");
        newBFPLDiv.dataset["index"] = cspDisplayDiv.childElementCount - 1;
        newBFPLDiv.innerHTML = `
                <div class="bfpl__input">
                    <textarea></textarea>
                </div>
                <div class="bfpl__result">
                    <div class="bfpl__result__buttons"> 
                        <button onclick="checkBFPL(this);">RUN</button><button onclick="clearBFPL(this);">CLEAR</button> <button onclick="removeBFPL(this);">REMOVE</button> 
                    </div>
                    <div class="bfpl__result__texDisplay"></div>
                </div>`;
        cspDisplayDiv.insertBefore(newBFPLDiv, document.querySelector(".csp-display__buttons"));
        var nodeId = parseInt(document.querySelector("#select-by-id-csp button.selected").innerHTML);
        graph.getNodeById(nodeId).setState("ready");
    }

    function readFromFileBFPL() {
        var nodeId = parseInt(document.querySelector("#select-by-id-csp button.selected").innerHTML);
        var d1 = document.getElementById(`inputFileNode-${nodeId}`);

        if(d1){
            d1.remove();
        }
        
        var aux = document.createElement("div")
        aux.innerHTML = `<input type="file" name="inputfile"
        id="inputfile-${nodeId}">`

        
        var input = aux.querySelector(`input`);

        input.addEventListener('change', function() {
        
            var fr=new FileReader();
            fr.onload=function(){
                fileContent = fr.result.replace(/(\r\n|\n)/gm, "").split(/(?<!\.)\.(?!\.)/gm).filter(s => s.trim() != "").forEach(s => {
                    const newBFPLDiv = document.createElement("div");
                    newBFPLDiv.className = "bfpl";
                    const cspDisplayDiv = document.getElementById("csp-display");
                    newBFPLDiv.dataset["index"] = cspDisplayDiv.childElementCount - 1;
                    newBFPLDiv.innerHTML = `
                            <div class="bfpl__input">
                                <textarea>${s.replace(/(\t|\r\n|\n|\s+)/gm, " ")}</textarea>
                            </div>
                            <div class="bfpl__result">
                                <div class="bfpl__result__buttons"> 
                                    <button onclick="checkBFPL(this);">RUN</button><button onclick="clearBFPL(this);">CLEAR</button> <button onclick="removeBFPL(this);">REMOVE</button> 
                                </div>
                                <div class="bfpl__result__texDisplay"></div>
                            </div>`;
                    cspDisplayDiv.insertBefore(newBFPLDiv, document.querySelector(".csp-display__buttons"));
                    newBFPLDiv.querySelector("button").click();
                });
                ;


                aux.remove();
            }
            
            fr.readAsText(this.files[0]);
        });

        input.click();
        var nodeId = parseInt(document.querySelector("#select-by-id-csp button.selected").innerHTML);
        graph.getNodeById(nodeId).setState("ready");
    }

    function removeAllBFPL() {
        var cspDisplayDiv = document.getElementById("csp-display");
        cspDisplayDiv.querySelectorAll(".bfpl").forEach(d => {d.remove();});
        var nodeId = parseInt(document.querySelector("#select-by-id-csp button.selected").innerHTML);
        graph.getNodeById(nodeId).setState("ready");
    }

    function saveCSP() {
        
        var cspDisplayDiv = document.getElementById("csp-display");
        let nodeId = parseInt(document.querySelector('#select-by-id-csp>.selected').innerHTML);
        let node = graph.getNodeById(nodeId);
        node.properties.formulas = [];
        cspDisplayDiv.querySelectorAll("textarea").forEach(ta => {
            node.properties.formulas.push(ta.value.replace(/(\t|\r\n|\n|\s+)/gm, ""));  
        });
        MEMORY["CSPs"][nodeId] = node.properties.formulas;
        graph.getNodeById(nodeId).generateQuery();
    }

    function saveToFile(){
        var cspDisplayDiv = document.getElementById("csp-display");
        var nodeId = parseInt(document.querySelector("#select-by-id-csp button.selected").innerHTML);
        var fileData = "";
        cspDisplayDiv.querySelectorAll("textarea").forEach(ta => {
            fileData += ta.value.replace(/(\t|\r\n|\n|\s+)/gm, "") + '.\n';  
        });
        var blob = new Blob([fileData], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `CSP-${nodeId}.txt`);
    }


function CSPPPLtoDIMACS() {
    var that = this;
    this.addInput("", "BSPL");
    this.addOutput("", "DIMACS_FILE");
    this.addProperty("state", "init");
    this.addProperty("sourceID", "");
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widget4 = this.addWidget("button", "GET FILE", "", function(){
       downloadCSPDIMACSFile(that.id);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();
    
    this.title = "CSPPPLtoDIMACS";
    this.desc = "It generates a file from a CSP following DIMACS CNF format"
    this.size =  [210,38];
    
    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

function downloadCSPDIMACSFile(nodeId) {
    var that = graph.getNodeById(nodeId);
    var fileData = that.properties["value_"];
    if(fileData){
        var blob = new Blob([fileData], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `CSPDIMACS-${that.properties["sourceID"]}.txt`);
    }
    
}

CSPPPLtoDIMACS.prototype.antecessorChange = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
        this.setState("ready");
    } else {
        this.setState("edited");
    }
    this.size = this.computeSize();
}

CSPPPLtoDIMACS.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        var widget4Index = this.widgets.indexOf(this.widget4);
        if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
            this.properties["sourceID"] =  graph.links[this.inputs[0].link].origin_id;
        } else {
            this.properties["sourceID"] =  "";
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

CSPPPLtoDIMACS.prototype.generateQuery = function(){
    var links =  graph.links;
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
            nodeType: "CSPPLtoDIMACS", 
            content:  JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})});

    return query; 
}

CSPPPLtoDIMACS.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.addProperty("dvars_", {});
            this.properties["value_"] = response.message.content;
            this.properties["dvars_"] = response.message.dvars;
            if (!this.widgets.includes(this.widget4)){
                this.widgets.push(this.widget4);
            }
            this.setState("uptodate");
            if (ERRORS[this.id]){
                delete ERRORS[this.id];
            }
            break;
        
        default:
            ERRORS[this.id] = response.message;
            this.setState("error");
            break;
    }
}

function SolveDIMACS() {
    var that = this;
    this.addInput("", "DIMACS_FILE");
    this.addProperty("state", "init");
    this.addProperty("sourceID", "");
    this.addProperty("value_", "");
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        // Testing function.
        var source = graph.getNodeById(that.properties["sourceID"]);
        var problem = source.properties["value_"];
        if(problem){
            var result = cnfSolve(problem);
            if(result && result.trail){
                that.properties["value_"] = result.trail;
                var widget6Index = that.widgets.indexOf(that.widget6);
                if(widget6Index > -1){that.widgets.splice(widget6Index, 1);};
                if (!that.widgets.includes(that.widget4)){
                    that.widgets.push(that.widget4);
                }
            } else {
                that.properties["value_"] = result;
                var widget4Index = that.widgets.indexOf(that.widget4);
                if(widget4Index > -1){that.widgets.splice(widget4Index, 1);};
                if (!that.widgets.includes(that.widget6)){
                    that.widgets.push(that.widget6);
                }
            }
            
            that.setState("uptodate");
        }
        
    });
    this.widgets.pop();
    this.widget4 = this.addWidget("button", "SAT", "", function(){
        downloadDIMACSSolutionFile(that.id);
    });
    this.widgets.pop();
    this.widget6 = this.addWidget("button", "UNSAT", "", function(){
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();
    
    this.title = "SolveDIMACS";
    this.desc = "It solves the satisfiability of a set of clauses in DIMACS format"
    this.size = [210,38];
    
    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

function downloadDIMACSSolutionFile(nodeId) {
    var that = graph.getNodeById(nodeId);
    var fileData = that.properties["value_"];
    if(fileData){
        var dvars = graph.getNodeById(that.properties["sourceID"]).properties["dvars_"];
        var trueVars = fileData.filter(l => l > 0).map(l => dvars[l]).sort();
        var falseVars = fileData.filter(l => l < 0).map(l => dvars[-l]).sort();
        var blob = new Blob([`Raw output: ${JSON.stringify(fileData)}\nProcessed output:\n    True vars: ${JSON.stringify(trueVars)}\n    False vars:${JSON.stringify(falseVars)}\n`], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `DIMACSSolution-${that.properties["sourceID"]}.txt`);
    }
}

SolveDIMACS.prototype.antecessorChange = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    var widget6Index = this.widgets.indexOf(this.widget6);
    if(widget6Index > -1){this.widgets.splice(widget6Index, 1);};
    if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
        this.setState("ready");
    } else {
        this.setState("edited");
    }
    this.size = this.computeSize();
}

SolveDIMACS.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        var widget4Index = this.widgets.indexOf(this.widget4);
        if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
        var widget6Index = this.widgets.indexOf(this.widget6);
        if(widget6Index > -1){this.widgets.splice(widget6Index, 1);};
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
            this.properties["sourceID"] =  graph.links[this.inputs[0].link].origin_id;
        } else {
            this.properties["sourceID"] =  "";
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

// VARIABLE FORGETTING

// CanonicFOFPL

function ForeignVarsFPL() {
    var that = this;
    this.addInput("", "FormulaPL")
    this.addProperty("state", "init");
    this.addProperty("vars", "");
    this.addProperty("class", "canonicFO");
    this.addOutput("", "FormulaPL")
    this.widget = this.addWidget("text","vars","","vars");
    this.widget3 = this.addWidget("combo","method", "canonicFO", "class", { values:["canonicFO"]} );
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "ForeignVarsFPL";
    this.desc = "It provide the foreign operator for propositional formula, that allows dismiss several variables (specified as a sequence of propositional atoms separated by commas) according to the selected method.";
    
    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

ForeignVarsFPL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

ForeignVarsFPL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

ForeignVarsFPL.prototype.onPropertyChanged = function(){
    this.setState("edited");
    this.size = this.computeSize();
}

ForeignVarsFPL.prototype.generateQuery = function(){
    var links =  graph.links;
    var l =  links[this.inputs[0].link];
    var query = JSON.stringify({ nodeId: this.id, nodeType: "ForeignVarsFPL", content:  JSON.stringify({option : this.properties["class"], vars: this.properties["vars"], input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});
            
    //console.log(query);
    return query; 
}

ForeignVarsFPL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            // this.widget.value = response.message;
            this.setState("uptodate");
            MEMORY['PL Formulas'][this.id] = response.message;
            if (ERRORS[this.id]){
                delete ERRORS[this.id];
            }
            break;
        
        default:
            ERRORS[this.id] = response.message;
            this.setState("error");
            break;
    }
}

// Connection with Prover9


function Prover9Mace4() {
    var that = this;
    this.inputs = [];
    this.addProperty("state", "init");
    this.addProperty("xopts", "");
    this.addProperty("mode", "prover9");
    this.addProperty("format", "standard");
    this.addProperty("rename", true);
    this.addInput("A", "SetFOL")
    this.addInput("G", "SetFOL")
    
    this.widget = this.addWidget("combo","mode", "prover9", "mode", { values:["prover9","mace4"]} );  //link to property value
    this.widget4 = this.addWidget("combo","format", "standard", "format", { values:["raw","standard"]} );  
    this.widget5 = this.addWidget("combo","rename", true, "rename", { values:[true,false]} );  
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widget3 = this.addWidget("button","SPECIFY OPTIONS", "", function(){
        const desc_title = document.getElementById("desc-node_title");
        const desc_content = document.getElementById("desc-content");
        const desc_node = document.getElementById("desc-node");
        desc_node.classList.remove(["uptodate", "error"]);

        desc_title.innerHTML = "P9M4 - Options ";
        desc_content.innerHTML = "";

        var ta = document.createElement("textarea");
        ta.autofocus = true;
        ta.value = that.properties.xopts;

        btFILE = document.createElement("button");
        btFILE.innerHTML = "FROM FILE";
        btFILE.onclick = function(){
        
            var d1 = document.getElementById("inputFileNode-" + that.id);
    
            if(d1){
                d1.remove();
            }
            
            var aux = document.createElement("div")
            aux.innerHTML = `<input type="file" name="inputfile"
            id="inputfile-${that.id}">`
    
            
            var input = aux.querySelector(`input`);
    
            input.addEventListener('change', function() {
            
                var fr=new FileReader();
                fr.onload=function(){
                    ta.value = fr.result.replaceAll(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, ""); // comments
                    ta.value = ta.value.replaceAll(/\n+/g, "\n");
                    aux.remove();
                } 
                
                fr.readAsText(this.files[0]);
            });
            input.click();
        };
        btFILE.className = "btFile";

        btOK = document.createElement("button");
        btOK.innerHTML = "OK";
        btOK.onclick = function(){
            that.properties.value = ta.value; 
            that.onPropertyChanged();
            that.onDeselected();
            that.computeSize();
        };
        btOK.className = "btOK"; 

        btCANCEL = document.createElement("button");
        btCANCEL.innerHTML = "CANCEL";
        btCANCEL.onclick = function(){
            that.onDeselected();
        };
        btCANCEL.className = "btCANCEL";

        desc_title.appendChild(btFILE);
        desc_title.appendChild(btOK);
        desc_title.appendChild(btCANCEL);
        desc_content.appendChild(ta);
        
    });



    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "Prover9Mace4";
    this.desc = `Prover9 is an automated theorem prover for first-order and equational logic, and Mace4 searches for finite models and counterexamples. 
    
    <br><br>You must give two FOL sets one given as the assumptions and the other given as the goal(s) for being proved. Different formats are allowed for each mode (you can see it at <a href='https://www.cs.unm.edu/~mccune/prover9/'> Prover9/Mace4 oficial doc</a>. 
    
    <br><br>NOTE: As default, we rename functions and predicates, for ensuring the syntax is correct for P9M4. You can choose no renaming for avoiding this point).`;
    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

Prover9Mace4.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

Prover9Mace4.prototype.myComputeSize = function(){
    var that = this;
    var size = that.computeSize();
    if (that.horizontal) {
       return [size[0], Math.min(that.size[1], (that.properties.source == "input" ? 120 : 80))];
    } else {
        return size;
    }
}

Prover9Mace4.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.myComputeSize();
    }
}

Prover9Mace4.prototype.onPropertyChanged = function(){
    if (this.properties["mode"] == "prover9"){
        this.widget4.options.values=["standard","raw"]
    } else {
        this.widget4.options.values=["standard","raw","tabular", "portable","cooked"]
    } 

    if(!this.widget4.options.values.includes(this.widget4.value)){
        this.widget4.value = this.widget4.options.values[0]
    }

    var that = this;
    this.setState("edited");
    this.size = this.myComputeSize();
}

Prover9Mace4.prototype.generateQuery = function(){
    var la =  graph.links[this.inputs[0].link];
    var lg =  graph.links[this.inputs[1].link];
    var query = JSON.stringify({ nodeId: this.id, nodeType: "Prover9Mace4", 
        content:  JSON.stringify({
            a : JSON.stringify({origin_id: la.origin_id, origin_slot : la.origin_slot}),
            g : JSON.stringify({origin_id: lg.origin_id, origin_slot : lg.origin_slot}),
            u : this.properties["rename"]
        })});

    console.log(query);
    return query; 
}

Prover9Mace4.prototype.processResponse = function(response){
    var that = this;
    switch (response.errorCode) {
        case 0:
            input_txt = this.properties["xopts"] + "\n" + response.message
            fetch('http://localhost:3000', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: input_txt, 
                    mode: that.properties["mode"],
                    format: that.properties["format"]
                })
                })
                .then(response => response.text())
                .then(data => 
                    {var blob = new Blob([data], { type: "text/plain;charset=utf-8" });
                    saveAs(blob, `${that.properties["mode"]}_${that.properties["format"]}_${that.id}.txt`);
                    that.setState("uptodate")
                    }
                )
                .catch(error => {ERRORS[this.id] = error;
                    that.setState("error");});
            break;
        
        default:
            ERRORS[this.id] = response.message;
            this.setState("error");
            break;
    }
}



// CanonicFOSPL

function ForeignVarsSPL() {
    var that = this;
    this.addInput("", "SetPL")
    this.addProperty("state", "init");
    this.addProperty("vars", "");
    this.addProperty("class", "canonicFO");
    this.addOutput("", "SetPL")
    this.widget = this.addWidget("text","vars","","vars");
    this.widget3 = this.addWidget("combo","method", "canonicFO", "class", { values:["canonicFO"]} );
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "ForeignVarsSPL";
    this.desc = "It provide the foreign operator for propositional sets of formulas, that allows dismiss several variables (specified as a sequence of propositional atoms separated by commas), according to the selected method.";
    
    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

ForeignVarsSPL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

ForeignVarsSPL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

ForeignVarsSPL.prototype.onPropertyChanged = function(){
    this.setState("edited");
    this.size = this.computeSize();
}

ForeignVarsSPL.prototype.generateQuery = function(){
    var links =  graph.links;
    var l =  links[this.inputs[0].link];
    var query = JSON.stringify({ nodeId: this.id, nodeType: "ForeignVarsSPL", content:  JSON.stringify({option: this.properties["class"], vars: this.properties["vars"], input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});
            
    //console.log(query);
    return query; 
}

ForeignVarsSPL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['PL Sets'][this.id] = response.message;
            this.setState("uptodate");
            if (ERRORS[this.id]){
                delete ERRORS[this.id];
            }
            break;
        
        default:
            ERRORS[this.id] = response.message;
            this.setState("error");
            break;
    }
}

// ConservativeRetractFPL

function ConservativeRetractFPL() {
    var that = this;
    this.addInput("", "FormulaPL")
    this.addProperty("state", "init");
    this.addProperty("vars", "");
    this.addProperty("class", "canonicFO");
    this.addOutput("", "FormulaPL")
    this.widget = this.addWidget("text","vars","","vars");
    this.widget3 = this.addWidget("combo","method", "canonicFO", "class", { values:["canonicFO"]} );
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "ConservativeRetractFPL";
    this.desc = "It computes the conservative retraction of a propositional formula into a language (given by a sequence of propositional atoms separated by commas) according to the selected method.";
    
    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

ConservativeRetractFPL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

ConservativeRetractFPL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

ConservativeRetractFPL.prototype.onPropertyChanged = function(){
    this.setState("edited");
    this.size = this.computeSize();
}

ConservativeRetractFPL.prototype.generateQuery = function(){
    var links =  graph.links;
    var l =  links[this.inputs[0].link];
    var query = JSON.stringify({ nodeId: this.id, nodeType: "ConservativeRetractFPL", content:  JSON.stringify({option: this.properties["class"], vars: this.properties["vars"], input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});
            
    //console.log(query);
    return query; 
}

ConservativeRetractFPL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            // this.widget.value = response.message;
            this.setState("uptodate");
            MEMORY['PL Formulas'][this.id] = response.message;
            if (ERRORS[this.id]){
                delete ERRORS[this.id];
            }
            break;
        
        default:
            ERRORS[this.id] = response.message;
            this.setState("error");
            break;
    }
}
// ConservativeRetractSPL

function ConservativeRetractSPL() {
    var that = this;
    this.addInput("", "SetPL")
    this.addProperty("state", "init");
    this.addProperty("vars", "");
    this.addProperty("class", "canonicFO");
    this.addOutput("", "SetPL")
    this.widget = this.addWidget("text","vars","","vars");
    this.widget3 = this.addWidget("combo","method", "canonicFO", "class", { values:["canonicFO"]} );
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "ConservativeRetractSPL";
    this.desc = "It computes the conservative retraction of a propositional set of formulas into a language (given by a sequence of propositional atoms separated by commas) according to the selected method.";
    
    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

ConservativeRetractSPL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

ConservativeRetractSPL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

ConservativeRetractSPL.prototype.onPropertyChanged = function(){
    this.setState("edited");
    this.size = this.computeSize();
}

ConservativeRetractSPL.prototype.generateQuery = function(){
    var links =  graph.links;
    var l =  links[this.inputs[0].link];
    var query = JSON.stringify({ nodeId: this.id, nodeType: "ConservativeRetractSPL", content:  JSON.stringify({option: this.properties["class"], vars: this.properties["vars"], input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});
            
    //console.log(query);
    return query; 
}

ConservativeRetractSPL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['PL Sets'][this.id] = response.message;
            this.setState("uptodate");
            if (ERRORS[this.id]){
                delete ERRORS[this.id];
            }
            break;
        
        default:
            ERRORS[this.id] = response.message;
            this.setState("error");
            break;
    }
}














