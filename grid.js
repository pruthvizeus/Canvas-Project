class Grid {
    constructor(canvasId, cellWidth, cellHeight) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 0.2;
        this.cellData = {};
        this.verticalLines = [];
        this.horizontalLines = [];
        this.initialcell = [];
        this.finallcell = [];
        this.selectedCells = [];
        this.ismousedown = false;
        this.ismouseup = false;
        this.ismousemove = false;
        this.initLines();
    }

    initLines() {
        // Initialize vertical lines
        for (let x = this.cellWidth; x <= this.canvas.width; x += this.cellWidth) {
            this.verticalLines.push(x);
        }

        // Initialize horizontal lines
        for (let y = this.cellHeight; y <= this.canvas.height; y += this.cellHeight) {
            this.horizontalLines.push(y);
        }
    }
    copyCellData() {
        if (this.highlightedCell) {
            const { cellX, cellY } = this.highlightedCell;
            const key = `${cellX / this.cellWidth},${cellY / this.cellHeight}`;
            const cellData = this.cellData[key] || '';
            
            // Highlight cell with a border
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(cellX + 1, cellY + 1, this.cellWidth - 2, this.cellHeight - 2);

            navigator.clipboard.writeText(cellData).then(() => {
                console.log('Copied to clipboard:', cellData);
            }).catch(err => {
                console.error('Failed to copy text:', err);
            });
        }
    }

    loadJsonData(jsonData) {
        this.cellData = {};
        const headers = Object.keys(jsonData[0]).filter(header => header !== "id");
        headers.forEach((header, colIndex) => {
            this.cellData[`${colIndex + 1},1`] = header;
        });
        jsonData.forEach((row, rowIndex) => {
            headers.forEach((header, colIndex) => {
                this.cellData[`${colIndex + 1},${rowIndex + 2}`] = row[header];
            });
        });
        this.drawGrid();
    }
    
    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        // Draw vertical lines and column headers
        for (let i = 0; i < this.verticalLines.length; i++) {
            const x = this.verticalLines[i];
            this.ctx.beginPath();
            this.ctx.moveTo(x + 0.5, 0);
            this.ctx.lineTo(x + 0.5, this.canvas.height);
            this.ctx.stroke();
    
            if (x > 0 && i > 0) {
                const columnHeader = String.fromCharCode(64 + i);
                this.ctx.fillStyle = "black";
                this.ctx.font = "15px Arial";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                const columnCenterX = (this.verticalLines[i - 1] + x) / 2;
                this.ctx.fillText(columnHeader, columnCenterX, this.cellHeight / 2);
            }
        }
    
        // Draw horizontal lines and row headers
        for (let i = 0; i < this.horizontalLines.length; i++) {
            const y = this.horizontalLines[i];
            this.ctx.beginPath();
            this.ctx.moveTo(0, y + 0.5);
            this.ctx.lineTo(this.canvas.width, y + 0.5);
            this.ctx.stroke();
    
            if (y > 0 && i > 0) {
                const rowHeader = i;
                this.ctx.fillStyle = "black";
                this.ctx.font = "15px Arial";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                const rowCenterY = (this.horizontalLines[i - 1] + y) / 2;
                this.ctx.fillText(rowHeader, this.cellWidth / 2, rowCenterY);
            }
        }
    
        // Draw cell content
        for (let key in this.cellData) {
            const [cellX, cellY] = key.split(',').map(Number);
            if (cellX > 0 && cellY > 0) { // Skip headers
                const textX = (this.verticalLines[cellX - 1] + this.verticalLines[cellX]) / 2;
                const textY = (this.horizontalLines[cellY - 1] + this.horizontalLines[cellY]) / 2;
                this.ctx.fillStyle = "black";
                this.ctx.font = "15px Arial";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText(this.cellData[key], textX, textY);
            }
        }
    }
    
    
    resizeLine(lineIndex, direction, offset) {
        if (direction === 'vertical') {
            this.verticalLines[lineIndex] += offset;
        } else if (direction === 'horizontal') {
            this.horizontalLines[lineIndex] += offset;
        }
        this.drawGrid();
    }


    clearCanavsClick() {
        this.cellData = {}
        this.drawGrid()

    }
    highlighthorizontal(x, y) {
        this.drawGrid();
    
        let startX = 0;
        let targetColumn = 0;
        let accumulatedWidth = 0;
    
        // Determine which column the x coordinate belongs to
        for (let i = 0; i < this.columnWidths.length; i++) {
            accumulatedWidth += this.columnWidths[i];
            if (x < accumulatedWidth) {
                targetColumn = i;
                break;
            }
            startX = accumulatedWidth;
        }
    
        const columnWidth = this.columnWidths[targetColumn];
    
        // Highlight the appropriate column
        this.ctx.fillStyle = "rgba(52,152,235,0.3)";
        this.ctx.fillRect(startX, 0, columnWidth, this.canvas.height);
    }
    
    highlightvertical(x, y) {
        this.drawGrid()
        this.ctx.fillStyle = "rgba(52,152,235,0.3)"

        this.ctx.fillRect(0, y, this.canvas.width, this.cellHeight);
    }
    highlightCell(x, y) {

        const cellX = Math.floor(x / this.cellWidth) * this.cellWidth;
        const cellY = Math.floor(y / this.cellHeight) * this.cellHeight;
        // console.log(cellX,cellY);
        if (cellY == 0 || cellX==0) {
            return
        }
        this.drawGrid();

        this.ctx.fillStyle = "rgba(255, 255, 255, 0)";
        this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);

        this.ctx.strokeStyle = "rgba(44, 116, 232)";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(cellX, cellY, this.cellWidth, this.cellHeight);

        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 0.2;
    }

   

    highlightmiltiple(initial, final) {
        this.drawGrid();

        const x1 = Math.min(initial[0], final[0]);
        const y1 = Math.min(initial[1], final[1]);
        const x2 = Math.max(initial[0], final[0]);
        const y2 = Math.max(initial[1], final[1]);
        this.ctx.fillStyle = "rgba(52,152,235,0.3)"

        this.ctx.fillRect(x1, y1, x2-x1+this.cellWidth, y2-y1+this.cellHeight);
   
    }

    editCell(x, y) {
       
        const cellX = Math.floor(x / this.cellWidth) * this.cellWidth;
        const cellY = Math.floor(y / this.cellHeight) * this.cellHeight;
        if (cellX == 0 || cellY == 0) { return; }
        const input = document.createElement('input');
        input.type = 'text';
        input.style.position = 'absolute';
        input.style.left = `${cellX + this.canvas.offsetLeft + 1}px`;
        input.style.top = `${cellY + this.canvas.offsetTop + 1}px`;
        input.style.width = `${this.cellWidth - 6}px`;
        input.style.height = `${this.cellHeight - 5}px`;
        input.style.outline = 'none';
        input.style.border = "0px";
        input.value = this.cellData[`${cellX / this.cellWidth},${cellY / this.cellHeight}`] || '';

        document.body.appendChild(input);
        input.focus();

        const saveInput = () => {
            this.cellData[`${cellX / this.cellWidth},${cellY / this.cellHeight}`] = input.value;
            document.body.removeChild(input);
            this.drawGrid();
        };

        input.addEventListener('blur', saveInput);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveInput();
            }
        });
    }
}

export default Grid;
