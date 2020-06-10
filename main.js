const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight; 

const pieces = [];
const sprites = [];
const tiles = [[],[],[],[],[],[],[],[]];

let turn = 'white';
let endGame = false;

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

const Piece = function(tile, sprite, type, colour, diagonalRange, horizontalRange)
{
    this.width = 80;
    this.height = 80;

    this.tile = tile;
    this.type = type;
    this.colour = colour; 
    this.sprite = sprite;
    
    this.legalMoves = [];
    this.pawnAttack = [];
    this.diagonalRay = [[],[],[],[]];
    this.horizontalRay = [[],[],[],[]];

    this.axisOfCheck = [[],[]];

    this.defended = false;
    this.attacker = 'none';

    this.x = this.tile.x;
    this.y = this.tile.y;

    this.blocked = false; 
    this.hasMoved = false;
    this.defendingCheck = false;
    

    this.king; 
    this.kingBox = [];

    this.diagonalRange = diagonalRange;
    this.horizontalRange = horizontalRange;
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
    mouseObj.rightClick = false;
});

window.addEventListener('keyup', function(event)
{
    if(event.keyCode == 38)
    {
        console.log(blackKing.axisOfCheck);
        console.log(whiteKing.axisOfCheck);
    }
});

document.addEventListener('contextmenu', function(event)
{
    event.preventDefault();
});

//Point and rectangle collision detection
function mouseCollision(mouse, rect)
{
    if(mouse.x > rect.x && mouse.x < (rect.x + rect.width)
    && mouse.y > rect.y && mouse.y < (rect.y + rect.height))
        return true;
    else 
        return false; 
}

//Determines if the mouse is selecting a piece
function mousePiece(mouse, piece)
{
    if(mouseCollision(mouse, piece) && mouse.mouseDown && turn === piece.colour)
        mouse.pieceHeld = piece; 

    // if(mouseCollision(mouse, piece))
    //     mouse.pieceHeld = piece; 
}

function piecePosUpdate(piece)
{
    piece.x = mouseObj.x - 40;
    piece.y = mouseObj.y - 40;
    
    if(!mouseObj.mouseDown)
        mouseObj.pieceHeld = 'none';

    for(let i = 0; i < tiles.length; i++)
    {
        for(let y = 0; y < tiles[i].length; y++)
        {
            //If the mouse has moved over a tile with a piece selected (the function does not get called if there is no piece selected), and lets go
            //Also checks if it is a legal move for the piece selected
            if(mouseCollision(mouseObj, tiles[i][y]) && !mouseObj.mouseDown && piece.legalMoves.includes(tiles[i][y]))
            {   
                piece.hasMoved = true; 

                //If there is already a piece on the tile unasign it's tile so that it is ready for deletion
                tiles[i][y].piece.tile = 'none';
                
                //Remove the piece from being associated with the previous tile
                piece.tile.piece = 'none';

                //Associates the tile and piece together in their internal variables
                piece.tile = tiles[i][y];
                piece.tile.piece = piece;

                if(!piece.hasMoved)
                    piece.hasMoved = true;

                //Toggle turns after each move
                if(turn === 'white')
                    turn = 'black';
                else
                    turn = 'white';

                for(let j = 0; j < pieces.length; j++)
                {
                    pieces[j].defended = false;
                }
            }
        }
    }
    
    //When the mouse lets go of a piece, it returns to the coordinates of the tile associated with the piece
    if(mouseObj.pieceHeld != piece)
    {
        piece.x = piece.tile.x;
        piece.y = piece.tile.y;
    }
}

function adjustLegalMovesForPawn(piece)
{
    let tileIndex = [];

    //Finds the index within the tiles array of the tile associated with the piece passed to this function
    for(let i = 0; i < tiles.length; i++)
    {
        for(let y = 0; y < tiles[i].length; y++)
        {
            if(tiles[i][y] == piece.tile)
                tileIndex = [i, y]; 
        }
    }

    //Think about changing this to a more general solution for colours ala rook rules
    if(piece.colour === 'white' && tileIndex[0] != 7)
    {
        piece.pawnAttack = [];

        if(!piece.hasMoved && tiles[tileIndex[0] + 2][tileIndex[1]].piece == 'none')
            piece.legalMoves.push(tiles[tileIndex[0] + 2][tileIndex[1]]);

        if(tiles[tileIndex[0] + 1][tileIndex[1]].piece === 'none')
            piece.legalMoves.push(tiles[tileIndex[0] + 1][tileIndex[1]]);

        if(tileIndex[1] != 7)
        {   
            if(tiles[tileIndex[0] + 1][tileIndex[1] + 1].piece != 'none' && tiles[tileIndex[0] + 1][tileIndex[1] + 1].piece.colour != 'white')
                piece.legalMoves.push(tiles[tileIndex[0] + 1][tileIndex[1] + 1]);

            piece.pawnAttack.push(tiles[tileIndex[0] + 1][tileIndex[1] + 1]);
        }       

        if(tileIndex[1] != 0)
        {
            if(tiles[tileIndex[0] + 1][tileIndex[1] - 1].piece != 'none' && tiles[tileIndex[0] + 1][tileIndex[1] - 1].piece.colour != 'white')
                piece.legalMoves.push(tiles[tileIndex[0] + 1][tileIndex[1] - 1]);

            piece.pawnAttack.push(tiles[tileIndex[0] + 1][tileIndex[1] - 1]);
        }
    }  
    else if(piece.colour === 'black' && tileIndex[0] != 0)
    {
        piece.pawnAttack = [];

        if(!piece.hasMoved && tiles[tileIndex[0] - 2][tileIndex[1]].piece === 'none')
            piece.legalMoves.push(tiles[tileIndex[0] - 2][tileIndex[1]]);

        if(tiles[tileIndex[0] - 1][tileIndex[1]].piece === 'none')
            piece.legalMoves.push(tiles[tileIndex[0] - 1][tileIndex[1]]);

        if(tileIndex[1] != 7 )
        {
            if(tiles[tileIndex[0] - 1][tileIndex[1] + 1].piece != 'none' && tiles[tileIndex[0] - 1][tileIndex[1] + 1].piece.colour != 'black')
                piece.legalMoves.push(tiles[tileIndex[0] - 1][tileIndex[1] + 1]);
            
            piece.pawnAttack.push(tiles[tileIndex[0] - 1][tileIndex[1] + 1]);
        }

        if(tileIndex[1] != 0)
        {
            if(tiles[tileIndex[0] - 1][tileIndex[1] - 1].piece != 'none' && tiles[tileIndex[0] - 1][tileIndex[1] - 1].piece.colour != 'black')
                piece.legalMoves.push(tiles[tileIndex[0] - 1][tileIndex[1] - 1]);

            piece.pawnAttack.push(tiles[tileIndex[0] - 1][tileIndex[1] - 1]);
        }
    }  

    for(let i = 0; i < piece.pawnAttack.length; i++)
    {
        if(piece.pawnAttack[i].piece.type === 'king' && piece.pawnAttack[i].piece.colour != piece.colour)
        {
            piece.pawnAttack[i].piece.axisOfCheck[0] = [piece.pawnAttack[i]];
            piece.pawnAttack[i].piece.attacker = piece;
        }
    }
}

function horizontalMovement(piece, distance)
{
    let tileIndex = [];

    //Finds the index within the tiles array of the tile associated with the piece passed to this function
    for(let i = 0; i < tiles.length; i++)
    {
        for(let y = 0; y < tiles[i].length; y++)
        {
            if(tiles[i][y] == piece.tile)
                tileIndex = [i, y]; 
        }
    }

    piece.blocked = false; 
    for(let i = 1; i < 8; i++)
    {   
        if((tileIndex[0] + i) < 8)
        {   
            if(tiles[tileIndex[0] + i][tileIndex[1]].piece.colour != piece.colour && !piece.blocked && i <= distance)
                piece.legalMoves.push(tiles[tileIndex[0] + i][tileIndex[1]]);

            if(tiles[tileIndex[0] + i][tileIndex[1]].piece != 'none' && !piece.blocked)
            {
                if(tiles[tileIndex[0] + i][tileIndex[1]].piece.colour == piece.colour && i <= distance)
                    tiles[tileIndex[0] + i][tileIndex[1]].piece.defended = true;

                piece.blocked = true;
            }

            if(piece.type === 'king' && i <= distance)
                piece.kingBox.push(tiles[tileIndex[0] + i][tileIndex[1]]);

            piece.horizontalRay[0].push(tiles[tileIndex[0] + i][tileIndex[1]]);
        }
    }

    piece.blocked = false; 
    for(let i = 1; i < 8 + 1; i++)
    {   
        if((tileIndex[0] - i) > -1)
        {
            if(tiles[tileIndex[0] - i][tileIndex[1]].piece.colour != piece.colour && !piece.blocked && i <= distance)
                piece.legalMoves.push(tiles[tileIndex[0] - i][tileIndex[1]]);
            if(tiles[tileIndex[0] - i][tileIndex[1]].piece != 'none' && !piece.blocked && i <= distance)
            {
                if(tiles[tileIndex[0] - i][tileIndex[1]].piece.colour == piece.colour)
                    tiles[tileIndex[0] - i][tileIndex[1]].piece.defended = true;
                
                piece.blocked = true;
            }    
            if(piece.type === 'king' && i <= distance)
                piece.kingBox.push(tiles[tileIndex[0] - i][tileIndex[1]]);

            piece.horizontalRay[1].push(tiles[tileIndex[0] - i][tileIndex[1]]);
        }
    }

    piece.blocked = false; 
    for(let i = 1; i < 8 + 1; i++)
    {   
        if((tileIndex[1] + i) < 8)
        {
            if(tiles[tileIndex[0]][tileIndex[1] + i].piece.colour != piece.colour && !piece.blocked && i <= distance)
                piece.legalMoves.push(tiles[tileIndex[0]][tileIndex[1] + i]);
            if(tiles[tileIndex[0]][tileIndex[1] + i].piece != 'none' && !piece.blocked && i <= distance)
            {
                if(tiles[tileIndex[0]][tileIndex[1] + i].piece.colour == piece.colour)
                    tiles[tileIndex[0]][tileIndex[1] + i].piece.defended = true;
                piece.blocked = true;
            }

            if(piece.type === 'king' && i <= distance)
                piece.kingBox.push(tiles[tileIndex[0]][tileIndex[1] + i]);

            piece.horizontalRay[2].push(tiles[tileIndex[0]][tileIndex[1] + i]);
        }
    }

    piece.blocked = false; 
    for(let i = 1; i < 8 + 1; i++)
    {   
        if((tileIndex[1] - i) > -1)
        {
            if(tiles[tileIndex[0]][tileIndex[1] - i].piece.colour != piece.colour && !piece.blocked && i <= distance)
                piece.legalMoves.push(tiles[tileIndex[0]][tileIndex[1] - i]);
            if(tiles[tileIndex[0]][tileIndex[1] - i].piece != 'none' && !piece.blocked && i <= distance)
            {
                if(tiles[tileIndex[0]][tileIndex[1] - i].piece.colour == piece.colour)
                    tiles[tileIndex[0]][tileIndex[1] - i].piece.defended = true;

                piece.blocked = true;
            }

            if(piece.type === 'king' && i <= distance)
                piece.kingBox.push(tiles[tileIndex[0]][tileIndex[1] - i]);

            piece.horizontalRay[3].push(tiles[tileIndex[0]][tileIndex[1] - i]);
        }
    }

    for(let i = 0; i < piece.legalMoves.length; i++)
    {
        if(piece.legalMoves[i].piece.type === 'king')
        {
            for(let y = 0; y < 4; y++)
            {
                for(let j = 0; j < piece.horizontalRay[y].length; j++)
                {
                    if(piece.horizontalRay[y][j].piece.type === 'king' && piece.type != 'king' && piece.horizontalRay[y][j].piece.colour != piece.colour)
                    {
                        if(piece.horizontalRay[y][j].piece.axisOfCheck[0].length == 0)
                            piece.horizontalRay[y][j].piece.axisOfCheck[0] = piece.horizontalRay[y];
                        else 
                        {
                            let arraysEqual = false; 
                            for(let u = 0; u < piece.horizontalRay[y].length; u++)
                            {
                                if(!piece.horizontalRay[y][j].piece.axisOfCheck[0].includes(piece.horizontalRay[y][u]))
                                {
                                    arraysEqual = false;
                                    break;
                                }
                                
                                arraysEqual = true;
                            }

                            if(!arraysEqual)
                                piece.horizontalRay[y][j].piece.axisOfCheck[1] = piece.horizontalRay[y];
                        }

                        piece.horizontalRay[y][j].piece.attacker = piece;
                    }    
                }
            }
        }
    }
}

function diagonalMovement(piece, distance)
{
    let tileIndex = [];


    //Finds the index within the tiles array of the tile associated with the piece passed to this function
    for(let i = 0; i < tiles.length; i++)
    {
        for(let y = 0; y < tiles[i].length; y++)
        {
            if(tiles[i][y] == piece.tile)
                tileIndex = [i, y]; 
        }
    }

    piece.blocked = false; 
    for(let i = 1; i < 8 + 1; i++)
    {

         if((tileIndex[0] + i) < 8 && (tileIndex[1] + i) < 8)
        {
            if(tiles[tileIndex[0] + i][tileIndex[1] + i].piece.colour != piece.colour && !piece.blocked && i <= distance)
                piece.legalMoves.push(tiles[tileIndex[0] + i][tileIndex[1] + i]);
        
            if(tiles[tileIndex[0] + i][tileIndex[1] + i].piece != 'none' && !piece.blocked && i <= distance)
            {
                if(tiles[tileIndex[0] + i][tileIndex[1] + i].piece.colour == piece.colour)
                    tiles[tileIndex[0] + i][tileIndex[1] + i].piece.defended = true;

                piece.blocked = true;
            }

            if(piece.type === 'king' && i <= distance)
                piece.kingBox.push(tiles[tileIndex[0] + i][tileIndex[1] + i]);

            piece.diagonalRay[0].push(tiles[tileIndex[0] + i][tileIndex[1] + i]);
        }
    }

    piece.blocked = false; 
    for(let i = 1; i < 8 + 1; i++)
    {
        if((tileIndex[0] + i) < 8 && (tileIndex[1] - i) > -1)
        {
            if(tiles[tileIndex[0] + i][tileIndex[1] - i].piece.colour != piece.colour && !piece.blocked && i <= distance)
                piece.legalMoves.push(tiles[tileIndex[0] + i][tileIndex[1] - i]);
            
            if(tiles[tileIndex[0] + i][tileIndex[1] - i].piece != 'none' && !piece.blocked && i <= distance)
            {
                if(tiles[tileIndex[0] + i][tileIndex[1] - i].piece.colour == piece.colour)
                    tiles[tileIndex[0] + i][tileIndex[1] - i].piece.defended = true;

                piece.blocked = true;
            }
             
            if(piece.type === 'king' && i <= distance)
                piece.kingBox.push(tiles[tileIndex[0] + i][tileIndex[1] - i]);

            piece.diagonalRay[1].push(tiles[tileIndex[0] + i][tileIndex[1] - i]);
        } 
    }

    piece.blocked = false; 
    for(let i = 1; i < 8 + 1; i++)
    {
        if((tileIndex[0] - i) > -1 && (tileIndex[1] - i) > -1)
        {
            if(tiles[tileIndex[0] - i][tileIndex[1] - i].piece.colour != piece.colour && !piece.blocked && i <= distance)
                piece.legalMoves.push(tiles[tileIndex[0] - i][tileIndex[1] - i]);
            
            if(tiles[tileIndex[0] - i][tileIndex[1] - i].piece != 'none' && !piece.blocked && i <= distance)
            {
                if(tiles[tileIndex[0] - i][tileIndex[1] - i].piece.colour == piece.colour)
                    tiles[tileIndex[0] - i][tileIndex[1] - i].piece.defended = true;

                piece.blocked = true;
            }   

            if(piece.type === 'king' && i <= distance)
                piece.kingBox.push(tiles[tileIndex[0] - i][tileIndex[1] - i]);

            piece.diagonalRay[2].push(tiles[tileIndex[0] - i][tileIndex[1] - i]);
        }
    }

    piece.blocked = false; 
    for(let i = 1; i < 8 + 1; i++)
    {
        if((tileIndex[0] - i) > -1 && (tileIndex[1] + i) < 8)
        {
            if(tiles[tileIndex[0] - i][tileIndex[1] + i].piece.colour != piece.colour && !piece.blocked && i <= distance)
                piece.legalMoves.push(tiles[tileIndex[0] - i][tileIndex[1] + i]);
            
            if(tiles[tileIndex[0] - i][tileIndex[1] + i].piece != 'none' && !piece.blocked && i <= distance)
            {
                if(tiles[tileIndex[0] - i][tileIndex[1] + i].piece.colour == piece.colour)
                    tiles[tileIndex[0] - i][tileIndex[1] + i].piece.defended = true;

                piece.blocked = true;
            }

            if(piece.type === 'king' && i <= distance)
                piece.kingBox.push(tiles[tileIndex[0] - i][tileIndex[1] + i]);

            piece.diagonalRay[3].push(tiles[tileIndex[0] - i][tileIndex[1] + i]);        
        }
    }

    for(let i = 0; i < piece.legalMoves.length; i++)
    {
        if(piece.legalMoves[i].piece.type === 'king')
        {
            for(let y = 0; y < 4; y++)
            {
                for(let j = 0; j < piece.diagonalRay[y].length; j++)
                {
                    if(piece.diagonalRay[y][j].piece.type === 'king' && piece.type != 'king' && piece.diagonalRay[y][j].piece.colour != piece.colour)
                    {

                        if(piece.diagonalRay[y][j].piece.axisOfCheck[0].length == 0)
                            piece.diagonalRay[y][j].piece.axisOfCheck[0] = piece.diagonalRay[y];
                        else 
                        {
                            let arraysEqual = false; 
                            for(let u = 0; u < piece.diagonalRay[y].length; u++)
                            {
                                if(!piece.diagonalRay[y][j].piece.axisOfCheck[0].includes(piece.diagonalRay[y][u]))
                                {
                                    arraysEqual = false;
                                    break;
                                }
                                arraysEqual = true;
                            }

                            if(!arraysEqual)
                                piece.diagonalRay[y][j].piece.axisOfCheck[1] = piece.diagonalRay[y];
                        }

                        piece.diagonalRay[y][j].piece.attacker = piece;   
                    }    
                }
            }
        }
    }
}

function knightMovement(piece)
{
    let tileIndex = [];

    //Finds the index within the tiles array of the tile associated with the piece passed to this function
    for(let i = 0; i < tiles.length; i++)
    {
        for(let y = 0; y < tiles[i].length; y++)
        {
            if(tiles[i][y] == piece.tile)
                tileIndex = [i, y]; 
        }
    }
    
    if((tileIndex[0] + 2) < 8 && (tileIndex[1] + 1) < 8)
        if(tiles[tileIndex[0] + 2][tileIndex[1] + 1].piece.colour != piece.colour)
            piece.legalMoves.push(tiles[tileIndex[0] + 2][tileIndex[1] + 1]);
        else 
            tiles[tileIndex[0] + 2][tileIndex[1] + 1].piece.defended = true;

    if((tileIndex[0] + 2) < 8 && (tileIndex[1] - 1) > -1)
        if(tiles[tileIndex[0] + 2][tileIndex[1] - 1].piece.colour != piece.colour)
            piece.legalMoves.push(tiles[tileIndex[0] + 2][tileIndex[1] - 1]);
        else 
            tiles[tileIndex[0] + 2][tileIndex[1] - 1].piece.defended = true;    


    if((tileIndex[0] + 1) < 8 && (tileIndex[1] + 2) < 8)
        if(tiles[tileIndex[0] + 1][tileIndex[1] + 2].piece.colour != piece.colour)
            piece.legalMoves.push(tiles[tileIndex[0] + 1][tileIndex[1] + 2]);
        else 
            tiles[tileIndex[0] + 1][tileIndex[1] + 2].piece.defended = true;

    if((tileIndex[0] + 1) < 8 && (tileIndex[1] - 2) > -1)
        if(tiles[tileIndex[0] + 1][tileIndex[1] - 2].piece.colour != piece.colour)
            piece.legalMoves.push(tiles[tileIndex[0] + 1][tileIndex[1] - 2]);
        else    
            tiles[tileIndex[0] + 1][tileIndex[1] - 2].piece.defended = true;

    if((tileIndex[0] - 2) > -1 && (tileIndex[1] - 1) > -1)
        if(tiles[tileIndex[0] - 2][tileIndex[1] - 1].piece.colour != piece.colour)
            piece.legalMoves.push(tiles[tileIndex[0] - 2][tileIndex[1] - 1]);
        else 
            tiles[tileIndex[0] - 2][tileIndex[1] - 1].piece.defended = true;    

    if((tileIndex[0] - 2) > -1 && (tileIndex[1] + 1) < 8)
        if(tiles[tileIndex[0] - 2][tileIndex[1] + 1].piece.colour != piece.colour)
            piece.legalMoves.push(tiles[tileIndex[0] - 2][tileIndex[1] + 1]);
        else    
            tiles[tileIndex[0] - 2][tileIndex[1] + 1].piece.defended = true;

    if((tileIndex[0] - 1) > -1 && (tileIndex[1] - 2) > -1)
        if(tiles[tileIndex[0] - 1][tileIndex[1] - 2].piece.colour != piece.colour)
            piece.legalMoves.push(tiles[tileIndex[0] - 1][tileIndex[1] - 2]);
        else 
            tiles[tileIndex[0] - 1][tileIndex[1] - 2].piece.defended = true;
            
    if((tileIndex[0] - 1) > -1 && (tileIndex[1] + 2) < 8)
        if(tiles[tileIndex[0] - 1][tileIndex[1] + 2].piece.colour != piece.colour)
            piece.legalMoves.push(tiles[tileIndex[0] - 1][tileIndex[1] + 2]);
        else 
            tiles[tileIndex[0] - 1][tileIndex[1] + 2].piece.defended = true;

    for(let i = 0; i < piece.legalMoves.length; i++)
    {
        if(piece.legalMoves[i].piece.type === 'king')
        {
            piece.legalMoves[i].piece.axisOfCheck[0] = [piece.legalMoves[i]];
            piece.legalMoves[i].piece.attacker = piece;
        }
    }
}

function kingMovement(piece)
{
    piece.kingBox = [];
    diagonalMovement(piece, 1);
    horizontalMovement(piece, 1);

    let movesToRemove = [];

    for(let i = 0; i < pieces.length; i++)
    {
        if(pieces[i].colour != piece.colour)
        {
            for(let y = 0; y < piece.legalMoves.length; y++)
            {
                if(pieces[i].legalMoves.includes(piece.legalMoves[y]) && pieces[i].type != 'pawn')
                {
                    if(!movesToRemove.includes(piece.legalMoves[y]))   
                        movesToRemove.push(piece.legalMoves[y]);
                }
                
                if(pieces[i].pawnAttack.includes(piece.legalMoves[y]) && pieces[i].type === 'pawn')
                {
                    if(!movesToRemove.includes(piece.legalMoves[y]))   
                        movesToRemove.push(piece.legalMoves[y]);  
                }

                if(piece.legalMoves[y].piece.defended)
                {
                    if(!movesToRemove.includes(piece.legalMoves[y]))
                        movesToRemove.push(piece.legalMoves[y]);
                }

                if(pieces[i].king.kingBox.includes(piece.legalMoves[y]))
                {
                    if(!movesToRemove.includes(piece.legalMoves[y]))
                        movesToRemove.push(piece.legalMoves[y]);
                }
            }   
        }
    }   

    if(piece.axisOfCheck[0].length > 0)
    {
        for(let i = 0; i < piece.axisOfCheck[0].length; i++)
        {
            if(piece.legalMoves.includes(piece.axisOfCheck[0][i]) && !movesToRemove.includes(piece.axisOfCheck[0][i]))
                movesToRemove.push(piece.axisOfCheck[0][i]);
        }
        if(piece.axisOfCheck[1].length > 0)
        {
            for(let i = 0; i < piece.axisOfCheck[1].length; i++)
            {
                if(piece.legalMoves.includes(piece.axisOfCheck[1][i]) && !movesToRemove.includes(piece.axisOfCheck[1][i]))
                    movesToRemove.push(piece.axisOfCheck[1][i]);
            }
        }
    }

    for(let i = 0; i < movesToRemove.length; i++)
    {
        piece.legalMoves.splice(piece.legalMoves.indexOf(movesToRemove[i]), 1);
    }
}

function movesThatBlockCheck(piece)
{
    let movesToRemove = [];
    let axis = [];

    for(let i = 0; i < piece.king.axisOfCheck[0].length; i++)
    {
        axis.push(piece.king.axisOfCheck[0][i]);
    }
    
    for(let i = (axis.length - 1); i > 0; i--)
    {
        if(axis[i].piece == piece.king)
            break;
        
        axis.pop();
    }

    if(axis.length > 0)
    {
        for(let i = 0; i < piece.legalMoves.length; i++)
        {
            if(!axis.includes(piece.legalMoves[i]) && piece.legalMoves[i] != piece.king.attacker.tile)
                movesToRemove.push(piece.legalMoves[i]);
        }
    }

    for(let i = 0; i < movesToRemove.length; i++)
    {
        piece.legalMoves.splice(piece.legalMoves.indexOf(movesToRemove[i]), 1);
    }

    if(piece.king.axisOfCheck[1].length > 0)
        piece.legalMoves = [];
}

function checkIfPieceBlocksCheck(piece)
{   
    let scanningRay;
    let scanningPiece;
    
    for(let i = 0; i < pieces.length; i++)
    {
        if(pieces[i].colour != piece.colour) 
        {
            if(pieces[i].horizontalRange == 8)
            {
                for(let y = 0; y < 4; y++)
                {
                    if(pieces[i].horizontalRay[y].includes(piece.king.tile) && pieces[i].horizontalRay[y].includes(piece.tile))
                    {
                        for(let j = 0; j < pieces[i].horizontalRay[y].length; j++)
                        {
                            if(pieces[i].horizontalRay[y][j].piece.type === 'king') 
                                break;

                            if(pieces[i].horizontalRay[y][j].piece != 'none' && pieces[i].horizontalRay[y][j].piece != piece)
                            {
                                piece.defendingCheck = false;
                                break;
                            }
                            
                            piece.defendingCheck = true;
                            scanningPiece = pieces[i];
                            scanningRay = pieces[i].horizontalRay[y];
                        }
                    }
                }
            }

            if(pieces[i].diagonalRange == 8)
            {
                for(let y = 0; y < 4; y++)
                {
                    if(pieces[i].diagonalRay[y].includes(piece.king.tile) && pieces[i].diagonalRay[y].includes(piece.tile))
                    {
                        for(let j = 0; j < pieces[i].diagonalRay[y].length; j++)
                        {
                            if(pieces[i].diagonalRay[y][j].piece.type === 'king') 
                                break;

                            if(pieces[i].diagonalRay[y][j].piece != 'none' && pieces[i].diagonalRay[y][j].piece != piece)
                            {
                                piece.defendingCheck = false;
                                break;
                            }
                            
                            piece.defendingCheck = true;
                            scanningPiece = pieces[i];
                            scanningRay = pieces[i].diagonalRay[y];
                        }
                    }
                }
            }
        }
    }

    let movesToRemove = [];
    if(piece.defendingCheck)
    {
        for(let i = 0; i < piece.legalMoves.length; i++)
        {
            if(!scanningRay.includes(piece.legalMoves[i]) && piece.legalMoves[i] != scanningPiece.tile)
                movesToRemove.push(piece.legalMoves[i]);   
        }
    }

    for(let i = 0; i < movesToRemove.length; i++)
    {
        piece.legalMoves.splice(piece.legalMoves.indexOf(movesToRemove[i]), 1);
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

// Add all the starting pieces
for(let i = 0; i < 8; i++)
{
    pieces.push(new Piece(tiles[1][i], sprites[5], 'pawn', 'white', 0, 0));

    pieces.push(new Piece(tiles[6][i], sprites[11], 'pawn', 'black', 0, 0));
}

pieces.push(new Piece(tiles[0][0], sprites[4], 'rook', 'white', 0, 8));
pieces.push(new Piece(tiles[0][7], sprites[4], 'rook', 'white', 0, 8));

pieces.push(new Piece(tiles[7][0], sprites[10], 'rook', 'black', 0, 8));
pieces.push(new Piece(tiles[7][7], sprites[10], 'rook', 'black', 0, 8));

pieces.push(new Piece(tiles[0][1], sprites[3], 'knight', 'white', 0, 0));
pieces.push(new Piece(tiles[0][6], sprites[3], 'knight', 'white', 0, 0));

pieces.push(new Piece(tiles[7][1], sprites[9], 'knight', 'black', 0, 0));
pieces.push(new Piece(tiles[7][6], sprites[9], 'knight', 'black', 0, 0));

pieces.push(new Piece(tiles[0][2], sprites[2], 'bishop', 'white', 8, 0));
pieces.push(new Piece(tiles[0][5], sprites[2], 'bishop', 'white', 8, 0));

pieces.push(new Piece(tiles[7][2], sprites[8], 'bishop', 'black', 8, 0));
pieces.push(new Piece(tiles[7][5], sprites[8], 'bishop', 'black', 8, 0));

pieces.push(new Piece(tiles[0][3], sprites[1], 'queen', 'white', 8, 8));
pieces.push(new Piece(tiles[7][3], sprites[7], 'queen', 'black', 8, 8));

let whiteKing = new Piece(tiles[0][4], sprites[0], 'king', 'white', 1, 1);
let blackKing = new Piece(tiles[7][4], sprites[6], 'king', 'black', 1, 1);

pieces.push(whiteKing);
pieces.push(blackKing);

//Links the Tile object's interal "piece" variable to the piece assigned to the tile
for(let i = 0; i < pieces.length; i++)
{
    pieces[i].tile.piece = pieces[i];
    if(pieces[i].colour === 'white')
        pieces[i].king = whiteKing;
    else 
        pieces[i].king = blackKing;
}

function loop()
{   
    c.clearRect(0, 0, canvas.width, canvas.height);

    //Print an indicator of whose turn it is
    c.font = '20px Arial';
    c.fillStyle = 'red';

    c.fillText(turn + "'s" + ' turn', 300, 50, 150);

    if(endGame) 
    {
        if(turn === 'black')
            c.fillText('white wins', 850, 50, 150);
        else 
            c.fillText('black wins', 850, 50, 150);
    }

    //Draw each tile in the tiles array
    for(let i = 0; i < 8; i++)
    {
        for(let y = 0; y < 8; y++)
        {
            
            if (tiles[i][y].piece != 'none' && tiles[i][y].piece.axisOfCheck[0].length > 0)
            {
                if(endGame)
                    c.fillStyle = 'red'
                else 
                    c.fillStyle = '#ff3300';
            }
            else 
                c.fillStyle = tiles[i][y].colour;
            
            c.fillRect(tiles[i][y].x, tiles[i][y].y, tiles[i][y].width, tiles[i][y].height);

            //print the tile's name
            c.fillStyle = 'black';
            c.font = '10px Arial';
            c.fillText(tiles[i][y].name, tiles[i][y].x + 2, tiles[i][y].y + 78, 50);
        }
    }
    
    //Draw each piece in the pieces array
    for(let i = 0; i < pieces.length; i++)
    {
        //If the mouse is not currently holding a piece, check whether the currently indexed piece can be held by it
        if(mouseObj.pieceHeld == 'none')
            mousePiece(mouseObj, pieces[i]);

        let piecesToRemove = [];
        pieces[i].legalMoves = [];
        pieces[i].diagonalRay = [[],[],[],[]];
        pieces[i].horizontalRay = [[],[],[],[]];
        
        pieces[i].defendingCheck = false;

        if(pieces[i].type === 'pawn')
        {
            adjustLegalMovesForPawn(pieces[i]);
            movesThatBlockCheck(pieces[i]);
            checkIfPieceBlocksCheck(pieces[i]);
        }
        
        if(pieces[i].type === 'rook')
        {
            horizontalMovement(pieces[i], 8);
            movesThatBlockCheck(pieces[i]);
            checkIfPieceBlocksCheck(pieces[i]);
        }
        
        if(pieces[i].type === 'bishop')
        {
            diagonalMovement(pieces[i], 8);
            movesThatBlockCheck(pieces[i]);
            checkIfPieceBlocksCheck(pieces[i]);
        }
        
        if(pieces[i].type === 'knight')
        {
            knightMovement(pieces[i]);
            movesThatBlockCheck(pieces[i]);
            checkIfPieceBlocksCheck(pieces[i]);
        }
        
        if(pieces[i].type === 'queen')
        {
            horizontalMovement(pieces[i], 8);
            diagonalMovement(pieces[i], 8);
            movesThatBlockCheck(pieces[i]);
            checkIfPieceBlocksCheck(pieces[i]);
        }
        
        if(pieces[i].type === 'king')
        {
            if(pieces[i].colour === turn)
            {
                if(turn === 'white')
                {
                    kingMovement(blackKing);
                    kingMovement(whiteKing);
                }
                else 
                {
                    kingMovement(whiteKing);
                    kingMovement(blackKing);
                }
            }
        }

        //If the mouse is holding the currently indexed piece, update its position 
        if(mouseObj.pieceHeld == pieces[i] && !endGame)
        {
            piecePosUpdate(pieces[i]);

            whiteKing.attacker = 'none';
            blackKing.attacker = 'none';
            whiteKing.axisOfCheck = [[],[]];
            blackKing.axisOfCheck = [[],[]];
        }    

        //Remove any pieces that are not assigned to tiles 
        for(let i = 0; i < pieces.length; i++)
        {
            if(pieces[i].tile === 'none')
                piecesToRemove.push(pieces[i]);
        }

        if(pieces[i] != mouseObj.pieceHeld)
            c.drawImage(pieces[i].sprite, pieces[i].x, pieces[i].y, 80, 80);

        for(let i = 0; i < piecesToRemove.length; i++)
        {
            pieces.splice(pieces.indexOf(piecesToRemove[i]), 1);
        }
    }

    if(mouseObj.pieceHeld != 'none')
    {
        for(let i = 0; i < 8; i++)
        {
            for(let y = 0; y < 8; y++)
            {
                //Draws a circle on each tile that a held piece can move to
                if(mouseObj.pieceHeld != 'none' && mouseObj.pieceHeld.legalMoves.includes(tiles[i][y]))
                {
                    c.beginPath();
                    c.strokeStyle = 'rgb(0, 100, 100)';
                    c.arc(tiles[i][y].x + 40, tiles[i][y].y + 40, 10, 0, 2 * Math.PI);

                    c.fillStyle = 'rgba(0, 100, 100, .7)';
                    c.fill();
                }
            }
        }

        c.drawImage(mouseObj.pieceHeld.sprite, mouseObj.pieceHeld.x, mouseObj.pieceHeld.y, 80, 80);
    }

    for(let i = 0; i < pieces.length; i++)
    {
        if(pieces[i].colour === turn)
        {
            if(pieces[i].legalMoves.length > 0)
            {
                endGame = false;
                break;
            }

            endGame = true; 
        }
    }
    
    window.requestAnimationFrame(loop);
}
loop();