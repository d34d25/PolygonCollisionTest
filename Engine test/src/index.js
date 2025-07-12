
import { Entity } from "./components/entity.js";
import { Polygon } from "./components/polygon.js";
import { Rigidbody } from "./components/rigidbody.js";
import { Transform } from "./components/transform.js";
import { Player } from "./game/player.js";
import { drawPolygon } from "./systems/render.js";
import { PhysicsEngine } from "./systems/physics.js";

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


const size = 50;

testPlayer.entity.getComponent(Polygon).localVertices = [
    { x: -size, y: -size },
    { x: size, y: -size },  
    { x: size, y: size },   
    { x: -size, y: size }, 
];

testPlayer.moveSpeed = 100;

testPlayer.entity.getComponent(Transform).setScale(1.5,0.7);

testPlayer.entity.getComponent(Rigidbody).linearDamping = 1;

testPlayer.entity.getComponent(Rigidbody).mass = 1;

testPlayer.entity.hasCollisions = true;

var testObstacle = new Entity();

testObstacle.addComponent(new Transform());
testObstacle.addComponent(new Rigidbody());
testObstacle.addComponent(new Polygon());

testObstacle.getComponent(Transform).position.x = 220;
testObstacle.getComponent(Transform).position.y = 220;

testObstacle.getComponent(Transform).setRotation(45);

testObstacle.getComponent(Rigidbody).linearDamping = 1;

testObstacle.getComponent(Rigidbody).isStatic = true;

const sizeB = 50;

testObstacle.getComponent(Polygon).localVertices = [
    { x: -sizeB, y: -sizeB },
    { x: sizeB, y: -sizeB },  
    { x: sizeB, y: sizeB },   
    { x: -sizeB, y: sizeB }, 
]


console.log("" + testPlayer.entity.getArea());

const physEngine = new PhysicsEngine([testPlayer.entity, testObstacle]); 

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

    physEngine.update(dt);

    physEngine.resolveCollisions(physEngine.entities[0], physEngine.entities[1]);

    drawPolygon(ctx, testPlayer.entity.getWorldVertices(), testPlayer.entity.getComponent(Polygon).color);

    drawPolygon(ctx, testObstacle.getWorldVertices(), 'yellow');


    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);



