const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight; 

const pieces = [];
const sprites = [];
const tiles = [[],[],[],[],[],[],[],[]];

const Mouse = function()
{
    this.x = 0;
    this.y = 0;
    this.mouseDown = false;
    this.pieceHeld = 'none'; 
}

const Tile = function(x, y, colour, name){
    this.x = x; 
    this.y = y;

    this.width = 80;
    this.height = 80;

    this.name = name;
    this.colour = colour;
}

const Piece = function(tile, sprite)
{
    this.width = 80;
    this.height = 80;

    this.tile = tile;
    this.sprite = sprite;
    
    this.x = this.tile.x;
    this.y = this.tile.y;
}

let mouseObj = new Mouse();

//Dynamically resize the canvas to fit the window
window.addEventListener('resize', function(event)
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;    
});

//Event listeners to determine the mouse objects properties
window.addEventListener('mousemove', function(event){
    mouseObj.x = event.x;
    mouseObj.y = event.y; 
});

window.addEventListener('mousedown', function(event){
    mouseObj.mouseDown = true;
});

window.addEventListener('mouseup', function(event){
    mouseObj.mouseDown = false;
});

function mouseCollision(mouse, rect)
{
    if(mouse.x > rect.x && mouse.x < (rect.x + rect.width)
    && mouse.y > rect.y && mouse.y < (rect.y + rect.height))
        return true;
    else 
        return false; 
}

function mousePiece(mouse, piece)
{
    if(mouseCollision(mouse, piece) && mouse.mouseDown)
        mouse.pieceHeld = piece; 
}


function piecePosUpdate(piece)
{
    piece.x = mouseObj.x - 40;
    piece.y = mouseObj.y - 40;
    
    if(mouseObj.mouseDown == false)
        mouseObj.pieceHeld = 'none';

    for(let i = 0; i < tiles.length; i++)
    {
        for(let y = 0; y < tiles[i].length; y++)
        {
            if(mouseCollision(mouseObj, tiles[i][y]))
                piece.tile = tiles[i][y];
        }
    }

    if(mouseObj.pieceHeld != piece)
    {
        piece.x = piece.tile.x;
        piece.y = piece.tile.y;
    }
}







//Push piece images into the sprites array
for(let i = 0; i < 12; i++)
{
    let img = new Image();
    img.src = 'sprites/piece' + parseInt(i) + '.png';
    sprites.push(img);
}

//Create the board by filling the tiles array with Tile objects
let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

let x = 300;
let y = 660; 

for(let i = 0; i < 8; i++)
{
    x = 300; 
    for(let j = 0; j < 8; j++)
    {   
        if(i % 2 == 0)
        {
            if(j % 2 == 0)
                tiles[i].push(new Tile(x, y, '#BA5546', letters[j] + parseInt(i + 1)));
            else 
                tiles[i].push(new Tile(x, y, '#F0D8BF', letters[j] + parseInt(i + 1)));
        }
        else 
        {
            if(j % 2 == 0)
                tiles[i].push(new Tile(x, y, '#F0D8BF', letters[j] + parseInt(i + 1)));
            else 
                tiles[i].push(new Tile(x, y, '#BA5546', letters[j] + parseInt(i + 1)));   
        }
        x+=80;
    }
    y-=80;
}


pieces.push(new Piece(tiles[1][1], sprites[5]));
pieces.push(new Piece(tiles[4][2], sprites[11]));

function loop()
{   
    c.clearRect(0, 0, canvas.width, canvas.height);
    
    //Draw each tile in the tiles array
    for(let i = 0; i < 8; i++)
    {
        for(let y = 0; y < 8; y++)
        {
            //Detect whether the mouse is hovering over the tile and change the colour to indicate it is
            if(mouseCollision(mouseObj, tiles[i][y]))
                c.fillStyle = '#ff3333';
            else 
                c.fillStyle = tiles[i][y].colour;
            
            c.fillRect(tiles[i][y].x, tiles[i][y].y, tiles[i][y].width, tiles[i][y].height);

            //print the tiles name
            c.fillStyle = 'black';
            c.fillText(tiles[i][y].name, tiles[i][y].x + 2, tiles[i][y].y + 78, 50);
        }
    }
    
    //Draw each piece in the pieces array
    for(let i = 0; i < pieces.length; i++)
    {
        if(mouseObj.pieceHeld == 'none')
            mousePiece(mouseObj, pieces[i]);
        
        if(mouseObj.pieceHeld == pieces[i])
            piecePosUpdate(pieces[i]);


        c.drawImage(pieces[i].sprite, pieces[i].x, pieces[i].y, 80, 80);
    }


    window.requestAnimationFrame(loop);
}
loop();