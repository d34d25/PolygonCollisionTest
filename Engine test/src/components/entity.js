//entity is the container for the rest of components
import { Vector2D } from "../utils/maths.js";
import { Polygon } from "./polygon.js";
import { Rigidbody } from "./rigidbody.js";
import { Transform } from "./transform.js";

export class Entity
{
    constructor(components = [], hasCollisions = true) 
    {
        this.components = new Map();

        for (const component of components) 
        {
            this.addComponent(component);
        }

        this._tempMovement = new Vector2D();
        this.hasCollisions = hasCollisions;
    }


    getWorldVertices()
    {
        if(!this.hasComponent(Polygon) || !this.hasComponent(Transform)) return;

        const transform = this.getComponent(Transform);
        const polygon = this.getComponent(Polygon);

        const cos = Math.cos(transform.rotationRAD);
        const sin = Math.sin(transform.rotationRAD);
        const pos = transform.position;

        return polygon.localVertices.map(({ x, y }) => ({
            x: pos.x + x * cos - y * sin,
            y: pos.y + x * sin + y * cos
        }));
    }

    move(amount)
    {
        const transform = this.getComponent(Transform);
        if (transform) transform.move(amount);
    }

    update(dt) 
    {
        const transform = this.getComponent(Transform);
        const rb = this.getComponent(Rigidbody);

        if (!transform || !rb) return;

        transform.rotationRAD += rb.angularVelocity * dt;

        this._tempMovement.x = rb.linearVelocity.x;
        this._tempMovement.y = rb.linearVelocity.y;

        this._tempMovement.scale(dt);
        transform.move(this._tempMovement);
    }



    addComponent(component) 
    {
        if (this.components.has(component.constructor)) 
        {
            console.warn(`Component of type ${component.constructor.name} already exists!`);
            return false;
        }

        this.components.set(component.constructor, component);
    }

    getComponent(componentClass) 
    {
        return this.components.get(componentClass);
    }

    hasComponent(componentClass) 
    {
        return this.components.has(componentClass);
    }

    removeComponent(componentClass) 
    {
        this.components.delete(componentClass);
    }

}



//(transform = new Transform(), polygon = new Polygon(), rb = new Rigidbody(), hasCollisions = true)
      //this.transform = transform;
        //this.polygon = polygon;
        //this.rb = rb;


//this.collider = { transform: this.transform, polygon: this.polygon };