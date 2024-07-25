class Grid {
    constructor(canvasId, cellWidth, cellHeight) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1;
        this.cellData = {};
        this.selectedCellsX = new Set()
        this.selectedCellsY = new Set()
        this.ismousedown = false;
        this.ismouseup = false;
        this.ismousemove = false;


    }


    drawGrid() {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw vertical lines and column headers
        for (let x = this.cellWidth; x <= this.canvas.width; x += this.cellWidth) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();

            // Draw column headers (A, B, C, ...)
            if (x > 0) {
                const columnHeader = String.fromCharCode(64 + x / this.cellWidth);
                this.ctx.fillStyle = "black";
                this.ctx.font = "15px Arial";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText(columnHeader, x - this.cellWidth / 2 + this.cellWidth, this.cellHeight / 2);
            }

        }

        // Draw horizontal lines and row headers
        for (let y = this.cellHeight; y <= this.canvas.height; y += this.cellHeight) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();


            if (y > 0) {
                const rowHeader = y / this.cellHeight;
                this.ctx.fillStyle = "black";
                this.ctx.font = "15px Arial";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText(rowHeader, this.cellWidth / 2, y - this.cellHeight / 2 + this.cellHeight);
            }
        }

        // Draw cell content
        for (let key in this.cellData) {
            const [cellX, cellY] = key.split(',').map(Number);
            this.ctx.fillStyle = "black";
            this.ctx.font = "15px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            const textX = cellX + this.cellWidth / 2;
            const textY = cellY + this.cellHeight / 2;
            this.ctx.fillText(this.cellData[key], textX, textY);
        }

    }

    highlightCell(x, y) {
        const cellX = Math.floor(x / this.cellWidth) * this.cellWidth;
        const cellY = Math.floor(y / this.cellHeight) * this.cellHeight;


        // Draw the grid
        this.drawGrid();

        // Highlight the cell
        this.ctx.fillStyle = "rgba(255, 255, 255, 0)";
        this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);

        // Draw border around the cell
        this.ctx.strokeStyle = "rgba(63, 80, 235)";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(cellX, cellY, this.cellWidth, this.cellHeight);

        // Reset styles
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1;
    }


    highlightmiltiple(x, y) {
        const cellX = Math.floor(x / this.cellWidth) * this.cellWidth;
        const cellY = Math.floor(y / this.cellHeight) * this.cellHeight;
        if (this.ismouseup == false) {
            
            if (this.ismousedown) {
                // this.selectedCellsX.add(cellX)
                // this.selectedCellsY.add(cellY)
                // console.warn(cellX, cellY);

                console.log("fnal", x, y)
            }
        }



    }

    editCell(x, y) {
        const cellX = Math.floor(x / this.cellWidth) * this.cellWidth;
        const cellY = Math.floor(y / this.cellHeight) * this.cellHeight;
        if (cellX == 0 || cellY == 0) { return }
        const input = document.createElement('input');
        input.type = 'text';
        input.style.position = 'absolute';
        input.style.left = `${cellX + this.canvas.offsetLeft + 1}px`;
        input.style.top = `${cellY + this.canvas.offsetTop + 1}px`;
        input.style.width = `${this.cellWidth - 6}px`;
        input.style.height = `${this.cellHeight - 5}px`;
        input.style.outline = 'none'
        input.style.border = "0px"
        input.value = this.cellData[`${cellX},${cellY}`] || '';

        document.body.appendChild(input);
        input.focus();

        const saveInput = () => {
            this.cellData[`${cellX},${cellY}`] = input.value;
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
