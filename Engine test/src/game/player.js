import { Entity } from "../components/entity.js";
import { Rigidbody } from "../components/rigidbody.js";
import { Input } from "./input.js";

export class Player
{
    constructor(entity = new Entity(), moveSpeed = 50, rotationSpeed = 5)
    {
        this.entity = entity;
        this.input = new Input();

        this.moveSpeed = moveSpeed;
        this.rotationSpeed = rotationSpeed;
    }

    movePlayer()
    {
        if(this.input.isKeyDown('d'))
        {
            this.entity.getComponent(Rigidbody).linearVelocity.x = this.moveSpeed;
        }
        else if(this.input.isKeyDown('a'))
        {
            this.entity.getComponent(Rigidbody).linearVelocity.x = -this.moveSpeed;
        }
        else
        {
            this.entity.getComponent(Rigidbody).linearVelocity.x = 0;
        }

        if(this.input.isKeyDown('w'))
        {
            this.entity.getComponent(Rigidbody).linearVelocity.y = -this.moveSpeed;
        }
        else if(this.input.isKeyDown('s'))
        {
            this.entity.getComponent(Rigidbody).linearVelocity.y = this.moveSpeed;
        }
        else
        {
            this.entity.getComponent(Rigidbody).linearVelocity.y = 0;
        }

        if(this.input.isKeyDown('e'))
        {
            this.entity.getComponent(Rigidbody).angularVelocity = this.rotationSpeed;
        }
        else if(this.input.isKeyDown('q'))
        {
            this.entity.getComponent(Rigidbody).angularVelocity = -this.rotationSpeed;
        }
        else
        {
            this.entity.getComponent(Rigidbody).angularVelocity = 0;
        }

    }
}