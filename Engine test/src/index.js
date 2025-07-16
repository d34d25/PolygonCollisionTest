
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

testPlayer.moveSpeed = 2000;

testPlayer.entity.getComponent(Transform).setScale(1,1);

testPlayer.entity.getComponent(Rigidbody).linearDamping = 3;

testPlayer.entity.getComponent(Rigidbody).restitution = 0;
testPlayer.entity.getComponent(Rigidbody).mass = 1;
testPlayer.entity.getComponent(Rigidbody).angularDamping = 2;
testPlayer.entity.getComponent(Rigidbody).rotationalInertia = testPlayer.entity.calculateRotationalInertia();

testPlayer.entity.getComponent(Rigidbody).affectedByGravity = true;
testPlayer.entity.hasCollisions = true;

var testObstacle = new Entity();

testObstacle.addComponent(new Transform());
testObstacle.addComponent(new Rigidbody());
testObstacle.addComponent(new Polygon());

testObstacle.getComponent(Polygon).createBox(50);

testObstacle.getComponent(Transform).position.x = 250;
testObstacle.getComponent(Transform).position.y = 220;

testObstacle.getComponent(Transform).setRotation(0);

testObstacle.getComponent(Rigidbody).linearDamping = 1;
testObstacle.getComponent(Rigidbody).rotationalInertia = testObstacle.calculateRotationalInertia();
//testObstacle.getComponent(Rigidbody).makeStatic();

testObstacle.getComponent(Rigidbody).restitution = 0;
testObstacle.getComponent(Rigidbody).affectedByGravity = true;


var testObstacleTwo = new Entity([new Transform(new Vector2D(250,0)), new Rigidbody(), new Polygon()], true);

testObstacleTwo.getComponent(Polygon).createBox(30);

testObstacleTwo.getComponent(Rigidbody).linearDamping = 2;
testObstacleTwo.getComponent(Rigidbody).rotationalInertia = testObstacleTwo.calculateRotationalInertia();

//testObstacle.getComponent(Rigidbody).makeStatic();

testObstacleTwo.getComponent(Rigidbody).restitution = 0;
testObstacleTwo.getComponent(Rigidbody).affectedByGravity = true;

var secondObstacle = new Entity([new Transform(new Vector2D(250,500)), new Rigidbody(), new Polygon()], true);

//secondObstacle.getComponent(Rigidbody).mass = Infinity;
secondObstacle.getComponent(Rigidbody).makeStatic();

const sizeC = 100;

secondObstacle.getComponent(Polygon).createBox(sizeC);

secondObstacle.getComponent(Transform).setScale(3,0.5);

secondObstacle.getComponent(Rigidbody).restitution = 0;

var thirdObstacle =  new Entity([new Transform(new Vector2D(250,20)), new Rigidbody(), new Polygon()], true);

thirdObstacle.getComponent(Polygon).createBox(20);

thirdObstacle.getComponent(Rigidbody).affectedByGravity = true;
thirdObstacle.getComponent(Rigidbody).rotationalInertia = thirdObstacle.calculateRotationalInertia();

console.log("" + testPlayer.entity.polygonArea);

console.log("rotational inertia" + testPlayer.entity.calculateRotationalInertia());

const physEngine = new PhysicsEngine([testPlayer.entity, testObstacle, secondObstacle, testObstacleTwo,  thirdObstacle], 1200); 

//gameloop start

let lastTime = 0;
let accumulator = 0;
const FIXED_TIMESTEP = 1 / 144; // 60 FPS → 16.66 ms per update

function gameLoop(timestamp) 
{
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    const frameTime = Math.min((timestamp - lastTime) / 1000, 0.25);
    lastTime = timestamp;
    accumulator += frameTime;

    //update
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    while (accumulator >= FIXED_TIMESTEP)
    {

      testPlayer.movePlayer();

      physEngine.update(FIXED_TIMESTEP);

      for (let i = 0; i < 3; i++) 
      {
        physEngine.resolveCollisionsWRotations(physEngine.entities[0], physEngine.entities[1], ctx);
        physEngine.resolveCollisionsWRotations(physEngine.entities[0], physEngine.entities[2], ctx);
        physEngine.resolveCollisionsWRotations(physEngine.entities[0], physEngine.entities[3], ctx);
        physEngine.resolveCollisionsWRotations(physEngine.entities[0], physEngine.entities[4], ctx);

        physEngine.resolveCollisionsWRotations(physEngine.entities[1], physEngine.entities[2], ctx);
        physEngine.resolveCollisionsWRotations(physEngine.entities[1], physEngine.entities[4], ctx);
        physEngine.resolveCollisionsWRotations(physEngine.entities[2], physEngine.entities[4], ctx);
        physEngine.resolveCollisionsWRotations(physEngine.entities[3], physEngine.entities[4], ctx);

        physEngine.resolveCollisionsWRotations(physEngine.entities[3], physEngine.entities[1], ctx);
        physEngine.resolveCollisionsWRotations(physEngine.entities[3], physEngine.entities[2], ctx);
      }

      
      

      accumulator -= FIXED_TIMESTEP;
    }


      
    //render

    

    drawPolygon(ctx, testPlayer.entity.getWorldVertices(), testPlayer.entity.getComponent(Polygon).color);

    drawPolygon(ctx, testObstacle.getWorldVertices(), 'yellow');

    drawPolygon(ctx, secondObstacle.getWorldVertices(), 'green');

    drawPolygon(ctx, testObstacleTwo.getWorldVertices(), 'red');
    
    drawPolygon(ctx, thirdObstacle.getWorldVertices(), 'pink');

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);



