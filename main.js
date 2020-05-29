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
    this.piece = 'none';
    this.colour = colour;
}

const Piece = function(tile, sprite, type, colour)
{
    this.width = 80;
    this.height = 80;

    this.tile = tile;
    this.type = type;
    this.colour = colour; 
    this.sprite = sprite;
    
    this.legalMoves = [];

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
            if(mouseCollision(mouseObj, tiles[i][y]) && mouseObj.mouseDown == false && piece.legalMoves.includes(tiles[i][y]))
            {
                tiles[i][y].piece.tile = 'none';
                
                piece.tile.piece = 'none';
                piece.tile = tiles[i][y];
                piece.tile.piece = piece;
            }
        }
    }

    if(mouseObj.pieceHeld != piece)
    {
        piece.x = piece.tile.x;
        piece.y = piece.tile.y;
    }
}

function pawnRules(piece)
{
    piece.legalMoves = [];
    let tileIndex = [];

    for(let i = 0; i < tiles.length; i++)
    {
        for(let y = 0; y < tiles[i].length; y++)
        {
            if(tiles[i][y] == piece.tile)
                tileIndex = [i, y]; 
        }
    }

    if(piece.colour === 'white' && tileIndex[0] != 7)
    {
        if(tiles[tileIndex[0] + 1][tileIndex[1]].piece === 'none')
            piece.legalMoves.push(tiles[tileIndex[0] + 1][tileIndex[1]]);

        if(tileIndex[1] != 7 && tiles[tileIndex[0] + 1][tileIndex[1] + 1].piece != 'none' && tiles[tileIndex[0] + 1][tileIndex[1] + 1].piece.colour != 'white')
            piece.legalMoves.push(tiles[tileIndex[0] + 1][tileIndex[1] + 1]);


        if(tileIndex[1] != 0 && tiles[tileIndex[0] + 1][tileIndex[1] - 1].piece != 'none' && tiles[tileIndex[0] + 1][tileIndex[1] - 1].piece.colour != 'white')
            piece.legalMoves.push(tiles[tileIndex[0] + 1][tileIndex[1] - 1]);
    }  

    if(piece.colour === 'black' && tileIndex[0] != 0)
    {
        if(tiles[tileIndex[0] - 1][tileIndex[1]].piece === 'none')
            piece.legalMoves.push(tiles[tileIndex[0] - 1][tileIndex[1]]);

        if(tileIndex[1] != 7 && tiles[tileIndex[0] - 1][tileIndex[1] + 1].piece != 'none' && tiles[tileIndex[0] - 1][tileIndex[1] + 1].piece.colour != 'black')
            piece.legalMoves.push(tiles[tileIndex[0] - 1][tileIndex[1] + 1]);

        if(tileIndex[1] != 0 && tiles[tileIndex[0] - 1][tileIndex[1] - 1].piece != 'none' && tiles[tileIndex[0] - 1][tileIndex[1] - 1].piece.colour != 'black')
            piece.legalMoves.push(tiles[tileIndex[0] - 1][tileIndex[1] - 1]);
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


pieces.push(new Piece(tiles[1][7], sprites[5], 'pawn', 'white'));
pieces.push(new Piece(tiles[1][6], sprites[5], 'pawn', 'white'));
pieces.push(new Piece(tiles[4][6], sprites[11], 'pawn', 'black'));
pieces.push(new Piece(tiles[4][7], sprites[11], 'pawn', 'black'));


for(let i = 0; i < pieces.length; i++)
{
    pieces[i].tile.piece = pieces[i];
}


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
    
    for(let i = 0; i < pieces.length; i++)
    {
        if(pieces[i].tile === 'none')
            pieces.splice(i, 1);
    }


    //Draw each piece in the pieces array
    for(let i = 0; i < pieces.length; i++)
    {
        if(mouseObj.pieceHeld == 'none')
            mousePiece(mouseObj, pieces[i]);
        else 
            pawnRules(pieces[i]);
        
        if(mouseObj.pieceHeld == pieces[i])
            piecePosUpdate(pieces[i]);

        c.drawImage(pieces[i].sprite, pieces[i].x, pieces[i].y, 80, 80);
    }

    
    window.requestAnimationFrame(loop);
}
loop();