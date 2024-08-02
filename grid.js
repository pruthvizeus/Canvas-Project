class Grid {
    constructor(canvasId, cellWidth, cellHeight) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 0.2;
        this.cellData = {
        };
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
                this.ctx.font = "12px Arial";
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
    highlightvertical(x, y) {
        if (!this.horizontalLines || this.horizontalLines.length === 0) {
            console.error("horizontalLines is not initialized or empty.");
            return;
        }

        this.drawGrid();

        let startY = 0;
        let targetRow = 0;
        let accumulatedHeight = 0;

        for (let i = 0; i < this.horizontalLines.length; i++) {
            accumulatedHeight += (i === 0 ? this.horizontalLines[i] : this.horizontalLines[i] - this.horizontalLines[i - 1]);
            if (y < accumulatedHeight) {
                targetRow = i;
                break;
            }
            startY = accumulatedHeight;
        }

        const rowHeight = this.horizontalLines[targetRow] - startY;

        this.ctx.fillStyle = "rgba(19, 126, 67,0.3)";
        this.ctx.fillRect(0, startY, this.canvas.width, rowHeight);
    }

    highlighthorizontal(x, y) {
        if (!this.verticalLines || this.verticalLines.length === 0) {
            console.error("verticalLines is not initialized or empty.");
            return;
        }

        this.drawGrid();

        let startX = 0;
        let targetColumn = 0;
        let accumulatedWidth = 0;

        for (let i = 0; i < this.verticalLines.length; i++) {
            accumulatedWidth += (i === 0 ? this.verticalLines[i] : this.verticalLines[i] - this.verticalLines[i - 1]);
            if (x < accumulatedWidth) {
                targetColumn = i;
                break;
            }
            startX = accumulatedWidth;
        }

        const columnWidth = this.verticalLines[targetColumn] - startX;

        this.ctx.fillStyle = "rgba(19, 126, 67,0.3)";
        this.ctx.fillRect(startX, 0, columnWidth, this.canvas.height);
    }

    highlightCell(x, y) {
        let cellX = 0;
        let cellY = 0;
        let cellWidth = 0;
        let cellHeight = 0;

        // Find the corresponding column
        for (let i = 0; i < this.verticalLines.length; i++) {
            if (x < this.verticalLines[i]) {
                cellX = i === 0 ? 0 : this.verticalLines[i - 1];
                cellWidth = this.verticalLines[i] - cellX;
                break;
            }
        }

        // Find the corresponding row
        for (let j = 0; j < this.horizontalLines.length; j++) {
            if (y < this.horizontalLines[j]) {
                cellY = j === 0 ? 0 : this.horizontalLines[j - 1];
                cellHeight = this.horizontalLines[j] - cellY;
                break;
            }
        }

        // If the click is on the headers (row 0 or column 0), do not highlight
        if (cellY === 0 || cellX === 0) {
            return;
        }

        this.drawGrid();

        // Highlight the identified cell
        this.ctx.fillStyle = "rgba(255, 255, 255, 0)";
        this.ctx.fillRect(cellX, cellY, cellWidth, cellHeight);

        this.ctx.strokeStyle = "rgba(19, 126, 67)";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(cellX, cellY, cellWidth, cellHeight);

        // Reset drawing styles
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
    
        // Find the left and right boundaries
        const leftBoundaryIndex = this.verticalLines.findIndex(line => line > x1);
        const rightBoundaryIndex = this.verticalLines.findIndex(line => line >= x2);
        const xStart = leftBoundaryIndex > 0 ? this.verticalLines[leftBoundaryIndex - 1] : 0;
        const xEnd = this.verticalLines[rightBoundaryIndex] || this.canvas.width;
    
        // Find the top and bottom boundaries
        const topBoundaryIndex = this.horizontalLines.findIndex(line => line > y1);
        const bottomBoundaryIndex = this.horizontalLines.findIndex(line => line >= y2);
        const yStart = topBoundaryIndex > 0 ? this.horizontalLines[topBoundaryIndex - 1] : 0;
        const yEnd = this.horizontalLines[bottomBoundaryIndex] || this.canvas.height;
    
        this.ctx.fillStyle = "rgba(19, 126, 67, 0.3)"; // green color rgb
    
        // Fill the top header highlight
        this.ctx.fillRect(xStart, 0, xEnd - xStart, this.horizontalLines[0]);
    
        // Fill the left header highlight
        this.ctx.fillRect(0, yStart, this.verticalLines[0], yEnd - yStart);
    
        this.ctx.save();
    
        // Fill the main highlight area
        this.ctx.fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
    
        // Set stroke style for the border
        this.ctx.strokeStyle = "rgba(19, 126, 67, 1)";
        this.ctx.lineWidth = 2; // Adjust for desired thickness
    
        // Draw bottom border for the top header highlight
        this.ctx.beginPath();
        this.ctx.moveTo(xStart, this.horizontalLines[0]);
        this.ctx.lineTo(xEnd, this.horizontalLines[0]);
        this.ctx.stroke();
    
        // Draw right border for the left header highlight
        this.ctx.beginPath();
        this.ctx.moveTo(this.verticalLines[0], yStart);
        this.ctx.lineTo(this.verticalLines[0], yEnd);
        this.ctx.stroke();
    
        // Draw the border around the main highlighted area
        this.ctx.strokeRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
    
        this.ctx.restore();
    }
    


    editCell(x, y) {
        // Determine the column and row based on the mouse coordinates
        let cellX = 0;
        let cellY = 0;
        let accumulatedWidth = 0;
        let accumulatedHeight = 0;
        let columnIndex = 0;
        let rowIndex = 0;
    
        // Find the correct column index
        for (let i = 0; i < this.verticalLines.length; i++) {
            if (x < this.verticalLines[i]) {
                cellX = i === 0 ? 0 : this.verticalLines[i - 1];
                columnIndex = i;
                break;
            }
        }
    
        // Find the correct row index
        for (let j = 0; j < this.horizontalLines.length; j++) {
            if (y < this.horizontalLines[j]) {
                cellY = j === 0 ? 0 : this.horizontalLines[j - 1];
                rowIndex = j;
                break;
            }
        }
    
        // If the click is on the headers (row 0 or column 0), do not edit
        if (rowIndex === 0 || columnIndex === 0) {
            return;
        }
    
        // Create input element for editing
        const input = document.createElement('input');
        input.type = 'text';
        input.style.position = 'absolute';
        input.style.left = `${cellX + this.canvas.offsetLeft + 1}px`;
        input.style.top = `${cellY + this.canvas.offsetTop + 1}px`;
        input.style.width = `${(this.verticalLines[columnIndex] - cellX) - 6}px`;
        input.style.height = `${(this.horizontalLines[rowIndex] - cellY) - 5}px`;
        input.style.outline = 'none';
        input.style.border = "0px";
        input.value = this.cellData[`${columnIndex},${rowIndex}`] || '';
    
        document.body.appendChild(input);
        input.focus();
    
        // Save the input data and remove the input element
        const saveInput = () => {
            this.cellData[`${columnIndex},${rowIndex}`] = input.value;
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
