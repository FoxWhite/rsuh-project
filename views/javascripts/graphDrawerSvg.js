function graphDrawer(data, startNodeUrl){
    var nodes = data[0],
        edges = data[1];
    for (var i = edges.length - 1; i >= 0; i--) {
            console.log('from:',edges[i].from, 'to:', edges[i].to);
    };
        
    var graph = Viva.Graph.graph(),
        initialNode = nodes.filter(function(n){return n.label == startNodeUrl})[0];
    // for (var i = nodes.length - 1; i >= 0; i--) {
    //     graph.addNode(nodes[i].id, nodes[i].label);
    // };
    // // FOR TESTING: adds all nodes and edges
    // for (var i = edges.length - 1; i >= 0; i--) {
    //     graph.addLink(edges[i].from, edges[i].to);
    // };
    // // ------------------------GRAPHICS ---------------------------------
    var graphics = Viva.Graph.View.svgGraphics(),
        nodeSize = 24,
        drawChunk = function(topNode){
            (graph.getNode(topNode.id) == undefined) ? graph.addNode(topNode.id, topNode.label) : console.log(topNode,' already exists;');

            for (var i = 0,len = edges.length; i< len; i++){
                if (edges[i].from === topNode.id && edges[i].to !== topNode.id){
                    var n = nodes;
                    var nodeToAdd = n.filter(function(nodeListed){return nodeListed.id == edges[i].to;})[0];
    
                    (graph.getNode(nodeToAdd.id) == undefined) ? graph.addNode(nodeToAdd.id, nodeToAdd.label): console.log(nodeToAdd,' already exists;');
                    
                    graph.removeLink(topNode.id, nodeToAdd.id);
                    graph.addLink(topNode.id, nodeToAdd.id);
                    
                    graph.forEachLinkedNode(topNode.id, function(linkedNode, link){
                        graph.forEachNode(function(eachNode){
                            if (edges.some(function(edge){return ((edge.from == linkedNode) && (edge.to == eachNode));})){
                                graph.removeLink(linkedNode.id, eachNode.id);
                                graph.addLink(linkedNode.id, eachNode.id);
                            }
                        });    
                    });
               }
            }
        
        },

        highlightRelatedNodes = function(nodeId, isOn, fixed) {
           graph.forEachLinkedNode(nodeId, function(node, link){
               var linkUI = graphics.getLinkUI(link.id);
               if (linkUI) {
                   linkUI.attr('stroke', (isOn || fixed) ? 'red' : 'gray');
               }
           });
        },
        showNodeInfo = function(node, isOn, fixed){
            if (fixed) {graphics.getNodeUI(node.id).attr('fixed','yes');}
            var info = "Страница <br><div class='nodeEl'>" + node.data +'</div>';
            info += "<br>Связи: <br><b>";
            graph.forEachLinkedNode(node.id, function(n, link){
                info += n.data + "<br>";
            }); 
            $('.nodeInfo').html((isOn || fixed) ? info :'');
        },
        resetSelection = function(){
            $('.nodeInfo').html('');
            graph.forEachLink(function(link){
                graphics.getLinkUI(link.id).attr('stroke', 'gray');
            });
        };

    graphics.node(function(node) {
        console.log((node.data));
        var ui = Viva.Graph.svg('g'),
            rect =Viva.Graph.svg('rect')        
                     .attr('width', nodeSize)
                     .attr('height', nodeSize)
                     .attr('fill', '#00a2e8'),
            svgText = Viva.Graph.svg('text').attr('y', '-4px').text(/([^\/]*)$/.exec(node.data)[0]);      

        $(ui).hover(function() { // mouse over
                    highlightRelatedNodes(node.id, true, false);
                    showNodeInfo(node, true, false);
                }, function() { // mouse out
                    if(this.attr('fixed') != 'yes'){
                        highlightRelatedNodes(node.id, false, false);
                        showNodeInfo(node, false, false);
                    }
                })
            .click(function(){
                if(this.attr('fixed') != 'yes'){
                    resetSelection();
                    highlightRelatedNodes(node.id, true, true);
                    showNodeInfo(node, true, true);
                }
                else{
                    this.attr('fixed', 'no');
                    resetSelection();
                }
                
                drawChunk(node);
                                
            });
        ui.append(svgText);
        ui.append(rect);
        return  ui;
    });
    graphics.placeNode(function(nodeUI, pos) {
                nodeUI.attr('transform',
                            'translate(' +
                                  (pos.x - nodeSize/2) + ',' + (pos.y - nodeSize/2) +
                            ')');
            });

    graphics.link(function(link){
                return Viva.Graph.svg('path')
                              .attr('stroke', 'gray')
                              .attr('stroke-opacity', '1')
                              .attr('stroke-width', '0.5');

    }).placeLink(function(linkUI, fromPos, toPos) {
                var data = 'M' + fromPos.x + ',' + fromPos.y +
                           'L' + toPos.x + ',' + toPos.y;

                linkUI.attr("d", data);
    });
    //------ LAYOUT --------------------------------------------------------------
    var layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength : 15,
        springCoeff : 0.00005,
        dragCoeff : 0.03,
        gravity : -10.2
    });

    var renderer = Viva.Graph.View.renderer(graph, {
            graphics : graphics,
            layout : layout
        });


    drawChunk(initialNode); 
    renderer.run();

}
