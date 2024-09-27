// FormulaPL

function FormulaPL() {
    var that = this;
    this.addProperty("state", "init");
    this.addProperty("value", "");
    this.addOutput("", "FormulaPL");
    this.widget = this.addWidget("button","INPUT FORMULA", "", function(){
        const desc_title = document.getElementById("desc-node_title");
        const desc_content = document.getElementById("desc-content");
        const desc_node = document.getElementById("desc-node");
        desc_node.classList.remove(["uptodate", "error"]);

        desc_title.innerHTML = "Formula PL - ";
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
                // str = str.replace(/!A|Ɐ/g, '∀');
                // str = str.replace(/!E/g, '∃');
                str = str.replace(/!F/g, '⊥');
                str = str.replace(/!V/g, '⊤');
                // str = str.replace(/\\?forall[\{ ]?\}?/g, '∀');
                // str = str.replace(/\\?exists[\{ ]?\}?/g, '∃');
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
        
    });  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery(); 
        console.log(query);
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();
    
    this.title = "FormulaPL";
    this.desc = `It allows defining a propositional formula  from a string. The string must satisfy the following rules: <ul><li> <u>Propositional variables</u> must correspond to strings of lowercase characters indexed, optionally, by a series of indices, corresponding to integers, specified between the symbols '{' and '}' and separated by commas. Examples of valid propositional variables are 'p', 'p_{1}', 'p_{1,2,3}'.</li> <li> <u>Conectives:</u> '-' for negation, '&' for conjunction, '|' for disjunction, '->' for implication, and '<->' for equivalence. This order gives the association priority if it is not explicitly given by using the the brackets '('...')'.</li><li> <u>Others</u>: The inconsistent formula is represented by the symbol '!I' and the valid formula by the symbol '!V'. </li>`
    
    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}


function rewriteFPLInput(ta){
    str = ta.value;
    str = str.replace(/&| and /ig, '∧');
    str = str.replace(/\|| or /ig, '∨');
    str = str.replace(/~|-(?!>)| not /ig, '¬');
    str = str.replace(/<->|<=>| iff /ig, '↔');
    str = str.replace(/->|=>| then /g, '→');
    // str = str.replace(/!A|Ɐ/g, '∀');
    // str = str.replace(/!E/g, '∃');
    str = str.replace(/!F/g, '⊥');
    str = str.replace(/!V/g, '⊤');
    // str = str.replace(/\\?forall[\{ ]?\}?/g, '∀');
    // str = str.replace(/\\?exists[\{ ]?\}?/g, '∃');
    str = str.replace(/\\?top[\{ ]?\}?/g, '⊤');
    str = str.replace(/\\?bottom[\{ ]?\}?/g, '⊥');
    str = str.replace(/(\\neg|\\lnot)[\{ ]?\}?/g, '¬');
    str = str.replace(/(\\vee|\\lor)[\{ ]?\}?/g, '∨');
    str = str.replace(/(\\wedge|\\land)[\{ ]?\}?/g, '∧');
    str = str.replace(/(\\implies|\\rightarrow)[\{ ]?\}?/g, '→');
    str = str.replace(/\\iff|\\leftrightarrow[\{ ]?\}?/g, '↔');
    ta.value = str;
}




FormulaPL.prototype.generateQuery = function(){
    return JSON.stringify({ nodeId: this.id, nodeType: "FormulaPL", content: this.properties["value"] }); 
}

FormulaPL.prototype.onPropertyChanged = function(){
    this.setState("edited");
    this.properties["value"] = this.properties["value"].replace(/\t\s/g, '');
    
    if(this.properties["value"] != ""){
       this.setState("ready");
    }else{
        this.setState("edited")
    }
    this.size = this.computeSize();
}

FormulaPL.prototype.processResponse = function(response){
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


// ConnectivePL

function ConnectivePL() {
    var that = this;
    this.addInput("", "FormulaPL")
    this.addProperty("state", "init");
    this.addProperty("class", "¬");
    this.addOutput("", "FormulaPL")
    this.widget = this.addWidget("combo","connective", "¬", "class", { values:["¬","∧","∨","→","↔"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "ConnectivePL";
    this.desc = "Make a new PL formula with the connective and formula(s) given" ;

    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

ConnectivePL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

ConnectivePL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

ConnectivePL.prototype.onPropertyChanged = function(){
    var that = this;

    var arity = that.properties['class'] == "¬" ? 1 : 2;

    var il = that.inputs.length;

    for (let index = il-1; index >= arity; index--) {
        that.disconnectInput(index);
    }
    
    that.inputs.splice(arity);

    var il = that.inputs.length;
    for (let index = 0; index < (arity - il); index++) {
        that.addInput(``, "FormulaPL");
    }
   
    this.size = this.computeSize();
    this.setState("edited");
    this.onConnectionsChange();
}

ConnectivePL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    switch (this.properties['class']) {
        case "¬":
            var l =  links[this.inputs[0].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "ConnectivePL", content:  JSON.stringify({option: 'neg', input : JSON.stringify({origin1_id: l.origin_id, origin1_slot : l.origin_slot, origin2_id: 0, origin2_slot : 0 })})});
            break;
        
        case "∧":
            var l1 =  links[this.inputs[0].link];
            var l2 =  links[this.inputs[1].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "ConnectivePL", content:  JSON.stringify({option: 'conj', input : JSON.stringify({origin1_id: l1.origin_id, origin1_slot : l1.origin_slot, origin2_id: l2.origin_id, origin2_slot : l2.origin_slot})})});
            break;
        
        case "∨":
            var l1 =  links[this.inputs[0].link];
            var l2 =  links[this.inputs[1].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "ConnectivePL", content:  JSON.stringify({option: 'disj', input : JSON.stringify({origin1_id: l1.origin_id, origin1_slot : l1.origin_slot, origin2_id: l2.origin_id, origin2_slot : l2.origin_slot})})});
            break;
        
        case "→":
            var l1 =  links[this.inputs[0].link];
            var l2 =  links[this.inputs[1].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "ConnectivePL", content:  JSON.stringify({option: 'impl', input : JSON.stringify({origin1_id: l1.origin_id, origin1_slot : l1.origin_slot, origin2_id: l2.origin_id, origin2_slot : l2.origin_slot})})});
            break;
        
        case "↔":
            var l1 =  links[this.inputs[0].link];
            var l2 =  links[this.inputs[1].link];
            query = JSON.stringify({ nodeId: this.id, nodeType: "ConnectivePL", content:  JSON.stringify({option: 'equi', input : JSON.stringify({origin1_id: l1.origin_id, origin1_slot : l1.origin_slot, origin2_id: l2.origin_id, origin2_slot : l2.origin_slot})})});
            break;
    
        default:
            console.log("Unknown class of connective");
            break;
    }
            
    //console.log(query);
    return query; 
}

ConnectivePL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
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


//TransformFPL

function TransformFPL() {
    var that = this;
    this.addInput("", "FormulaPL")
    this.addProperty("state", "init");
    this.addProperty("class", "replaceEquiv");
    this.addOutput("", "FormulaPL")
    this.widget = this.addWidget("combo","transform", "replaceEquiv", "class", { values:["replaceEquiv","replaceImpl","interiorizeNegs", "interiorizeDisjs", "interiorizeConjs", "toNNF", "toCNF", "toDNF"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "TransformFPL";
    this.desc = "It allows make several transformations of a propositional formula to an equivalent one, according to the selected option: <ul><li><i>replaceEquiv</i>: replacement of each equivalence under the rule A ↔ B ≡ (A → B) ∧ (B → A).</li><li><i>replaceImpl</i>: replacement of each implication under the rule A → B ≡ ¬A ∨ B.</li><li><i>interiorizeNeg</i>: It transforms a formula to an equivalent whose negations are involved only in literals.</li><li><i>toNNF</i>: It transforms a formula to an equivalent in Negative Normal Form.</li><li><i>toCNF</i>: It transforms a formula to an equivalent in Conjunctive Normal Form.</li><li><i>toDNF</i>: It transforms a formula to an equivalent in Disjunctive Normal Form.</li></ul>";

    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

TransformFPL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

TransformFPL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

TransformFPL.prototype.onPropertyChanged = function(){
    this.size = this.computeSize();
    this.setState("edited");
}

TransformFPL.prototype.generateQuery = function(){
    var links =  graph.links;
    var l =  links[this.inputs[0].link];
    var query = JSON.stringify({ nodeId: this.id, nodeType: "TransformFPL", content:  JSON.stringify({option: this.properties["class"], input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});
            
    //console.log(query);
    return query; 
}


TransformFPL.prototype.processResponse = function(response){
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


//SET PL

function SetPL() {
    var that = this;
    this.inputs = [];
    this.addProperty("state", "init");
    this.addProperty("source", "input");
    this.addProperty("value", "");
    this.addProperty("entries", 0);
    this.addOutput("", "SetPL")
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

        desc_title.innerHTML = "Set PL - ";
        desc_content.innerHTML = "";

        var ta = document.createElement("textarea");
        ta.autofocus = true;
        ta.value = that.properties.value;
        ta.onkeyup = function(e){
            let str = ta.value
            if (e.keyCode == 32) {
                str = ta.value;
                str = str.replace(/&| and /ig, '∧');
                str = str.replace(/\|| or /ig, '∨');
                str = str.replace(/~|-(?!>)| not /ig, '¬');
                str = str.replace(/<->|<=>| iff /ig, '↔');
                str = str.replace(/->|=>| then /g, '→');
                // str = str.replace(/!A|Ɐ/g, '∀');
                // str = str.replace(/!E/g, '∃');
                str = str.replace(/!F/g, '⊥');
                str = str.replace(/!V/g, '⊤');
                // str = str.replace(/\\?forall[\{ ]?\}?/g, '∀');
                // str = str.replace(/\\?exists[\{ ]?\}?/g, '∃');
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

    this.title = "SetPL";
    this.desc = "It allows defining a set of propositional formulas. <ul><li>It can be done through a file where each formula must be ended by a period ('.') and must follow the notation rules given in FormulaPL.</li><li>Also, it can be used as a collector of propositional formulas (max. 10 formulas).</li></ul>";

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

SetPL.prototype.antecessorChange = function(){
    this.setState("edited");
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

SetPL.prototype.myComputeSize = function(){
    var that = this;
    var size = that.computeSize();
    if (that.horizontal) {
       return [size[0], Math.min(that.size[1], (that.properties.source == "file" ? 120 : 80))];
    } else {
        return size;
    }
}

SetPL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.myComputeSize();
    }
}

SetPL.prototype.onPropertyChanged = function(){
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
            

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "FormulaPL"){
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
                that.addInput(``, "FormulaPL");
            }
            
            that.properties['value'] = "";
            break;

        case "union":

            var widget4Index = that.widgets.indexOf(that.widget4);
            if(widget4Index == -1){that.widgets.push(that.widget4);};
            
            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index > -1){that.widgets.splice(widget3Index, 1);};
            

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "SetPL"){
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
                that.addInput(``, "SetPL");
            }
            
            that.properties['value'] = "";
            break;
            
    }
    
    this.setState("edited");
    this.size = this.myComputeSize();
}

SetPL.prototype.generateQuery = function(){
    var query = "";
    
    switch (this.properties["source"]) {
        case "input":
            query = JSON.stringify({ nodeId: this.id, nodeType: "SetPL", content:  JSON.stringify({option: "fromFile", input : this.properties["value"].replaceAll(/(\r\n|\n|\r|\t)/gm, "")})});
            break;
    
        case "collect":
            var links =  graph.links;
            query = JSON.stringify({ nodeId: this.id, nodeType: "SetPL", content:  JSON.stringify({option: "collect", input : JSON.stringify(
                this.inputs.map(i => {return links[i.link];}))})});
            break;

        case "union":
            var links =  graph.links;
            query = JSON.stringify({ nodeId: this.id, nodeType: "SetPL", content:  JSON.stringify({option: "union", input : JSON.stringify(
                this.inputs.map(i => {return links[i.link];}))})});
            break;
    }
    console.log(query);
    return query; 
}

SetPL.prototype.processResponse = function(response){
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


// TRANSFORM SET PL

function TransformSetPL() {
    var that = this;
    this.addInput("", "SetPL")
    this.addProperty("state", "init");
    this.addProperty("class", "neg_all");
    this.addOutput("", "SetPL")
    this.widget = this.addWidget("combo","transform", "neg_all", "class", { values:["neg_all","conj_all","disj_all", "to_cnf", "to_dnf"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "TransformSetPL";
    this.desc = "It allows making some transformations over a set of propositional formulas. The different options are: <ul><li>neg_all: it results into a set with all formulas negated</li><li>conj_all: it results into a formula that is the conjunction of the formulas of the set</li><li>disj_all: it results into a formula that is the disjunction of the formulas of the set</li><li>to_cnf: it results into a set with the cnf forms of the formulas in the original set</li><li>to_dnf: it results into a set with the dnf forms of the formulas in the original set</li></ul>"

    this.color = LGraphCanvas.node_colors.purple.color;
    this.bgcolor = LGraphCanvas.node_colors.purple.bgcolor;
}

TransformSetPL.prototype.antecessorChange = function(){
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

TransformSetPL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

TransformSetPL.prototype.onPropertyChanged = function(){
    var that = this;

    switch (that.properties['class']) {
        case "neg_all":
            if(that.outputs[0].type != "SetPL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "SetPL";
            }
            break;
        case "conj_all":
            if(that.outputs[0].type != "FormulaPL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "FormulaPL";
            }
            break;
        case "disj_all":
            if(that.outputs[0].type != "FormulaPL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "FormulaPL";
            }
            break;
        case "to_cnf":
            if(that.outputs[0].type != "SetPL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "SetPL";
            }
            break;
        case "to_dnf":
            if(that.outputs[0].type != "SetPL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "SetPL";
            }
            break;
        case "to_clauses":
            if(that.outputs[0].type != "ClauseSetPL"){
                that.disconnectOutput(0);
                that.outputs[0].type = "ClauseSetPL";
            }
            break;
        
        default:
            break;
    }
   
    this.size = this.computeSize();
    this.setState("edited");
}

TransformSetPL.prototype.generateQuery = function(){
    var links =  graph.links;
    var l =  links[this.inputs[0].link];
    var query = JSON.stringify({ nodeId: this.id, nodeType: "TransformSetPL", content:  JSON.stringify({option: this.properties["class"], input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});
            
    //console.log(query);
    return query; 
}

TransformSetPL.prototype.processResponse = function(response){
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
                    MEMORY['PL Sets'][this.id] = response.message;
                break;
                case "conj_all":
                    MEMORY['PL Formulas'][this.id] = response.message;
                    break;
                case "disj_all":
                    MEMORY['PL Formulas'][this.id] = response.message;
                    break;
                case "to_cnf":
                    MEMORY['PL Sets'][this.id] = response.message;
                    break;
                case "to_dnf":
                    MEMORY['PL Sets'][this.id] = response.message;
                    break;
                case "to_clauses":
                    MEMORY['PL Clause Sets'][this.id] = response.message;
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



// ClausePL

function ClausePL() {
    var that = this;
    this.addProperty("state", "init");
    this.addProperty("value", "");
    this.addOutput("", "ClausePL");
    this.widget3 = this.addWidget("button","INPUT CLAUSE", "", function(){
        const desc_title = document.getElementById("desc-node_title");
        const desc_content = document.getElementById("desc-content");
        const desc_node = document.getElementById("desc-node");
        desc_node.classList.remove(["uptodate", "error"]);

        desc_title.innerHTML = "Clause PL - ";
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
                str = str.replace(/!F/g, '⊥');
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

    this.title = "ClausePL";
    this.desc = "A propositional clause. It must be specified by separating the literals by , (comma). Example: p, ¬q, r";

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

ClausePL.prototype.generateQuery = function(){
    return JSON.stringify({ nodeId: this.id, nodeType: "ClausePL", content: this.properties["value"] }); 
}

ClausePL.prototype.onPropertyChanged = function(){
    this.setState("edited");
    this.properties["value"] = this.properties["value"].replace(/\t\s/g, '');
    
    if(this.properties["value"] != ""){
       this.setState("ready");
    }else{
        this.setState("edited")
    }
    this.size = this.computeSize();
}

ClausePL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            // this.widget.value = response.message;
            this.setState("uptodate");
            MEMORY['PL Clauses'][this.id] = response.message;
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





// ClauseSetPL

function ClauseSetPL() {
    var that = this;
    this.inputs = [];
    this.addProperty("state", "init");
    this.addProperty("source", "input");
    this.addProperty("value", "");
    this.addProperty("entries", 0);
    this.addOutput("", "ClauseSetPL")
    // this.widget4 = this.addWidget("button", "slotsDirection", "", function(){
    //     that.horizontal = !that.horizontal;
    //     that.size = that.myComputeSize();
    // });
    this.widget = this.addWidget("combo","source", "input", "source", { values:["input", "collect", "union", "fromCNFSet", "fromSetPL"]} );  //link to property value
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

        desc_title.innerHTML = "ClauseSet PL - ";
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
                str = str.replace(/!F/g, '⊥');
                str = str.replace(/!V/g, '⊤');
                // str = str.replace(/\\?forall[\{ ]?\}?/g, '∀');
                // str = str.replace(/\\?exists[\{ ]?\}?/g, '∃');
                str = str.replace(/\\?top[\{ ]?\}?/g, '⊥');
                str = str.replace(/\\?bottom[\{ ]?\}?/g, '⊤');
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

    this.title ="ClauseSetPL";
    this.desc = "It allows defining a set of propositional clauses. It can be done by one of these ways: <ul><li> Through a file where each clause must be ended by a period ('.') and must follow the notation rules given in ClausePL.</li><li>As a collector of propositional clause (max. 10 clauses).</li><li>From a set of formulas in cnf form.</li><li>From a set of formulas which will be parsed into clausal form.</li></ul>";

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

ClauseSetPL.prototype.antecessorChange = function(){
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

ClauseSetPL.prototype.myComputeSize = function(){
    var that = this;
    var size = that.computeSize();
    if (that.horizontal) {
       return [size[0], Math.min(that.size[1], (that.properties.source == "input" ? 120 : 80))];
    } else {
        return size;
    }
}


ClauseSetPL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.myComputeSize();
    }
}

ClauseSetPL.prototype.onPropertyChanged = function(){
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

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "ClausePL"){
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
                that.addInput(``, "ClausePL");
            }
            
            that.properties['value'] = "";
            break;

        case "union":
        
            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index > -1){that.widgets.splice(widget3Index, 1);};

            var widget5Index = that.widgets.indexOf(that.widget5);
            if(widget5Index == -1){that.widgets.push(that.widget5);};

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "ClauseSetPL"){
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
                that.addInput(``, "ClauseSetPL");
            }
            
            that.properties['value'] = "";
            break;

        default:
        
            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index > -1){that.widgets.splice(widget3Index, 1);};

            var widget5Index = that.widgets.indexOf(that.widget5);
            if(widget5Index > -1){that.widgets.splice(widget5Index, 1);};

          
            if (that.inputs.length != 1 || that.inputs[0].type != 'SetPL'){
                for (let index = il-1; index >= 0; index--) {
                    that.disconnectInput(index);
                }

                that.inputs = [];
                that.addInput(``, "SetPL");
            }

            that.properties['value'] = "";
            break;
            
    }
   
    this.size = this.myComputeSize();
}

ClauseSetPL.prototype.generateQuery = function(){
    var query = "";
    
    switch (this.properties["source"]) {
        case "input":

            query = JSON.stringify({ nodeId: this.id, nodeType: "ClauseSetPL", content:  JSON.stringify({option: "fromFile", input : this.properties["value"]})});
            break;
    
        case "collect":
            var links =  graph.links;
            query = JSON.stringify({ nodeId: this.id, nodeType: "ClauseSetPL", content:  JSON.stringify({option: "collect", input : JSON.stringify(
                this.inputs.map(i => {return links[i.link];}))})});
            break;
        
        case "union":
            var links =  graph.links;
            query = JSON.stringify({ nodeId: this.id, nodeType: "ClauseSetPL", content:  JSON.stringify({option: "union", input : JSON.stringify(
                this.inputs.map(i => {return links[i.link];}))})});
            break;

        default: 
            var links =  graph.links;
            var query = "";
            var l =  links[this.inputs[0].link];
            query = JSON.stringify({ 
                nodeId: this.id,
                nodeType: "ClauseSetPL", 
                content:  JSON.stringify({
                    option: this.properties["source"], 
                    input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});

    }
    console.log(query);
    return query; 
}

ClauseSetPL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['PL Clause Sets'][this.id] = response.message;
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


// Horn Fact PL

function HornFactPL() {
    var that = this;
    this.addProperty("state", "init");
    this.addProperty("value", "");
    this.addOutput("", "HornFactPL");
    this.widget = this.addWidget("text","value","","value");  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();
    

    this.title = "HornFactPL";
    this.desc = ` It declares a Horn fact, that is, a clause with an unique positive literal. It must  correspond to a string of lowercase characters indexed, optionally, by a series of indices, corresponding to integers, specified between the symbols '{' and '}' and separated by commas. Examples of valid facts are 'p', 'p_{1}', 'p_{1,2,3}'. The inconsistent fact is represented by the symbol '!I' and the valid one by the symbol '!V'.<br>`;

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

HornFactPL.prototype.generateQuery = function(){
    return JSON.stringify({ nodeId: this.id, nodeType: "HornFactPL", content: this.properties["value"] }); 
}

HornFactPL.prototype.onPropertyChanged = function(){
    this.setState("edited");
    this.properties["value"] = this.properties["value"].replace(/\t\s/g, '');
    
    if(this.properties["value"] != ""){
       this.setState("ready");
    }else{
        this.setState("edited")
    }
    this.size = this.computeSize();
}

HornFactPL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            // this.widget.value = response.message;
            this.setState("uptodate");
            MEMORY['HornRS'][this.id] = response.message;
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

// Horn Fact Set PL

function HornFactSetPL() {
    var that = this;
    this.addProperty("state", "init");
    this.addProperty("value", "");
    this.addProperty("source", "spec");
    this.addProperty("entries", 0);
    this.addOutput("", "HornFactSetPL");
    this.widget5 = this.addWidget("combo","source", "spec", "source", { values:["spec", "collect", "union"]});
    this.widget = this.addWidget("text","facts","","value");  //link to property value
    this.widget3 = this.addWidget("number","entries", 0, "entries", { min: 0, step: 10, precision:0} );
    this.widgets.pop();
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();
    this.desc = ` It declares a Horn fact set, that consist of a set of positive literals (expressed as a sequence separated by ,).`;

    this.title = "HornFactSetPL";
    this.inputs = [];

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

HornFactSetPL.prototype.generateQuery = function(){
    switch (this.properties["source"]) {
        case "spec":
            return JSON.stringify({ nodeId: this.id, nodeType: "HornFactSetPL", content: JSON.stringify({option: this.properties["source"], input : `${this.properties["value"]}`})});
    
        case "collect":
        case "union":
            var links =  graph.links;
            return JSON.stringify({ nodeId: this.id, nodeType: "HornFactSetPL", content: JSON.stringify({option: this.properties["source"], input : JSON.stringify(
                this.inputs.map(i => {return links[i.link];}))})});
    }
}

HornFactSetPL.prototype.onPropertyChanged = function(){
    var that = this;
    this.setState("edited");
    switch (this.properties["source"]) {
        case "spec":
            var il = this.inputs.length;
            for (let index = il-1; index >= 0; index-=1) {
                this.disconnectInput(index);
            }
            this.inputs = [];

            var widgetIndex = this.widgets.indexOf(this.widget);
            if(widgetIndex == -1){this.widgets.push(this.widget);};

            var widget3Index = this.widgets.indexOf(this.widget3);
            if(widget3Index > -1){this.widgets.splice(widget3Index, 1);};

            if (this.properties["ants"] && this.properties["consq"]){
                this.setState("ready");
            }
            break;
        case "collect":

            var widgetIndex = this.widgets.indexOf(this.widget);
            if(widgetIndex > -1){this.widgets.splice(widgetIndex, 1);};

            var widget3Index = this.widgets.indexOf(this.widget3);
            if(widget3Index == -1){this.widgets.push(this.widget3);};

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "HornFactPL"){
                this.widget5.value = 0;
                that.properties['entries'] = 0;
            }

            var arity = parseInt(this.properties['entries']);
            var il = this.inputs.length;

            for (let index = il-1; index >= arity; index--) {
                this.disconnectInput(index);
            }
            
            this.inputs.splice(arity);

            var il = this.inputs.length;
            for (let index = 0; index < (arity - il); index++) {
                this.addInput(``, "HornFactPL");
            }
            break;

        case "union":

            var widgetIndex = this.widgets.indexOf(this.widget);
            if(widgetIndex > -1){this.widgets.splice(widgetIndex, 1);};

            var widget3Index = this.widgets.indexOf(this.widget3);
            if(widget3Index == -1){this.widgets.push(this.widget3);};

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "HornFactSetPL"){
                this.widget5.value = 0;
                that.properties['entries'] = 0;
            }

            var arity = parseInt(this.properties['entries']);
            var il = this.inputs.length;

            for (let index = il-1; index >= arity; index--) {
                this.disconnectInput(index);
            }
            
            this.inputs.splice(arity);

            var il = this.inputs.length;
            for (let index = 0; index < (arity - il); index++) {
                this.addInput(``, "HornFactSetPL");
            }
            break;
    }


    this.size = this.computeSize();
}

HornFactSetPL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            this.setState("uptodate");
            MEMORY['HornRS'][this.id] = response.message;
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



// Horn Rule PL

function HornRulePL() {
    var that = this;
    this.addProperty("state", "init");
    this.addProperty("ants", "");
    this.addProperty("consq", "");
    this.addProperty("source", "spec");
    this.addOutput("", "HornRulePL");
    this.widget5 = this.addWidget("combo","source", "spec", "source", { values:["spec", "collect"]});
    this.widget = this.addWidget("text","ants","","ants");  //link to property value
    this.widget3 = this.addWidget("text","cons","","consq");
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();
    this.desc = ` It declares a Horn rule, that consist of a set of positive literals as antecedents (expressed as a sequence separated by &) and one unique fact as a consequence.`;

    this.title = "HornRulePL";
    this.inputs = [];

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

HornRulePL.prototype.generateQuery = function(){
    switch (this.properties["source"]) {
        case "spec":
            return JSON.stringify({ nodeId: this.id, nodeType: "HornRulePL", content: JSON.stringify({option: this.properties["source"], input : `${this.properties["ants"]} -> ${this.properties["consq"]}`})});
    
        case "inputs":
            var links =  graph.links;
            var l1 =  links[this.inputs[0].link];
            var l2 =  links[this.inputs[1].link];
            return JSON.stringify({ nodeId: this.id, nodeType: "HornRulePL", content: JSON.stringify({option: this.properties["source"], input : JSON.stringify({origin_id1: l1.origin_id, origin_slot1: l1.origin_slot, origin_id2: l2.origin_id, origin_slot2: l2.origin_slot})})});
    }
}

HornRulePL.prototype.onPropertyChanged = function(){
    var that = this;
    switch (this.properties["source"]) {
        case "spec":
            var il = that.inputs.length;
            for (let index = il-1; index >= 0; index-=1) {
                that.disconnectInput(index);
            }
            this.inputs = [];

            var widgetIndex = that.widgets.indexOf(that.widget);
            if(widgetIndex == -1){that.widgets.push(that.widget);};

            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index == -1){that.widgets.push(that.widget3);};

            this.setState("edited");

            if (this.properties["ants"] && this.properties["consq"]){
                this.setState("ready");
            }
            break;
    
        case "inputs":

            var widgetIndex = that.widgets.indexOf(that.widget);
            if(widgetIndex > -1){that.widgets.splice(widgetIndex, 1);};

            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index > -1){that.widgets.splice(widget3Index, 1);};

            if (this.inputs.length == 0){
                this.addInput("ants", "HornFactSetPL");
                this.addInput("consq", "HornFactPL");
            }

            this.setState("edited");
    }


    this.size = this.computeSize();
}

HornRulePL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            this.setState("uptodate");
            MEMORY['HornRS'][this.id] = response.message;
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

// Horn Rule Set PL

function HornRuleSetPL() {
    var that = this;
    this.addProperty("state", "init");
    this.addProperty("value", "");
    this.addProperty("source", "file");
    this.addProperty("entries", 0);
    this.addProperty("fileContent", "");
    this.addOutput("", "HornRuleSetPL");
    this.widget = this.addWidget("combo","source", "spec", "source", { values:["spec", "collect", "union"]});
    this.widget3 = this.addWidget("number","entries", 0, "entries", { min: 0, step: 10, precision:0} );
    this.widgets.pop();
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    
    this.widget4 = this.addWidget("button", "selectFile", "", function(){
        
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
                that.properties['fileContent'] = fr.result.replace(/(\r\n|\n|\r|\t)/gm, "");
                aux.remove();

                that.setState("ready");
            }
            
            fr.readAsText(this.files[0]);
        });

        input.click();


        
    });

    this.widgets_up = true;
    this.size = this.computeSize();
    this.desc = ` It declares a Horn rule set, that consist of a set of rules. It can be specificated as a collector or through a file. In file, each rule must me specificated as a set of facts separated by & (that constitutes the antecedents), the symbol '->', an unique fact (as consequent) and a point . for indicating the end of the rule.`;

    this.title = "HornRuleSetPL";
    this.inputs = [];

    this.color = LGraphCanvas.node_colors.pale_blue.color;
    this.bgcolor = LGraphCanvas.node_colors.pale_blue.bgcolor;
}

HornRuleSetPL.prototype.generateQuery = function(){
    switch (this.properties["source"]) {
        case "file":
            return JSON.stringify({ nodeId: this.id, nodeType: "HornRuleSetPL", content:  JSON.stringify({option: "fromFile", input : this.properties["fileContent"]})});
    
        case "collect":
        case "union":
            var links =  graph.links;
            return JSON.stringify({ nodeId: this.id, nodeType: "HornRuleSetPL", content: JSON.stringify({option: this.properties["source"], input : JSON.stringify(
                this.inputs.map(i => {return links[i.link];}))})});
            
    }
}

HornRuleSetPL.prototype.antecessorChange = function(){
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

HornRuleSetPL.prototype.onPropertyChanged = function(){
    var that = this;
    switch (this.properties["source"]) {
        case "file":
            var il = that.inputs.length;
            for (let index = il-1; index >= 0; index-=1) {
                that.disconnectInput(index);
            }
            this.inputs = [];

            var widget4Index = that.widgets.indexOf(that.widget4);
            if(widget4Index == -1){that.widgets.push(that.widget4);};

            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index > -1){that.widgets.splice(widget3Index, 1);};

            this.setState("edited");
            if (this.properties["ants"] && this.properties["consq"]){
                this.setState("ready");
            }
            break;
    
        case "collect":

            var widget4Index = that.widgets.indexOf(that.widget4);
            if(widget4Index > -1){that.widgets.splice(widget4Index, 1);};

            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index == -1){that.widgets.push(that.widget3);};

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "HornRulePL"){
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
                that.addInput(``, "HornRulePL");
            }

            this.setState("edited");
            break;

        case "union":

            var widget4Index = that.widgets.indexOf(that.widget4);
            if(widget4Index > -1){that.widgets.splice(widget4Index, 1);};

            var widget3Index = that.widgets.indexOf(that.widget3);
            if(widget3Index == -1){that.widgets.push(that.widget3);};

            if (this.inputs && this.inputs[0] && this.inputs[0].type != "HornRuleSetPL"){
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
                that.addInput(``, "HornRuleSetPL");
            }

            this.setState("edited");
            break;
    }


    this.size = this.computeSize();
}

HornRuleSetPL.prototype.processResponse = function(response){
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            this.setState("uptodate");
            MEMORY['HornRS'][this.id] = response.message;
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


// Horn Forward Chaining 

function HornFwChPL() {
    var that = this;
    this.addInput("R", "HornRuleSetPL")
    this.addInput("KB", "HornFactSetPL")
    this.addInput("G", "HornFactPL")
    this.addProperty("state", "init");
    this.addProperty("performMode", "remIrrel");
    this.widget = this.addWidget("combo","performMode", "remIrrel", "performMode", { values:["remIrrel", "remUsed"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widget4 = this.addWidget("button", "SHOW TABLE", "", function(){
        openTABLESPANEL();
        displayTable(that.id);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "HornFwChPL";
    this.desc = "Perform Forward Chaining Algorithm with respect to the rules, initial knowledge base and goal given, in the context of Horn Reasoning. It provides two possibilities: removing only used rules, or removing all rules that are irrelevant.";

    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

HornFwChPL.prototype.antecessorChange = function(){
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

HornFwChPL.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

HornFwChPL.prototype.onPropertyChanged = function(){
    this.setState("edited");
}

HornFwChPL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var lr =  links[this.inputs[0].link];
    var lkb =  links[this.inputs[1].link];
    var lg =  links[this.inputs[2].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "HornFwChPL", 
         content:  JSON.stringify({
             option: `${this.properties.performMode}`,
             input : JSON.stringify({originr_id: lr.origin_id, originr_slot : lr.origin_slot, originkb_id: lkb.origin_id, originkb_slot : lkb.origin_slot, origing_id: lg.origin_id, origing_slot : lg.origin_slot})})});

    
            
    console.log(query);
    return query; 
}

HornFwChPL.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            tablehtml = "<h3>Summary</h3><table>"
        
            rows = response.message.info.split('\n')
            tablehtml += `<thead><tr>${rows.shift().split(';').map(c => '<th>' + c + '</th>').join('')}</tr></thead>`
    
            has_body = rows.length >= 1
            if(rows){
                tablehtml += '<tbody>'      
                tablehtml +=(rows.map(r => `<tr>${r.split(';').map(c => '<th>' + c + '</th>').join('')}</tr>`).join(''))
                tablehtml += '</tbody>'
            }
            tablehtml += "</table>"

            tablehtml += "<h3>Process</h3><table>"
        
            rows = response.message.process.split('\n')
            tablehtml += `<thead><tr>${rows.shift().split(';').map(c => '<th>' + c + '</th>').join('')}</tr></thead>`
    
            has_body = rows.length >= 1
            if(rows){
                tablehtml += '<tbody>'      
                tablehtml +=(rows.map(r => `<tr>${r.split(';').map(c => '<th>' + c + '</th>').join('')}</tr>`).join(''))
                tablehtml += '</tbody>'
            }
            tablehtml += "</table>"

            MEMORY['Tables'][this.id] = {type:'HornFwChPLPL',  content:tablehtml};
            
            this.setState("uptodate");
            if (ERRORS[this.id]){
                delete ERRORS[this.id];
            }

           

            var widget4Index = this.widgets.indexOf(this.widget4);
            if(widget4Index == -1){this.widgets.push(this.widget4);};
            break;
        
        default:
            ERRORS[this.id] = response.message;
            this.setState("error");
            break;
    }
}

// Horn Backward Chaining

function HornBWCh() {
    var that = this;
    this.addInput("R", "HornRuleSetPL")
    this.addInput("KB", "HornFactSetPL")
    this.addInput("G", "HornFactPL")
    this.addProperty("state", "init");
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widget4 = this.addWidget("button", "SHOW TABLE", "", function(){
        openTABLESPANEL();
        displayTable(that.id);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "HornBWCh";
    this.desc = "Perform Backward Chaining Algorithm with respect to the rules, initial knowledge base and goal given, in the context of Horn Reasoning. It performs the backward chaining algorithm by selecting at each step the way with the fewest remaining goals and the goal using alphabetical order.";

    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

HornBWCh.prototype.antecessorChange = function(){
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

HornBWCh.prototype.onConnectionsChange = function( connection ){
    if (connection == LiteGraph.INPUT){
        if(this.inputs && this.inputs.filter(i => i.link == null).length == 0){
            this.setState("ready");
        } else {
            this.setState("edited");
        }
        this.size = this.computeSize();
    }
}

HornBWCh.prototype.onPropertyChanged = function(){
    this.setState("edited");
}

HornBWCh.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var lr =  links[this.inputs[0].link];
    var lkb =  links[this.inputs[1].link];
    var lg =  links[this.inputs[2].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "HornBWCh", 
         content:  JSON.stringify({
             option: `${this.properties.performMode}`,
             input : JSON.stringify({originr_id: lr.origin_id, originr_slot : lr.origin_slot, originkb_id: lkb.origin_id, originkb_slot : lkb.origin_slot, origing_id: lg.origin_id, origing_slot : lg.origin_slot})})});

    
            
    console.log(query);
    return query; 
}

HornBWCh.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            tablehtml = "<h3>Summary</h3><table>"
        
            rows = response.message.info.split('\n')
            tablehtml += `<thead><tr>${rows.shift().split(';').map(c => '<th>' + c + '</th>').join('')}</tr></thead>`
    
            has_body = rows.length >= 1
            if(rows){
                tablehtml += '<tbody>'      
                tablehtml +=(rows.map(r => `<tr>${r.split(';').map(c => '<th>' + c + '</th>').join('')}</tr>`).join(''))
                tablehtml += '</tbody>'
            }
            tablehtml += "</table>"

            tablehtml += "<h3>Process</h3><table>"
        
            rows = response.message.process.split('\n')
            tablehtml += `<thead><tr>${rows.shift().split(';').map(c => '<th>' + c + '</th>').join('')}</tr></thead>`
    
            has_body = rows.length >= 1
            if(rows){
                tablehtml += '<tbody>'      
                tablehtml +=(rows.map(r => `<tr>${r.split(';').map(c => '<th>' + c + '</th>').join('')}</tr>`).join(''))
                tablehtml += '</tbody>'
            }
            tablehtml += "</table>"

            MEMORY['Tables'][this.id] = {type:'HornBWChPL',  content:tablehtml};
            
            this.setState("uptodate");
            if (ERRORS[this.id]){
                delete ERRORS[this.id];
            }

            var widget4Index = that.widgets.indexOf(that.widget4);
            if(widget4Index == -1){that.widgets.push(that.widget4);};
            break;
        
        default:
            ERRORS[this.id] = response.message;
            this.setState("error");
            break;
    }
}

HornBWCh.prototype.setState = function(state) {
    var links = graph.links;
    
    switch (state) {
        case "edited":
            this.title = `HornBWCh`;
            this.properties["state"] = "edited";
            this.boxcolor = "#666"; 
            var widget2Index = this.widgets.indexOf(this.widget2);
            if(widget2Index > -1){this.widgets.splice(widget2Index, 1);};
            var widget4Index = this.widgets.indexOf(this.widget4);
            if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
            break;

        case "ready":
            this.title = `HornBWCh`;
            this.properties["state"] = "ready";
            this.boxcolor = "#eb7f1a"; 
            var widget2Index = this.widgets.indexOf(this.widget2);
            if(widget2Index == -1){this.widgets.push(this.widget2);};
            break;

        case "uptodate":
            this.title = `HornBWCh`;
            this.properties["state"] = "uptodate";
            this.boxcolor = "#00ff00"; 
            var widget2Index = this.widgets.indexOf(this.widget2);
            if(widget2Index > -1){this.widgets.splice(widget2Index, 1);};
            if (!this.widgets.includes(this.widget4)){
                this.widgets.push(this.widget4);
            }
            break;

        case "error":
            this.title = `Error: id-${this.id}`;
            this.properties["state"] = "error";
            this.boxcolor = "#ff0000"; 
            var widget2Index = this.widgets.indexOf(this.widget2);
            if(widget2Index > -1){this.widgets.splice(widget2Index, 1);};
            break;
    
        default:
            console.log(`Unkonwn state: ${state}`);
            this.setState("uptodate");
            break;
    } 
    this.size = this.computeSize();
} 




// Truth Table

function TruthTablePL() {
    var that = this;
    this.addInput("", "SetPL")
    this.addProperty("state", "init");
    this.addProperty("performMode", "SPL_full");
    this.widget = this.addWidget("combo","performMode", "SPL_full", "performMode", { values:["FPL", "SPL_full", "SPL_lite"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widget4 = this.addWidget("button", "SHOW TABLE", "", function(){
        openTABLESPANEL();
        displayTable(that.id);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();
    
    this.title = "TruthTablePL";
    this.desc = "It performs the Truth Table Algorithm. It can be executed over a propositional formula (FPL), or over a propositional set showing the valuation for each formula (full) or only for the complete set (lite)"

    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

TruthTablePL.prototype.antecessorChange = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

TruthTablePL.prototype.onConnectionsChange = function( connection ){
    
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

TruthTablePL.prototype.onPropertyChanged = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    const new_entry_type = this.properties.performMode.split("_")[0];
    switch (new_entry_type) {
            case "FPL":
                if (new_entry_type != "FormulaPL"){
                    this.disconnectInput(0);
                    this.inputs[0].type = "FormulaPL";
                }
                break;
        
            case "SPL":
                if (new_entry_type != "SetPL"){
                    this.disconnectInput(0);
                    this.inputs[0].type = "SetPL";
                }
        }
    if (new_entry_type != this.inputs[0].type){
        this.disconnectInput(0);
        
        
    }
    this.size = this.computeSize();
}

TruthTablePL.prototype.generateQuery = function(){
    var links =  graph.links;
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "TruthTablePL", 
         content:  JSON.stringify({
             option: `${this.properties.performMode}`, 
             input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});

    return query; 
}

TruthTablePL.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            tablehtml = "<table>"
        
            rows = response.message.split('\n')
            tablehtml += `<thead><tr>${rows.shift().split(';').map(c => '<th>' + c + '</th>').join('')}</tr></thead>`
    
            has_body = rows.length >= 1
            if(rows){
                tablehtml += '<tbody>'      
                tablehtml +=(rows.map(r => `<tr>${r.split(';').map(c => '<th>' + c + '</th>').join('')}</tr>`).join(''))
                tablehtml += '</tbody>'
            }
            tablehtml += "</table>"
            MEMORY['Tables'][this.id] = {type:'TruthTableSPL',  content:tablehtml};

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


// SemanticTableauPL



function SemanticTableauPL() {
    var that = this;
    this.addInput("", "SetPL")
    this.addProperty("state", "init");
    this.addProperty("performMode", "Full");
    this.addProperty("inputMode", "spl");
    this.addProperty("resultMode", "asDNF");
    this.addOutput("", "FormulaPL");
    this.widget5 = this.addWidget("combo","inputMode", "spl", "inputMode", { values:["spl", "fpl"]} );  //link to property value
    this.widget3 = this.addWidget("combo","resultMode", "asDNF", "resultMode", { values:["NoSimp", "Minimal", "asDNF"]} );  //link to property value
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
    this.desc = "It performs the algorithm of Semantic Tableaux over a set of propositional formulas. The following options can be applied: <ul><li>NoSimp: It gives one output for one of the opened leafs of the tableau</li><li>Minimal: It gives one output for each of the opened leafs that are not subsumed by other one.</li><li>asDNF: gives one formula as a result, that is the disjunction of the conjunction of the literal sets from the opened leafs.</li></ul>";

    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

SemanticTableauPL.prototype.antecessorChange = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

SemanticTableauPL.prototype.onConnectionsChange = function( connection ){
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

SemanticTableauPL.prototype.onPropertyChanged = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    switch (this.properties.inputMode) {
        case "spl":
            if (this.inputs[0].type != "SetPL"){
                this.disconnectInput(0);
                this.inputs[0].type = "SetPL"
            }
            break;
            
        
        case "fpl":
            if (this.inputs[0].type != "FormulaPL"){
                this.disconnectInput(0);
                this.inputs[0].type = "FormulaPL"
            }
            break;

    }

    switch (this.properties.resultMode) {
        case "NoSimp":
        
        case "Minimal":
            if (this.outputs.length > 0  && this.outputs[0].type == "FormulaPL"){
                for (const key in this.outputs) {
                    this.disconnectOutput(key);
                }
                this.outputs = []
            }
            this.setState("edited");
            this.onConnectionsChange(LiteGraph.INPUT);
            break;

        case "asDNF":
            if (this.outputs[0].type != "FormulaPL"){
                for (const key in this.outputs) {
                    this.disconnectOutput(key);
                }
                this.outputs = [];
                
                this.addOutput("", "FormulaPL");
            }

            this.setState("edited");
            this.onConnectionsChange(LiteGraph.INPUT);
        
            this.setState("edited");
            this.onConnectionsChange(LiteGraph.INPUT);
            break;
    
        default:
            console.log("unknown option for resultMode")
            break;
    }
}

SemanticTableauPL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "SemanticTableauPL", 
         content:  JSON.stringify({
             option: JSON.stringify({input_mode : this.properties.inputMode.toLowerCase(), 
                perform_mode : this.properties.performMode.toLowerCase(), 
                result_mode : this.properties.resultMode.toLowerCase()}), 
             input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});

    
            
    console.log(query);
    return query; 
}

SemanticTableauPL.prototype.processResponse = function(response){
    var that = this;
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.addProperty("value_graph", "");
            this.properties["value_"] = response.message.result;
            this.properties["value_graph"] = response.message.graph;
            MEMORY['Graphs'][this.id] = {type:'dot', typeExtra:'SemanticTableauPL',  content:response.message.graph};
            
            delete MEMORY['PL Formulas'][this.id];
            for (const key in MEMORY['PL Sets']) {
                if (`${key}` == `${this.id}` || `${key}`.split(",")[0] == `(${this.id}`) {
                    delete MEMORY['PL Sets'][key];
                }
            }

            switch (this.properties.resultMode) {
                case "NoSimp":
                
                case "Minimal":
                    if (this.outputs.length > 0){
                        for (const key in this.outputs) {
                            this.disconnectOutput(key);
                        }
                        this.outputs = [];
                    }
                    var res_ = response.message.result.split(".");
                    for (let index = 0; index < res_.length; index++) {
                        const ls = res_[index];
                        MEMORY['PL Sets'][`(${this.id}, ${index})`] = ls;
                        this.addOutput(index, "SetPL");
                    }
                    break;
        

                case "asDNF":
                    MEMORY['PL Formulas'][this.id] = response.message.result;
                    break;
            
                default:
                    console.log("unknown option for resultMode")
                    break;
            }
       
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

//DPLL

function DPLLGraphPL() {
    var that = this;
    this.addInput("", "ClauseSetPL")
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
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "DPLLGraphPL";
    this.desc = "Perform DPLL (showing Graph) Algorithm over a set of clauses";

    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

DPLLGraphPL.prototype.antecessorChange = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

DPLLGraphPL.prototype.onConnectionsChange = function( connection ){

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
DPLLGraphPL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "DPLLGraphPL", 
         content:  JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})});
    
            
    console.log(query);
    return query; 
}

DPLLGraphPL.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['Graphs'][this.id] = {type:'dot', typeExtra:'DPLLGraph',  content:response.message};
            
            
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



// Resolution PL

function ResolutionPL() {
    var that = this;
    this.addInput("", "ClauseSetPL")
    this.addProperty("state", "init");
    this.addProperty("symbolsOrder", "");
    this.addProperty("performMode", "Regular");
    this.widget = this.addWidget("combo","performMode", "Regular", "performMode", { values:["Saturation", "Regular"]} );  //link to property value
    this.widget2 = this.addWidget("button", "RUN NODE", "", function(){
        var query = that.generateQuery();
        //console.log("query");
        app.ports.messageReceiver.send(query);
    });
    this.widgets.pop();
    this.widget3 = this.addWidget("text","symbolsOrder","","symbolsOrder")
    this.widget4 = this.addWidget("button", "SHOW TABLE", "", function(){
        openTABLESPANEL();
        displayTable(that.id);
    });
    this.widgets.pop();
    this.widgets_up = true;
    this.size = this.computeSize();

    this.title = "ResolutionPL";
    this.desc = "Perform Regular/Saturation Resolution over a set of Clauses PL. Regular mode requires an order for the propositional variables that must be specified as a sequence of propositional variables separated by commas.";

    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

ResolutionPL.prototype.antecessorChange = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

ResolutionPL.prototype.onConnectionsChange = function( connection ){
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

ResolutionPL.prototype.onPropertyChanged = function(){
    switch (this.properties.performMode) {
        case "Saturation":
            this.onConnectionsChange(LiteGraph.INPUT);
            var widget3Index = this.widgets.indexOf(this.widget3);
            if(widget3Index > -1){this.widgets.splice(widget3Index, 1);};
            break;
        case "Regular":
            this.onConnectionsChange(LiteGraph.INPUT);
            var widget3Index = this.widgets.indexOf(this.widget3);
            if(widget3Index == -1){this.widgets.push(this.widget3);};
            break;
        default:
            console.log(`${this.id}: unknown option for perform mode`)
            break;
    }
    this.setState("edited");
}

ResolutionPL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "ResolutionPL", 
         content:  JSON.stringify({
             option: `${this.properties.performMode.toLowerCase()}`,
             choiceOrder: `${this.properties["symbolsOrder"]}`,  
             input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});

    
            
    console.log(query);
    return query; 
}

ResolutionPL.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            tablehtml = "<table>"
        
            rows = response.message.split('\n')
            tablehtml += `<thead><tr>${rows.shift().split(';').map(c => '<th>' + c + '</th>').join('')}</tr></thead>`
    
            has_body = rows.length >= 1
            if(rows){
                tablehtml += '<tbody>'      
                tablehtml +=(rows.map(r => `<tr>${r.split(';').map(c => '<th>' + c + '</th>').join('')}</tr>`).join(''))
                tablehtml += '</tbody>'
            }
            tablehtml += "</table>"
            MEMORY['Tables'][this.id] = {type:'TruthTableSPL',  content:tablehtml};
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

// Resolution Graph PL 

function ResolutionGraphPL() {
    var that = this;
    this.addInput("", "ClauseSetPL")
    this.addProperty("state", "init");
    this.addProperty("performMode", "Standard");
    this.widget = this.addWidget("combo","performMode", "Standard", "performMode", { 
        values:["Standard", "Linear", "Positive", "Negative", "Unitary", "By entries"]} );  //link to property value
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

    this.title = "ResolutionGraphPL"; 
    this.desc = `Perform Resolution  Algorithm (Graph version) over a set of Clauses PL. Different strategies can be applied: "Standard", "Linear", "Positive", "Negative", "Unitary", "By entries"`;

    this.color = LGraphCanvas.node_colors.yellow.color;
    this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
}

ResolutionGraphPL.prototype.antecessorChange = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    if (this.properties["state"] == "uptodate") {
        this.setState("ready");
    }
}

ResolutionGraphPL.prototype.onConnectionsChange = function( connection ){
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

ResolutionGraphPL.prototype.onPropertyChanged = function(){
    var widget4Index = this.widgets.indexOf(this.widget4);
    if(widget4Index > -1){this.widgets.splice(widget4Index, 1);};
    this.setState("edited");
}

ResolutionGraphPL.prototype.generateQuery = function(){
    var links =  graph.links;
    var query = "";
    var l =  links[this.inputs[0].link];
    query = JSON.stringify({ 
        nodeId: this.id,
         nodeType: "ResolutionGraphPL", 
         content:  JSON.stringify({
             option: `${this.properties.performMode.toLowerCase()}`, 
             input : JSON.stringify({origin_id: l.origin_id, origin_slot : l.origin_slot})})});

    
            
    console.log(query);
    return query; 
}

ResolutionGraphPL.prototype.processResponse = function(response){
    console.log(response);
    switch (response.errorCode) {
        case 0:
            this.addProperty("value_", "");
            this.properties["value_"] = response.message;
            MEMORY['Graphs'][this.id] = {type:'dot', typeExtra:'ResolutionGraph',  content:response.message};
            
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














