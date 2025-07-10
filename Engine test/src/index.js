import { Entity } from "./components/entity.js";
import { Polygon } from "./components/polygon.js";
import { Rigidbody } from "./components/rigidbody.js";
import { Transform } from "./components/transform.js";
import { Player } from "./game/player.js";
import { drawPolygon } from "./systems/render.js";
import { SAT } from "./utils/collisions.js";

//canvas initialization
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

//initialization


var testPlayer = new Player();

testPlayer.entity = new Entity([
  new Transform(),
  new Rigidbody(),
  new Polygon()
]);


const size = 40;

testPlayer.entity.getComponent(Polygon).localVertices = [
    { x: -size, y: -size },
    { x: size, y: -size },  
    { x: size, y: size },   
    { x: -size, y: size }, 
];

testPlayer.moveSpeed = 100;



var testObstacle = new Entity();

testObstacle.addComponent(new Transform());
testObstacle.addComponent(new Rigidbody());
testObstacle.addComponent(new Polygon());

testObstacle.getComponent(Transform).position.x = 220;
testObstacle.getComponent(Transform).position.y = 220;

testObstacle.getComponent(Transform).setRotation(45);

const sizeB = 50;

testObstacle.getComponent(Polygon).localVertices = [
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
        testPlayer.entity.getComponent(Polygon).color = 'red';

        const correction = {
        x: -collisionResult.normal.x * collisionResult.depth,
        y: -collisionResult.normal.y * collisionResult.depth
        };

        testPlayer.entity.move(correction);
    }
    else
    {
        testPlayer.entity.getComponent(Polygon).color = 'blue';
    }

    drawPolygon(ctx, testPlayer.entity.getWorldVertices(), testPlayer.entity.getComponent(Polygon).color);

    drawPolygon(ctx, testObstacle.getWorldVertices(), 'yellow');


    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
