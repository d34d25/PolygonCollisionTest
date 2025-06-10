import { Polygon } from "./src/polygon.js";
import { Player } from "./src/player.js";
import { shapeOverlapDiagonal } from "./src/physics/collisions.js";

//canvas initialization
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

//initialization


var playerPolygon = new Polygon(10,10, 0);

const size = 40;

playerPolygon.localVertices = [
    { x: -size, y: -size },
    { x: size, y: -size },  
    { x: size, y: size },   
    { x: -size, y: size }, 
];


var player = new Player(playerPolygon, 100, 0.06);

var obstaclePolygon = new Polygon(120,150, 0); //50 * Math.PI / 180

const sizeb = 40;

obstaclePolygon.localVertices = [
    { x: -sizeb, y: -sizeb },
    { x: sizeb, y: -sizeb },  
    { x: sizeb, y: sizeb },   
    { x: -sizeb, y: sizeb }, 
];

//gameloop start

let lastTime = 0;

function gameLoop(timestamp) 
{
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //update

    obstaclePolygon.drawPolygon(ctx, obstaclePolygon.getVertices(), 'red');


    player.move();

    player.update(dt);

    player.entity.polygon.drawPolygon(ctx, player.entity.polygon.getVertices());

    
    if(shapeOverlapDiagonal(player.entity.polygon, obstaclePolygon))
    {
        console.log('colliding');
    }

    //console.log("" + dt);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
