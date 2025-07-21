import { PhysWorld } from "./physics.js";
import { createBodyBox, createBodyCircle, createBodyTriangle } from "./rigidbody.js";

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let box = createBodyBox({x:210, y: 400}, {w: 35, h: 35}, 1, 0.4, false, false);
box.angle = 0;

let box2 = createBodyTriangle({x:400, y: 50}, {w: 35, h: 35}, 1, 1, false);
box2.angle = 0;

let triangle = createBodyTriangle({x:200, y: 540}, {w: 35, h: 35}, 0, 0,true);
triangle.angle = 0.7;

let floor = createBodyBox({x:200, y: 600}, {w: 2, h: 40}, 1 ,1, true, true);
floor.angle = 0;
let floor2 = createBodyBox({x:400, y: 100}, {w: 120, h: 40}, 1 ,1, true, true);
floor2.angle = 0.1;

let floor3 = createBodyBox({x:600, y: 500}, {w: 120, h: 40}, 1 ,1, true, true)
let theFloor = createBodyBox({x:720/2, y: 640}, {w: 720, h: 40}, 1 ,1, true, true);

const FIXED_TIMESTEP = 1 / 144;

const phys = new PhysWorld([box,triangle, floor, box2 ,floor2, floor3, theFloor], {x:0, y:9.8 * 2});


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

        for (let i = 0; i < 3; i++) 
        {


            phys.step(ctx,FIXED_TIMESTEP, true);
            phys.collisionStep(ctx, box,floor, true);
            phys.collisionStep(ctx, box2,floor, true);
            
            //phys.collisionStep(ctx, box,triangle, true);

            phys.collisionStep(ctx, box2,floor, true);
            phys.collisionStep(ctx, box,floor2, true);

            phys.collisionStep(ctx, box,floor3, true);

            phys.collisionStep(ctx, box,theFloor, true);
        }

        accumulator -= FIXED_TIMESTEP;
    }

    drawPolygon(ctx, triangle.transformedVertices, 'green');

    drawPolygon(ctx, box.transformedVertices, 'blue');
    
    drawPolygon(ctx, box2.transformedVertices, 'red');

    drawPolygon(ctx, floor.transformedVertices, 'gray');
    drawPolygon(ctx, floor2.transformedVertices, 'gray');
    drawPolygon(ctx, floor3.transformedVertices, 'gray');
    drawPolygon(ctx, theFloor.transformedVertices, 'gray');

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

function drawCircle(ctx, point, color = 'red', radius = 15, rotation) 
{
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke(); 

    const endX = point.x + Math.cos(rotation) * radius;
    const endY = point.y + Math.sin(rotation) * radius;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
}