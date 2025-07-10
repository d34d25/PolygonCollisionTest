import { Entity } from "./components/entity.js";
import { Player } from "./game/player.js";
import { drawPolygon } from "./systems/render.js";
import { SAT } from "./utils/collisions.js";

//canvas initialization
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

//initialization


var testPlayer = new Player();

const size = 40;

testPlayer.entity.polygon.localVertices = [
    { x: -size, y: -size },
    { x: size, y: -size },  
    { x: size, y: size },   
    { x: -size, y: size }, 
];

testPlayer.moveSpeed = 100;



var testObstacle = new Entity();

testObstacle.transform.position.x = 220;
testObstacle.transform.position.y = 220;

testObstacle.transform.setRotation(45);

const sizeB = 50;

testObstacle.polygon.localVertices = [
    { x: -sizeB, y: -sizeB },
    { x: sizeB, y: -sizeB },  
    { x: sizeB, y: sizeB },   
    { x: -sizeB, y: sizeB }, 
]

//gameloop start

let lastTime = 0;

function gameLoop(timestamp) 
{
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //update

    testPlayer.movePlayer();

    testPlayer.entity.update(dt); //update is only needed when the position is changed via velocity

    let collisionResult = SAT(testPlayer.entity, testObstacle);

    if(collisionResult.collision)
    {
        testPlayer.entity.polygon.color = 'red';

        const correction = {
        x: -collisionResult.normal.x * collisionResult.depth,
        y: -collisionResult.normal.y * collisionResult.depth
        };

        testPlayer.entity.move(correction);
    }
    else
    {
        testPlayer.entity.polygon.color = 'blue';
    }

    drawPolygon(ctx, testPlayer.entity.getWorldVertices(), testPlayer.entity.polygon.color);

    drawPolygon(ctx, testObstacle.getWorldVertices(), 'yellow');


    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
