import { Shape } from "./shape.js";

export class Polygon extends Shape
{
    constructor(color = 'blue', shape = '')
    {
        super(color);
        this.localVertices = [];
    }


    createBox(size)
    {
        this.localVertices = [
            { x: -size, y: -size  },
            { x: size, y: -size },  
            { x: size, y: size },   
            { x: -size, y: size },
        ];

        this.type = 'box';
    }

    createTriangle(size, height = Math.sqrt(3) / 2 * size)
    {
        this.localVertices = [
            { x: -size / 2, y: height / 3 },
            { x: size / 2, y: height / 3 },
            { x: 0, y: -2 * height / 3 }
        ];

        this.type = 'triangle';
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
