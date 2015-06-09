
                        function graphDrawer(data){
                            var nodes = data[0],
                                edges = data[1];
                                //- container = document.getElementById('results');
                                //- console.log(nodes);
                                var graph = Viva.Graph.graph();
                                var startNodeUrl = 'http://sport.rggu.ru/';
                                var initialNode = nodes.filter(function(n){return n.label == startNodeUrl})[0];
                                //- var initialNode = nodes.filter(function(n){return n.id == 29560})[0];
                                
                                
                                var addEdges = function(nodeFrom, nodesTo){
                                    var to = nodesTo || null; //optional. if not set, adds all existing 
                                    if (to === null){
                                        for (var i = 0,len = edges.length; i< len; i++){
                                            if (edges[i].from === nodeFrom.id){
                                                graph.addLink(edges[i].from, edges[i].to); 
                                            } 
                                        }
                                    }
                                    else {
                                        for (var i = 0, len = to.length; i< len; i++){
                                            if(edges.filter(function(n){return (n.from == nodeFrom.id && n.to == to[i].id)}).length > 0 )
                                                graph.addLink(nodeFrom.id, to[i].id);
                                        }
                                    }
                                };


                            var addRelatedNodes = function(node){
                            console.log('adding related to ', node.id);
                                for (var i = 0,len = edges.length; i< len; i++){
                                    if (edges[i].from === node.id){
                                        var nodeToAdd = nodes.filter(function(n){return n.id == node.id})[0];
                                        console.log('nodeToAdd:', nodeToAdd);
                                        graph.addNode(nodeToAdd.id, nodeToAdd.label);
                                    }
                                }
                                addEdges(node);
                            };

                            graph.addNode(initialNode.id, initialNode.label);
                            addEdges(initialNode);
                            var nodesDrawn = [];
                            graph.forEachNode( function(node, link){
                                nodesDrawn.push(node);                        
                            });
                            graph.forEachNode( function(node, link){
                                addEdges(node, nodesDrawn);                        
                            });
                            //- for(var i = 0, l = nodes.length; i<l; i++){
                            //-     graph.addNode(nodes[i].id, nodes[i].label);
                            //-     addEdgesFrom(nodes[i]);
                            //- }
                            
                            var graphics = Viva.Graph.View.webglGraphics({clearColor: true});  
                            graphics
                                .node(function(node){
                                    return Viva.Graph.View.webglSquare(30);
                            }); 

                            var highlightRelatedNodes = function(nodeId, isOn) {
                                graph.forEachLinkedNode(nodeId, function(node, link){

                                var linkUI = graphics.getLinkUI(link.id);
                                if (linkUI) {
                                    $(linkUI).attr('color', isOn ? 0xff0000ff : 0xb3b3b3ff);
                                }

                               });
                            };
                            var events = Viva.Graph.webglInputEvents(graphics, graph);
                            events.mouseEnter(function (node) {
                                console.log('Mouse entered node: ' + node.id);
                                highlightRelatedNodes(node.id, true);
                            }).mouseLeave(function (node) {
                                console.log('Mouse left node: ' + node.id);
                                highlightRelatedNodes(node.id, false);
                            }).dblClick(function (node) {
                                console.log('Double click on node: ' + node.id);
                            }).click(function (node) {
                                console.log('Single click on node: ' + node.id);
                                addRelatedNodes(node);
                            });                            

                            var layout = Viva.Graph.Layout.forceDirected(graph, {
                               springLength : 30,
                               springCoeff : 0.00005,
                               dragCoeff : 0.05,
                               gravity : -10.2,
                               theta : 0.1
                            });
                            var renderer = Viva.Graph.View.renderer(graph,
                                {
                                    layout     : layout,
                                    graphics   : graphics,
                                    renderLinks : true,
                                    prerender  : true
                                });

                            renderer.run();                

                        }