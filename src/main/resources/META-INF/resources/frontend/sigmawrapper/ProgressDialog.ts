/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/TypeScriptDataObjectTemplate.ts to edit this template
 */

export class ProgressDialog {
    private progressDialog: HTMLElement | null = null;

    constructor() { }

    // Método para crear el diálogo flotante
    createProgressDialog() {
        this.progressDialog = document.createElement('div');
        this.progressDialog.id = 'progress-dialog';
        this.progressDialog.innerHTML = `
            <div class="dialog-content">
              <div id="logArea"></div>
              <div id="progress-bar-container">
                <div id="progress-bar"><span id="progress-percentage-text">%</span></div>
              </div>
            </div>
          `;

        // Añadir el diálogo al body del DOM
        document.body.appendChild(this.progressDialog);

        // Aplicar estilos CSS
        const style = document.createElement('style');
        style.textContent = `
          #progress-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 300px;
            padding: 20px;
            background-color: white;
            border: 2px solid #ccc;
            border-radius: 5px;
            box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
            z-index: 9999;
          }
          #logArea {
            height: 100px;
            overflow-y: auto;
            background-color: #f8f8f8;
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            font-size: 14px;
            white-space: pre-wrap; /* Permite múltiples líneas */
          }

          .dialog-content {
            text-align: left;
          }
          #progress-bar-container {
            width: 100%;
            background-color: #e0e0e0;
            height: 20px;
            border-radius: 5px;
            margin-top: 10px;
            overflow: hidden;
          }
          #progress-bar {
            width: 0%;
            height: 100%;
            text-align: center;
            line-height: 20px;
            background-color: #76c7c0;
            transition: width 0.3s;
          }
        `;
        document.head.appendChild(style);
    }

    // Método para actualizar el progreso
    updateProgress(message: string, percentage?: number) {
        const progressBar = document.getElementById('progress-bar') as HTMLElement;
        const logArea = document.getElementById('logArea') as HTMLElement;
        const percentageText = document.getElementById('progress-percentage-text') as HTMLElement;

        if (progressBar && percentage) {
            progressBar.style.width = percentage + '%';
            percentageText.textContent = "" + percentage.toFixed(2) + "%";
        }
        if (logArea) {
            this.updateLogLastLine(message);
        }
    }

    updateProgressBar(percentage: number) {
        const progressBar = document.getElementById('progress-bar') as HTMLElement;
        const percentageText = document.getElementById('progress-percentage-text') as HTMLElement;

        if (progressBar && percentage) {
            progressBar.style.width = percentage + '%';
            percentageText.textContent = "" + percentage + "%";
        }
    }
    
    updateLogLastLine(message) {
        const logArea = document.getElementById('logArea');

        // Dividir el texto por líneas, reemplazar la última línea y volver a unirlo
        const lines = logArea.innerText.split('\n');
        if (lines.length == 0) {
            logArea.innerText = message;
        } else {
            lines[lines.length - 1] = message; // Penúltimo índice es la última línea no vacía
            logArea.innerText = lines.join('\n');
        }
        // Desplazar el área de log a la última línea
        logArea.scrollTop = logArea.scrollHeight;
    }
    
    addLogLine(message: string) {
        const logArea = document.getElementById('logArea');
        logArea.innerText += '\n'+message;
        logArea.scrollTop = logArea.scrollHeight;
    }
    
    // Método para iniciar el proceso largo
    start() {
        this.createProgressDialog();  // Mostrar el diálogo
        let progress = 0;
    }
    
    // Método para finalizar el proceso y remover el diálogo
    end() {
        if (this.progressDialog) {
            this.progressDialog.remove();
            this.progressDialog = null;
        }
    }
}