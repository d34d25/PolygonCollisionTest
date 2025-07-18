export function drawPolygon(ctx, vertices, fillStyle = 'blue') 
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

export function drawCircle(ctx, point, color = 'red', radius = 15, rotation) 
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