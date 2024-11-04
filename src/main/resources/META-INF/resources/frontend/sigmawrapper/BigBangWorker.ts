import Graph, { MultiGraph } from "graphology";
import { SparseMatrix } from "./SparseMatrix";

export class BigBangWorker {
    logEnabled: boolean = true;
    log(...logVal) {
        if (this.logEnabled) {
            console.log(...logVal);
        }
    }
    worker: any;
    graph: MultiGraph;
    private matrix: SparseMatrix;
    private clusterMatrix: SparseMatrix;
    private MAXCLUSTERREPULSION = 3;     // distancia a la que se repelen los clusters entre sí.
    private MAXCLUSTERSPEED = 1;
    private CLUSTERREPULSIONLOOP: number = 400;  // cantidad de veces que se aplica la repulsión entre los clusters

    private CONDENSED: boolean = true;
    private CLUSTER: boolean = true;
    // Parámetros del layout
    private MAXDISTANCEREPULSION = 1;
    private ATTRACTION_CONSTANT = 1;
    private REPULSION_CONSTANT = 1;
    private MAX_ITERATIONS = 1;
    private MAX_SPEED = 0.1;
    private FRICCION = 0.75;
    private THRESHOLD = 0.05;


    // distancia mínima a la que se intentará ubicar a los nodos
    // desde el centro de un cluster
    private MINDISTANCE: number = 0.9;
    constructor(graph: MultiGraph, worker: any) {
        this.worker = worker;
        this.graph = graph;
        this.matrix = new SparseMatrix();
        this.clusterMatrix = new SparseMatrix();

        // let sm = new SparseMatrix();
        // sm.setValue(1.5, 1.5, "A");
        // sm.setValue(1, 1, "B");
        // sm.setValue(2.5, 1.5, "C");
        // sm.setValue(-1.5, 2.5, "D");
        // sm.moveValue(1, 1, 3, 3, "A");
        // this.log(sm);

        // console.log("mc:", sm.getMinCol());
        // console.log("mr:", sm.getMinRow());
        // console.log("xc", sm.getMaxCol());
        // console.log("xr", sm.getMaxRow());
        // console.log(sm.getValue(2, 1));
        // console.log(sm.getValue(1, 1));
    }

    /*
      para cada nodo:
      1. anotar el nodo en un SparceMatrix y marcarlo como visitado con el número de iteración actual. 
      2. buscar cual es el siguiente nodo de los que están linkeados que tiene la mayor cardinalidad (MaxCard).
      2.1 Si se encuentra un nodo con mayor cardinalidad y no existe en el SparceMatrix:
      2.1.1 En forma recursiva saltar a ese nodo para que realice el proceso.
      2.1.2 Recuperar las condenadas de MaxCard desde SparceMatrix y 
              a) Si el nodo no está marcado saltar en dirección hacia el nodo a la distancia mínima posible que esté desocupada. 
                  Marcarlo como jumped.
                  Registrar en dx y dy el vector normalizado del salto. 
              b) Si está marcado como Jumped saltar al 50% de la distancia del Cluster ponderando el vector con la dirección de movimiento inicial
      2.2 Si no hay un nodo con mayor cardinalidad:
          Marcar el nodo como cluster y regresar.
      */

    detectClusters(directed: boolean) {
        this.updateProgress(true, "Detectar clusters...");

        this.graph.forEachNode((n, attr) => {
            const currentDegree = this.graph.degree(n);

            // recorrer los vecinos calculando el grado
            let maxDegree = -1;
            let maxNode: string = "";
            let maxNodeAttr: any;
            const self = this;
            if (directed) {
                this.graph.forEachOutNeighbor(n, function(nn, attrn) {
                    const nnd = self.graph.degree(nn);
                    if (nnd > maxDegree) {
                        maxDegree = nnd;
                        maxNode = nn;
                        maxNodeAttr = attrn;
                    }
                });
            } else {
                this.graph.forEachNeighbor(n, function(nn, attrn) {
                    const nnd = self.graph.degree(nn);
                    if (nnd > maxDegree) {
                        maxDegree = nnd;
                        maxNode = nn;
                        maxNodeAttr = attrn;
                    }
                });
            }
            // solo se considera cluster si llega mas de un link.
            if (currentDegree > 1  && currentDegree > maxDegree) {
                // soy un cluster. Agregarme a la lista.
                attr.x = 0;
                attr.y = 0;
                this.clusterMatrix.setValue(attr.x, attr.y, n);
                this.graph.setNodeAttribute(n, "CLUSTER", this.CLUSTER);
            }
        });
        this.updateProgress(true, "Clusters detectados: " + this.clusterMatrix.getElementCount());
    }

    // distribuir los nodos formando un cuadrado.
    squareReposition() {
        const clusterStartColumns = Math.sqrt(this.clusterMatrix.getElementCount());
        let index = 0;
        for (let [key, nodes] of this.clusterMatrix.getMatrix()) {
            nodes.forEach((clusterNode) => {
                let iy = Math.floor(index / clusterStartColumns);
                let ix = index % clusterStartColumns;
                let attr = this.graph.getNodeAttributes(clusterNode);
                attr.x = ix;
                attr.y = iy;
            });
        }
    }

    // detectar los cluster y repelerlos entre sí.
    clusterRepulsion() {
        this.log("Cluster Repulstion");
        // si no se ha inicializado el clusterList, detectar los clustes. 
        if (this.clusterMatrix.size() == 0) {
            // true: directed. Usa OutNeighbor para determinar si en el camino hay alguien con mayor cardinalidad
            // false: se fija en todo el vecindario.  
            this.detectClusters(true);
        }
        // reordenar los clusters en una matriz
        // procesar la lista de clusters aplicando la repulsion entre ellos.
        this.updateProgress(true, "aplicando repulsión de clusters :" + this.clusterMatrix.getElementCount(), 0);
        const total = this.clusterMatrix.getElementCount() * this.CLUSTERREPULSIONLOOP;
        let totalProcessed = 0;
        for (let clusterloop = 0; clusterloop < this.CLUSTERREPULSIONLOOP; clusterloop++) {
            for (let [key, nodes] of this.clusterMatrix.getMatrix()) {
                nodes.forEach((clusterNode) => {
                    this.updateProgress(false, "aplicando repulsión de clusters :" + this.clusterMatrix.getElementCount(),
                        (totalProcessed / total * 100));
                    totalProcessed++;
                    
                    let attr = this.graph.getNodeAttributes(clusterNode);

                    this.log("===============================================");
                    this.log("analizar nodo", clusterNode, attr);
                    const xInit = Math.floor(attr.x - this.MAXCLUSTERREPULSION);
                    const xEnd = Math.floor(attr.x + this.MAXCLUSTERREPULSION);
                    const yInit = Math.floor(attr.y - this.MAXCLUSTERREPULSION);
                    const yEnd = Math.floor(attr.y + this.MAXCLUSTERREPULSION);
                    this.log(">>> ", xInit, yInit, xEnd, yEnd);
                    this.log("===============================================");
                    for (let iY = yInit; iY < yEnd; iY++) {
                        for (let iX = xInit; iX < xEnd; iX++) {
                            // obtener los nodos que están en la posición
                            const cumulo = this.clusterMatrix.getValue(iX, iY);

                            if (cumulo.length > 0) {
                                this.log("<<>>---->> : ", iX, iY, cumulo);
                            }
                            // aplicar repulsión a cada nodo del cumulo
                            for (const nodeToRepulse of cumulo) {
                                if (nodeToRepulse !== clusterNode) {

                                    const cnX = this.graph.getNodeAttribute(nodeToRepulse, "x");
                                    const cnY = this.graph.getNodeAttribute(nodeToRepulse, "y");
                                    let cnVx = this.graph.getNodeAttribute(nodeToRepulse, "bbVx");
                                    let cnVy = this.graph.getNodeAttribute(nodeToRepulse, "bbVy");
                                    this.log(nodeToRepulse, cnX, cnY, cnVx, cnVy);
                                    // Calcular la distancia
                                    const dx = cnX - attr.x;
                                    const dy = cnY - attr.y;
                                    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                                    if (distance < this.MAXCLUSTERREPULSION) {
                                        // Aplicar fuerza de repulsión
                                        const repulsionForce =
                                            this.REPULSION_CONSTANT / (distance * distance);

                                        let forceX = (dx / distance) * repulsionForce;
                                        let forceY = (dy / distance) * repulsionForce;

                                        // si las dos fuerzas de repulsión son 0 quiere decir que están superpuestos
                                        // en ese caso seleccionar una dirección random en x e y y aplicar 
                                        if (forceX === 0 && forceY === 0) {
                                            forceX = Math.random();
                                            forceY = Math.random();
                                        }

                                        // attr.bbVx -= forceX;
                                        // attr.bbVy -= forceY;

                                        cnVx += forceX;
                                        cnVy += forceY;
                                        // normalizar el vector de escape
                                        const cnh = Math.sqrt(cnVx * cnVx + cnVy * cnVy);
                                        cnVx /= cnh;
                                        cnVy /= cnh;

                                        // actualizar el nodo repelido
                                        this.graph.setNodeAttribute(nodeToRepulse, "bbVx", cnVx);
                                        this.graph.setNodeAttribute(nodeToRepulse, "bbVy", cnVy);
//                                        this.log(
//                                            "---R--->",
//                                            nodeToRepulse,
//                                            cnVx,
//                                            cnVy,
//                                            "distance: ",
//                                            distance
//                                        );
                                        
                                    } else {
                                        this.log("---R---||", nodeToRepulse, "distance: ", distance);
                                    }
                                }
                            }
                        }
                    }
                    
                });


            }
            // actualizar las posiciones de los clusters
            this.log("actualizar posiciones de los clusters...");
//            this.updateProgress(false, "actualizando posiciones de los clusters...");
            let uc = 0;
            for (let [key, nodes] of this.clusterMatrix.getMatrix()) {
                nodes.forEach((clusterNode) => {
//                    this.updateProgress(false, "actualizando posiciones de los clusters...", uc / this.clusterMatrix.getElementCount() * 100);
                    uc ++;
                    
                    let attr = this.graph.getNodeAttributes(clusterNode);
                    attr.bbVx *= this.FRICCION;
                    attr.bbVy *= this.FRICCION;
                    // controlar el mínimo de desplazamiento
                    if (Math.abs(attr.bbVx) < this.THRESHOLD) {
                        attr.bbVx = 0;
                    }
                    if (Math.abs(attr.bbVy) < this.THRESHOLD) {
                        attr.bbVy = 0;
                    }

                    const oldx = attr.x;
                    const oldy = attr.y;

                    attr.x += attr.bbVx * this.MAX_SPEED;
                    attr.y += attr.bbVy * this.MAX_SPEED;

                    // actualizar la matriz
                    this.clusterMatrix.moveValue(oldx, oldy, attr.x, attr.y, clusterNode);

                });
            }
            
            
        }
        this.log("================ FIN CLUSTER REPULSION ================");
    }

    moveNode(node, positionMatrix: SparseMatrix) {
        let attr = this.graph.getNodeAttributes(node);
        attr.bbVx *= this.FRICCION;
        attr.bbVy *= this.FRICCION;
        // controlar el mínimo de desplazamiento
        if (Math.abs(attr.bbVx) < this.THRESHOLD) {
            attr.bbVx = 0;
        }
        if (Math.abs(attr.bbVy) < this.THRESHOLD) {
            attr.bbVy = 0;
        }

        const oldx = attr.x;
        const oldy = attr.y;

        attr.x += attr.bbVx * this.MAX_SPEED;
        attr.y += attr.bbVy * this.MAX_SPEED;

        // actualizar la matriz
        positionMatrix.moveValue(oldx, oldy, attr.x, attr.y, node);
    }

    condense(n: string, attr: any) {
        // verificar si ya fue condensado
        if (attr.CLUSTER) {
            this.log("soy cluster! No moverme.");
            this.matrix.setValue(attr.x, attr.y, n);
            
        } else if(!attr.CONDENSED) {
            // marcar el nodo
            // marcar el nodo como condensado
            this.graph.setNodeAttribute(n, "CONDENSED", this.CONDENSED);
            // registrar el nodo
            const currentDegree = this.graph.degree(n);

            this.log("condensando nodo: ", n, "degree: ", currentDegree);
            this.log("attr", attr);
            // recorrer los vecinos calculando el grado
            let maxDegree = -1;
            let maxNode: string = "";
            let maxNodeAttr: any;
            const self = this;
            // calcular el centroide de todos los Out a los que apunta el nodo
            let outCount = 0;
            let centroidX = 0;
            let centroidY = 0;
            this.graph.forEachOutNeighbor(n, function(nn, attrn) {
                outCount++;
                centroidX += attrn.x;
                centroidY += attrn.y;
                const nnd = self.graph.degree(nn);
                if (nnd > maxDegree) {
                    maxDegree = nnd;
                    maxNode = nn;
                    maxNodeAttr = attrn;
                }
            });
            // determinar la posición final del centroide
            if (outCount) {
                centroidX = centroidX / outCount;
                centroidY = centroidY / outCount;
            }
            
            this.log("maxNode: ", maxNode, " degree: ", maxDegree);
            if (maxDegree >= currentDegree) {
                if (!maxNodeAttr.CONDENSED) {
                    this.log("condensar el cluster primero");
                    // hay un nodo con mayor cardinalidad.
                    // Saltar al nodo para que se procese y luego continuar
                    this.condense(maxNode, maxNodeAttr);
                }
                this.log("Actualizar mi pos");

                // refrescar los datos del max y moverme a la minDistance
                const cnX = this.graph.getNodeAttribute(maxNode, "x");
                const cnY = this.graph.getNodeAttribute(maxNode, "y");
                
                let dx = cnX - attr.x;
                let dy = cnY - attr.y;
                // si el outCount > 1 moverme al centroide
                if (outCount > 1) {
                   dx = cnX - centroidX;
                   dy = cnY - centroidY; 
                }
                
                // normalizar el vector de salto
                const h = Math.sqrt(dx * dx + dy * dy);
                const dXn = dx / h;
                const dYn = dy / h;

                // calcular las nuevas coord
                const cX = cnX + dXn * this.MINDISTANCE;
                const cY = cnY + dYn * this.MINDISTANCE;
                // reubicar el nodo
                //this.graph.setNodeAttribute(n, "x", cX);
                //this.graph.setNodeAttribute(n, "y", cY);
                this.log("reubicar ", n, " en ", cX, cY);
                this.matrix.moveValue(attr.x, attr.y, cX, cY, n);
                attr.x = cX;
                attr.y = cY;
            } else {
                // el nodo no apunta a nadie y no es cluster 
                // En este punto debería tener un solo edge entrante. Moverse a las proximidades del 
                // nodo que lo apunta o el nodo está solo sin edges que lo apunte.
                if (this.graph.inNeighbors(n).length == 1) {
                    // saltar a la proximidad del nodo
                    const inN = this.graph.inNeighbors(n)[0];
                    const cnX = this.graph.getNodeAttribute(inN, "x");
                    const cnY = this.graph.getNodeAttribute(inN, "y");

                    let dx = cnX - attr.x;
                    let dy = cnY - attr.y;
                    
                    // normalizar el vector de salto
                    const h = Math.sqrt(dx * dx + dy * dy);
                    const dXn = dx / h;
                    const dYn = dy / h;

                    // calcular las nuevas coord
                    const cX = cnX + dXn * this.MINDISTANCE * 2;
                    const cY = cnY + dYn * this.MINDISTANCE * 2;
                    // reubicar el nodo
                    //this.graph.setNodeAttribute(n, "x", cX);
                    //this.graph.setNodeAttribute(n, "y", cY);
                    this.log("reubicar ", n, " en ", cX, cY);
                    this.matrix.moveValue(attr.x, attr.y, cX, cY, n);
                    attr.x = cX;
                    attr.y = cY;
                } else {
                    // hay mas de un nodo apuntando. No se debería entrar acá porque el nodo debería haber sido marcado
                    // como cluster.
                    let inCount = 0;
                    this.graph.forEachInNeighbor(n, function(nn, attrn) {
                        inCount++;
                        centroidX += attrn.x;
                        centroidY += attrn.y;
                    });
                    centroidX = centroidX / inCount;
                    centroidY = centroidY / inCount;
                    
                    attr.x = centroidX;
                    attr.y = centroidY;
                }
            }
            
        }
    }




    // Aplicar la fuerza de repulsión entre todos los nodos
    applyRepulsion(node: string, attr: any) {
        this.log("===============================================");
        this.log("analizar nodo", node, attr);
        const xInit = Math.floor(attr.x - this.MAXDISTANCEREPULSION);
        const xEnd = Math.floor(attr.x + this.MAXDISTANCEREPULSION);
        const yInit = Math.floor(attr.y - this.MAXDISTANCEREPULSION);
        const yEnd = Math.floor(attr.y + this.MAXDISTANCEREPULSION);
        this.log(">>> ", xInit, yInit, xEnd, yEnd);
        this.log("===============================================");
        for (let iY = yInit; iY < yEnd; iY++) {
            for (let iX = xInit; iX < xEnd; iX++) {
                // obtener los nodos que están en la posición
                const cumulo = this.matrix.getValue(iX, iY);

                this.log("repeler a: ", iX, iY, cumulo);
                // aplicar repulsión a cada nodo del cumulo
                for (const nodeToRepulse of cumulo) {
                    if (nodeToRepulse !== node) {
                        const cnX = this.graph.getNodeAttribute(nodeToRepulse, "x");
                        const cnY = this.graph.getNodeAttribute(nodeToRepulse, "y");
                        let cnVx = this.graph.getNodeAttribute(nodeToRepulse, "bbVx");
                        let cnVy = this.graph.getNodeAttribute(nodeToRepulse, "bbVy");

                        // Calcular la distancia
                        const dx = cnX - attr.x;
                        const dy = cnY - attr.y;
                        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                        if (distance < this.MAXDISTANCEREPULSION) {
                            // Aplicar fuerza de repulsión
                            const repulsionForce =
                                this.REPULSION_CONSTANT / (distance * distance);

                            const forceX = (dx / distance) * repulsionForce;
                            const forceY = (dy / distance) * repulsionForce;

                            // attr.bbVx -= forceX;
                            // attr.bbVy -= forceY;

                            cnVx += forceX;
                            cnVy += forceY;
                            // normalizar el vector de escape
                            const cnh = Math.sqrt(cnVx * cnVx + cnVy * cnVy);
                            cnVx /= cnh;
                            cnVy /= cnh;

                            // actualizar el nodo repelido
                            this.graph.setNodeAttribute(nodeToRepulse, "bbVx", cnVx);
                            this.graph.setNodeAttribute(nodeToRepulse, "bbVy", cnVy);
                            this.log(
                                "---R--->",
                                nodeToRepulse,
                                cnVx,
                                cnVy,
                                "distance: ",
                                distance
                            );
                        } else {
                            this.log("---R---||", nodeToRepulse, "distance: ", distance);
                        }
                    }
                }
            }
        }
        // normalizar el vector de escape
        // const h = Math.sqrt(attr.bbVx * attr.bbVx + attr.bbVy * attr.bbVy);
        // attr.bbVx = attr.bbVx / h;
        // attr.bbVy = attr.bbVy / h;
        this.log(attr);
    }

    repulsion() {
        this.log("***************** REPULSION *****************");
        this.log(this.matrix.getValue(1, 1));
        this.log(this.matrix);
        this.log(this.matrix.getValue(1, 1));

        for (let iter: number = 0; iter < this.MAX_ITERATIONS; iter++) {
            this.log("ITERACION ", iter);
            this.graph.forEachNode((n, attr) => {
                this.applyRepulsion(n, attr);
            });
            // const attr = this.graph.getNodeAttributes("0");
            // this.applyRepulsion("0", attr);
        }

        this.log("***************** FIN REPULSION *****************");
    }

    // Aplicar la fuerza de atracción entre nodos conectados
    applyAttraction(n, attr) {
        const currentDegree = this.graph.degree(n);

        this.log("atraer nodos: ", n, "degree: ", currentDegree);
        this.log("attr", attr);
        // recorrer los vecinos calculando el grado
        let maxDegree = -1;
        let maxNode: string = "";
        let maxNodeAttr: any;
        const self = this;
        this.graph.forEachNeighbor(n, function(nn, attrn) {
            const nnd = self.graph.degree(nn);
            if (nnd > maxDegree) {
                maxDegree = nnd;
                maxNode = nn;
                maxNodeAttr = attrn;
            }
        });
        this.log("maxNode: ", maxNode, " degree: ", maxDegree);
        if (maxDegree >= currentDegree) {
            // hay un nodo con mayor cardinalidad.
            // Saltar al nodo para que atraiga y luego continuar
            this.applyAttraction(maxNode, maxNodeAttr);

            this.log("Actualizar mi pos");

            // refrescar los datos del max y moverme a la minDistance
            const cnX = this.graph.getNodeAttribute(maxNode, "x");
            const cnY = this.graph.getNodeAttribute(maxNode, "y");
            let cnVx = this.graph.getNodeAttribute(maxNode, "bbVx");
            let cnVy = this.graph.getNodeAttribute(maxNode, "bbVy");

            // Calcular la distancia
            const dx = cnX - attr.x;
            const dy = cnY - attr.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;

            if (distance > this.MINDISTANCE) {
                // Aplicar fuerza de atrsacción
                const attractionForce =
                    this.ATTRACTION_CONSTANT / (distance * distance);

                const forceX = (dx / distance) * attractionForce;
                const forceY = (dy / distance) * attractionForce;

                // attr.bbVx -= forceX;
                // attr.bbVy -= forceY;

                attr.bbVx += forceX;
                attr.bbVy += forceY;
                // normalizar el vector de escape
                const bbh = Math.sqrt(attr.bbVx * attr.bbVx + attr.bbVy * attr.bbVy);
                attr.bbVx /= bbh;
                attr.bbVy /= bbh;

                // actualizar el nodo repelido
                this.log(
                    attr.bbVx,
                    attr.bbVy,
                    "--- atraído por -->",
                    maxNode,
                    cnX,
                    cnY
                );
            } else {
                this.log(" >>>>> MIN DISTANCE <<<< ", n, " --> ", maxNode);
            }
        } else {
            // el nodo es un cluster. Solo registarlo en la matriz
            this.log("soy cluster! No moverme.");
        }
    }

    attraction() {
        this.log("***************** ATTRACTION *****************");
        this.graph.forEachNode((n, attr) => {
            this.applyAttraction(n, attr);
        });
        this.log("***************** FIN ATTRACTION *****************");
    }

    updatePositions() {
        this.log("***************** Update Positions *****************");
        this.graph.forEachNode((n, attr) => {
            this.log(">>>", n, attr.x, attr.y, attr.bbVx, attr.bbVy);
            attr.bbVx *= this.FRICCION;
            attr.bbVy *= this.FRICCION;
            // controlar el mínimo de desplazamiento
            if (Math.abs(attr.bbVx) < this.THRESHOLD) {
                attr.bbVx = 0;
            }
            if (Math.abs(attr.bbVy) < this.THRESHOLD) {
                attr.bbVy = 0;
            }

            const oldx = attr.x;
            const oldy = attr.y;

            attr.x += attr.bbVx * this.MAX_SPEED;
            attr.y += attr.bbVy * this.MAX_SPEED;

            // actualizar la matriz
            this.matrix.moveValue(oldx, oldy, attr.x, attr.y, n);

            this.log("<<<<", n, this.graph.getNodeAttributes(n));
        });
        this.log("***************** FIN Update Positions *****************");
    }

    printMatrix() {
        console.log(this.matrix);
    }

    loop() {
        this.repulsion();
        this.attraction();
        this.updatePositions();
    }

    start() {
        this.graph.forEachNode((n, attr) => {
            // inicializar los atributos del vector de movimiento
            // en cada nodo creando los atributos  bbVx y bbVy.
            this.graph.setNodeAttribute(n, "bbVx", 0);
            this.graph.setNodeAttribute(n, "bbVy", 0);
        });

        this.detectClusters(true);
        
        this.clusterRepulsion();

        let progress = 0
        const totalNodes = this.graph.order;
        this.updateProgress(true, "condensando...", progress);
        this.graph.forEachNode((n, attr) => {
            
            this.updateProgress(false, "condensado...", progress/totalNodes);
            progress++;
            
            this.condense(n, attr);
        });
        
        this.updateProgress(true, "actualizando posiciones...");
        this.updatePositions();
        
        //    this.graph.forEachNode((n, attr) => {
        //      this.log(n, attr.x, attr.y);
        //    });
        //    this.log(this.matrix);
        // repetir un número de iteraciones
        //        for (let iter = 0; iter < this.MAX_ITERATIONS; iter++) {
        //            this.repulsion();
        //            this.attraction();
        //            this.updatePositions();
        //        }
        // this.repulsion();
        this.sendComplete("finalizado");
    }
    
    
    // Método para enviar mensajes de progreso
    private updateProgress(addLine: boolean, message: string, percentage?: number) {
        this.worker.postMessage({ type: 'progress', addLine: addLine, message: message, percentage: percentage });
    }

    // Método para enviar cuando el proceso termina
    private sendComplete(message: string) {
        const serializedGraph = this.graph.export();
        this.worker.postMessage({ type: 'complete', message, graph: serializedGraph });
    }
}

// ref https://docs.deno.com/examples/web-workers/
// Comunicación con el hilo principal
self.onmessage = (event) => {
    console.log("BigBangWorker", event);
    if (event.data.command === 'start') {
        console.log("start BB");
        const g = Graph.from(event.data.graph);
        const workerInstance = new BigBangWorker(g, self);
        workerInstance.start();
    }
};