class Grid {
    constructor(canvasId, cellWidth, cellHeight) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 0.5;
        this.cellData = {};
        this.initialcell = [];
        this.finallcell = [];
        this.selectedCells = [];
        this.ismousedown = false;
        this.ismouseup = false;
        this.ismousemove = false;
        this.setupFileInput();
    }
   
   
    setupFileInput() {
        this.drawGrid()
        const fileInput = document.getElementById('jsonUpload');
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const jsonData = JSON.parse(e.target.result);
                    this.loadJsonData(jsonData);
                };
                reader.readAsText(file);
            }
        });
    }

    loadJsonData(jsonData) {
        this.cellData = jsonData;
        this.drawGrid();
    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw vertical lines and column headers
        for (let x = this.cellWidth; x <= this.canvas.width; x += this.cellWidth) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();

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
            if (cellX > 0 && cellY > 0) { // Skip headers
                this.ctx.fillStyle = "black";
                this.ctx.font = "15px Arial";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                const textX = cellX * this.cellWidth + this.cellWidth / 2;
                const textY = cellY * this.cellHeight + this.cellHeight / 2;
                this.ctx.fillText(this.cellData[key], textX, textY);
            }
        }
    }
    clearCanavsClick()
    {
        console.log('clicked');
        this.cellData = {}
        this.drawGrid()

    }
    highlightCell(x, y) {
        const cellX = Math.floor(x / this.cellWidth) * this.cellWidth;
        const cellY = Math.floor(y / this.cellHeight) * this.cellHeight;

        this.drawGrid();

        this.ctx.fillStyle = "rgba(255, 255, 255, 0)";
        this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);

        this.ctx.strokeStyle = "rgba(63, 80, 235)";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(cellX, cellY, this.cellWidth, this.cellHeight);

        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 0.5;
    }

    drawcell(x, y) {
        const cellX = Math.floor(x / this.cellWidth) * this.cellWidth;
        const cellY = Math.floor(y / this.cellHeight) * this.cellHeight;
        this.ctx.fillStyle = "rgba(2, 25, 255, 0)";
        this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);

        this.ctx.strokeStyle = "rgba(63, 80, 235)";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(cellX, cellY, this.cellWidth, this.cellHeight);

        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 0.5;
    }

    highlightmiltiple(initial, final) {
        this.drawGrid();
        const x1 = Math.min(initial[0], final[0]);
        const y1 = Math.min(initial[1], final[1]);
        const x2 = Math.max(initial[0], final[0]);
        const y2 = Math.max(initial[1], final[1]);
            console.log(x1,y1,x2,y2);
        for (let i = x1; i <= x2; i++) {
            for (let j = y1; j <= y2; j++) {
                this.drawcell(i, j);
            }
        }
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
