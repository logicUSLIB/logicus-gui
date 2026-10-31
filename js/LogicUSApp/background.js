let MEMORY = {
    'PL Formulas' : {}, 
    'PL Sets' : {},
    'PL Clauses' : {},
    'PL Clause Sets' : {},
    'FOL Formulas' : {}, 
    'FOL Sets' : {},
    'FOL Clauses' : {},
    'FOL Clause Sets' : {},
    'HornRS' : {},
    'CSPs' : {},
    'HerbrandWs' : {},
    'Graphs' : {},
    'Tables' : {}
}

let ERRORS = {}

POPUP = document.getElementById('popup');


function openSTATEPANEL(){
    let formulasClausesPLTableRows = ``;
    let formulasClausesSetsPLTableRows = ``;
    let hornRSTableRows = ``;

    let formulasClausesFOLTableRows = ``;
    let formulasClausesSetsFOLTableRows = ``;
    let herbrandTableRows = ``;

    let graphsTableRows = '';
    let tablesTableRows = '';
    let cspsTableRows = '';
    
    for(const k in MEMORY['PL Formulas']){
        formulasClausesPLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['PL Formulas'][k]}</div>
            `
    }

    for(const k in MEMORY['PL Clauses']){
        formulasClausesPLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['PL Clauses'][k]}</div>`
    }

    for(const k in MEMORY['PL Sets']){
        formulasClausesSetsPLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['PL Sets'][k]}</div>
            `
    }

    for(const k in MEMORY['PL Clause Sets']){
        formulasClausesSetsPLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['PL Clause Sets'][k]}</div>
            `
    }

    for(const k in MEMORY['HornRS']){
        hornRSTableRows += `
            <div>${k}</div>
            <div>${MEMORY['HornRS'][k]}</div>
            `
    }

    for(const k in MEMORY['FOL Formulas']){
        formulasClausesFOLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['FOL Formulas'][k]}</div>
            `
    }

    for(const k in MEMORY['FOL Clauses']){
        formulasClausesFOLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['FOL Clauses'][k]}</div>`
    }

    for(const k in MEMORY['FOL Sets']){
        formulasClausesSetsFOLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['FOL Sets'][k]}</div>
            `
    }

    for(const k in MEMORY['FOL Clause Sets']){
        formulasClausesSetsFOLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['FOL Clause Sets'][k]}</div>
            `
    }

    for(const k in MEMORY['HerbrandWs']){
        herbrandTableRows += `
            <div>${k}</div>
            <div>${MEMORY['HerbrandWs'][k]}</div>
            `
    }
    

    for(const k in MEMORY['Graphs']){
        graphsTableRows += `
            <div>${k}</div>
            <div>${MEMORY['Graphs'][k].typeExtra} &nbsp; <button onclick="openGRAPHSPANEL(); displayGraph(${k});">SHOW GRAPH</button></div>
            `
    }

    for(const k in MEMORY['Tables']){
        tablesTableRows += `
            <div>${k}</div>
            <div>${MEMORY['Tables'][k].type} &nbsp; <button onclick="openTABLESPANEL(); displayTable(${k});">SHOW TABLE</button></div>
            `
    }

    for(const k in MEMORY['CSPs']){
        cspsTableRows += `
            <div>${k}</div>
            <div> CSPPL <button onclick="openCSPPANEL(); displayCSP(${k});">VIEW/EDIT CSP</button></div>
            `
    }


    

    let popupContent = `
    <div id="popup-head">
            <span id="popup-title">STATE PANEL</span>
            <button id="popup-close" onclick="document.getElementById('popup').style.zIndex = 0;">CLOSE</button>
        </div>
        <div id="popup-content">
            <div id="popup-content-left">
                <div class="table">
                    <div class="head">
                        <div>ID</div> <div>FORMULA PL / CLAUSE PL</div>
                    </div>
                    <div>
                        ${formulasClausesPLTableRows}
                    </div>
                </div>

                <div class="table">
                    <div class="head">
                        <div>ID</div> <div>FORMULA FOL / CLAUSE FOL</div>
                    </div>
                    <div>
                        ${formulasClausesFOLTableRows}
                    </div>
                </div>

                

                <div class="table">
                    <div class="head">
                        <div>ID</div> <div>HORN RS: FACTS, FACT SETS & RULES</div>
                    </div>
                    <div>
                        ${hornRSTableRows}
                    </div>
                </div>

                
                <div class="table special">
                <div class="head">
                <div>ID</div> <div> TABLES </div>
                </div>
                <div>
                ${tablesTableRows}
                </div>
                </div>
                
                <div class="table special">
                    <div class="head">
                        <div>ID</div> <div>CONSTRAINT SATISFACTION PROBLEMS</div>
                    </div>
                    <div>
                        ${cspsTableRows}
                    </div>
                </div>
                
                
                
                
            </div>
            <div id="popup-content-right">
                
                <div class="table">
                    <div class="head">
                        <div>ID</div> <div>FORMULA SET PL/ CLAUSE SET PL</div>
                    </div>
                    <div>
                        ${formulasClausesSetsPLTableRows}
                    </div>
                </div>

                <div class="table">
                    <div class="head">
                        <div>ID</div> <div>FORMULA SET FOL/ CLAUSE SET FOL</div>
                    </div>
                    <div>
                        ${formulasClausesSetsFOLTableRows}
                    </div>
                </div>

                

                <div class="table">
                    <div class="head">
                        <div>ID</div> <div>HERBRAND</div>
                    </div>
                    <div>
                        ${herbrandTableRows}
                    </div>
                </div>

                <div class="table special">
                    <div class="head">
                        <div>ID</div> <div> GRAPHS </div>
                    </div>
                    <div>
                       ${graphsTableRows}
                    </div>
                </div>
            </div>
        </div>
    `

    POPUP.innerHTML = popupContent;
    POPUP.style.zIndex = 1000;
}

function openGRAPHSPANEL(){
    memoryGraphKeys = []
    for (const i in MEMORY['Graphs']){
        memoryGraphKeys.push(i);
    }
    // console.log(memoryGraphKeys)
    const popupContent = `
    <div id="popup-head">
        <span id="popup-title">GRAPHS PANEL</span>
        <button id="popup-close" onclick="document.getElementById('popup').style.zIndex = 0;">CLOSE</button>
    </div>
    <div id="popup-content2">
        <div class="select-by-id" id="select-by-id-graphs">
        ${memoryGraphKeys.map(i => `<button id="selectGraph${i}" onclick="displayGraph(${i})">${i}</button>`)}
        </div>
        <div id="graph-display"></div>
    </div>`    

    POPUP.innerHTML = popupContent;
    POPUP.style.zIndex = 1000;
}

function displayGraph(id){
    selGButi = document.getElementById(`selectGraph${id}`);
    if (!(selGButi.className == 'selected')){
        
        prevSel = document.querySelector('#select-by-id-graphs>.selected');
        gdisplay = document.getElementById('graph-display');
        
        if (prevSel){
            prevSel.className = '';
        }
        
        selGButi.className = 'selected';
        gdisplay.innerHTML = '<div><svg id="graphContainer"> <g/> </svg></div>';

        const g = MEMORY['Graphs'][id];
        if(g.type == 'tree'){
            tooltip = document.querySelector(".tooltip");
            if (tooltip){
                tooltip.remove();
            }
            BuildVerticaLTree(JSON.parse(JSON.stringify(g.content)), gdisplay);
        } else if (g.type == 'dot') {
            var graph = graphlibDot.parse(g.content);
            var renderer = new dagreD3.Renderer();
            renderer.run(graph, d3.select("#graphContainer"));

            var svg = document.querySelector('#graphContainer');
        var bbox = svg.getBBox();
        svg.style.width = bbox.width + 40.0 + "px";
        svg.style.height = bbox.height + 40.0 + "px";
        }
    }

}

function openTABLESPANEL(){
    memoryTablesKeys = []
    for (const i in MEMORY['Tables']){
        memoryTablesKeys.push(i);
    }
    // console.log(memoryTablesKeys)
    const popupContent = `
    <div id="popup-head">
        <span id="popup-title">TABLES PANEL</span>
        <button id="popup-close" onclick="document.getElementById('popup').style.zIndex = 0;">CLOSE</button>
    </div>
    <div id="popup-content2">
        <div class="select-by-id" id="select-by-id-graphs">
        ${memoryTablesKeys.map(i => `<button id="selectGraph${i}" onclick="displayTable(${i})">${i}</button>`)}
        </div>
        <div id="graph-display"></div>
    </div>`    

    POPUP.innerHTML = popupContent;
    POPUP.style.zIndex = 1000;
}

function displayTable(id){
    selGButi = document.getElementById(`selectGraph${id}`);
    if (!(selGButi.className == 'selected')){
        
        prevSel = document.querySelector('#select-by-id-graphs>.selected');
        gdisplay = document.getElementById('graph-display');
        
        if (prevSel){
            prevSel.className = '';
        }
        
        selGButi.className = 'selected';
        gdisplay.innerHTML = '<div>' + MEMORY['Tables'][id].content + '</div>';
        
    }

}

function openCSPPANEL(){
    let memoryCSPKeys = []
    for (const i in MEMORY['CSPs']){
        memoryCSPKeys.push(i);
    }
    // console.log(memoryGraphKeys)
    const popupContent = `
    <div id="popup-head">
            <span id="popup-title">Constraint Satisfaction Problems Panel</span>
            <button id="popup-close" onclick="document.getElementById('popup').style.zIndex = 0;">CLOSE</button>
        </div>
        <div id="popup-content2">
            <div class="select-by-id" id="select-by-id-csp">
                ${memoryCSPKeys.map(i => `<button id="selectCSP${i}" onclick="displayCSP(${i})">${i}</button>`)}
            </div>
            <div id="csp-display">
            </div>
        </div>`    

    POPUP.innerHTML = popupContent;
    POPUP.style.zIndex = 1000;
}

function displayCSP(id){
    var closeButton = document.getElementById("popup-close");
    if (closeButton){
        closeButton.remove();
    }
    var selGButi = document.getElementById(`selectCSP${id}`);
    if (!(selGButi.className == 'selected')){
        
        prevSel = document.querySelector('#select-by-id-csp>.selected');
        cspdisplay = document.getElementById('csp-display');
        
        if (prevSel){
            prevSel.className = '';
        }
        
        selGButi.className = 'selected';
        cspdisplay.innerHTML = ``;

        cspdisplay.innerHTML = `
            <div class="csp-display__buttons">
                <button onclick="addBFPL();">ADD FORMULA</button>
                <button onclick="removeAllBFPL();">REMOVE ALL</button>
                <button onclick="readFromFileBFPL();">READ FROM FILE</button>
                <button onclick="saveToFile();">SAVE TO FILE</button>
                <button onclick="saveCSP();">CLOSE</button>
                
            </div>`

        MEMORY["CSPs"][id].forEach(s => {
            const newBFPLDiv = document.createElement("div");
            newBFPLDiv.className = "bfpl";
            const cspDisplayDiv = document.getElementById("csp-display");
            newBFPLDiv.dataset["index"] = cspDisplayDiv.childElementCount - 1;
            newBFPLDiv.innerHTML = `
                <div class="bfpl__input">
                    <textarea>${s.trim()}</textarea>
                </div>
                <div class="bfpl__result">
                    <div class="bfpl__result__buttons"> 
                        <button onclick="checkBFPL(this);">RUN</button><button onclick="clearBFPL(this);">CLEAR</button> <button onclick="removeBFPL(this);">REMOVE</button> 
                    </div>
                    <div class="bfpl__result__texDisplay"></div>
                </div>`;
            cspDisplayDiv.insertBefore(newBFPLDiv, document.querySelector(".csp-display__buttons"));
            newBFPLDiv.querySelector("button").click();
        })
        
    }

}

function openERRORSPANEL(){
    // console.log(memoryGraphKeys)
    errorstable = `<div class="table">`
        
    errorstable += `<div class="tr"> <div class="id-col">Id</div><div class="errmes-col"> Error message </div></div>`

    for (const i in ERRORS){
        errorstable += `<div class="tr"> <div class="id-col">${i}</div><div class="errmes-col"> ${ERRORS[i]} </div></div>`
    }
    
    errorstable += "</div>"


    const popupContent = `
    <div id="popup-head" class="errors">
        <span id="popup-title">ERRORS PANEL</span>
        <button id="popup-close" onclick="document.getElementById('popup').style.zIndex = 0;">CLOSE</button>
    </div>
    <div id="popup-content2" class="errors">
        <div id="errors-display">
            ${errorstable}
        </div>
    </div>`    

    POPUP.innerHTML = popupContent;
    POPUP.style.zIndex = 1000;
}

function saveModel(){
    var data = JSON.stringify( graph.serialize() );
	var file = new Blob( [ data ] );
	var url = URL.createObjectURL( file );
	var element = document.createElement("a");
	element.setAttribute('href', url);
	element.setAttribute('download', "graph.JSON" );
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
	setTimeout( function(){ URL.revokeObjectURL( url ); }, 1000*60 )
}

function loadModel(){
    var element = document.createElement("input");
    element.id = "fileInput";
    element.type="file";
    element.style.display = 'none';
    document.body.appendChild(element);
    element.onchange = function(){
        var file = element.files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                loadSchema(JSON.parse(evt.target.result));
            }
            reader.onerror = function (evt) {
                alert("error reading file");
            }
        }
    }
    element.click();
    
}

// It replaces the current schema (and the state of the core) by the given one.
function loadSchema(schema){
    graph.clear();
    for (const k in MEMORY) {
        MEMORY[k] = {};
    }
    for (const k in ERRORS) {
        delete ERRORS[k];
    }
    app.ports.messageReceiver.send(JSON.stringify({ nodeId: 0, nodeType: "ClearModel", content: "" }));
    graph.configure(schema);
    graph._nodes.forEach(n => {n.setState("edited"); n.size = n.computeSize();});
    graph.setDirtyCanvas(true,true);
}

function openEXAMPLESPANEL(){
    POPUP.innerHTML = `
    <div id="popup-head">
        <span id="popup-title">EXAMPLES</span>
        <button id="popup-close" onclick="document.getElementById('popup').style.zIndex = 0;">CLOSE</button>
    </div>
    <div id="popup-content2"><div id="examples-list">Loading…</div></div>`;
    POPUP.style.zIndex = 1000;
    const list = document.getElementById("examples-list");
    fetch("examples/index.json")
        .then(r => r.json())
        .then(examples => {
            list.innerHTML = examples.map(e => `
                <div class="example">
                    <div><b>${e.title}</b><p>${e.description}</p></div>
                    <button onclick="loadExample('${e.file}')">OPEN</button>
                </div>`).join("")
                + "<p>Open an example and press RUN SCHEMA. The files are in the <code>examples</code> folder of LogicUS.</p>";
        })
        .catch(() => {
            list.innerHTML = "<p>The examples can only be listed when LogicUS is served from a web server. "
                + "You can open them with LOAD SCHEMA from the <code>examples</code> folder.</p>";
        });
}

function loadExample(file){
    fetch(`examples/${file}`)
        .then(r => r.json())
        .then(schema => {
            loadSchema(schema);
            document.getElementById('popup').style.zIndex = 0;
        })
        .catch(e => alert(`The example ${file} could not be loaded: ${e}`));
}

function runModel(){
    runbutton = document.getElementById('run-model');
    if (runbutton.className == 'confirm'){
        graph.clear();
        for (const k in MEMORY) {
            MEMORY[k] = {};
        }

        query = JSON.stringify({ 
            nodeId: 0,
            nodeType: "ClearModel", 
            content:  ""});

        app.ports.messageReceiver.send(query);
        
        runbutton.textContent = 'RUN MODEL';
        runbutton.className = '';
    }else{
        graph._nodes.forEach(n => {n.setState("edited"); n.size = n.computeSize();});
        r_nodes = []

        let execNodes = graph._nodes_in_order;
        
        for (n of execNodes){
            
            if (typeof(n.widget2) !== "undefined" && Object.values(graph.links).filter(l => l.target_id==n.id).every(l => r_nodes.includes(l.origin_id))){
                n.widget2.callback();   
                
                if(!ERRORS[n.id]){
                    r_nodes.push(n.id);
                }
            }

            if (graph.getNodeById(n.id).type === 'LogicUS-EXT/CSP/CSPPL'){
                alert("CSP can not be run with RUN MODEL");
            }

            

            
    }


    }
    graph.setDirtyCanvas(true,true)
    
}

function clearModel(){
    runbutton = document.getElementById('run-model');
    runbutton.textContent = 'CONFIRM CLEAR';
    runbutton.className = 'confirm';
    
    setTimeout(() => {  runbutton.textContent = 'RUN MODEL'; runbutton.className = ''; }, 4000);
    
}

function openInfoNode(nid) {
    const node = graph.getNodeById(nid);
    const node_info = document.getElementById("info-node");
    const node_info_content = document.getElementById("info-node-content");
    const node_info_title = document.getElementById("info-node-title");

    node_info_title.innerHTML = `[${nid}] ${node.title}`;
    node_info_content.innerHTML = node.desc;
    
    if(node.properties["state"] == "uptodate"){
        node_info.className = "uptodate";
        if(node.properties["value_"])
            node_info_content.innerHTML += "<br><br><u>Current value</u>: " + node.properties["value_"];
    } else if (node.properties["state"] == "error") {
        node_info_content.innerHTML += `<br><br> ${ERRORS[nid]}`
        node_info.className ="error";
    }
    
    
    node_info.style.display = "grid";
    
    
}