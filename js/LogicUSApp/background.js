let MEMORY = {
    'PL Formulas' : {}, 
    'PL Sets' : {},
    'PL Clauses' : {},
    'PL Clause Sets' : {},
    'FOL Formulas' : {}, 
    'FOL Sets' : {},
    'FOL Clauses' : {},
    'FOL Clause Sets' : {},
    'LTL Formulas' : {},
    'LTL Sets' : {},
    'HornRS' : {},
    'CSPs' : {},
    'HerbrandWs' : {},
    'Graphs' : {},
    'Tables' : {},
    'KL Formulas' : {},
    'KL Sets' : {},
    'Chats' : {}
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

    let formulasClausesLTLTableRows = ``;
    let formulasClausesSetsLTLTableRows = ``;

    let formulasClausesKLTableRows = ``;
    let formulasClausesSetsKLTableRows = ``;

    let graphsTableRows = '';
    let tablesTableRows = '';
    let cspsTableRows = '';
    let chatsTableRows = '';
    
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

    for(const k in MEMORY['LTL Formulas']){
        formulasClausesLTLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['LTL Formulas'][k]}</div>
            `
    }

    for(const k in MEMORY['KL Formulas']){
        formulasClausesKLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['KL Formulas'][k]}</div>
            `
    }

    for(const k in MEMORY['LTL Sets']){
        formulasClausesSetsLTLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['LTL Sets'][k]}</div>
            `
    }

    for(const k in MEMORY['KL Sets']){
        formulasClausesSetsKLTableRows += `
            <div>${k}</div>
            <div>${MEMORY['KL Sets'][k]}</div>
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

    for(const k in MEMORY['Chats']){
        chatsTableRows += `
            <div>${k}</div>
            <div> CHAT - <button onclick="openCHATSPANEL(); displayChat(${k});">OPEN CHAT</button></div>
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
                        <div>ID</div> <div>FORMULA LTL</div>
                    </div>
                    <div>
                        ${formulasClausesLTLTableRows}
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
                        <div>ID</div> <div>FORMULA SET LTL</div>
                    </div>
                    <div>
                        ${formulasClausesSetsLTLTableRows}
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

                <div class="table special">
                    <div class="head">
                        <div>ID</div> <div>CHATS</div>
                    </div>
                    <div>
                        ${chatsTableRows}
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

function openCHATSPANEL(){
    let memoryChatKeys = []
    for (const i in MEMORY['Chats']){
        memoryChatKeys.push(i);
    }
    // console.log(memoryGraphKeys)
    const popupContent = `
    <div id="popup-head">
            <span id="popup-title"> LLM - FORMALIZATION ASSISTANT </span>
            <button id="popup-close" onclick="closeCHATSPANEL();">CLOSE</button>
        </div>
        <div id="popup-content2">
            <div class="select-by-id" id="select-by-id-chat">
                ${ memoryChatKeys.map(i => `<button id="selectChat${i}" onclick="displayChat(${i})">${i}</button>`).join("\n")}
                <button id="newChat" onclick="newChat(this);">+</button>
            </div>
            <div id="chat-display">
            </div>
        </div>`    

    POPUP.innerHTML = popupContent;
    POPUP.style.zIndex = 1000;
}

function closeCHATSPANEL() {
    prevSel = document.querySelector('#select-by-id-chat>.selected');
    if(prevSel)
        saveDisplayedChat(prevSel.innerHTML);
    document.getElementById('popup').style.zIndex = 0;
}

function newChat(newChatBtn){
        const id = Object.keys(MEMORY["Chats"]).length;

        MEMORY["Chats"][id] = 
            { "gpt-api-key":""
            ,"gpt-model":""
            ,"gpt-url":""
            ,"gpt-hist":[]};

        newChatBtn.id = `selectChat${id}`
        newChatBtn.onclick = ()=>{displayChat(id)};
        newChatBtn.innerHTML = `${id}`;
        
        const newAddChatBtn = document.createElement('button');
        newAddChatBtn.innerHTML = "+";
        newAddChatBtn.class = "add-element";
        newAddChatBtn.onclick = () => {newChat(newAddChatBtn);};

        newChatBtn.parentElement.appendChild(newAddChatBtn);

        displayChat(id);
}

function displayChat(id){
    var selChatButi = document.getElementById(`selectChat${id}`);
    if (!(selChatButi.class == 'selected')){
        
        prevSel = document.querySelector('#select-by-id-chat>.selected');
        chatdisplay = document.getElementById('chat-display');
        
        if (prevSel){
            prevSel.className = '';
            prevSel.disabled = false;
            saveDisplayedChat(prevSel.innerHTML);
        }
        
        selChatButi.className = 'selected';
        selChatButi.disabled = true;

        

        // }
        const gpt_api_key = MEMORY["Chats"][id]["gpt-api-key"];
        const gpt_model = MEMORY["Chats"][id]["gpt-model"];
        const gpt_hist =  MEMORY["Chats"][id]["gpt-hist"];
        const gpt_connected = gpt_hist.length > 0;

        chatdisplay.innerHTML = `
        <div style="display: grid; grid-template-columns: 100px 1fr 100px 1fr 100px 1fr; row-gap: 10px; column-gap:20px;" >
            <b>URL-API:</b>
            <input type="text" name="gpt-api-url" style="width: 100%;" value="${gpt_api_key}" >
            <b>API-KEY:</b>
            <input type="password" name="gpt-api-key" style="width: 100%;" value="${gpt_api_key}" >
            <b>Model:</b>
            <input type="text" name="gpt-model" id="gpt-model" style="width: 100%;" value="${gpt_model}">
            <button class="gpt-connect-btn" style="width: 100%; grid-column: span 6" onclick="gpt_init(this);">${gpt_connected ? "RECONECT" : "CONNECT"}</button>
        </div>

        <br>
        `;

        if (gpt_connected) {

            const dialogue_div = document.createElement("div");
            dialogue_div.style = "border:1px solid black; padding: 2px; display: grid; grid-template-columns: 100px 1fr; row-gap: 10px;";
            dialogue_div.innerHTML = "";
            chatdisplay.appendChild(dialogue_div);
            gpt_hist.forEach((r,i) => gpt_add_entry(dialogue_div, r["role"], r["content"], (i != (gpt_hist.length - 1) || r["role"] != "system" ? 'disabled' : '')));
        }

       
    }

}

async function gpt_init(connect_btn) {
    const chat_div = connect_btn.parentElement.parentElement;
    const gpt_api_key = chat_div.querySelector("input[name='gpt-api-key']");
    const gpt_url = chat_div.querySelector("input[name='gpt-api-url']");
    const gpt_model = chat_div.querySelector("input[name='gpt-model']");

    const old_dialogue_div = chat_div.querySelector("#gpt-dialogue");
    if (old_dialogue_div) {
        old_dialogue_div.remove();
    }

    const dialogue_div = document.createElement("div");
    dialogue_div.id = "gpt-dialogue";
    dialogue_div.style = "border:1px solid black; padding: 2px; display: grid; grid-template-columns: 100px 1fr; row-gap: 10px;";
    dialogue_div.innerHTML = "";

    // Define the data you want to send
    const data = {
            messages: [{ role: 'system', content:"Hello, I wan't that this chat serves only for academic purposes on formalization in logic, so you must omit all questions unrelated to this task." }],
            model: gpt_model.value,
            stream:false
            };
    
    // Define the headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gpt_api_key.value}` // Replace YOUR_API_KEY with your actual API key
    };
   
        await (fetch(gpt_url.value, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
        }))
        .then(response => response.json())
        .then(resp_data => {
            console.log(resp_data);
            if (resp_data.error){
                connect_btn.innerHTML = "RECONECT";
                chat_div.appendChild(dialogue_div);
                gpt_add_entry(dialogue_div, "Error", resp_data.error.message);
            } else {
                console.log(resp_data);
                connect_btn.innerHTML = "RECONECT";
                dialogue_div.innerHTML = "";
                chat_div.appendChild(dialogue_div);
                //console.log(data);
                const response_message= resp_data.choices[0].message;
                gpt_add_entry(dialogue_div, response_message.role, response_message.content)
            } 
        }).catch (error_msg => {
        connect_btn.innerHTML = "RECONECT";
        chat_div.appendChild(dialogue_div);
            gpt_add_entry(dialogue_div, "Error", error_msg);
        });
    // Make the request
    
}

function gpt_add_entry(dialogue_div, role, message, disabled='disabled') {
    
    const submitBtn = dialogue_div.querySelector("button");

    if (submitBtn) {
        submitBtn.parentElement.remove();
    }

    if(role == "assistant"){
        const newEntryRole = document.createElement("div");
        newEntryRole.innerHTML = "<b>GPT-Agent:</b>";
        const newEntryMessage = document.createElement("div");
        newEntryMessage.innerHTML = `<textarea style="width: 100%; resize:vertical;" data-role="assistant" ${disabled}>${message}</textarea>`;
        dialogue_div.appendChild(newEntryRole);
        dialogue_div.appendChild(newEntryMessage);
        const askButton = document.createElement('div');
        askButton.style = " grid-column: span 2;";
        askButton.innerHTML = `<button style="width: 100%; grid-column: span 2" onclick="gpt_add_entry(this.parentElement.parentElement, 'system','', '')">CONTINUE ASKING</button>`;
        dialogue_div.appendChild(askButton);
        
    } else if (role == "system") {
        const newEntryRole = document.createElement("div");
        newEntryRole.innerHTML = "<b>User:</b>";
        const newEntryMessage = document.createElement("div");
        newEntryMessage.innerHTML = `<textarea style="width: 100%; resize:vertical;" data-role="system" ${disabled}>${message}</textarea>`;
        dialogue_div.appendChild(newEntryRole);
        dialogue_div.appendChild(newEntryMessage);
        const askButton = document.createElement('div');
        askButton.style = " grid-column: span 2;";
        askButton.innerHTML = `<button style="width: 100%; grid-column: span 2" onclick="gpt_ask(this);">SUBMIT QUERY</button>`;
        dialogue_div.appendChild(askButton);
    } else if (role == "Error") {
        const newEntryRole = document.createElement("div");
        newEntryRole.className = "error";
        newEntryRole.innerHTML = "<b>Error:</b>";
        const newEntryMessage = document.createElement("div");
        newEntryMessage.innerHTML = `<textarea style="width: 100%; resize:vertical;" data-role="Error" class="error"; ${disabled}>${message}</textarea>`;
        dialogue_div.appendChild(newEntryRole);
        dialogue_div.appendChild(newEntryMessage);
    }
    
}

function gpt_ask(connect_btn) {
    const chat_div = connect_btn.parentElement.parentElement.parentElement;
    const gpt_api_key = chat_div.querySelector("input[name='gpt-api-key']");
    const gpt_url = chat_div.querySelector("input[name='gpt-api-url']");
    const gpt_model = chat_div.querySelector("input[name='gpt-model']");
    const hist = [];
    chat_div.querySelectorAll("textarea").forEach(ta => {hist.push({"role":ta.dataset["role"], "content":ta.value}); ta.disabled=true;});

    const dialogue_div = connect_btn.parentElement.parentElement;

    // Define the data you want to send
    const data = {
            messages: hist,
            model: gpt_model.value,
            stream:false
            };
    
    // Define the headers
    const headers = {
        
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gpt_api_key.value}` // Replace YOUR_API_KEY with your actual API key
    };

    // Make the request
    
    connect_btn.innerHTML = "IN PROGRESS"

    fetch(gpt_url.value, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        connect_btn.parentElement.remove();
        const response_message= data.choices[0].message;
        gpt_add_entry(dialogue_div, response_message.role, response_message.content)
    }
    )
    .catch((error) => {
        chat_div.appendChild(dialogue_div);
        gpt_add_entry(dialogue_div, "Error", error);
        
    });
}

function saveDisplayedChat(id) {
    const chat_div = document.getElementById("chat-display");
    const gpt_api_key = chat_div.querySelector("input[name='gpt-api-key']").value;
    const gpt_url = chat_div.querySelector("input[name='gpt-api-url']").value;
    const gpt_model = chat_div.querySelector("input[name='gpt-model']").value;
    const hist = [];
    chat_div.querySelectorAll("textarea").forEach(ta => {hist.push({"role":ta.dataset["role"], "content":ta.value}); ta.disabled=true;});
    
    MEMORY["Chats"][id] = {
        "gpt-api-key":gpt_api_key,
        "gpt-url":gpt_url,
        "gpt-model":gpt_model,
        "gpt-hist":hist
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
                readed = evt.target.result
                console.log('readed:', readed)
                console.log(JSON.parse(readed))
                graph.configure(JSON.parse(readed));
                graph._nodes.forEach(n => {n.setState("edited"); n.size = n.computeSize();});
                graph.setDirtyCanvas(true,true)
            }
            reader.onerror = function (evt) {
                alert("error reading file");
            }
        }
    }
    element.click();
    
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