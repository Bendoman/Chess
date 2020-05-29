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

const Tile = function(xPos, yPos, colour, name){
    this.xPos = xPos; 
    this.yPos = yPos;
    this.name = name;
    this.colour = colour;
}

const Piece = function(tile, sprite)
{
    this.sprite = sprite;
    this.xPos = tile.xPos;
    this.yPos = tile.yPos;
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
'test';
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
                tiles.push(new Tile(x, y, '#BA5546', letters[j] + parseInt(i + 1)));
            else 
                tiles.push(new Tile(x, y, '#F0D8BF', letters[j] + parseInt(i + 1)));
        }
        else 
        {
            if(j % 2 == 0)
                tiles.push(new Tile(x, y, '#F0D8BF', letters[j] + parseInt(i + 1)));
            else 
                tiles.push(new Tile(x, y, '#BA5546', letters[j] + parseInt(i + 1)));   
        }
        x+=80;
    }
    y-=80;
}
//-------------------------------------------------------------

pieces.push(new Piece(tiles[6], sprites[5]));


function loop()
{   
    //Draw each tile in the tiles array
    for(let i = 0; i < tiles.length; i++)
    {
        c.fillStyle = tiles[i].colour;
        c.fillRect(tiles[i].xPos, tiles[i].yPos, 80, 80);
        c.fillStyle = 'black';
        c.fillText(tiles[i].name, tiles[i].xPos + 2, tiles[i].yPos + 78, 50);
    }
    
    //Draw each piece in the pieces array
    for(let i = 0; i < pieces.length; i++)
    {
        c.drawImage(pieces[i].sprite, pieces[i].xPos, pieces[i].yPos, 80, 80);
    }

    window.requestAnimationFrame(loop);
}
loop();