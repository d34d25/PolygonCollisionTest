
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


const entityManager = new EntityManager();

var testPlayer = new Player(entityManager.createPhysicalEntity(50,'box', false), 4000, false);
testPlayer.entity.getComponent(Rigidbody).linearDamping = {x:6, y: 6};
testPlayer.entity.getComponent(Rigidbody).restitution = 0;
entityManager.getEntityById(1).getComponent(Rigidbody).mass = 2;


var testObstacle = entityManager.createPhysicalEntity(30,'circle' ,false, false, true);
testObstacle.getComponent(Transform).position = new Vector2D(250, 70);
testObstacle.getComponent(Rigidbody).restitution = 0;

console.log(Array.from(entityManager.entities).map(e => e.id));


const physEngine = new PhysicsEngine(entityManager, {x:0,y:1200}); 

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
        physEngine.resolveCollisions(physEngine.entities[1], physEngine.entities[0], false ,ctx);
      }

      

      accumulator -= FIXED_TIMESTEP;
    }


      
    //render

   
    drawPolygon(ctx, entityManager.getWorldVertices(testPlayer.entity), testPlayer.entity.getComponent(Polygon).color);
    //drawPolygon(ctx, entityManager.getWorldVertices(testObstacle), 'yellow');

    //drawCircle(ctx, testPlayer.entity.getComponent(Transform).position, testPlayer.entity.getComponent(Circle).color, testPlayer.entity.getComponent(Circle).radius);
    drawCircle(ctx, testObstacle.getComponent(Transform).position, 'yellow', testObstacle.getComponent(Circle).radius);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);



