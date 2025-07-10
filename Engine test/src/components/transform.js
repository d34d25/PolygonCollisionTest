import { Vector2D } from "../utils/maths.js";

export class Transform
{
    constructor(position = new Vector2D(0,0), rotationRAD = 0, scale = new Vector2D(1,1))
    {
        this.position = position;
        this.rotationRAD = rotationRAD;
        this.scale = scale;
    }

    setPosition(x, y) 
    {
        this.position.x = x;
        this.position.y = y;
        return this;
    }

    setRotation(degrees) 
    {
        let radians = degrees * (Math.PI / 180);
        this.rotationRAD = radians;
        return this;
    }

    setScale(x, y) 
    {
        this.scale.x = x;
        this.scale.y = y;
        return this;
    }

    move(amount) //amount is a vector
    {
       this.position.add(amount);
    }

    reset() 
    {
        this.position.set(0, 0);
        this.rotationRAD = 0;
        this.scale.set(1, 1);
        return this;
    }


}