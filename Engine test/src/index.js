
import { Entity } from "./components/entity.js";
import { Polygon } from "./components/shapes/polygon.js";
import { Rigidbody } from "./components/rigidbody.js";
import { Transform } from "./components/transform.js";
import { Player } from "./game/player.js";
import { drawPolygon } from "./systems/render.js";
import { PhysicsEngine } from "./systems/physics.js";
import { Vector2D } from "./utils/maths.js";

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

testPlayer.entity.getComponent(Polygon).createBox(size);

testPlayer.moveSpeed = 3000;

testPlayer.entity.getComponent(Transform).setScale(1.5,0.7);

testPlayer.entity.getComponent(Rigidbody).linearDamping = 10;

testPlayer.entity.getComponent(Rigidbody).restitution = 1;
testPlayer.entity.getComponent(Rigidbody).mass = 1;
testPlayer.entity.getComponent(Rigidbody).angularDamping = 3;
testPlayer.entity.getComponent(Rigidbody).rotationalInertia = 20; //testPlayer.entity.calculateRotationalInertia();

testPlayer.entity.hasCollisions = true;

var testObstacle = new Entity();

testObstacle.addComponent(new Transform());
testObstacle.addComponent(new Rigidbody());
testObstacle.addComponent(new Polygon());

testObstacle.getComponent(Transform).position.x = 220;
testObstacle.getComponent(Transform).position.y = 220;

testObstacle.getComponent(Transform).setRotation(45);

testObstacle.getComponent(Rigidbody).linearDamping = 1;

//testObstacle.getComponent(Rigidbody).makeStatic();
testObstacle.getComponent(Rigidbody).rotationalInertia = 5;

testObstacle.getComponent(Rigidbody).restitution = 1;

const sizeB = 50;

testObstacle.getComponent(Polygon).createBox(sizeB);


var secondObstacle = new Entity([new Transform(new Vector2D(250,500)), new Rigidbody(), new Polygon()], true);

//secondObstacle.getComponent(Rigidbody).mass = Infinity;
secondObstacle.getComponent(Rigidbody).makeStatic();

const sizeC = 100;

secondObstacle.getComponent(Polygon).createBox(sizeC);

secondObstacle.getComponent(Transform).setScale(3,0.5);

secondObstacle.getComponent(Rigidbody).restitution = 10;

console.log("" + testPlayer.entity.polygonArea);

console.log("rotational inertia" + testPlayer.entity.calculateRotationalInertia());

const physEngine = new PhysicsEngine([testPlayer.entity, testObstacle, secondObstacle]); 

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

    physEngine.resolveCollisionsWRotations(physEngine.entities[0], physEngine.entities[1], ctx);
    physEngine.resolveCollisionsWRotations(physEngine.entities[1], physEngine.entities[2]);
    physEngine.resolveCollisionsWRotations(physEngine.entities[0], physEngine.entities[2], ctx);

    drawPolygon(ctx, testPlayer.entity.getWorldVertices(), testPlayer.entity.getComponent(Polygon).color);

    drawPolygon(ctx, testObstacle.getWorldVertices(), 'yellow');

    drawPolygon(ctx, secondObstacle.getWorldVertices(), 'green');

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);



