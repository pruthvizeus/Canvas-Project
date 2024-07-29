import Grid from './grid.js';

const cellWidth = 120;
const cellHeight = 25;
const canvas = document.getElementById('gridCanvas');
canvas.width = window.innerWidth-20; 
canvas.height = window.innerHeight-20
const grid = new Grid('gridCanvas', cellWidth, cellHeight);

grid.drawGrid();


var myLink = document.getElementById('mylink');

myLink.onclick = function(){

   grid.clearCanavsClick()

}


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
    grid.initialcell = []
    grid.finallcell = []
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    grid.ismouseup = true;
    grid.ismousedown = false;


});
canvas.addEventListener('mousedown', function (event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cellX = Math.floor(x / grid.cellWidth) * grid.cellWidth;
    const cellY = Math.floor(y / grid.cellHeight) * grid.cellHeight;
    grid.ismousedown = true
    grid.highlightCell(x, y);
    grid.initialcell.push(cellX, cellY)




});
canvas.addEventListener('mousemove', function (event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cellX = Math.floor(x / grid.cellWidth) * grid.cellWidth;
    const cellY = Math.floor(y / grid.cellHeight) * grid.cellHeight;
    grid.ismousemove = true;

    if (grid.ismousedown && cellX != 0 && cellY != 0) {
        const arr = []
        arr.push(cellX, cellY)
        grid.finallcell = arr
        grid.highlightmiltiple(grid.initialcell, grid.finallcell)
    }

});
