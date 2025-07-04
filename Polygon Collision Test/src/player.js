import { Entity } from "./entity.js";

export class Player
{
    static _listenersAdded = false;

    static keys = {}; 

    static handleKeyDown(e) 
    {
        Player.keys[e.key] = true;
    }

    static handleKeyUp(e) 
    {
        Player.keys[e.key] = false;
    }

    constructor(polygon, speed, rotationSpeed)
    {
        this.entity = new Entity(polygon, speed, rotationSpeed);

        if (!Player._listenersAdded)
        {
            window.addEventListener('keydown', Player.handleKeyDown);
            window.addEventListener('keyup', Player.handleKeyUp);
            Player._listenersAdded = true;
        }
    }

    move()
    {
        //'ArrowRight' 'ArrowLeft' 'ArrowUp' 'ArrowDown'
        if (Player.keys['d']) this.entity.xVelocity = this.entity.speed;
        else if (Player.keys['a']) this.entity.xVelocity = -this.entity.speed;
        else this.entity.xVelocity = 0;

        if (Player.keys['w']) this.entity.yVelocity = -this.entity.speed;
        else if (Player.keys['s']) this.entity.yVelocity = this.entity.speed;
        else this.entity.yVelocity = 0;

        if(Player.keys['e']) this.entity.polygon.rotation -= this.entity.rotationSpeed;
        else if (Player.keys['q']) this.entity.polygon.rotation += this.entity.rotationSpeed;
        
    }

    update(dt)
    {
        this.entity.update(dt);
    }
}