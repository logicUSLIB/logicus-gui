function FormulaLTL() {
    var that = this;
    this.addProperty("state", "init");
    this.addProperty("value", "");
    this.addOutput("", "FormulaLTL");
    this.widget = this.addWidget("button","INPUT FORMULA", "", function(){
        const desc_title = document.getElementById("desc-node_title");
        const desc_content = document.getElementById("desc-content");
        const desc_node = document.getElementById("desc-node");
        desc_node.classList.remove(["uptodate", "error"]);

        desc_title.innerHTML = "Formula LTL - ";
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
                str = str.replace(/\[\]/ig, '□');
                str = str.replace(/<>/ig, '◇');
                str = str.replace(/\(\)/ig, '○');
                str = str.replace(/<->|<=>| iff /ig, '↔');
                str = str.replace(/->|=>| then /g, '→');
                // str = str.replace(/!A|Ɐ/g, '∀');
                // str = str.replace(/!E/g, '∃');
                str = str.replace(/!F/g, '⊥');
                str = str.replace(/!T/g, '⊤');
                // str = str.replace(/\\?forall[\{ ]?\}?/g, '∀');
                // str = str.replace(/\\?exists[\{ ]?\}?/g, '∃');
                str = str.replace(/\\?top[\{ ]?\}?/g, '⊥');
                str = str.replace(/\\?bot[\{ ]?\}?/g, '⊤');
                str = str.replace(/(\\neg|\\lnot)[\{ ]?\}?/g, '¬');
                str = str.replace(/(\\vee|\\lor)[\{ ]?\}?/g, '∨');
                str = str.replace(/(\\wedge|\\land)[\{ ]?\}?/g, '∧');
                str = str.replace(/(\\implies|\\rightarrow)[\{ ]?\}?/g, '→');
                str = str.replace(/\\iff|\\leftrightarrow[\{ ]?\}?/g, '↔');
                str = str.replace(/\\Box|\\square/ig, '□');
                str = str.replace(/\\diamond/ig, '◇');
                str = str.replace(/\\circle/ig, '○');
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
        
    });  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery(); 
        console.log(query);
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();
    
    this.title = "FormulaLTL";
    this.desc = `It allows defining a LTL formula from a string. The string must satisfy the following rules: <ul><li> <u>Propositional variables</u> must correspond to strings of lowercase characters indexed, optionally, by a series of indices, corresponding to integers, specified between the symbols '{' and '}' and separated by commas. Examples of valid propositional variables are 'p', 'p_{1}', 'p_{1,2,3}'.</li> <li> <u>Conectives:</u> '-' for negation, '&' for conjunction, '|' for disjunction, '->' for implication, and '<->' for equivalence, '[]' or '!G' for globally, '<>' eventually in the future, '()'. This order gives the association priority if it is not explicitly given by using the the brackets '('...')'.</li><li> <u>Others</u>: The inconsistent formula is represented by the symbol '!F' and the valid formula by the symbol '!V'. </li>`
    
    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}


function rewriteLTLInput(ta){
    str = ta.value;
    str = str.replace(/&| and /ig, '∧');
    str = str.replace(/\|| or /ig, '∨');
    str = str.replace(/~|-(?!>)| not /ig, '¬');
    str = str.replace(/\[\]/ig, '□');
    str = str.replace(/<>/ig, '◇');
    str = str.replace(/\(\)/ig, '○');
    str = str.replace(/<->|<=>| iff /ig, '↔');
    str = str.replace(/->|=>| then /g, '→');
    // str = str.replace(/!A|Ɐ/g, '∀');
    // str = str.replace(/!E/g, '∃');
    str = str.replace(/!F/g, '⊥');
    str = str.replace(/!T/g, '⊤');
    // str = str.replace(/\\?forall[\{ ]?\}?/g, '∀');
    // str = str.replace(/\\?exists[\{ ]?\}?/g, '∃');
    str = str.replace(/\\?top[\{ ]?\}?/g, '⊥');
    str = str.replace(/\\?bot[\{ ]?\}?/g, '⊤');
    str = str.replace(/(\\neg|\\lnot)[\{ ]?\}?/g, '¬');
    str = str.replace(/(\\vee|\\lor)[\{ ]?\}?/g, '∨');
    str = str.replace(/(\\wedge|\\land)[\{ ]?\}?/g, '∧');
    str = str.replace(/(\\implies|\\rightarrow)[\{ ]?\}?/g, '→');
    str = str.replace(/\\iff|\\leftrightarrow[\{ ]?\}?/g, '↔');
    str = str.replace(/\\Box|\\square/ig, '□');
    str = str.replace(/\\diamond/ig, '◇');
    str = str.replace(/\\circle/ig, '○');
    ta.value = str;
}

FormulaLTL.prototype.generateQuery = function(){
    return JSON.stringify({ nodeId: this.id, nodeType: "FormulaLTL", content: this.properties["value"] }); 
}

FormulaLTL.prototype.onPropertyChanged = function(){
    this.setState("edited");
    this.properties["value"] = this.properties["value"].replace(/\t\s/g, '');
    
    if(this.properties["value"] != ""){
       this.setState("ready");
    }else{
        this.setState("edited")
    }
    this.size = this.computeSize();
}

FormulaLTL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            // this.widget.value = response.message;
            this.setState("uptodate");
            MEMORY['LTL Formulas'][this.id] = response.message;
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

function SetLTL() {
    var that = this;
    this.inputs = [];
    this.addProperty("state", "init");
    this.addProperty("source", "input");
    this.addProperty("value", "");
    this.addProperty("entries", 0);
    this.addOutput("", "SetLTL")
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
        desc_node.classList.remove(["uptodate", "error"]);

        desc_title.innerHTML = "Set LTL - ";
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
                str = str.replace(/\[\]/ig, '□');
                str = str.replace(/<>/ig, '◇');
                str = str.replace(/\(\)/ig, '○');
                str = str.replace(/<->|<=>| iff /ig, '↔');
                str = str.replace(/->|=>| then /g, '→');
                // str = str.replace(/!A|Ɐ/g, '∀');
                // str = str.replace(/!E/g, '∃');
                str = str.replace(/!F/g, '⊥');
                str = str.replace(/!T/g, '⊤');
                // str = str.replace(/\\?forall[\{ ]?\}?/g, '∀');
                // str = str.replace(/\\?exists[\{ ]?\}?/g, '∃');
                str = str.replace(/\\?top[\{ ]?\}?/g, '⊥');
                str = str.replace(/\\?bot[\{ ]?\}?/g, '⊤');
                str = str.replace(/(\\neg|\\lnot)[\{ ]?\}?/g, '¬');
                str = str.replace(/(\\vee|\\lor)[\{ ]?\}?/g, '∨');
                str = str.replace(/(\\wedge|\\land)[\{ ]?\}?/g, '∧');
                str = str.replace(/(\\implies|\\rightarrow)[\{ ]?\}?/g, '→');
                str = str.replace(/\\iff|\\leftrightarrow[\{ ]?\}?/g, '↔');
                str = str.replace(/\\Box|\\square/ig, '□');
                str = str.replace(/\\diamond/ig, '◇');
                str = str.replace(/\\circle/ig, '○');
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

    this.widget4 = this.addWidget("number","entries", 0, "entries", { min: 0, step: 10, precision:0} );
    this.widgets.pop();

    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "SetLTL";
    this.desc = "It allows defining a set of propositional formulas. <ul><li>It can be done through a file where each formula must be ended by a period ('.') and must follow the notation rules given in FormulaLTL.</li><li>Also, it can be used as a collector of propositional formulas (max. 10 formulas).</li></ul>";

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

SetLTL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

SetLTL.prototype.myComputeSize = function(){
    var that = this;
    var size = that.computeSize();
    if (that.horizontal) {
       return [size[0], Math.min(that.size[1], (that.properties.source == "file" ? 120 : 80))];
    } else {
        return size;
    }
}

SetLTL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.myComputeSize();
    }
}

SetLTL.prototype.onPropertyChanged = function(){
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
            

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "FormulaLTL"){
                this.widget4.value = 0;
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
                that.addInput(``, "FormulaLTL");
            }
            
            that.properties['value'] = "";
            break;

        case "union":

            var widget4Index = that.widgets.indexOf(that.widget4);
            if(widget4Index == -1){that.widgets.push(that.widget4);};
            
            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index > -1){that.widgets.splice(widget3Index, 1);};
            

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "SetLTL"){
                console.log("paso");
                this.widget4.value = 0;
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
                that.addInput(``, "SetLTL");
            }
            
            that.properties['value'] = "";
            break;
            
    }
    
    this.setState("edited");
    this.size = this.myComputeSize();
}

SetLTL.prototype.generateQuery = function(){
    var query = "";
    
    switch (this.properties["source"]) {
        case "input":
            query = JSON.stringify({ nodeId: this.id, nodeType: "SetLTL", content:  JSON.stringify({option: "fromFile", input : this.properties["value"].replaceAll(/(\r\n|\n|\r|\t)/gm, "")})});
            break;
    
        case "collect":
            var links =  graph.links;
            query = JSON.stringify({ nodeId: this.id, nodeType: "SetLTL", content:  JSON.stringify({option: "collect", input : JSON.stringify(
                this.inputs.map(i => {return links[i.link];}))})});
            break;

        case "union":
            var links =  graph.links;
            query = JSON.stringify({ nodeId: this.id, nodeType: "SetLTL", content:  JSON.stringify({option: "union", input : JSON.stringify(
                this.inputs.map(i => {return links[i.link];}))})});
            break;
    }
    console.log(query);
    return query; 
}

SetLTL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['LTL Sets'][this.id] = response.message;
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

function SemanticTableauLTL() {
    var that = this;
    this.addInput("", "SetLTL")
    this.addProperty("state", "init");
    this.addProperty("performMode", "only tableau");
    this.addProperty("inputMode", "set");
    // this.addProperty("resultMode", "AsFormula");
    this.addOutput("", "SemanticTableauLTL");
    this.widget5 = this.addWidget("combo","inputMode", "set", "inputMode", { values:["set", "formula"]} );  //link to property value
    // this.widget3 = this.addWidget("combo","resultMode", "AsFormula", "resultMode", { values:["NoSimp", "Minimal", "AsFormula"]} );  //link to property value
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

    this.title = "";
    this.desc = "It performs the algorithm of Semantic Tableaux over a formula LTL or a set of LTL formulas.";

    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

SemanticTableauLTL.prototype.antecessorChange = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

SemanticTableauLTL.prototype.onConnectionsChange = function( connection ){
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

SemanticTableauLTL.prototype.onPropertyChanged = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    switch (this.properties.inputMode) {
        case "set":
            if (this.inputs[0].type != "SetLTL"){
                this.disconnectInput(0);
                this.inputs[0].type = "SetLTL"
            }
            break;
            
        
        case "formula":
            if (this.inputs[0].type != "FormulaLTL"){
                this.disconnectInput(0);
                this.inputs[0].type = "FormulaLTL"
            }
            break;

    }
}

SemanticTableauLTL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "SemanticTableauLTL", 
         content:  JSON.stringify({
             option: JSON.stringify({input_mode : this.properties.inputMode.toLowerCase(), 
                perform_mode : this.properties.performMode.toLowerCase()}), 
             input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});

    console.log(query);
    return query; 
}

SemanticTableauLTL.prototype.processResponse = function(response){
    var that = this;
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.addProperty("value_graph", "");
            this.properties["value_"] = response.message.result;
            this.properties["value_graph"] = response.message.graph;
            MEMORY['Graphs'][this.id] = {type:'dot', typeExtra:'SemanticTableauLTL',  content:response.message.graph};
       
            if (!this.widgets.includes(this.widget4)){
                this.widgets.push(this.widget4);
            }
            this.setState("uptodate");
            if (ERRORS[this.id]){
                delete ERRORS[this.id];
            }
            break;
        
        default:
            var widget4Index = this.widgets.indexOf(this.widget4);
            if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
            ERRORS[this.id] = response.message;
            this.setState("error");
            break;
    }
}


function CheckTableauLTL() {
    var that = this;
    this.addInput("", "SemanticTableauLTL")
    this.addProperty("state", "init");
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
    this.widget5 = this.addWidget("button", "UNSATISFIABLE", "", function(){
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "";
    this.desc = "It check the satisfiability of Semantic Tableaux LTL.";

    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

CheckTableauLTL.prototype.antecessorChange = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

CheckTableauLTL.prototype.onConnectionsChange = function( connection ){
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

CheckTableauLTL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
        nodeType: "CheckTableauLTL", 
        content:  JSON.stringify({
            input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});

    console.log(query);
    return query; 
}

CheckTableauLTL.prototype.processResponse = function(response){
    var that = this;
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.addProperty("value_graph", "");
            this.properties["value_"] = response.message.result;
            this.properties["value_graph"] = response.message.graph;
            MEMORY['Graphs'][this.id] = {type:'dot', typeExtra:'LTL Model',  content:response.message.graph};
       
            var widget5Index = this.widgets.indexOf(this.widget5);
            if(widget5Index > -1){this.widgets.splice(widget5Index, 1);};

            if (!this.widgets.includes(this.widget4)){
                this.widgets.push(this.widget4);
            }
            this.setState("uptodate");
            if (ERRORS[this.id]){
                delete ERRORS[this.id];
            }
            break;

        case 1:
            var widget4Index = this.widgets.indexOf(this.widget4);
            if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};

            if (!this.widgets.includes(this.widget5)){
                this.widgets.push(this.widget5);
            }
            this.setState("uptodate");
            if (ERRORS[this.id]){
                delete ERRORS[this.id];
            }
            break;
        
        default:
            var widget4Index = this.widgets.indexOf(this.widget4);
            if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
            ERRORS[this.id] = response.message;
            this.setState("error");
            break;
    }
}