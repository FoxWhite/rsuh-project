function graphDrawer(data){
    var nodes = data[0],
        edges = data[1],
        startNodeUrl = 'http://sport.rggu.ru/';
        
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
            graph.addNode(topNode.id, topNode.label);

            for (var i = 0,len = edges.length; i< len; i++){
                if (edges[i].from === topNode.id && edges[i].to !== topNode.id){
                    var nodeToAdd = nodes.filter(function(n){return n.id == edges[i].to;})[0];
                    console.log(nodeToAdd.id);
                    graph.addNode(nodeToAdd.id, nodeToAdd.label);
                    graph.forEachNode(function(node){
                        graph.addLink(topNode.id, node.id);
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
                              .attr('stroke', 'gray');
    }).placeLink(function(linkUI, fromPos, toPos) {
                var data = 'M' + fromPos.x + ',' + fromPos.y +
                           'L' + toPos.x + ',' + toPos.y;

                linkUI.attr("d", data);
    });
    //------ LAYOUT --------------------------------------------------------------
    var layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength : 10,
        springCoeff : 0.00018,
        dragCoeff : 0.009,
        gravity : -8.2
    });

    var renderer = Viva.Graph.View.renderer(graph, {
            graphics : graphics,
            layout : layout
        });


    drawChunk(initialNode); 
    renderer.run();

}
