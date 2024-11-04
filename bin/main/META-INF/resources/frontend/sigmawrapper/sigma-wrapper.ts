// import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
// import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';

import {css, unsafeCSS, html, LitElement} from 'lit';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { customElement, property, query } from 'lit/decorators.js';

import { MultiGraph } from "graphology";
import Sigma from "sigma";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { PlainObject } from "sigma/types";
import { animateNodes } from "sigma/utils";
import { createNodeBorderProgram } from "@sigma/node-border";
import {
  DEFAULT_EDGE_CURVATURE,
  EdgeCurvedArrowProgram,
  indexParallelEdgesIndex,
} from "@sigma/edge-curve";
import { zIndexOrdering } from "sigma/dist/declarations/src/utils";
import { EdgeArrowProgram } from "sigma/rendering";
import { EdgeDisplayData, NodeDisplayData } from "sigma/types";
import { bindWebGLLayer, createContoursProgram } from "@sigma/layer-webgl";
import louvain from "graphology-communities-louvain";


import "@vaadin/flow-frontend/sigmawrapper/sigma-css-loader.js";


/**
 * `Sigma wrapper`
 * Sigma wrapper component
 *
 * @customElement
 * @polymer
 */
@customElement("sigma-wrapper")
class SigmaWrapper extends ThemableMixin(LitElement) {
    logEnabled: boolean;
    @query("#sigmagraph")
    private sigmagraph: any;
    private camera: any;

    @query("#layoutForceAtlas")
    private btnForceAtlas: any;
    
    @query("#layoutCircular")
    private btnCircular: any;


    @query("#fitgraph")
    private btnFitGraph: any;

    @query("#drawEdge")
    private btnDrawEdge: any;

    @query("#groupNodes")
    private btnGroupNodes: any;


    // State for drag'n'drop
    private draggedNode: string | null = null;
    private isDragging = false;
    sigma: any;
    graph: any;

    cancelCurrentAnimation: (() => void) | null = null;

    // nodos actualmente seleccionados
    private selectedNodes: any[] = [];

    // nombre de los grupos de nodos.
    private nodesGroups = new Set<string>();
    
    private initState: any;
    
    private isDrawingEdge = false;
    private tmpDrawEdge = "tmpDrawEdge";
    private originDrawEdgeNode: string | null = null;
    private targetDrawEdgeNode: string | null = null;

    // utilizado para almacenar las funciones de limpieza de los grupos creados. 
    private cleanGroupFunctions = new Map();
    
    
    @query("#nodesGroups")
    private nodesGroupsContainer: any;

    private state:
            | { type: "idle" }
            | { type: "hovered"; edge: string; source: string; target: string } = {
            type: "idle",
          };

    render() {
        this.log("rendering...");
        return html`
            <style>
            </style>
            <div id="sigmawrapper" class="sigmawrapper">
                <div id="toolbar" class="toolbar">
                    <div id="layoutForceAtlas" class="button">FA</div>
                    <div id="layoutCircular" class="button">C</div>
                    <div id="fitgraph" class="button btnFitGraph"></div>
                    <div id="drawEdge" class="button">E</div>
                    <div id="groupNodes" class="button btnGroup"></div>
                </div>
                <div class="sigmagraph" id="sigmagraph">
                    <div id="nodesGroups" class="nodesGroups">- Groups -</div>
                </div>
            </div>
            `;
    }

    static get is() {
        return 'sigma-wrapper';
    }

    // static get properties() {
    //     return {
    //         targetid: {
    //             type: String,
    //             value: ''
    //         }
    //     };
    // }

    log(...logVal) {
        if (this.logEnabled) {
            console.log(...logVal);
        }
    }
    
    constructor() {
        super();

        this.logEnabled = true;

        this.log("\n\Sigma Wrapper\n\n");

        this.log("constructor end! \n\n\n");
    
    }


    firstUpdated() {
        this.log("firstUpdate called");
        super.firstUpdated();
        this.updateChart();
    }
    
    updateChart() {
        this.log("initializing Chart...");
        this.graph = new MultiGraph();
        
//        this.graph.addNode("1", { label: "Node 1", x: 0, y: 0, size: 10, color: "blue" });
//        this.graph.addNode("2", { label: "Node 2", x: 1, y: 1, size: 20, color: "red" });
//        this.graph.addNode("3", { label: "Node 3", x: -1, y: 1, size: 20, color: "red" });
//        
//        this.graph.addEdge("1", "2", { size: 5, color: "purple" });
//        this.graph.addEdge("1", "3", { size: 5, color: "purple" });
//        this.graph.addEdge("1", "3", {
//          size: 5,
//          color: "purple",
//          forceLabel: true,
//          label: "works with",
//        });

        this.sigma = new Sigma(this.graph, this.sigmagraph, {
                                        allowInvalidContainer: true,
                                        zIndex: true,
                                        defaultEdgeType: "straight",
                                        enableEdgeEvents: true,
                                        renderEdgeLabels: true,
                                        edgeProgramClasses: {
                                            straight: EdgeArrowProgram,
                                            curved: EdgeCurvedArrowProgram,
                                        },
                                        edgeReducer: (edge, attributes) => {
                                          const res: Partial<EdgeDisplayData> = { ...attributes };

                                          if (this.state.type === "hovered") {
                                            if (edge === this.state.edge) {
                                                res.size = (res.size || 1) * 1.5;
                                                res.zIndex = 1;
                                                res.color = "#f0f0f0";
                                            } else {
                                                res.zIndex = 0;
                                            }
                                          }

                                          return res;
                                        },
                                        nodeReducer: (node, attributes) => {
                                          const res: Partial<NodeDisplayData> = { ...attributes };

                                          if (this.state.type === "hovered") {
                                            if (node === this.state.source || node === this.state.target) {
                                                res.highlighted = true;
                                                res.zIndex = 1;
                                            } else {
                                                res.label = undefined;
                                                res.zIndex = 0;
                                            }
                                          }

                                          return res;
                                        },
                                    });
                                    
        // this.renderer.setSetting("allowInvalidContainer", true);
        this.camera = this.sigma.getCamera();
        this.initState = this.camera.getState();
        
        // =================== Select nodes ===================
        // si se hace click sobre el fondo se cancela la selección
        this.sigma.on("clickStage", (e) => {
            this.selectedNodes.forEach((selected) => this.graph.setNodeAttribute(selected, "highlighted", false));
            this.selectedNodes.length = 0;;
        });
        
        // ctrl para seleccionar nodos
        this.sigma.on("clickNode", (e) => {
            if (e.event.original.ctrlKey) {
                this.graph.setNodeAttribute(e.node, "highlighted", true);
                this.selectedNodes.push(e.node);
            }
        });
        
        // =================== Drag nodes ===================
        // On mouse down on a node
        //  - we enable the drag mode
        //  - save in the dragged node in the state
        //  - highlight the node
        //  - disable the camera so its state is not updated
        this.sigma.on("downNode", (e) => {
            this.isDragging = true;
            if (!this.isDrawingEdge) {
              this.draggedNode = e.node;
              this.graph.setNodeAttribute(this.draggedNode, "highlighted", true);
            } else {
              // tomar el nodo actual como el origen y agregar uno nuevo
              this.originDrawEdgeNode = e.node;

              const xx = this.graph.getNodeAttribute(e.node, "x");
              const yy = this.graph.getNodeAttribute(e.node, "y");
              this.graph.addNode(this.tmpDrawEdge, {
                x: xx,
                y: yy,
                size: 1,
                color: "red",
                zIndex: 0,
              });
              this.draggedNode = this.tmpDrawEdge;

              this.graph.addEdge(e.node, this.tmpDrawEdge, { size: 2, color: "red" });
            }
        });

        this.sigma.on("enterNode", (e) => {
            // ir registrando el último nodos sobre el que se está ingresando.
            if (this.isDrawingEdge && e.node != this.tmpDrawEdge) {
                this.targetDrawEdgeNode = e.node;
            }
        });
        
        this.sigma.on("leaveNode", (e) => {
            // si se sale del nodo, eliminar la referecia
            if (this.isDrawingEdge && e.node != this.tmpDrawEdge) {
                this.targetDrawEdgeNode = null;
            }
        });
        
        // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
        this.sigma.getMouseCaptor().on("mousemovebody", (e) => {
            // this.log("mouse move...");
            if (!this.isDragging || !this.draggedNode) return;

            // Get new position of node
            const pos = this.sigma.viewportToGraph(e);

            this.graph.setNodeAttribute(this.draggedNode, "x", pos.x);
            this.graph.setNodeAttribute(this.draggedNode, "y", pos.y);

            // Prevent sigma to move camera:
            e.preventSigmaDefault();
            e.original.preventDefault();
            e.original.stopPropagation();
        });

        // On mouse up, we reset the autoscale and the dragging mode
        this.sigma.getMouseCaptor().on("mouseup", () => {
            if (this.draggedNode) {
                this.graph.removeNodeAttribute(this.draggedNode, "highlighted");
            }
            if (this.isDrawingEdge) {
                // quitar el nodo temporal
                this.graph.dropNode(this.tmpDrawEdge);
                // establecer un edge entre el origen y destino
                if (this.targetDrawEdgeNode) {
                    this.graph.addEdge(this.originDrawEdgeNode, this.targetDrawEdgeNode, {
                    size: 2,
                    color: "blue",
                  });
                }
            }
            this.originDrawEdgeNode = null;
            this.targetDrawEdgeNode = null;
            this.isDragging = false;
            this.draggedNode = null;
            this.isDrawingEdge = false;
        });
        //=============== fin dragging ===============
        
        
        this.sigma.on("enterEdge", ({ edge }) => {
            this.state = {
              type: "hovered",
              edge,
              source: this.graph.source(edge),
              target: this.graph.target(edge),
            };
            this.sigma.refresh();
        });
        this.sigma.on("leaveEdge", () => {
            this.state = { type: "idle" };
            this.sigma.refresh();
        });
        
        this.curveEdges();
        //==========================================
        // Disable the autoscale at the first down interaction
        this.sigma.getMouseCaptor().on("mousedown", () => {
          if (!this.sigma.getCustomBBox()) this.sigma.setCustomBBox(this.sigma.getBBox());
        });
        

        this.btnForceAtlas.addEventListener('click', this.forceAtlas2.bind(this));
//        this.btnCircular.addEventListener('click', this.resetZoom.bind(this));
        this.btnFitGraph.addEventListener('click', this.fitGraph.bind(this));
        this.btnGroupNodes.addEventListener("click", this.groupNodes.bind(this));
        this.btnDrawEdge.addEventListener('click', this.drawEdge.bind(this));
        
        // cambiar la configuración del estilo para hacerlo responsive
        this.sigma.refresh();
        
        //======================== FIN DEL SETUP ========================
    }
    
    
    
    //============================================
    // Manejo de edges
    //============================================
        
    getCurvature(index: number, maxIndex: number): number {
            if (maxIndex <= 0) throw new Error("Invalid maxIndex");
            if (index < 0) return this.getCurvature(-index, maxIndex);
            const amplitude = 3.5;
            const maxCurvature = amplitude * (1 - Math.exp(-maxIndex / amplitude)) * DEFAULT_EDGE_CURVATURE;
            return (maxCurvature * index) / maxIndex;
    }

    
    //============================================
    // curvar edgest
    //============================================
    curveEdges(): void {
        // Use dedicated helper to identify parallel edges:
        indexParallelEdgesIndex(this.graph, {
            edgeIndexAttribute: "parallelIndex",
            edgeMinIndexAttribute: "parallelMinIndex",
            edgeMaxIndexAttribute: "parallelMaxIndex",
        });

          // Adapt types and curvature of parallel edges for rendering:
        this.graph.forEachEdge(
            (
            edge,
            {
                parallelIndex,
                parallelMinIndex,
                parallelMaxIndex,
            }:
            | {
                parallelIndex: number;
                parallelMinIndex?: number;
                parallelMaxIndex: number;
            }
            | {
                parallelIndex?: null;
                parallelMinIndex?: null;
                parallelMaxIndex?: null;
                }
            ) => {
                if (typeof parallelMinIndex === "number") {
                    this.graph.mergeEdgeAttributes(edge, {
                    type: parallelIndex ? "curved" : "straight",
                    curvature: this.getCurvature(parallelIndex, parallelMaxIndex),
                });
              } else if (typeof parallelIndex === "number") {
                    this.graph.mergeEdgeAttributes(edge, {
                    type: "curved",
                    curvature: this.getCurvature(parallelIndex, parallelMaxIndex),
                });
              } else {
                    this.graph.setEdgeAttribute(edge, "type", "straight");
              }
            }
        );
    }
    
    
    //============================================
    // Agrupar nodos
    //============================================
    // preparar un DIV para mostrar los grupos creados.
    // se le podría aregar la funcionalidad de mostrar/ocultar
    // para pode jugar con eso.
    // FIXME: se podría asignar el nombre del atributo por parámetro!

    groupNodes(): void {
        this.log("Group nodes");
        if (this.selectedNodes.length > 0) {
            louvain.assign(this.graph, { nodeCommunityAttribute: "nodeGroup" });    
        
            this.log("hay nodos seleccionados");
            // darle un nombre al grupo. Debería venir desde un form.
            const groupName = "g" + this.generateUUID();

            this.nodesGroups.add(groupName);

            // darle un nombre al grupo.
            this.selectedNodes.forEach((n) => {
                this.graph.setNodeAttribute(n, "nodeGroup", groupName);
            });

            // crear un check para mostrar/ocultar el grupo y agregarlo al div de grupos
            const checkboxContainer = document.createElement("div");
            checkboxContainer.innerHTML += `
                <input type="checkbox" id="${groupName}" name="">
                <label for="${groupName}" >${groupName}</label>    
            `;
            this.nodesGroupsContainer?.append(checkboxContainer);
            const checkbox = this.nodesGroupsContainer.querySelector(
              `#${groupName}`
            ) as HTMLInputElement;
            checkbox.addEventListener("change", () => {
              this.toggle(groupName);
            });
            checkbox.checked = true;
            this.toggle(groupName);

            //resetear la selección
            this.selectedNodes.forEach((selected) =>
                this.graph.setNodeAttribute(selected, "highlighted", false)
            );
            this.selectedNodes.length = 0;
          }
    }
    
    
    toggle(groupName) {
        let clean: null | (() => void) = null;
        clean = this.cleanGroupFunctions.get(groupName);
        if (clean) {
            clean();
            clean = null;
            this.cleanGroupFunctions.delete(groupName);
        } else {
            clean = bindWebGLLayer(
                `${groupName}`,
                this.sigma,
                createContoursProgram(
                    this.graph.filterNodes((_, attr) => attr.nodeGroup === groupName),
                    {
                      radius: 150,
                      border: {
                        color: "#DEDEDE",
                        thickness: 8,
                    },
                    levels: [
                        {
                            color: "#00000000",
                            threshold: 0.5,
                        },
                      ],
                    }
              )
            );
            this.cleanGroupFunctions.set(groupName, clean);
          }
    }
    
    export():void {
        this.log(this.graph.export());
    }
    
    import(data: string): void {
        this.log("parsing data...",data.length);
        const graphData = JSON.parse(data);
        this.log("importing to graph...",graphData);
        this.graph.import(graphData);
        this.log("end import!");
        this.export();
    } 
    
    drawEdge() {
       this.isDrawingEdge = true;
    }
    
    fitGraph(): void {
        this.log("fitGraph");
        this.sigma.setCustomBBox(null);
        this.sigma.getCamera().setState({ x: 0.5, y: 0.5, ratio: 1 });
        this.sigma.refresh();
    }

    forceAtlas2(iterations?: number): void {
        this.log("forceAtlas2");
        let it = 1000;
        if ( iterations != undefined) {
            it = iterations;
        }
        const sensibleSettings = {
                    scalingRatio: 3,
                    gravity: 1,
                    strongGravityMode: false,
                    iterationsPerRender: 100,
                    barnesHutOptimize: true,
                    barnesHutTheta: 0.6,
                    timeout: 5000
                    }
        this.log(sensibleSettings);
        const fa2Layout = new FA2Layout(this.graph, {
            settings: sensibleSettings,
            iterations: it 
        });
        if (this.cancelCurrentAnimation) this.cancelCurrentAnimation();
        fa2Layout.start();
//        setTimeout(() =>{fa2Layout.stop();this.sigma.refresh();}, 5000);
    }
    // static get styles() {
        
    //     var st = css`${unsafeCSS(c3styles)}`;
            
    //     console.log("styles: " + st);
    //     return st;
    // }
    
    addNode(nodeConfig: string){
        this.log("addNode string: ", nodeConfig);
        const nc = JSON.parse(nodeConfig);
        this._addNode(nc.attributes);
    }

    _addNode(nodeParams:{x: number,y: number,id?: string,  label?: string, color?: string, size?: number, type?: any} ) {
        // nodo base.
        this.log("addNode nodeparams", nodeParams.x, nodeParams.y, nodeParams.id, nodeParams.label, nodeParams.color, nodeParams.size, nodeParams.type);
        const n = {
            x: nodeParams.x, 
            y: nodeParams.y
        }
        
        let id: string = nodeParams.id; 
        if ( id == undefined) {
            id = this.generateUUID();
        }

        if (nodeParams.label !== undefined) {
            n["label"] = nodeParams.label;
        }
        
        if (nodeParams.size !== undefined) {
            n["size"] = nodeParams.size;
        } else {
            n["size"] = 3;
        }
        
        if (nodeParams.color !== undefined) {
            n["color"] = nodeParams.color;
        }
        
        // We create a new node
        this.log("id: ",id,"  n: ",n);
        this.graph.addNode(id, n);

        this.sigma.refresh();
        this.log("addNode end.")
    }

    enableAddNodeOnClick() {
        //
        // Create node (and edge) by click
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //

        // When clicking on the stage, we add a new node and connect it to the closest node
        this.sigma.on("clickStage", ({ event }: { event: { x: number; y: number } }) => {
            // Sigma (ie. graph) and screen (viewport) coordinates are not the same.
            // So we need to translate the screen x & y coordinates to the graph one by calling the sigma helper `viewportToGraph`
              this.log("agregar nodo en click");
              const coordForGraph = this.sigma.viewportToGraph({ x: event.x, y: event.y });
  
              // We create a new node
              const node = {
                  ...coordForGraph,
                  size: 10,
                  color: '#FF0000',
              };
  
            //   // Searching the two closest nodes to auto-create an edge to it
            //   const closestNodes = this.graph
            //       .nodes()
            //       .map((nodeId) => {
            //       const attrs = this.graph.getNodeAttributes(nodeId);
            //       const distance = Math.pow(node.x - attrs.x, 2) + Math.pow(node.y - attrs.y, 2);
            //       return { nodeId, distance };
            //       })
            //       .sort((a, b) => a.distance - b.distance)
            //       .slice(0, 2);
  
              // We register the new node into graphology instance
              const id = this.generateUUID();
              this.graph.addNode(id, node);
  
              // We create the edges
            //   closestNodes.forEach((e) => this.graph.addEdge(id, e.nodeId));
        });
    }


    addEdge(edgeConfig: string) {
        
        const ec = JSON.parse(edgeConfig);
        this.log("addEdge: ",ec);
        this._addEdge(ec);
    }
    
    _addEdge(edgeParams: {source: string, target: string, key?: string, attributes?: {size?: number, color?: string, label?: string, type?: any, hidden?: boolean, forceLabel?: boolean, zIndex?: number}}) {
        
        const e = {}
        
        if (edgeParams.attributes.size !== undefined) {
            e["size"] = edgeParams.attributes.size;
        }
        
        if (edgeParams.attributes.color !== undefined) {
            e["color"] = edgeParams.attributes.color;
        }
        
        if (edgeParams.attributes.label !== undefined) {
            e["label"] = edgeParams.attributes.label;
        }

        if (edgeParams.attributes.type !== undefined) {
            e["type"] = edgeParams.attributes.type;
        }
        
        if (edgeParams.attributes.hidden !== undefined) {
            e["hidden"] = edgeParams.attributes.hidden;
        }
        
        if (edgeParams.attributes.forceLabel!== undefined) {
            e["forceLabel"] = edgeParams.attributes.forceLabel;
        }
        if (edgeParams.attributes.zIndex!== undefined) {
            e["zIndex"] = edgeParams.attributes.zIndex;
        }
        this.log("_addEdge: ",edgeParams.source,edgeParams.target, e);
        this.graph.addEdge(edgeParams.source,edgeParams.target, e);
    }
    
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r   
        : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

}

interface NodeParams {
    x: number;
    y: number;
    id?: string;
    label?: string;
    color?: string;
    size?: number;
    type?: any;
}
// customElements.define(SigmaWrapper.is, SigmaWrapper);
