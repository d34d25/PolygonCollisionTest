export class Entity
{
    constructor(polygon, speed, rotationSpeed)
    {
        this.polygon = polygon;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed;

        this.xVelocity = 0;
        this.yVelocity = 0;
    }

    update(dt)
    {
        this.polygon.x += this.xVelocity * dt;
        this.polygon.y += this.yVelocity * dt;
    }
}