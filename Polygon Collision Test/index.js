import { Polygon } from "./src/polygon.js";
import { Player } from "./src/player.js";
import { SAT, shapeOverlapDiagonal } from "./src/physics/collisions.js";
import { Entity } from "./src/entity.js";

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

obstaclePolygon.color = 'green';

var obstacleEntity = new Entity(obstaclePolygon, 0, 0);

//gameloop start

let lastTime = 0;

function gameLoop(timestamp) 
{
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //update

    player.move();
    player.update(dt);

    let collisionResult = SAT(player.entity.polygon, obstacleEntity.polygon);

    if(collisionResult.collision)
    {
        player.entity.polygon.color = 'red';
        
        const correction = {
        x: -collisionResult.normal.x * collisionResult.depth / 1,
        y: -collisionResult.normal.y * collisionResult.depth / 1
        };

        player.entity.move(correction);
    }
    else
    {
        player.entity.polygon.color = 'blue';
    }

    obstaclePolygon.drawPolygon(ctx, obstaclePolygon.getVertices());
    player.entity.polygon.drawPolygon(ctx, player.entity.polygon.getVertices());

    //console.log("" + dt);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);


/*
if I want to push the obstacle:

let collisionResult = SAT(player.entity.polygon, obstacleEntity.polygon);

    if(collisionResult.collision)
    {
        player.entity.polygon.color = 'red';
        
        const correction = {
        x: -collisionResult.normal.x * collisionResult.depth / 2,
        y: -collisionResult.normal.y * collisionResult.depth / 2 //if two obstacles can move then divide by 2 example. y: -collisionResult.normal.y * collisionResult.depth / 2 
        };

        const correctionB = {
        x: collisionResult.normal.x * collisionResult.depth / 2,
        y: collisionResult.normal.y * collisionResult.depth / 2 
        };

        player.entity.move(correction);
        obstacleEntity.move(correctionB);
    }
    else
    {
        player.entity.polygon.color = 'blue';
    }

 */