const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const sprites = [];
const pieces = [];
const tiles = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight; 

window.addEventListener('resize', function(event)
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;    
});

const Tile = function(xPos,yPos,colour){
    this.xPos = xPos; 
    this.yPos = yPos;
    this.colour = colour;
}

const Piece = function(xPos, yPos, sprite)
{
    this.xPos = xPos;
    this.yPos = yPos;
    this.sprite = sprite;
}

//Push piece images into the sprites array
for(let i = 0; i < 12; i++)
{
    let img = new Image();
    img.src = 'sprites/piece' + parseInt(i) + '.png';
    sprites.push(img);
}


//Create new piece objects, asigning them coordinates and sprites
for(let i = 0; i < 8; i++)
{
    pieces.push(new Piece((300 + (i*80)), 580, sprites[5]));
    pieces.push(new Piece((300 + (i*80)), 180, sprites[11]));
}

pieces.push(new Piece(300, 100, sprites[10]));
pieces.push(new Piece(860, 100, sprites[10]));
pieces.push(new Piece(300, 660, sprites[4]));
pieces.push(new Piece(860, 660, sprites[4]));

pieces.push(new Piece(380, 100, sprites[9]));
pieces.push(new Piece(780, 100, sprites[9]));
pieces.push(new Piece(380, 660, sprites[3]));
pieces.push(new Piece(780, 660, sprites[3]));

pieces.push(new Piece(460, 100, sprites[9]));
pieces.push(new Piece(700, 100, sprites[8]));
pieces.push(new Piece(460, 660, sprites[2]));
pieces.push(new Piece(700, 660, sprites[2]));

pieces.push(new Piece(540, 100, sprites[6]));
pieces.push(new Piece(540, 660, sprites[0]));

pieces.push(new Piece(620, 100, sprites[7]));
pieces.push(new Piece(620, 660, sprites[1]));
//---------------------------------------------------------------


//Create the board by filling the tiles array with Tile objects
let x = 300;
let y = 100; 

for(let i = 0; i < 8; i++)
{
    x = 300; 
    for(let j = 0; j < 8; j++)
    {   
        if(i % 2 == 0)
        {
            if(j % 2 == 0)
                tiles.push(new Tile(x, y, '#F0D8BF'));
            else 
                tiles.push(new Tile(x, y, '#BA5546'));
        }
        else 
        {
            if(j % 2 == 0)
                tiles.push(new Tile(x, y, '#BA5546'));
            else 
                tiles.push(new Tile(x, y, '#F0D8BF'));   
        }
        x+=80;
    }
    y+=80;
}
//-------------------------------------------------------------




function loop()
{
    for(let i = 0; i < tiles.length; i++)
    {
        c.fillStyle = tiles[i].colour;
        c.fillRect(tiles[i].xPos, tiles[i].yPos, 80, 80);
    }
    
    for(let i = 0; i < pieces.length; i++)
    {
        c.drawImage(pieces[i].sprite, pieces[i].xPos, pieces[i].yPos, 80, 80);
    }

    window.requestAnimationFrame(loop);
}
loop();