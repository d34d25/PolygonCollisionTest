import { PhysWorld } from "../physics.js";
import { createBodyBox, createBodyCircle, createBodyTriangle } from "../rigidbody.js";
import { TestPlayer } from "./testplayer.js";
const keysPressed = {};

window.addEventListener('keydown', (e) => {
  keysPressed[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

let mousePos = { x: 0, y: 0 };
let mouseClicked = false;

window.addEventListener('mousemove', (e) => {
  mousePos = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mousedown', (e) => {
  mouseClicked = true;
});

window.addEventListener('mouseup', (e) => {
  mouseClicked = false;
});


const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let box = createBodyBox({position: {x: 210, y: 400}, size: {w: 35, h:35}, density: 1, restitution: 0.6,affectedByGravity: true});
box.angle = 0;

let box2 = createBodyTriangle({position: {x: 210, y: 550}, size: {w: 70, h:30}, density: 1, restitution: 0.6 ,isStatic: true, noRotation: true});
box2.angle = 0;

let triangle = createBodyBox({position: {x: 500, y: 240}, size: {w: 35, h:35}, density: 1, restitution: 0.6, staticFriction:0.2, dynamicFriction:0.1});
triangle.angle = 0.1;

let floor = createBodyBox({position: {x: 210, y: 600}, size: {w: 1, h:35}, density: 1, restitution: 0, isStatic:true, noRotation: true});
floor.angle = 0;

let floor2 = createBodyBox({position: {x: 400, y: 100}, size: {w: 120, h:40}, density: 1, restitution: 0,isStatic:true, noRotation: true});
floor2.angle = 0.1;

let floor3 = createBodyBox({position: {x: 600, y: 500}, size: {w: 120, h:40}, density: 1, restitution: 0,isStatic:true, noRotation: true, staticFriction:0, dynamicFriction:0});
floor3.angle = -0.1;

let theFloor = createBodyBox({position: {x: 720/2, y: 640}, size: {w: 720, h:40}, density: 1, restitution: 0,isStatic:true, noRotation: true, dynamicFriction:0.4, staticFriction:0.6});


const FIXED_TIMESTEP = 1 / 144;

const phys = new PhysWorld([box,triangle, floor, box2 ,floor2, floor3, theFloor], {x:0, y:9.8 * 2});

let testPlayer = new TestPlayer(createBodyBox({position: {x: 0, y: 0}, size: {w: 35, h:35}, density: 1, restitution: 0.6, affectedByGravity: false, linearDamping:{x: 0.6,y:0.6}, angularDamping: 0.6}), phys); 

phys.bodies.push(testPlayer.body);

let lastTime = 0;
let accumulator = 0;

function gameLoop(timestamp) 
{
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    const frameTime = Math.min((timestamp - lastTime) / 1000, 0.25);
    lastTime = timestamp;
    accumulator += frameTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    while (accumulator >= FIXED_TIMESTEP)
    {

        testPlayer.move(dt, keysPressed, mousePos, mouseClicked);


        for (let i = 0; i < 3; i++) 
        {
            phys.step(ctx, FIXED_TIMESTEP, true);
        }

        accumulator -= FIXED_TIMESTEP;
    }


    let n = phys.bodies.length;

    for(let i = 0; i < n; i++)
    {
        

        if(phys.bodies[i].isCircle)
        {
          drawCircle(ctx, phys.bodies[i].position, 'red', phys.bodies[i].radius, phys.bodies[i].angle);
        }
        else
        {
          drawPolygon(ctx, phys.bodies[i].transformedVertices, 'blue');
        }
        
    }
        
            

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);


function drawPolygon(ctx, vertices, fillStyle = 'blue') 
{
    if (vertices.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) 
    {
        ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.stroke();
}

function drawCircle(ctx, point, color = 'red', radius = 15, rotation = 0) {
    ctx.save();

    ctx.translate(point.x, point.y);
    ctx.rotate(rotation);  // rotation is in radians

    // Draw circle centered at (0, 0)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();

    // Draw direction indicator (along +X axis)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);  // forward vector (along rotated axis)
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

