// Formula FOL

function FormulaFOL() {
    var that = this;
    this.addProperty("state", "init");
    this.addProperty("value", "");
    this.addOutput("", "FormulaFOL");
    this.widget = this.addWidget("button","INPUT FORMULA", "", function(){
        const desc_title = document.getElementById("desc-node_title");
        const desc_content = document.getElementById("desc-content");
        const desc_node = document.getElementById("desc-node");
        desc_node.classList.remove("uptodate", "error");

        desc_title.innerHTML = "Formula FOL - ";
        desc_content.innerHTML = "";

        var ta = document.createElement("input");
        ta.autofocus = true;
        ta.value = that.properties.value;
        ta.onkeyup = function(e){
            let str = ta.value
            if (e.keyCode == 32) {
                str = str.replace(/&| and /ig, '∧');
                str = str.replace(/\|| or /ig, '∨');
                str = str.replace(/~|-(?!>)| not /ig, '¬');
                str = str.replace(/<->|<=>| iff /ig, '↔');
                str = str.replace(/->|=>| then /g, '→');
                str = str.replace(/!A|Ɐ/g, '∀');
                str = str.replace(/!E/g, '∃');
                str = str.replace(/!I/g, '⊥');
                str = str.replace(/!V/g, '⊤');
                str = str.replace(/\\?forall[\{ ]?\}?/g, '∀');
                str = str.replace(/\\?exists[\{ ]?\}?/g, '∃');
                str = str.replace(/\\?top[\{ ]?\}?/g, '⊤');
                str = str.replace(/\\?bottom[\{ ]?\}?/g, '⊥');
                str = str.replace(/(\\neg|\\lnot)[\{ ]?\}?/g, '¬');
                str = str.replace(/(\\vee|\\lor)[\{ ]?\}?/g, '∨');
                str = str.replace(/(\\wedge|\\land)[\{ ]?\}?/g, '∧');
                str = str.replace(/(\\implies|\\rightarrow)[\{ ]?\}?/g, '→');
                str = str.replace(/\\iff|\\leftrightarrow[\{ ]?\}?/g, '↔');
            }
            ta.value = str;
        }

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

        desc_title.appendChild(btOK);
        desc_title.appendChild(btCANCEL);
        desc_content.appendChild(ta);
        
    });
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        console.log(query);
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "FormulaFOL";
    this.desc = `It reads the formula from a string. The rules of the notation are:<ul>

    <li> The variables correspond to alphanumeric strings, starting with an uppercase letter, and optionally indexed by a sequence of natural numbers, which have been written between braces, { and }, and separated by commas. For example: \`X\`,\`Y_{1}\`, \`Xa_{1,1}\`.</li>
    
    <li> The functions are described analogously to the variables but starting with a lowercase letter. In addition, the arguments, if any, are specified between parentheses and separated by commas. For example: \`a\`,\`b_{1}\`,\`john\`, that are constants, and \`f(X)\`, \`g_{1}(X, a)\`,\`father(john)\`, as functions. </li>
    
    <li> Predicates are described in a similar way to functions, as strings of characters, the first in uppercase, and followed, if applicable, by a list of terms, specified in parentheses and separated by commas, in the same way as presented for functions. Examples of predicates are \`P\`,\`Q_{1}(X)\`,\`Uncle(john, paul)\`.</li>
    
    <li> The use of connectives is equivalent proposed for propositional logic, using \`-\` for negation, \`&\` for conjunction, \`|\` for disjunction, \`->\` for implication and \`<->\` for equivalence; with these priority order in absence of parentheses that alterate it. You can use the unicode connective symbols. </li>
    
    <li> Quantifiers are described as \`!E\` for the existential and \`!A\` for the universal, followed by the variable indicated in brackets, \`[\` and \`]\`, and by the quantized formula. As for example: \`!A[X_{1}] !A[X_{2}](f(X_{1}) = f(X_{2}) -> X_{1} = f(X_{2}))\` or \`!E[X](g(X) = a))\` are valid quantificated formulas. You can use unicode quantifier symbols too. </li>
    
    <li> As in propositional logic, the valid formula is defined by \`!V\` and the unsatisfiable formula for \`!I\`. </li>
    
    <li> The external parentheses of the formulas should not be put, since the Parser will put them automatically, so their use or not is irrelevant. </li>`;

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

FormulaFOL.prototype.generateQuery = function(){
    return JSON.stringify({ nodeId: this.id, nodeType: "FormulaFOL", content: this.properties["value"] }); 
}

FormulaFOL.prototype.onPropertyChanged = function(){
    this.setState("edited");
    this.properties["value"] = this.properties["value"].replace(/\t\s/g, '');
    
    if(this.properties["value"] != ""){
       this.setState("ready");
    }else{
        this.setState("edited")
    }
    this.size = this.computeSize();
}

FormulaFOL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            //this.widget.value = response.message;
            this.setState("uptodate");
            MEMORY['FOL Formulas'][this.id] = response.message;
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


// Connective FOL

function ConnectiveFOL() {
    var that = this;
    this.addInput("", "FormulaFOL")
    this.addProperty("state", "init");
    this.addProperty("class", "¬");
    this.addOutput("", "FormulaFOL")
    this.widget = this.addWidget("combo","connective", "¬", "class", { values:["¬","∧","∨","→","↔"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "ConnectiveFOL";
    this.desc = "Make a new FOL formula with the connective and formula(s) given";

    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

ConnectiveFOL.prototype.antecessorChange = function(){
    this.setState("edited");
}

ConnectiveFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

ConnectiveFOL.prototype.onPropertyChanged = function(){
    var that = this;

    var arity = that.properties['class'] == "¬" ? 1 : 2;

    var il = that.inputs.length;

    for (let index = il-1; index >= arity; index--) {
        that.disconnectInput(index);
    }
    
    that.inputs.splice(arity);

    var il = that.inputs.length;
    for (let index = 0; index < (arity - il); index++) {
        that.addInput(``, "FormulaFOL");
    }
   
    this.size = this.computeSize();
    this.setState("edited");
    this.onConnectionsChange();
}

ConnectiveFOL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    switch (this.properties['class']) {
        case "¬":
            var l =  links[this.inputs[0].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "ConnectiveFOL", content:  JSON.stringify({option: 'neg', input : JSON.stringify({origin1_id: l.origin_id, origin1_slot : l.origin_slot, origin2_id: 0, origin2_slot : 0 })})});
            break;
        
        case "∧":
            var l1 =  links[this.inputs[0].link];
            var l2 =  links[this.inputs[1].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "ConnectiveFOL", content:  JSON.stringify({option: 'conj', input : JSON.stringify({origin1_id: l1.origin_id, origin1_slot : l1.origin_slot, origin2_id: l2.origin_id, origin2_slot : l2.origin_slot})})});
            break;
        
        case "∨":
            var l1 =  links[this.inputs[0].link];
            var l2 =  links[this.inputs[1].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "ConnectiveFOL", content:  JSON.stringify({option: 'disj', input : JSON.stringify({origin1_id: l1.origin_id, origin1_slot : l1.origin_slot, origin2_id: l2.origin_id, origin2_slot : l2.origin_slot})})});
            break;
        
        case "→":
            var l1 =  links[this.inputs[0].link];
            var l2 =  links[this.inputs[1].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "ConnectiveFOL", content:  JSON.stringify({option: 'impl', input : JSON.stringify({origin1_id: l1.origin_id, origin1_slot : l1.origin_slot, origin2_id: l2.origin_id, origin2_slot : l2.origin_slot})})});
            break;
        
        case "↔":
            var l1 =  links[this.inputs[0].link];
            var l2 =  links[this.inputs[1].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "ConnectiveFOL", content:  JSON.stringify({option: 'equi', input : JSON.stringify({origin1_id: l1.origin_id, origin1_slot : l1.origin_slot, origin2_id: l2.origin_id, origin2_slot : l2.origin_slot})})});
            break;
    
        default:
            console.log("Unknown class of connective");
            break;
    }
            
    //console.log(query);
    return query; 
}

ConnectiveFOL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['FOL Formulas'][this.id] = response.message;
            
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

// Quantifier FOL 

function QuantifierFOL() {
    var that = this;
    this.addInput("", "FormulaFOL")
    this.addProperty("state", "init");
    this.addProperty("var", "");
    this.addProperty("class", "∀");
    this.addOutput("", "FormulaFOL")
    this.widget = this.addWidget("combo","connective", "∀", "class", { values:["∀","∃"]} );  //link to property value
    this.widget3 = this.addWidget("text","var","","var");
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "QuantifierFOL";
    this.desc = "Make a new FOL formula with the quantifier over the variable given";

    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

QuantifierFOL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

QuantifierFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        this.setState("edited")
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("ready");
        }
        this.size = this.computeSize();
    }
}

QuantifierFOL.prototype.onPropertyChanged = function(){
    if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
        this.setState("ready");
    } else {
        this.setState("edited");
    }
    this.size = this.computeSize();
}

QuantifierFOL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    switch (this.properties['class']) {
        case "∀":
            var l =  links[this.inputs[0].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "QuantifierFOL", content:  JSON.stringify({option: 'forall', var:this.properties['var'], input : JSON.stringify({origin1_id: l.origin_id, origin1_slot : l.origin_slot, origin2_id: 0, origin2_slot : 0 })})});
            break;
        
        case "∃":
            var l =  links[this.inputs[0].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "QuantifierFOL", content:  JSON.stringify({option: 'exists', var:this.properties['var'], input : JSON.stringify({origin1_id: l.origin_id, origin1_slot : l.origin_slot, origin2_id: 0, origin2_slot : 0 })})});
            break;
        
        default:
            console.log("Unknown class of quantifier");
            break;
    }
            
    //console.log(query);
    return query; 
}

QuantifierFOL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['FOL Formulas'][this.id] = response.message;
            
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

// Transform FFOL

function TransformFFOL() {
    var that = this;
    this.addInput("", "FormulaFOL")
    this.addProperty("state", "init");
    this.addProperty("class", "∀-closure");
    this.addOutput("", "FormulaFOL")
    this.widget = this.addWidget("combo","transform", "∀-closure", "class", { values:["∀-closure", "∃-closure", "varsRename", "toPrenex", "toSkolem", "replaceEquiv","replaceImpl","interiorizeNegs", "toNNF", "toCNF", "toDNF"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widget4 = this.addWidget("button", "SHOW GRAPH", "", function(){
        openGRAPHSPANEL();
        displayGraph(that.id);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "TransformFFOL";
    this.desc = `It allows making several transformations of a formula from a FOL, according to the selected option: 
    <ul>
        <li><i>∀-closure</i>: It produces the universal closure of a formula.</li>
        <li><i>∃-closure</i>: It produces the existential closure of a formula.</li>
        <li><i>varsRename</i>: It renames the variables into rectified form</li>
        <li><i>toPrenex</i>: It gives a formula in prenex form equivalent to the given one. It shows the associated graph</li>
        <li><i>toSkolem</i>: It removes the quantifiers by introducing skolem functions (a.k.a. skolemization).</li>
        <li><i>replaceEquiv</i>: replacement of each equivalence under the rule A ↔ B ≡ (A → B) ∧ (B → A).</li>
        <li><i>replaceImpl</i>: replacement of each implication under the rule A → B ≡ ¬A ∨ B.</li>
        <li><i>interiorizeNegs</i>: It transforms a formula to an equivalent whose negations are involved only in literals.</li>
        <li><i>toNNF</i>: It transforms a formula to an equiconsistent in Negative Normal Form.</li>
        <li><i>toCNF</i>: It transforms a formula to an equiconsistent in Conjunctive Normal Form.</li>
        <li><i>toDNF</i>: It transforms a formula to an equiconsistent in Disjunctive Normal Form.</li>
    </ul>`;

    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

TransformFFOL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

TransformFFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

TransformFFOL.prototype.onPropertyChanged = function(){
    if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
        this.setState("ready");
    } else {
        this.setState("edited");
    }
    this.size = this.computeSize();
    
}

TransformFFOL.prototype.generateQuery = function(){
    var links =  graph.links;
    var l =  links[this.inputs[0].link];
    var query = JSON.stringify({ nodeId: this.id, nodeType: "TransformFFOL", content:  JSON.stringify({option: this.properties["class"], input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});
            
    //console.log(query);
    return query; 
}

TransformFFOL.prototype.processResponse = function(response){
    var widget4Index = this.widgets.indexOf(this.widget4);
    switch (response.errorCode) {
        case 0:
            if (this.properties["class"] == "toPrenex"){
                if(widget4Index == -1){
                    this.widgets.push(this.widget4);
                };
                
                this.properties["value_"] = response.message.f;
                MEMORY['FOL Formulas'][this.id] = response.message.f;
                this.properties["value_graph"] = response.message.g;
                MEMORY['Graphs'][this.id] = {type:'dot', typeExtra:'PrenexGraph',  content:response.message.g};
            } else {
                this.addProperty("value_", "");
                this.properties["value_"] = response.message;
                MEMORY['FOL Formulas'][this.id] = response.message;

                if(widget4Index > -1){
                    this.widgets.splice(widget4Index,1);
                    delete MEMORY['Graphs'][this.id];
                };

            }
            
            this.setState("uptodate");
            if (ERRORS[this.id]){
                delete ERRORS[this.id];
            }
            this.size = this.computeSize();
            break;
        
        default:
            ERRORS[this.id] = response.message;
            this.setState("error");
            break;
    }
} 

// Set FOL

function SetFOL() {
    var that = this;
    this.inputs = [];
    this.addProperty("state", "init");
    this.addProperty("source", "input");
    this.addProperty("value", "");
    this.addProperty("entries", 0);
    this.addOutput("", "SetFOL")
    // this.widget4 = this.addWidget("button", "slotsDirection", "", function(){
    //     that.horizontal = !that.horizontal;
    //     that.size = that.myComputeSize();
    // });
    this.widget = this.addWidget("combo","source", "input", "source", { values:["input","collect", "union"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widget3 = this.addWidget("button","INPUT SET", "", function(){
        const desc_title = document.getElementById("desc-node_title");
        const desc_content = document.getElementById("desc-content");
        const desc_node = document.getElementById("desc-node");
        desc_node.classList.remove("uptodate", "error");

        desc_title.innerHTML = "Set FOL - ";
        desc_content.innerHTML = "";

        var ta = document.createElement("textarea");
        ta.autofocus = true;
        ta.value = that.properties.value;
        ta.onkeyup = function(e){
            let str = ta.value
            if (e.keyCode == 32) {
                str = str.replace(/&| and /ig, '∧');
                str = str.replace(/\|| or /ig, '∨');
                str = str.replace(/~|-(?!>)| not /ig, '¬');
                str = str.replace(/<->|<=>| iff /ig, '↔');
                str = str.replace(/->|=>| then /g, '→');
                str = str.replace(/!A|Ɐ/g, '∀');
                str = str.replace(/!E/g, '∃');
                str = str.replace(/!I/g, '⊥');
                str = str.replace(/!V/g, '⊤');
                str = str.replace(/\\?forall[\{ ]?\}?/g, '∀');
                str = str.replace(/\\?exists[\{ ]?\}?/g, '∃');
                str = str.replace(/\\?top[\{ ]?\}?/g, '⊤');
                str = str.replace(/\\?bottom[\{ ]?\}?/g, '⊥');
                str = str.replace(/(\\neg|\\lnot)[\{ ]?\}?/g, '¬');
                str = str.replace(/(\\vee|\\lor)[\{ ]?\}?/g, '∨');
                str = str.replace(/(\\wedge|\\land)[\{ ]?\}?/g, '∧');
                str = str.replace(/(\\implies|\\rightarrow)[\{ ]?\}?/g, '→');
                str = str.replace(/\\iff|\\leftrightarrow[\{ ]?\}?/g, '↔');
            }
            ta.value = str;
        }

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
                    ta.value = fr.result.replaceAll(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, "");
                    ta.value = ta.value.replaceAll(/\n+/g, "\n");
                    rewriteFPLInput(ta);
                    aux.remove();
                    that.setState("ready");
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

    this.widget4 = this.addWidget("number","entries", 0, "entries", { min: 0, step: 10, precision:0} );
    this.widgets.pop();

    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "SetFOL";
    this.desc = "It allows defining a set of first order formulas. <ul><li>It can be done through a file where each formula must be ended by a period ('.') and must follow the notation rules given in FormulaFOL.</li><li>Also, it can be used as a collector of first order formulas (max. 10 formulas).</li></ul>";

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

SetFOL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

SetFOL.prototype.myComputeSize = function(){
    var that = this;
    var size = that.computeSize();
    if (that.horizontal) {
       return [size[0], Math.min(that.size[1], (that.properties.source == "input" ? 120 : 80))];
    } else {
        return size;
    }
}

SetFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.myComputeSize();
    }
}

SetFOL.prototype.onPropertyChanged = function(){
    var that = this;

    switch (that.properties['source']) {
        case "input":
            var arity = 0;
            var il = that.inputs.length;
            for (let index = il-1; index >= 0; index-=1) {
                that.disconnectInput(index);
            }
            that.inputs = [];
            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index == -1){that.widgets.push(that.widget3);};

            var widget4Index = that.widgets.indexOf(that.widget4);
            if(widget4Index > -1){that.widgets.splice(widget4Index, 1);};
            break;
    
        case "collect":

            var widget4Index = that.widgets.indexOf(that.widget4);
            if(widget4Index == -1){that.widgets.push(that.widget4);};
            
            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index > -1){that.widgets.splice(widget3Index, 1);};

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "FormulaFOL"){
                this.widget5.value = 0;
                that.properties['entries'] = 0;
            }
            
            var arity = parseInt(that.properties['entries']);
            var il = that.inputs.length;

            for (let index = il-1; index >= arity; index--) {
                that.disconnectInput(index);
            }
            
            that.inputs.splice(arity);

            var il = that.inputs.length;
            for (let index = 0; index < (arity - il); index++) {
                that.addInput(``, "FormulaFOL");
            }
            
            that.properties['value'] = "";
            break;

        case "union":

            var widget4Index = that.widgets.indexOf(that.widget4);
            if(widget4Index == -1){that.widgets.push(that.widget4);};
            
            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index > -1){that.widgets.splice(widget3Index, 1);};

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "SetFOL"){
                this.widget5.value = 0;
                that.properties['entries'] = 0;
            }
            
            var arity = parseInt(that.properties['entries']);
            var il = that.inputs.length;

            for (let index = il-1; index >= arity; index--) {
                that.disconnectInput(index);
            }
            
            that.inputs.splice(arity);

            var il = that.inputs.length;
            for (let index = 0; index < (arity - il); index++) {
                that.addInput(``, "SetFOL");
            }
            
            that.properties['value'] = "";
            break;
            
    }

    this.setState("edited");
    this.size = this.myComputeSize();
}

SetFOL.prototype.generateQuery = function(){
    var query = "";
    
    switch (this.properties["source"]) {
        case "input":
            query = JSON.stringify({ nodeId: this.id, nodeType: "SetFOL", content:  JSON.stringify({option: "fromFile", input : this.properties["value"]})});
            break;
    
        case "collect":
        case "union":
            var links =  graph.links;
            query = JSON.stringify({ nodeId: this.id, nodeType: "SetFOL", content:  JSON.stringify({option: this.properties["source"], input : JSON.stringify(
                this.inputs.map(i => {return links[i.link];}))})});
            break;
    }
    console.log(query);
    return query; 
}

SetFOL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['FOL Sets'][this.id] = response.message;
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

//Transform SetFOL

function TransformSetFOL() {
    var that = this;
    this.addInput("", "SetFOL")
    this.addProperty("state", "init");
    this.addProperty("class", "neg_all");
    this.addOutput("", "SetFOL")
    this.widget = this.addWidget("combo","transform", "neg_all", "class", { values:["neg_all","conj_all","disj_all", "∀-closure", "∃-closure", "toSkolem", "toCNF", "toDNF"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "TransformSetFOL";
    this.desc = "It allows making some transformations over a set of FOL formulas. The different options are: <ul><li>neg_all: it results into a set with all formulas negated</li><li>conj_all: it results into a formula that is the conjunction of the formulas of the set</li><li>disj_all: it results into a formula that is the disjunction of the formulas of the set</li><li><i>∀-closure</i>: It produces the universal closure of each formula in the set.</li> <li><i>∃-closure</i>: It produces the existential closure of of each formula in the set.</li><li><i>toSkolem</i>: It performs the skolemization of each formula in the set.</li><li>toCNF: it results into a set with the cnf forms of the formulas in the original set</li><li>toDNF: it results into a set with the dnf forms of the formulas in the original set</li></ul>"

    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

TransformSetFOL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

TransformSetFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

TransformSetFOL.prototype.onPropertyChanged = function(){
    var that = this;

    switch (that.properties['class']) {
        case "neg_all":
            if(that.outputs[0].type != "SetFOL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "SetFOL";
            }
            break;
        case "conj_all":
            if(that.outputs[0].type != "FormulaFOL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "FormulaFOL";
            }
            break;
        case "disj_all":
            if(that.outputs[0].type != "FormulaFOL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "FormulaFOL";
            }
            break;
        case "neg_all":
            if(that.outputs[0].type != "SetFOL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "SetFOL";
            }
            break;
        
        case "∀-closure":
            if(that.outputs[0].type != "SetFOL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "SetFOL";
            }
            break;
            
        case "∃-closure":
            if(that.outputs[0].type != "SetFOL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "SetFOL";
            }
            break;
        
        case "toSkolem":
            if(that.outputs[0].type != "SetFOL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "SetFOL";
            }
            break;

        case "toCNF":
            if(that.outputs[0].type != "SetFOL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "SetFOL";
            }
            break;
        case "toDNF":
            if(that.outputs[0].type != "SetFOL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "SetFOL";
            }
            break;
        case "toClauses":
            if(that.outputs[0].type != "ClauseSetFOL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "ClauseSetFOL";
            }
            break;
        
        default:
            break;
    }
   
    this.size = this.computeSize();
    this.setState("edited");
}

TransformSetFOL.prototype.generateQuery = function(){
    var links =  graph.links;
    var l =  links[this.inputs[0].link];
    var query = JSON.stringify({ nodeId: this.id, nodeType: "TransformSetFOL", content:  JSON.stringify({option: this.properties["class"], input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});
            
    //console.log(query);
    return query; 
}

TransformSetFOL.prototype.processResponse = function(response){
    const that = this;
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            for(k in MEMORY){
                delete MEMORY[k][this.id]
            }

            switch (that.properties['class']) {
            
                case "neg_all":
                    MEMORY['FOL Sets'][this.id] = response.message;
                break;
                case "conj_all":
                    MEMORY['FOL Formulas'][this.id] = response.message;
                    break;
                case "disj_all":
                    MEMORY['FOL Formulas'][this.id] = response.message;
                    break;

                case "∀-closure":
                    MEMORY['FOL Sets'][this.id] = response.message;
                    break;
                    
                case "∃-closure":
                    MEMORY['FOL Sets'][this.id] = response.message;
                    break;
                
                case "toSkolem":
                    MEMORY['FOL Sets'][this.id] = response.message;
                    break;

                case "toCNF":
                    MEMORY['FOL Sets'][this.id] = response.message;
                    break;
                
                case "toDNF":
                    MEMORY['FOL Sets'][this.id] = response.message;
                    break;
                
                case "toClauses":
                    MEMORY['FOL Clause Sets'][this.id] = response.message;
                    break;
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



// ClauseFOL

function ClauseFOL() {
    var that = this;
    this.addProperty("state", "init");
    this.addProperty("value", "");
    this.addOutput("", "ClauseFOL");
    this.widget3 = this.addWidget("button","INPUT CLAUSE", "", function(){
        const desc_title = document.getElementById("desc-node_title");
        const desc_content = document.getElementById("desc-content");
        const desc_node = document.getElementById("desc-node");
        desc_node.classList.remove("uptodate", "error");

        desc_title.innerHTML = "Clause FOL - ";
        desc_content.innerHTML = "";

        var ta = document.createElement("input");
        ta.autofocus = true;
        ta.value = that.properties.value;
        ta.onkeyup = function(e){
            let str = ta.value
            if (e.keyCode == 32) {
             // str = str.replace(/&| and /ig, '∧');
                // str = str.replace(/\|| or /ig, '∨');
                str = str.replace(/~|-(?!>)| not /ig, '¬');
                // str = str.replace(/<->|<=>| iff /ig, '↔');
                // str = str.replace(/->|=>| then /g, '→');
                // str = str.replace(/!A|Ɐ/g, '∀');
                // str = str.replace(/!E/g, '∃');
                str = str.replace(/!I/g, '⊥');
                str = str.replace(/!V/g, '⊤');
                // str = str.replace(/\\?forall[\{ ]?\}?/g, '∀');
                // str = str.replace(/\\?exists[\{ ]?\}?/g, '∃');
                str = str.replace(/\\?top[\{ ]?\}?/g, '⊤');
                str = str.replace(/\\?bottom[\{ ]?\}?/g, '⊥');
                str = str.replace(/(\\neg|\\lnot)[\{ ]?\}?/g, '¬');
                // str = str.replace(/(\\vee|\\lor)[\{ ]?\}?/g, '∨');
                // str = str.replace(/(\\wedge|\\land)[\{ ]?\}?/g, '∧');
                // str = str.replace(/(\\implies|\\rightarrow)[\{ ]?\}?/g, '→');
                // str = str.replace(/\\iff|\\leftrightarrow[\{ ]?\}?/g, '↔');
            }
            ta.value = str;
        }

        btOK = document.createElement("button");
        btOK.innerHTML = "OK";
        btOK.onclick = function(){
            that.properties.value = ta.value; 
            that.widget3.name = ta.value;
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

        desc_title.appendChild(btOK);
        desc_title.appendChild(btCANCEL);
        desc_content.appendChild(ta);
        
    });
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "ClauseFOL";
    this.desc = "A first order clause. It must be specified by separating the literals (following the rules given in FormulaFOL) by , (comma). A valid example of clause: {P(X), Q(c), ¬Q(a)} (braces can be omitted)";

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

ClauseFOL.prototype.generateQuery = function(){
    return JSON.stringify({ nodeId: this.id, nodeType: "ClauseFOL", content: this.properties["value"] }); 
}

ClauseFOL.prototype.onPropertyChanged = function(){
    this.setState("edited");
    this.properties["value"] = this.properties["value"].replace(/\t\s/g, '');
    
    if(this.properties["value"] != ""){
       this.setState("ready");
    }else{
        this.setState("edited")
    }
    this.size = this.computeSize();
}

ClauseFOL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            // this.widget.value = response.message;
            this.setState("uptodate");
            MEMORY['FOL Clauses'][this.id] = response.message;
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

//ClauseSetFOL

function ClauseSetFOL() {
    var that = this;
    this.inputs = [];
    this.addProperty("state", "init");
    this.addProperty("source", "input");
    this.addProperty("value", "");
    this.addProperty("entries", 0);
    this.addOutput("", "ClauseSetFOL")
    // this.widget4 = this.addWidget("button", "slotsDirection", "", function(){
    //     that.horizontal = !that.horizontal;
    //     that.size = that.myComputeSize();
    // });
    this.widget = this.addWidget("combo","source", "input", "source", { values:["input", "collect", "union", "fromCNFSet", "fromSetFOL"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widget3 = this.addWidget("button","INPUT SET", "", function(){
        const desc_title = document.getElementById("desc-node_title");
        const desc_content = document.getElementById("desc-content");
        const desc_node = document.getElementById("desc-node");
        desc_node.classList.remove("uptodate", "error");

        desc_title.innerHTML = "ClauseSet FOL - ";
        desc_content.innerHTML = "";

        var ta = document.createElement("textarea");
        ta.autofocus = true;
        ta.value = that.properties.value;
        ta.onkeyup = function(e){
            let str = ta.value
            if (e.keyCode == 32) {
                // str = str.replace(/&| and /ig, '∧');
                // str = str.replace(/\|| or /ig, '∨');
                str = str.replace(/~|-(?!>)| not /ig, '¬');
                // str = str.replace(/<->|<=>| iff /ig, '↔');
                // str = str.replace(/->|=>| then /g, '→');
                // str = str.replace(/!A|Ɐ/g, '∀');
                // str = str.replace(/!E/g, '∃');
                str = str.replace(/!I/g, '⊥');
                str = str.replace(/!V/g, '⊤');
                // str = str.replace(/\\?forall[\{ ]?\}?/g, '∀');
                // str = str.replace(/\\?exists[\{ ]?\}?/g, '∃');
                str = str.replace(/\\?top[\{ ]?\}?/g, '⊤');
                str = str.replace(/\\?bottom[\{ ]?\}?/g, '⊥');
                str = str.replace(/(\\neg|\\lnot)[\{ ]?\}?/g, '¬');
                // str = str.replace(/(\\vee|\\lor)[\{ ]?\}?/g, '∨');
                // str = str.replace(/(\\wedge|\\land)[\{ ]?\}?/g, '∧');
                // str = str.replace(/(\\implies|\\rightarrow)[\{ ]?\}?/g, '→');
                // str = str.replace(/\\iff|\\leftrightarrow[\{ ]?\}?/g, '↔');
            }
            ta.value = str;
        }

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
                    ta.value = fr.result.replaceAll(/(\r\n|\n|\r|\t)/gm, " ");
                    rewriteFPLInput(ta);
                    aux.remove();
    
                    that.setState("ready");
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
    this.widget5 = this.addWidget("number","entries", 0, "entries", { min: 0, step: 10, precision:0} );
    this.widgets.pop();


    this.widgets_up = true;
    this.size = this.computeSize();

    this.title ="ClauseSetFOL";
    this.desc = "It allows defining a set of FOL clauses. It can be done by one of these ways: <ul><li> Through a file where each clause must be ended by a period ('.') and must follow the notation rules given in ClauseFOL.</li><li>As a collector of FOL clauses (max. 10 clauses).</li><li>From a set of formulas in cnf form.</li><li>From a set of formulas which will be parsed into clausal form.</li></ul>";

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

ClauseSetFOL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

ClauseSetFOL.prototype.myComputeSize = function(){
    var that = this;
    var size = that.computeSize();
    if (that.horizontal) {
       return [size[0], Math.min(that.size[1], (that.properties.source == "input" ? 120 : 80))];
    } else {
        return size;
    }
}


ClauseSetFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.myComputeSize();
    }
}

ClauseSetFOL.prototype.onPropertyChanged = function(){
    var that = this;

    this.setState("edited");

    switch (that.properties['source']) {
        case "input":
            var arity = 0;
            var il = that.inputs.length;
            for (let index = il-1; index >= 0; index-=1) {
                that.disconnectInput(index);
            }
            that.inputs = [];
            
            var widget5Index = that.widgets.indexOf(that.widget5);
            if(widget5Index > -1){that.widgets.splice(widget5Index, 1);};

            
            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index == -1){that.widgets.push(that.widget3);};
            break;

        
    
        case "collect":    
            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index > -1){that.widgets.splice(widget3Index, 1);};

            var widget5Index = that.widgets.indexOf(that.widget5);
            if(widget5Index == -1){that.widgets.push(that.widget5);};

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "ClauseFOL"){
                this.widget5.value = 0;
                that.properties['entries'] = 0;
            }

            var arity = parseInt(that.properties['entries']);
            var il = that.inputs.length;

            for (let index = il-1; index >= arity; index--) {
                that.disconnectInput(index);
            }
            
            that.inputs.splice(arity);

            var il = that.inputs.length;
            for (let index = 0; index < (arity - il); index++) {
                that.addInput(``, "ClauseFOL");
            }
            
            that.properties['value'] = "";
            break;

        case "union":    
            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index > -1){that.widgets.splice(widget3Index, 1);};

            var widget5Index = that.widgets.indexOf(that.widget5);
            if(widget5Index == -1){that.widgets.push(that.widget5);};

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "ClauseSetFOL"){
                this.widget5.value = 0;
                that.properties['entries'] = 0;
            }

            var arity = parseInt(that.properties['entries']);
            var il = that.inputs.length;

            for (let index = il-1; index >= arity; index--) {
                that.disconnectInput(index);
            }
            
            that.inputs.splice(arity);

            var il = that.inputs.length;
            for (let index = 0; index < (arity - il); index++) {
                that.addInput(``, "ClauseSetFOL");
            }
            
            that.properties['value'] = "";
            break;

        default:
        
            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index > -1){that.widgets.splice(widget3Index, 1);};

            var widget5Index = that.widgets.indexOf(that.widget5);
            if(widget5Index > -1){that.widgets.splice(widget5Index, 1);};

          
            if (that.inputs.length != 1 || that.inputs[0].type != 'SetFOL'){
                for (let index = il-1; index >= 0; index--) {
                    that.disconnectInput(index);
                }

                that.inputs = [];
                that.addInput(``, "SetFOL");
            }

            that.properties['value'] = "";
            break;
            
    }
   
    this.size = this.myComputeSize();
}

ClauseSetFOL.prototype.generateQuery = function(){
    var query = "";
    
    switch (this.properties["source"]) {
        case "file":
            query = JSON.stringify({ nodeId: this.id, nodeType: "ClauseSetFOL", content:  JSON.stringify({option: "fromFile", input : this.properties["value"]})});
            break;
    
        case "collect":
        case "union":
            var links =  graph.links;
            query = JSON.stringify({ nodeId: this.id, nodeType: "ClauseSetFOL", content:  JSON.stringify({option: this.properties["source"], input : JSON.stringify(
                this.inputs.map(i => {return links[i.link];}))})});
            break;

        default: 
            var links =  graph.links;
            var query = "";
            var l =  links[this.inputs[0].link];
            query = JSON.stringify({ 
                nodeId: this.id,
                nodeType: "ClauseSetFOL", 
                content:  JSON.stringify({
                    option: this.properties["source"], 
                    input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});

    }
    console.log(query);
    return query; 
}

ClauseSetFOL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['FOL Clause Sets'][this.id] = response.message;
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


// SemanticTableauFOL

function SemanticTableauFOL() {
    var that = this;
    this.addInput("", "SetFOL");
    this.addProperty("state", "init");
    this.addProperty("maxC", 1);
    this.addProperty("maxS", 1);
    this.addProperty("maxU", 1);
    this.addProperty("maxD", 1);
    this.addProperty("inputMode", "sfol");
    this.addProperty("performMode", "enhanced");
    this.widget6 = this.addWidget("combo","mode", "enhanced", "performMode", { values:["basic", "enhanced"]} );  //link to property value
    this.widget5 = this.addWidget("combo","inputMode", "sfol", "inputMode", { values:["sfol", "ffol"]} );
    this.widget = this.addWidget("number","maxC", 0, "maxC", { min: 0, step: 10, precision:0} );
    this.widget3 = this.addWidget("number","maxS", 0, "maxS", { min: 0, step: 10, precision:0} );
    this.widget7 = this.addWidget("number","maxD", 0, "maxD", { min: 0, step: 10, precision:0} );
    this.widgets.pop();
    this.widget8 = this.addWidget("number","maxU", 0, "maxU", { min: 0, step: 10, precision:0} );
    this.widgets.pop();
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widget4 = this.addWidget("button", "SHOW GRAPH", "", function(){
        openGRAPHSPANEL();
        displayGraph(that.id);
    });
    this.widgets.pop();
    
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "SemanticTableauFOL";
    this.desc = "Perform Semantic Tableau Algorithm over SFOL or FFOL(it incorporates mechanisms for handling equality in enhanced mode). Due to undecidability of SAT in FOL, it is requested: <ul> <li> A limit both for the number of times a gamma is usable (maxU) and the depth (maxD) of the tableau, in basic mode. </li> <li> A limit both for the maximum size of elements in the universe (maxS) as for the maximum numbers of constants that can be generated (maxC), in enhanced mode.";

    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

SemanticTableauFOL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

SemanticTableauFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

SemanticTableauFOL.prototype.onPropertyChanged = function(){

    switch (this.properties.inputMode) {
        case "sfol":
            if (this.inputs[0].type != "SetFOL"){
                this.disconnectInput(0);
                this.inputs[0].type = "SetFOL"
            }
            break;
            
        
        case "ffol":
            if (this.inputs[0].type != "FormulaFOL"){
                this.disconnectInput(0);
                this.inputs[0].type = "FormulaFOL"
            }
            break;

    }

    switch (this.properties.performMode) {
        case "enhanced":

            var widget7Index = this.widgets.indexOf(this.widget7);
            if(widget7Index > -1){this.widgets.splice(widget7Index, 1);};

            var widget8Index = this.widgets.indexOf(this.widget8);
            if(widget8Index > -1){this.widgets.splice(widget8Index, 1);};
        
            if (!this.widgets.includes(this.widget)){
                this.widgets.push(this.widget);
            }
            if (!this.widgets.includes(this.widget3)){
                this.widgets.push(this.widget3);
            }
            break;
            
        
        case "basic":
            var widgetIndex = this.widgets.indexOf(this.widget);
            if(widgetIndex > -1){this.widgets.splice(widgetIndex, 1);};

            var widget3Index = this.widgets.indexOf(this.widget3);
            if(widget3Index > -1){this.widgets.splice(widget3Index, 1);};
        
            if (!this.widgets.includes(this.widget7)){
                this.widgets.push(this.widget7);
            }
            if (!this.widgets.includes(this.widget8)){
                this.widgets.push(this.widget8);
            }
            break;

    }

    if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
        this.setState("ready");
    } else {
        this.setState("edited");
    }
    this.size = this.computeSize();
}

SemanticTableauFOL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "SemanticTableauFOL", 
         content:  JSON.stringify({
                input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot}), 
                option: JSON.stringify({
                    input_mode : this.properties.inputMode, 
                    perform_mode : this.properties.performMode,
                    maxSD: this.properties.performMode == "enhanced" ? this.properties['maxS'] : this.properties['maxD'] , 
                    maxCU: this.properties.performMode == "enhanced" ? this.properties['maxC'] : this.properties['maxU']
                })
            })
        });
    
            
    console.log(query);
    return query; 
}

SemanticTableauFOL.prototype.processResponse = function(response){
    console.log(response);
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['Graphs'][this.id] = {type:'dot', typeExtra:'SemanticTableauFOL',  content:response.message};
            
            this.setState("uptodate");
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

function ResolutionGraphFOL() {
    var that = this;
    this.addInput("", "ClauseSetFOL")
    this.addProperty("state", "init");
    this.addProperty("performMode", "Standard");
    this.widget = this.addWidget("combo","performMode", "Standard", "performMode", { 
        values:["Standard", "Linear", "Positive", "Negative"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widget4 = this.addWidget("button", "SHOW GRAPH", "", function(){
        openGRAPHSPANEL();
        displayGraph(that.id);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "ResolutionGraphFOL"; 
    this.desc = `Perform Resolution  Algorithm (Graph version) over a set of Clauses FOL. Different strategies can be applied: "Standard", "Linear", "Positive", "Negative", "Unitary", "By entries"`;

    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

ResolutionGraphFOL.prototype.antecessorChange = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

ResolutionGraphFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        var widget4Index = this.widgets.indexOf(this.widget4);
        if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

ResolutionGraphFOL.prototype.onPropertyChanged = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    this.setState("edited");
    this.onConnectionsChange(LiteGraph.INPUT);
}

ResolutionGraphFOL.prototype.generateQuery = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "ResolutionGraphFOL", 
         content:  JSON.stringify({
             option: `${this.properties.performMode.toLowerCase()}`, 
             input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});

    
            
    console.log(query);
    return query; 
}

ResolutionGraphFOL.prototype.processResponse = function(response){
    console.log(response);
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['Graphs'][this.id] = {type:'dot', typeExtra:'ResolutionGraph',  content:response.message};
            
    
            this.setState("uptodate");
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


// HERBRAND WORKS

// HerbrandUniverseFOL

function HerbrandUniverseFOL() {
    var that = this;
    this.addInput("", "SetFOL");
    this.addProperty("state", "init");
    this.addProperty("n", 1);
    this.widget = this.addWidget("number","n", 0, "n", { min: 0, step: 10, precision:0} );
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "Herbrand Universe FOL";
    this.desc = "It gives the Herbrand's n-order universe corresponding to the set of formulas given.";

    this.color = LGraphCanvas.node_colors.cyan.color;
    this.bgcolor = LGraphCanvas.node_colors.cyan.bgcolor;
}

HerbrandUniverseFOL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

HerbrandUniverseFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

HerbrandUniverseFOL.prototype.onPropertyChanged = function(){
    if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
        this.setState("ready");
    } else {
        this.setState("edited");
    }
    this.size = this.computeSize();
}

HerbrandUniverseFOL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "HerbrandUniverseFOL", 
         content:  JSON.stringify({input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot}), n:this.properties['n']})});
    
            
    console.log(query);
    return query; 
}

HerbrandUniverseFOL.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['HerbrandWs'][this.id] = response.message;

            this.setState("uptodate");
            
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

// HerbrandBaseFOL

function HerbrandBaseFOL() {
    var that = this;
    this.addInput("", "SetFOL");
    this.addProperty("state", "init");
    this.addProperty("n", 1);
    this.widget = this.addWidget("number","n", 0, "n", { min: 0, step: 10, precision:0} );
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "HerbrandBaseFOL";
    this.desc = "It gives the Herbrand's n-order base corresponding to the set of formulas given.";

    this.color = LGraphCanvas.node_colors.cyan.color;
    this.bgcolor = LGraphCanvas.node_colors.cyan.bgcolor;
}

HerbrandBaseFOL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

HerbrandBaseFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

HerbrandBaseFOL.prototype.onPropertyChanged = function(){
    if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
        this.setState("ready");
    } else {
        this.setState("edited");
    }
    this.size = this.computeSize();
}

HerbrandBaseFOL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "HerbrandBaseFOL", 
         content:  JSON.stringify({input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot}), n:this.properties['n']})});
    
            
    console.log(query);
    return query; 
}

HerbrandBaseFOL.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['HerbrandWs'][this.id] = response.message;

            this.setState("uptodate");
            
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


// Herbrand Interpretations

function HerbrandInterpretationsFOL() {
    var that = this;
    this.addInput("", "SetFOL");
    this.addProperty("state", "init");
    this.addProperty("n", 1);
    this.widget = this.addWidget("number","n", 0, "n", { min: 0, step: 10, precision:0} );
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "Herbrand Interpretations FOL";
    this.desc = "It gives the Herbrand's n-order interpretations corresponding to the set of formulas given.";

    this.color = LGraphCanvas.node_colors.cyan.color;
    this.bgcolor = LGraphCanvas.node_colors.cyan.bgcolor;
}

HerbrandInterpretationsFOL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

HerbrandInterpretationsFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

HerbrandInterpretationsFOL.prototype.onPropertyChanged = function(){
    if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
        this.setState("ready");
    } else {
        this.setState("edited");
    }
    this.size = this.computeSize();
}

HerbrandInterpretationsFOL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "HerbrandInterpretationsFOL", 
         content:  JSON.stringify({input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot}), n:this.properties['n']})});
    
            
    console.log(query);
    return query; 
}

HerbrandInterpretationsFOL.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['HerbrandWs'][this.id] = response.message;

            this.setState("uptodate");
            
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


// Herbrand Models

function HerbrandModelsFOL() {
    var that = this;
    this.addInput("", "SetFOL");
    this.addProperty("state", "init");
    this.addProperty("n", 1);
    this.widget = this.addWidget("number","n", 0, "n", { min: 0, step: 10, precision:0} );
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "Herbrand Models FOL";
    this.desc = "It gives the Herbrand's n-order models corresponding to the set of formulas given.";

    this.color = LGraphCanvas.node_colors.cyan.color;
    this.bgcolor = LGraphCanvas.node_colors.cyan.bgcolor;
}

HerbrandModelsFOL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

HerbrandModelsFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

HerbrandModelsFOL.prototype.onPropertyChanged = function(){
    if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
        this.setState("ready");
    } else {
        this.setState("edited");
    }
    this.size = this.computeSize();
}

HerbrandModelsFOL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "HerbrandModelsFOL", 
         content:  JSON.stringify({input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot}), n:this.properties['n']})});
    
            
    console.log(query);
    return query; 
}

HerbrandModelsFOL.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['HerbrandWs'][this.id] = response.message;

            this.setState("uptodate");
            
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


// Herbrand Extension

function HerbrandExtensionFOL() {
    var that = this;
    this.addInput("", "SetFOL");
    this.addOutput("", "SetPL")
    this.addProperty("state", "init");
    this.addProperty("n", 1);
    this.widget = this.addWidget("number","n", 0, "n", { min: 0, step: 10, precision:0} );
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "Herbrand Extension FOL";
    this.desc = "It gives the Herbrand's n-order extension corresponding to the set of formulas given.";

    this.color = LGraphCanvas.node_colors.cyan.color;
    this.bgcolor = LGraphCanvas.node_colors.cyan.bgcolor;
}

HerbrandExtensionFOL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

HerbrandExtensionFOL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

HerbrandExtensionFOL.prototype.onPropertyChanged = function(){
    if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
        this.setState("ready");
    } else {
        this.setState("edited");
    }
    this.size = this.computeSize();
}

HerbrandExtensionFOL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "HerbrandExtensionFOL", 
         content:  JSON.stringify({input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot}), n:this.properties['n']})});
    
            
    console.log(query);
    return query; 
}

HerbrandExtensionFOL.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['HerbrandWs'][this.id] = response.message;
            MEMORY['PL Formulas'][this.id] = response.message;
            
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

