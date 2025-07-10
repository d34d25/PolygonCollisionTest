import { Vector2D } from "../utils/maths.js";

export class Rigidbody
{
    constructor(linearVelocity = new Vector2D(0,0),angularVelocity = 0 ,mass = 1)
    {
        this.linearVelocity = linearVelocity;
        this.angularVelocity = angularVelocity;
        this.mass = mass;
    }

    
}