import { Entity } from "../components/entity.js";
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
            this.entity.rb.linearVelocity.x = this.moveSpeed;
        }
        else if(this.input.isKeyDown('a'))
        {
            this.entity.rb.linearVelocity.x = -this.moveSpeed;
        }
        else
        {
            this.entity.rb.linearVelocity.x = 0;
        }

        if(this.input.isKeyDown('w'))
        {
            this.entity.rb.linearVelocity.y = -this.moveSpeed;
        }
        else if(this.input.isKeyDown('s'))
        {
            this.entity.rb.linearVelocity.y = this.moveSpeed;
        }
        else
        {
            this.entity.rb.linearVelocity.y = 0;
        }

        if(this.input.isKeyDown('e'))
        {
            this.entity.rb.angularVelocity = this.rotationSpeed;
        }
        else if(this.input.isKeyDown('q'))
        {
            this.entity.rb.angularVelocity = -this.rotationSpeed;
        }
        else
        {
            this.entity.rb.angularVelocity = 0;
        }

    }
}