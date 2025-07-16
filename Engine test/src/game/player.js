import { Entity } from "../components/entity.js";
import { Rigidbody } from "../components/rigidbody.js";
import { Input } from "./input.js";

export class Player
{
    constructor(entity = new Entity(), moveSpeed = 50, rotationSpeed = 50)
    {
        this.entity = entity;
        this.input = new Input();

        this.moveSpeed = moveSpeed;
        this.rotationSpeed = rotationSpeed;
    }

    movePlayer()
    {
        if(!this.entity.getComponent(Rigidbody))
        {
            console.warn("No rigidbody was attached to this entity"); 
            return;
        }

        let inputX = 0;
        let inputY = 0;

        let inputR = 0;


        if (this.input.isKeyDown('d')) inputX = 1;
        if (this.input.isKeyDown('a')) inputX = -1;
        if (this.input.isKeyDown('w')) inputY = -1;
        if (this.input.isKeyDown('s')) inputY = 1;
   
        if(this.input.isKeyDown('q')) inputR = -1;
        if(this.input.isKeyDown('e')) inputR = 1;

        const length = Math.sqrt(inputX * inputX + inputY * inputY);

        if (length > 0)
        {
            inputX /= length;
            inputY /= length;
        }

        this.entity.getComponent(Rigidbody).force.x += inputX * this.moveSpeed;
        this.entity.getComponent(Rigidbody).force.y += inputY * this.moveSpeed;

        this.entity.getComponent(Rigidbody).torque += inputR * this.rotationSpeed;


    }
}