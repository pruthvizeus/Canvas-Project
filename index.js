import Grid from './grid.js';

const cellWidth = 180;
const cellHeight = 25;
const canvas = document.getElementById('gridCanvas');
canvas.width = window.innerWidth*2;
canvas.height = window.innerHeight;
const grid = new Grid('gridCanvas', cellWidth, cellHeight);

grid.drawGrid();

var myLink = document.getElementById('mylink');

myLink.onclick = function () {
    grid.clearCanavsClick();
}

document.getElementById('jsonUpload').addEventListener('change', async function() {
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

let isResizing = false;
let resizingColumnIndex = -1;
let initialMouseX = 0;

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
        grid.ismousedown = true;

        if (cellX == 0) {
            grid.highlightvertical(cellX, cellY);
        } else if (cellY == 0) {
            grid.highlighthorizontal(cellX, cellY);
        } else {
            grid.highlightCell(x, y);
            grid.initialcell.push(cellX, cellY);
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
        canvas.style.cursor = 'default';
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

document.getElementById('resizeOption').addEventListener('click', function () {
    alert('Resize Cell option clicked');
    // Add your resize logic here
});

document.getElementById('deleteOption').addEventListener('click', function () {
    alert('Delete Cell option clicked');
    // Add your delete logic here
});

document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 'c') {
        grid.copyCellData();
    }
});
