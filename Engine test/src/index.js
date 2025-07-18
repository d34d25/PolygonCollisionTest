
import { Entity } from "./components/entity.js";
import { Polygon } from "./components/shapes/polygon.js";
import { Rigidbody } from "./components/rigidbody.js";
import { Transform } from "./components/transform.js";
import { Player } from "./game/player.js";
import { drawCircle, drawPolygon } from "./systems/render.js";
import { PhysicsEngine } from "./systems/physics.js";
import { Vector2D } from "./utils/maths.js";
import { EntityManager } from "./systems/entityManager.js";
import { Circle } from "./components/shapes/circle.js";

//canvas initialization
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

//initialization

//'circle' 'box' 'triangle' circle box triangle

const entityManager = new EntityManager();

var testPlayer = new Player(entityManager.createPhysicalEntity(new Vector2D(0,0),50,0,{x: 1, y:0.5},'box', false), 2000, 200);
testPlayer.entity.getComponent(Rigidbody).linearDamping = {x:5, y: 5};
testPlayer.entity.getComponent(Rigidbody).angularDamping = 1;
testPlayer.entity.getComponent(Rigidbody).restitution = 0.7;
testPlayer.entity.getComponent(Rigidbody).setMass(1);


var testObstacle = entityManager.createPhysicalEntity(new Vector2D(250, 70),30,0,{x: 1, y:1},'box' ,true, false, true);
testObstacle.getComponent(Transform).position = new Vector2D(250, 70);
testObstacle.getComponent(Rigidbody).restitution = 0.7;
testObstacle.getComponent(Rigidbody).setMass(1);
testObstacle.getComponent(Rigidbody).linearDamping = {x:1, y: 0};
testObstacle.getComponent(Rigidbody).angularDamping = 1;

var testObstacle2 = entityManager.createPhysicalEntity(new Vector2D(400, 30),30,0,{x: 1, y:1},'box' ,true, false, true);
testObstacle2.getComponent(Rigidbody).restitution = 0.7;
testObstacle2.getComponent(Rigidbody).setMass(1);
testObstacle2.getComponent(Rigidbody).linearDamping = {x:1, y: 0};
testObstacle2.getComponent(Rigidbody).angularDamping = 1;

var testObstacle3 = entityManager.createPhysicalEntity(new Vector2D(600, 30),30,0,{x: 1, y:1},'triangle' ,true, false, true);
testObstacle3.getComponent(Rigidbody).restitution = 0.7;
testObstacle3.getComponent(Rigidbody).setMass(0.5);
testObstacle3.getComponent(Rigidbody).linearDamping = {x:1, y: 0};
testObstacle3.getComponent(Rigidbody).angularDamping = 1;

var floor = entityManager.createPhysicalEntity(new Vector2D(250, 500),30,0,{x: 15, y:1}, 'box', false,true, false);
floor.getComponent(Rigidbody).restitution = 0;
floor.getComponent(Rigidbody).makeCompletelyStatic();

console.log(Array.from(entityManager.entities).map(e => e.id));


const physEngine = new PhysicsEngine(entityManager, {x:0,y:9.8}); 

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
        
        //physEngine.resolveCollisionsWRotations(physEngine.entities[0], physEngine.entities[1], ctx);
        physEngine.resolveCollisions(physEngine.entities[0], physEngine.entities[2], true ,ctx);
        physEngine.resolveCollisions(physEngine.entities[1], physEngine.entities[0], true ,ctx);  
        physEngine.resolveCollisions(physEngine.entities[1], physEngine.entities[2], true ,ctx);

        physEngine.resolveCollisions(physEngine.entities[0], physEngine.entities[3], true ,ctx);
        physEngine.resolveCollisions(physEngine.entities[1], physEngine.entities[3], true ,ctx);
        physEngine.resolveCollisions(physEngine.entities[2], physEngine.entities[3], true ,ctx);

        physEngine.resolveCollisions(physEngine.entities[3], physEngine.entities[4], true ,ctx);
        physEngine.resolveCollisions(physEngine.entities[1], physEngine.entities[4], true ,ctx);
        physEngine.resolveCollisions(physEngine.entities[2], physEngine.entities[4], true ,ctx);
        physEngine.resolveCollisions(physEngine.entities[0], physEngine.entities[4], true ,ctx);
      }

      

      accumulator -= FIXED_TIMESTEP;
    }


      
    //render

   
    drawPolygon(ctx, entityManager.getWorldVertices(testPlayer.entity), testPlayer.entity.getComponent(Polygon).color);
    drawPolygon(ctx, entityManager.getWorldVertices(testObstacle), 'yellow');
    drawPolygon(ctx, entityManager.getWorldVertices(testObstacle2), 'green');
    drawPolygon(ctx, entityManager.getWorldVertices(testObstacle3), 'red');
    drawPolygon(ctx, entityManager.getWorldVertices(floor), 'gray');

    //drawCircle(ctx, testPlayer.entity.getComponent(Transform).position, testPlayer.entity.getComponent(Circle).color, testPlayer.entity.getComponent(Circle).radius,testPlayer.entity.getComponent(Transform).rotationRAD );
    //drawCircle(ctx, testObstacle.getComponent(Transform).position, 'yellow', testObstacle.getComponent(Circle).radius, testObstacle.getComponent(Transform).rotationRAD);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);



