import { Shape } from "./shape.js";

export class Circle extends Shape
{
    constructor(radius = 1, color = 'blue')
    {
        super(color, 'circle');
        this.radius = radius;
    }

}