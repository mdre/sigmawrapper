/*
Permite crear una matriz rala infinita basada en números flotantes. 
En cada celda discreta se pueden alojar varios valores únicos flotantes.
De esta forma un valor con coordenandas 1.5, 1.5 y valor "V" será alojado 
en la celda 1,1 y un valor con cordenadas 1.6, 1.6 también será alojado en la 
misma celda. 
*/

export class SparseMatrix {
    private matrix: Map<string, any[]>;
    private maxY: number;
    private maxX: number;
    private minY: number;
    private minX: number;
    private elementCount: number = 0;
    constructor() {
        this.matrix = new Map();
    }

    // Función para generar una clave única basada en las coordenadas
    private getKey(x: number, y: number): string {
        return `${Math.floor(x)},${Math.floor(y)}`;
    }

    // funciones para controlar los límites
    private updateStats(x: number, y: number): void {
        if (typeof this.minY === "undefined") {
            this.minY = y;
            this.maxY = y;
            this.minX = x;
            this.maxX = x;
        } else {
            this.minX = Math.min(this.minX, Math.floor(x));
            this.minY = Math.min(this.minY, Math.floor(y));
            this.maxX = Math.max(this.maxX, Math.floor(x));
            this.maxY = Math.max(this.maxY, Math.floor(y));
        }
    }
    // Establecer un valor en una posición
    setValue(x: number, y: number, value: any) {
        const key = this.getKey(x, y);
        let cumulo = this.matrix.get(key);

        // si no estaba en el cúmulo, agregar el valor
        if (cumulo === undefined) {
            cumulo = [value];
            this.matrix.set(key, cumulo);
            this.elementCount++;
        } else if (!cumulo?.includes(value)) {
            cumulo.push(value);
            this.matrix.set(key, cumulo);
            this.elementCount++
        }
        this.updateStats(x, y);
    }

    // Obtener el valor en una posición
    getValue(x: number, y: number): any[] {
        const key = this.getKey(x, y);
        return this.matrix.get(key) || []; // Si no existe, retorna []
    }

    // Eliminar una posición
    removeValue(x: number, y: number, value: string): boolean {
        let ret = false;
        const key = this.getKey(x, y);
        let cumulo = this.matrix.get(key);
        if (cumulo) {
            let i = cumulo.indexOf(value);
            if (i !== -1) {
                cumulo.splice(i, 1);
                this.matrix.set(key, cumulo);
                ret = true;
                this.elementCount--;
            }
        }
        return ret;
    }

    getElementCount(): number {
        return this.elementCount;
    }
    // Obtener el número total de elementos no cero
    getTotalNonZeroElements(): number {
        return this.matrix.size;
    }

    getMinY(): number {
        return this.minY;
    }

    getMinX(): number {
        return this.minX;
    }

    getMaxY(): number {
        return this.maxY;
    }

    getMaxX(): number {
        return this.maxX;
    }

    moveValue(
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        value: any
    ): void {
        const fx = Math.floor(fromX);
        const fy = Math.floor(fromY);
        const tx = Math.floor(toX);
        const ty = Math.floor(toY);

        if (fx !== tx || fy !== ty) {
            this.removeValue(fx, fy, value);
            this.setValue(tx, ty, value);
        }
    }

    size(): number {
        return this.matrix.size;
    }

    getMatrix(): Map<string, any[]> {
        return this.matrix;
    }
}
