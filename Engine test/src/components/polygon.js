export class Polygon
{
    constructor(color = 'blue')
    {
        this.localVertices = [];
        this.color = color;
    }

    getVertices()
    {
        return this.localVertices;
    }

    getLocalArea() 
    {
        let area = 0;
        const vertices = this.localVertices;
        const n = vertices.length;

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += vertices[i].x * vertices[j].y;
            area -= vertices[j].x * vertices[i].y;
        }

        return Math.abs(area) / 2;
    }



}
