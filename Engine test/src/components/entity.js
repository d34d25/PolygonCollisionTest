//entity is the container for the rest of components
import { Vector2D } from "../utils/maths.js";
import { Polygon } from "./polygon.js";
import { Rigidbody } from "./rigidbody.js";
import { Transform } from "./transform.js";

export class Entity
{
    constructor(transform = new Transform(), polygon = new Polygon(), rb = new Rigidbody(), hasCollisions = true)
    {
        this.transform = transform;
        this.polygon = polygon;
        this.rb = rb;

        this._tempMovement = new Vector2D();

        this.hasCollisions = hasCollisions;
    }


    getWorldVertices()
    {
        const cos = Math.cos(this.transform.rotationRAD);
        const sin = Math.sin(this.transform.rotationRAD);
        const pos = this.transform.position;

        return this.polygon.localVertices.map(({ x, y }) => ({
            x: pos.x + x * cos - y * sin,
            y: pos.y + x * sin + y * cos
        }));
    }

    move(amount)
    {
        this.transform.move(amount);
    }

    update(dt)
    {
        this.transform.rotationRAD += this.rb.angularVelocity * dt;

        this._tempMovement.x = this.rb.linearVelocity.x;
        this._tempMovement.y = this.rb.linearVelocity.y;

        this._tempMovement.scale(dt);
        this.transform.move(this._tempMovement);
    }
}






//this.collider = { transform: this.transform, polygon: this.polygon };