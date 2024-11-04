/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/TypeScriptDataObjectTemplate.ts to edit this template
 */
import { ProgressDialog } from "./ProgressDialog";
import Graph, { MultiGraph } from "graphology";

export class BigBang {
    logEnabled: boolean = true;
    log(...logVal) {
        if (this.logEnabled) {
            console.log(...logVal);
        }
    }
    
    private worker: Worker | null = null;
    private progressDialog: ProgressDialog;
    
    graph: MultiGraph;
    serializedGraph: any;
    
    constructor(graph: MultiGraph) {
        this.graph = graph;
        this.worker = new Worker(new URL('./BigBangWorker.ts', import.meta.url).href,{ type: "module",},);
        this.progressDialog = new ProgressDialog();
        
        // Escuchar mensajes enviados desde el worker
        this.worker.onmessage = (event) => {
            this.log("worker message",arguments);
            if (event.data.type === 'progress') {
                if (event.data.addLine) {
                    this.progressDialog.addLogLine(event.data.message);
                } else if (event.data.percentage) {
                    this.progressDialog.updateProgress(event.data.message,event.data.percentage);
                } else {
                    this.progressDialog.updateLogLastLine(event.data.message);
                }
            } else if (event.data.type === 'complete') {
                const updatedgraph : MultiGraph = Graph.from(event.data.graph);
                updatedgraph.forEachNode((n, attr) => {
                     this.graph.setNodeAttribute(n, "x", attr.x);
                     this.graph.setNodeAttribute(n, "y", attr.y);
                });
                this.onComplete();
            }
        };
    }

    // Iniciar el proceso en el worker
    start() {
        this.log("start worker...");
        if (this.worker) {
            // inicializar el progressDialog
            this.progressDialog.start();
            
            // inicializar el worker
            this.log("postMessage start al worker");
            console.time("serializar");
            this.serializedGraph = this.graph.export();
            console.timeEnd("serializar");
            console.log(this.worker);
            this.worker.postMessage({ command: 'start' , graph: this.serializedGraph});
            this.log("afer post");
        }
    }
    
    
    
    // Cuando el proceso termina
    onComplete() {
        this.progressDialog.end();
        if (this.worker) {
            this.worker.terminate();  // Terminar el worker
            this.worker = null;       // Liberar el worker
        }
    }
    
}