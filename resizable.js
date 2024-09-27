const resizer = document.getElementById('desc-resizer');
const descNode = document.getElementById('desc-node');
const toggleButton = document.getElementById('desc-node-posbtn');
let mpIsResizing = false;
let mpIsHorizontal = false; // Empieza con orientación horizontal

resizer.addEventListener('mousedown', function(e) {
mpIsResizing = true;
document.body.style.cursor = mpIsHorizontal ? 'ew-resize' : 'ns-resize';
document.addEventListener('mousemove', resizeDescNode);
document.addEventListener('mouseup', stopResizing);
});

toggleButton.addEventListener('click', function() {

mpIsHorizontal = !mpIsHorizontal; // Cambiamos la orientación
descNode.classList.toggle('onright');
drawPanel = document.getElementById("draw-panel");
descPanel = document.getElementById("desc-node");
if(descPanel.classList.contains("onright")){
    descPanel.style.height = drawPanel.style.height;
    descPanel.style.width = "200px";
} else {
    descPanel.style.width = drawPanel.style.width;
    descPanel.style.height = "150px";
}
});

function resizeDescNode(e) {
if (!mpIsResizing) return;

const containerRect = descNode.getBoundingClientRect();


if (mpIsHorizontal) {
const newLeftWidth = e.clientX - containerRect.left;
const totalWidth = containerRect.width;

descNode.style.width = `${totalWidth - newLeftWidth - resizer.offsetWidth}px`;

} else {
const newTopHeight = e.clientY - containerRect.top;
const totalHeight = containerRect.height;

descNode.style.height = `${totalHeight - newTopHeight - resizer.offsetHeight}px`;
}
}

function stopResizing() {
mpIsResizing = false;
document.body.style.cursor = 'default';
document.removeEventListener('mousemove', resizeDescNode);
document.removeEventListener('mouseup', stopResizing);
}

function resizeDescriptionPanel(){
    descNode = document.getElementById("desc-node");
    descNode.style.width = window.innerWidth - 200;
    descNode.style.height = "100px";
}

