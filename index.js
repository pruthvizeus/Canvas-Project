import Grid from './grid.js';

const cellWidth = 120;
const cellHeight = 25;
const grid = new Grid('gridCanvas', cellWidth, cellHeight);

grid.drawGrid();

const canvas = document.getElementById('gridCanvas');
canvas.addEventListener('click', function (event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    grid.highlightCell(x, y);
});

canvas.addEventListener('dblclick', function (event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    grid.editCell(x, y);
});
canvas.addEventListener('mouseup', function (event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    grid.ismouseup = true;

});
canvas.addEventListener('mousedown', function (event) {
    grid.ismousedown = false
    grid.ismousemove = false
    grid.ismouseup = false

    grid.selectedCellsX = new Set()
    grid.selectedCellsY = new Set()
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    grid.ismousedown = true
    grid.highlightCell(x, y);



});
canvas.addEventListener('mousemove', function (event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    grid.ismousemove = true;
    
    grid.highlightmiltiple(x, y)

});
