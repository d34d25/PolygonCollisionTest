//entity is the container for the rest of components
import { Polygon } from "./polygon.js";
import { Rigidbody } from "./rigidbody.js";
import { Transform } from "./transform.js";

export class Entity
{
    static nextId = 1;

    constructor(components = [], hasCollisions = true) 
    {
        this.id = Entity.nextId++;
        this.components = new Map();

        for (const component of components) 
        {
            this.addComponent(component);
        }

        this.hasCollisions = hasCollisions;
    }

    getWorldVertices()
    {
        if(!this.hasComponent(Polygon) || !this.hasComponent(Transform))
        {
            console.warn("A Polygon and a Transform need to be attached")
            return [];
        }

        const transform = this.getComponent(Transform);
        const polygon = this.getComponent(Polygon);

        const cos = Math.cos(transform.rotationRAD);
        const sin = Math.sin(transform.rotationRAD);
        const pos = transform.position;
        const scale = transform.scale;

        return polygon.localVertices.map(({ x, y }) => {
            const scaledX = x * scale.x;
            const scaledY = y * scale.y;

            return {
                x: pos.x + scaledX * cos - scaledY * sin,
                y: pos.y + scaledX * sin + scaledY * cos
            };
        });
    }

    getArea() 
    {
        if(!this.hasComponent(Polygon) || !this.hasComponent(Transform))
        {
            console.warn("A Polygon and a Transform need to be attached")
            return 0;
        }

        const polygon = this.getComponent(Polygon);
        const transform = this.getComponent(Transform);

        const localArea = polygon.getLocalArea();
        const { x: sx, y: sy } = transform.scale;

        return localArea * Math.abs(sx * sy);
    }

    move(amount)
    {
        if(!this.hasComponent(Transform))
        {
            console.warn("A Transform needs to be attached")
        }

        const transform = this.getComponent(Transform);
        transform.move(amount);
    }

    moveIfNotStatic(amount)
    {
        if(!this.hasComponent(Rigidbody) || !this.hasComponent(Transform))
        {
            console.warn("A Rigidbody and a Transform need to be attached")
            return;
        }

        const transform = this.getComponent(Transform);
        const rb = this.getComponent(Rigidbody);

        if(rb.mass !== Infinity) transform.move(amount);
        else return;
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
