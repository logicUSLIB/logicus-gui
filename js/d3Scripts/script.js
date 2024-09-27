
function textSize(text) {
    if (!d3) return;
    var container = d3.select('body').append('svg');
    container.append('text').attr({ x: -99999, y: -99999 }).text(text);
    var size = container.node().getBBox();
    container.remove();
    return { width: size.width, height: size.height };
}

function BuildVerticaLTree(treeData, treeContainerDom) {
    const depthT = depthTree(treeData);
    const widthT = widthTree(treeData);
    console.log(widthT)
    var margin = { top: 40, right: 20, bottom: 40, left: 20 };
    var width = widthT - margin.right - margin.left;
    var height = 80*depthT - margin.top - margin.bottom;

    var i = 0, duration = 550;
    var tree = d3.layout.tree()
        .size([height, width]);


    var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.x, d.y]; });
    var svg = d3.select(treeContainerDom).append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    root = treeData;

    var Tooltip = d3.select("body")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "rgb(255, 237, 157)")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("position", "absolute")

    update(root);
    function update(source) {
        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);
        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.isCollapse = false;
            d.y = d.depth * 80;
        });
        // Declare the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) { return d.id || (d.id = ++i); });

            // Enter the nodes.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.x + "," + source.y + ")";
            }).on("click", nodeclick);

            var mouseover = function(d) {
                
                boundingbox = this.getBoundingClientRect()
                console.log(boundingbox);

                d3.select(".tooltip")
                    .html(d.xlabel)
                    .style("left", (boundingbox.right + 10 + "px"))
                    .style("top", (boundingbox.bottom + "px"))

                    Tooltip
                        .style("width", textSize(d.xlabel.trim()).width + "px")
                        .style("opacity", 1)
                        .style("z-index", 2000);


                d3.select(this)
                        .style("stroke", "black")
                        .style("stroke-width", "1");
            }

            var mouseleave = function(d) {

                d3.select(".tooltip")
                    .style("opacity", 0)
                    .style("z-index", 0)
                d3.select(this)
                    .style("stroke-width", "0")
                }


        nodeEnter.append("text")
        .text(function(d){return (d.label.trim()) + "『" +  d.name + "』";})
        .attr("transform", function (d) {
            //console.log(textSize(d.label.trim() + "『" +  d.name + "』"))
            return "translate(" + (-0.5)*textSize(d.label.trim()).width + "," + 0 + ")";
        })
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave);

        nodeEnter.insert("rect","text")
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("width", function(d){return 1.07*textSize(d.label.trim()).width})
            .attr("height", function(d){return 1.4*textSize(d.label.trim() + "『" +  d.name + "』").height})
            .attr("transform", function (d) {
                //console.log(textSize(d.label.trim() + "『" +  d.name + "』"))
                return "translate(" + (-0.55)*textSize(d.label.trim()).width + "," + (-0.9)* textSize(d.label.trim() + "『" +  d.name + "』").height+ ")";
            })
            .style("fill", "#c1f6ff")
            .style("stroke", "black")
            .style("stroke-width", "1");

            

        //.attr("r", 10)
        //.style("fill", "#fff");
        // Transition nodes to their new position.
        //horizontal tree
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {return "translate(" + d.x + "," + d.y + ")"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);


        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {  return "translate(" + source.x + "," + source.y + ")"; })
            .remove();

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);
        // Update the links…
        // Declare the links…
        var link = svg.selectAll("path.link")
            .data(links, function (d) { return d.target.id; });
        // Enter the links.
        link.enter().insert("path", "g")
            .attr("class", "link")

            .attr("d", function (d) {
                var o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
            });
        // Transition links to their new position.
        link.transition()
            .duration(duration)
        .attr("d", diagonal);


        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }



    // Toggle children on click.
    function nodeclick(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
            d._children.forEach(c => collapseNode(c));
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
            d.children.forEach(c => uncollapseNode(c));
        }
        update(d);
    }

    function collapseNode(d) {
        d.isCollapse = true;
        if (d._children){
            d._children.forEach(c => collapseNode(c));
        }

    }

    function uncollapseNode(d){
        d.isCollapse = false;
        if (d.children){
            d.children.forEach(c => uncollapseNode(c));
        }

    }

    //tree.nodes(root).reverse().forEach(nodeclick);


}

 function depthTree(treeD){
     if (treeD.children.length != 0){
         return 1 + treeD.children.map(x => depthTree(x)).reduce(function(vcur, acum, ind, vec){return Math.max(vcur, acum);});
     }else{
         return 1
     }
 }

 function widthTree(treeD){
     if (treeD.children.length != 0){
         return textSize(treeD.label).width + treeD.children.map(x => widthTree(x)).reduce(function(vcur, acum, ind, vec){return vcur + acum;});
     }else{
         return textSize(treeD.label).width
     }
 }