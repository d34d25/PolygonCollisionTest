export class Polygon
{
    constructor(x,y, rotation = 0)
    {
        this.x = x;
        this.y = y;

        this.rotation = rotation;

        this.localVertices = [];

        this.color = 'blue';
    }

    getVertices() 
    {
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);

        return this.localVertices.map(({ x, y }) => ({
            x: this.x + x * cos - y * sin,
            y: this.y + x * sin + y * cos
        }));
    }


    drawPolygon(ctx, vertices, fillStyle = this.color) 
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
}