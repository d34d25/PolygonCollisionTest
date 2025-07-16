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

export function drawPoint(ctx, point, color = 'red', radius = 15) 
{
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawCircle()
{

}
