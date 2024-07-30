import Grid from './grid.js';

const cellWidth = 220;
const cellHeight = 25;
const canvas = document.getElementById('gridCanvas');
canvas.width = window.innerWidth*2 ;
canvas.height = window.innerHeight*20 
const grid = new Grid('gridCanvas', cellWidth, cellHeight);

grid.drawGrid();

var myLink = document.getElementById('mylink');

myLink.onclick = function () {

    grid.clearCanavsClick()

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

                // Fetch the uploaded data
                const dataResponse = await fetch('http://localhost:5208/upload/');
                if (dataResponse.ok) {
                    const jsonData = await dataResponse.json();
                    grid.loadJsonData(jsonData)
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
//touchdown event which is pointer event
canvas.addEventListener('mousedown', function (event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cellX = Math.floor(x / grid.cellWidth) * grid.cellWidth;
    const cellY = Math.floor(y / grid.cellHeight) * grid.cellHeight;
    grid.ismousedown = true
    if (cellX == 0) {
        grid.highlightvertical(cellX, cellY)
    }
    if (cellY == 0) {
        grid.highlighthorizontal(cellX, cellY)

    }
   
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
        //console.log(cellX, cellY);
        grid.highlightmiltiple(grid.initialcell, grid.finallcell)
    }

});
