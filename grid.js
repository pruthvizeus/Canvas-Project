window.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'gridCanvas';
    document.body.appendChild(canvas);
    const cellWidth = 140;
    const cellHeight = 18;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const grid = new Grid('gridCanvas', cellWidth, cellHeight);
    grid.drawGrid();
    document.getElementById('jsonUpload').addEventListener('change', async function () {
        const file = this.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const uploadResponse = await fetch('http://localhost:5208/upload', {
                    method: 'POST',
                    body: formData
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    console.log('File uploaded successfully:', uploadResult);

                    const dataResponse = await fetch('http://localhost:5208/upload/');
                    if (dataResponse.ok) {
                        const jsonData = await dataResponse.json();
                        grid.loadJsonData(jsonData);
                        console.log('Data fetched successfully:');
                    } else {
                        console.error('Failed to fetch data:', dataResponse.statusText);
                    }
                } else {
                    console.error('File upload failed:', uploadResponse.statusText);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    });

    document.getElementById('mylink').onclick = function () {
        grid.clearCanavsClick()
    }
    canvas.addEventListener('mousedown', function (event) {
        grid.drawGrid();
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        let isResizing = false;
        // Check if near a vertical line and within the header (row 0) for resizing columns
        if (y < grid.cellHeight) {
            for (let i = 0; i < grid.verticalLines.length; i++) {
                if (Math.abs(x - grid.verticalLines[i]) < 5) {
                    grid.isResizingColumn = true;
                    grid.resizeStartX = x;
                    grid.resizingColumnIndex = i;
                    isResizing = true;
                    return; // Prioritize resizing
                }
            }
        }

        // Check if near a horizontal line and within the index column (column 0) for resizing rows
        if (x < grid.cellWidth) {
            for (let i = 0; i < grid.horizontalLines.length; i++) {
                if (Math.abs(y - grid.horizontalLines[i]) < 5) {
                    grid.isResizingRow = true;
                    grid.resizeStartY = y;
                    grid.resizingRowIndex = i;
                    isResizing = true;
                    return; // Prioritize resizing
                }
            }
        }

        if (!isResizing) {
            // If not resizing, proceed with highlighting cells
            const cellX = Math.floor(x / grid.cellWidth) * grid.cellWidth;
            const cellY = Math.floor(y / grid.cellHeight) * grid.cellHeight;
            const arr = []
            arr.push(cellX, cellY)
            grid.ismousedown = true;

            if (cellX == 0) {
                grid.highlightvertical(cellX, cellY);
            } else if (cellY == 0) {
                grid.highlighthorizontal(cellX, cellY);
            } else {
                grid.highlightCell(x, y);
                grid.initialcell = arr;
            }
        }
    });


    canvas.addEventListener('mousemove', function (event) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        grid.ismousemove = true;

        let isNearVerticalLine = false;
        let isNearHorizontalLine = false;

        // Check if near a vertical line and within the header (row 0)
        if (y < grid.cellHeight) {
            for (let i = 0; i < grid.verticalLines.length; i++) {
                if (Math.abs(x - grid.verticalLines[i]) < 5) {
                    isNearVerticalLine = true;
                    canvas.style.cursor = 'col-resize';
                    break;
                }
            }
        }

        // Check if near a horizontal line and within the index column (column 0)
        if (x < grid.cellWidth) {
            for (let i = 0; i < grid.horizontalLines.length; i++) {
                if (Math.abs(y - grid.horizontalLines[i]) < 5) {
                    isNearHorizontalLine = true;
                    canvas.style.cursor = 'row-resize';
                    break;
                }
            }
        }

        // Reset cursor if not near any line
        if (!isNearVerticalLine && !isNearHorizontalLine) {

            canvas.style.cursor = 'cell';

        }

        // Resize logic
        if (grid.isResizingColumn) {
            const deltaX = x - grid.resizeStartX;
            const currentIndex = grid.resizingColumnIndex;

            const newLinePos = grid.verticalLines[currentIndex] + deltaX;

            if (newLinePos > grid.verticalLines[currentIndex - 1] + 20) {
                // Update current line position
                grid.verticalLines[currentIndex] = newLinePos;

                // Adjust subsequent lines
                for (let i = currentIndex + 1; i < grid.verticalLines.length; i++) {
                    grid.verticalLines[i] += deltaX;
                }

                grid.resizeStartX = x;
                grid.drawGrid();
            }
        } else if (grid.isResizingRow) {
            const deltaY = y - grid.resizeStartY;
            const currentIndex = grid.resizingRowIndex;

            const newLinePos = grid.horizontalLines[currentIndex] + deltaY;

            if (newLinePos > grid.horizontalLines[currentIndex - 1] + 20) {
                // Update current line position
                grid.horizontalLines[currentIndex] = newLinePos;

                // Adjust subsequent lines
                for (let i = currentIndex + 1; i < grid.horizontalLines.length; i++) {
                    grid.horizontalLines[i] += deltaY;
                }

                grid.resizeStartY = y;
                grid.drawGrid();
            }
        } else if (grid.ismousedown) {
            const cellX = Math.floor(x / grid.cellWidth) * grid.cellWidth;
            const cellY = Math.floor(y / grid.cellHeight) * grid.cellHeight;

            if (cellX != 0 && cellY != 0) {
                const arr = [];
                arr.push(cellX, cellY);
                grid.finallcell = arr;
                grid.highlightmiltiple(grid.initialcell, grid.finallcell);
            }
        }
    });


    canvas.addEventListener('mouseup', function (event) {
        grid.calculateSum(grid.initialcell, grid.finallcell)
       if(grid.finallcell.length)
       {
        grid.copyinitialcell = grid.initialcell
        grid.copyfinalcell = grid.finallcell
       }
        console.warn(grid.copyinitialcell,grid.copyfinalcell);
        
        grid.initialcell = [];
        grid.finallcell = [];
        grid.ismousedown = false;
        grid.isResizingColumn = false;
        grid.isResizingRow = false;
    });

    canvas.addEventListener('dblclick', function (event) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        grid.editCell(x, y);
    });

    canvas.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        const contextMenu = document.getElementById('contextMenu');
        const rect = canvas.getBoundingClientRect();
        contextMenu.style.top = `${event.clientY - rect.top}px`;
        contextMenu.style.left = `${event.clientX - rect.left}px`;
        contextMenu.style.display = 'block';

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        grid.contextMenuX = x;
        grid.contextMenuY = y;
        grid.highlightCell(x, y);
    });

    document.addEventListener('click', function (event) {
  
       
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'none';
       
    });

    document.getElementById('editOption').addEventListener('click', function () {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'none';
        grid.editCell(grid.contextMenuX, grid.contextMenuY);
    });
    document.addEventListener('keydown', function (event) {
    
        
        if (event.ctrlKey && event.key === 'c') {
            event.preventDefault()
            grid.isCopying = true;
            grid.drawSelectionRectangle(); // Draw with dashed line
            grid.pasting=true

        }
        if (event.ctrlKey && event.key === 'v') {
          
                 if(grid.pasting)
                 {
                    grid.drawCopiedRectangle(grid.copyinitialcell, grid.copyfinalcell, grid.recentX, grid.recentY); // Draw with dashed line
                 }
                    
               
          

        }
    });


}
export class Grid {
    constructor(canvasId, cellWidth, cellHeight) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 0.2;
        this.pasting=false
        this.cellData = {};
        this.verticalLines = [];
        this.horizontalLines = [];
        this.initialcell = [];
        this.finallcell = [];
        this.copyinitialcell = []
        this.copyfinalcell = []
        this.copiedCells = []
        this.selectedCells = [];
        this.ismousedown = false;
        this.ismouseup = false;
        this.ismousemove = false;
        this.recentX=0
        this.recentY=0
        this.initLines();
    }
    addRows(count) {
        const lastRowIndex = this.horizontalLines.length - 1;
        for (let i = 0; i < count; i++) {
            const newY = this.horizontalLines[lastRowIndex] + this.cellHeight;
            this.horizontalLines.push(newY);
        }
        this.drawGrid();
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

    drawSelectionRectangle() {
        const initial = this.copyinitialcell;
        const final = this.copyfinalcell;

        if (!initial.length || !final.length) {
            return;
        }

        const x1 = Math.min(initial[0], final[0]);
        const y1 = Math.min(initial[1], final[1]);
        const x2 = Math.max(initial[0], final[0]);
        const y2 = Math.max(initial[1], final[1]);
        const leftBoundaryIndex = this.verticalLines.findIndex(line => line > x1);
        const rightBoundaryIndex = this.verticalLines.findIndex(line => line > x2);
        const xStart = leftBoundaryIndex > 0 ? this.verticalLines[leftBoundaryIndex - 1] : 0;
        const xEnd = this.verticalLines[rightBoundaryIndex] || this.canvas.width;

        // Find the top and bottom boundaries
        const topBoundaryIndex = this.horizontalLines.findIndex(line => line > y1);
        const bottomBoundaryIndex = this.horizontalLines.findIndex(line => line > y2);
        const yStart = topBoundaryIndex > 0 ? this.horizontalLines[topBoundaryIndex - 1] : 0;
        const yEnd = this.horizontalLines[bottomBoundaryIndex] || this.canvas.height;
        this.ctx.strokeStyle = 'green';
        this.ctx.lineWidth = 3;

        // Set dashed line style if copying
        if (this.isCopying) {
            this.ctx.setLineDash([8, 5]); // Increased Dash pattern: 8px dash, 5px gap
        } else {
            ctx.setLineDash([]); // No dash, solid line
        }

        // Draw the rectangle
        this.ctx.strokeRect(xStart, yStart, xEnd - xStart, yEnd - yStart);

        // Reset the line dash to avoid affecting other drawings
        this.ctx.setLineDash([]);

    }

    drawGrid() {
        this.ctx.lineWidth = 0.2
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
                this.ctx.fillText(this.cellData[key], textX, textY, 140);
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
        this.recentX=x
        this.recentY=y
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
    drawCopiedRectangle(initial, final, x, y) {
       
        // this.drawGrid()
        const cellX = Math.floor(x / this.cellWidth) * this.cellWidth;
        const cellY = Math.floor(y / this.cellHeight) * this.cellHeight;
       

            const x1 = Math.min(initial[0], final[0]);
            const y1 = Math.min(initial[1], final[1]);
            const x2 = Math.max(initial[0], final[0]);
            const y2 = Math.max(initial[1], final[1]);

            console.warn(cellX,cellY);
            this.copiedCells = []
            // Find the left and right boundaries
            const leftBoundaryIndex = this.verticalLines.findIndex(line => line > x1);
            const rightBoundaryIndex = this.verticalLines.findIndex(line => line > x2);
            const xStart = leftBoundaryIndex > 0 ? this.verticalLines[leftBoundaryIndex - 1] : 0;
            const xEnd = this.verticalLines[rightBoundaryIndex] || this.canvas.width;

            // Find the top and bottom boundaries
            const topBoundaryIndex = this.horizontalLines.findIndex(line => line > y1);
            const bottomBoundaryIndex = this.horizontalLines.findIndex(line => line > y2);
            const yStart = topBoundaryIndex > 0 ? this.horizontalLines[topBoundaryIndex - 1] : 0;
            const yEnd = this.horizontalLines[bottomBoundaryIndex] || this.canvas.height;
            console.log(xStart,xEnd);
            
            this.ctx.save()
            this.ctx.fillStyle = "rgba(19, 126, 67, 0.3)";

            this.ctx.strokeStyle = "rgba(19, 126, 67, 1)";
            this.ctx.lineWidth = 2; // Adjust for desired thickness
            this.ctx.fillRect(cellX, cellY, xEnd - xStart, yEnd - yStart);
            this.ctx.strokeRect(cellX, cellY, xEnd - xStart, yEnd - yStart);
            this.ctx.restore()
       this.pasting=false

            
    }

    calculateSum(initial, final) {
        const x1 = Math.min(initial[0], final[0]);
        const y1 = Math.min(initial[1], final[1]);
        const x2 = Math.max(initial[0], final[0]);
        const y2 = Math.max(initial[1], final[1]);
        let cellX1 = 0;
        let cellY1 = 0;
        let cellX2 = 0
        let cellY2 = 0
        let columnIndex = 0;
        let rowIndex = 0;

        // Find the correct column index
        for (let i = 0; i < this.verticalLines.length; i++) {
            if (x1 < this.verticalLines[i]) {
                cellX1 = i === 0 ? 0 : this.verticalLines[i - 1];
                columnIndex = i;
                break;
            }
        }
        for (let i = 0; i < this.verticalLines.length; i++) {
            if (x2 < this.verticalLines[i]) {
                cellX2 = i === 0 ? 0 : this.verticalLines[i - 1];
                columnIndex = i;
                break;
            }
        }

        // Find the correct row index
        for (let j = 0; j < this.horizontalLines.length; j++) {
            if (y1 < this.horizontalLines[j]) {
                cellY1 = j === 0 ? 0 : this.horizontalLines[j - 1];
                rowIndex = j;
                break;
            }
        }
        for (let j = 0; j < this.horizontalLines.length; j++) {
            if (y2 < this.horizontalLines[j]) {
                cellY2 = j === 0 ? 0 : this.horizontalLines[j - 1];
                rowIndex = j;
                break;
            }
        }
        const cell1 = [], cell2 = []
        cell1.push(cellX1 / this.cellWidth, cellY1 / this.cellHeight)
        cell2.push(cellX2 / this.cellWidth, cellY2 / this.cellHeight)
        let ans = 0
        let times = 0
        this.copiedCells = []
        for (let i = cell1[0]; i <= cell2[0]; i++) {
            for (let j = cell1[1]; j <= cell2[1]; j++) {
                if (this.cellData[`${i},${j}`]) {
                    this.copiedCells.push(`${j},${i}`)


                }
                else {
                    this.copiedCells.push(`${j},${i}`)
                }



                if (!isNaN(parseFloat(this.cellData[`${i},${j}`]))) {

                    ans += parseFloat(this.cellData[`${i},${j}`])
                    times++;

                }
            }
        }




        // If the click is on the headers (row 0 or column 0), do not edit
        if (rowIndex === 0 || columnIndex === 0) {
            return;
        }
        const result = []
        result.push(ans, parseFloat(Math.round(ans / times)))
        document.getElementById('sumResult').innerHTML = result[0]
        document.getElementById('avgResult').innerHTML = result[1]
        // document.getElementById('maxResult').innerHTML=result[2]
        // document.getElementById('minResutl').innerHTML=result[3]




    }

    highlightmiltiple(initial, final) {
        this.drawGrid();

        const x1 = Math.min(initial[0], final[0]);
        const y1 = Math.min(initial[1], final[1]);
        const x2 = Math.max(initial[0], final[0]);
        const y2 = Math.max(initial[1], final[1]);

        // Find the left and right boundaries
        const leftBoundaryIndex = this.verticalLines.findIndex(line => line > x1);
        const rightBoundaryIndex = this.verticalLines.findIndex(line => line > x2);
        const xStart = leftBoundaryIndex > 0 ? this.verticalLines[leftBoundaryIndex - 1] : 0;
        const xEnd = this.verticalLines[rightBoundaryIndex] || this.canvas.width;

        // Find the top and bottom boundaries
        const topBoundaryIndex = this.horizontalLines.findIndex(line => line > y1);
        const bottomBoundaryIndex = this.horizontalLines.findIndex(line => line > y2);
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