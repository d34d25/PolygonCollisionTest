import { Polygon } from "../components/shapes/polygon.js";
import { Rigidbody } from "../components/rigidbody.js";
import { Transform } from "../components/transform.js";
import { Circle } from "../components/shapes/circle.js";
import { Entity } from "../components/entity.js";
import {EntityGroup} from "../components/entityGroup.js";
import { distance } from "../utils/maths.js";

export class EntityManager
{
    constructor()
    {
        this.entities = new Set();
        this.entityGroups = new Set();
    }

    getPolygonSize(entity)
    {
        if(entity.hasComponent(Circle))
        {
            return;
        }

        if(!entity.hasComponent(Polygon) || !entity.hasComponent(Transform))
        {
            console.warn("A Polygon and a Transform need to be attached")
            return 0;
        }

        if (entity.getComponent(Polygon).type != 'box')
        {
            console.warn("shape type is not box");
            return {width: 0, height: 0};
        }
        else
        {
            const worldVerts = this.getWorldVertices(entity);
            if (worldVerts.length === 0) return { width: 0, height: 0 };
            
            let minX = worldVerts[0].x;
            let maxX = worldVerts[0].x;
            let minY = worldVerts[0].y;
            let maxY = worldVerts[0].y;

            for (let i = 1; i < worldVerts.length; i++)
            {
                const v = worldVerts[i];
                if (v.x < minX) minX = v.x;
                if (v.x > maxX) maxX = v.x;
                if (v.y < minY) minY = v.y;
                if (v.y > maxY) maxY = v.y;
            }

            return {
                width: maxX - minX,
                height: maxY - minY
            };

        }
    }
    
    calculateRotationalInertia(entity) 
    {
        if (!entity.hasComponent(Rigidbody)) return 1;

        const rb = entity.getComponent(Rigidbody);

        if (entity.hasComponent(Polygon))
        {
            const polygon = entity.getComponent(Polygon);

            if (polygon.type === 'box') 
            {
                const size = this.getPolygonSize(entity);
                return (1 / 12) * rb.mass * (size.width ** 2 + size.height ** 2);
            }

            if (polygon.type === 'triangle') 
            {
                const verts = this.getWorldVertices(entity);

                if (verts.length !== 3) 
                {
                    console.warn("Triangle must have exactly 3 vertices.");
                    return 1;
                }

                const a = distance(verts[0], verts[1]);
                const b = distance(verts[1], verts[2]);
                const c = distance(verts[2], verts[0]);

                return (rb.mass / 36) * (a * a + b * b + c * c);
            }

        }

        if (entity.hasComponent(Circle)) 
        {
            const circle = entity.getComponent(Circle);
            return 0.5 * rb.mass * (circle.radius ** 2);
        }

        return 1;
    }

    getWorldVertices(entity) 
    {
        if(entity.hasComponent(Circle))
        {
            return [];
        }
        
        if (!entity.hasComponent(Polygon) || !entity.hasComponent(Transform)) 
        {
            console.warn(`Entity ${entity.id}: missing Polygon or Transform`);
            return [];
        }

        const polygon = entity.getComponent(Polygon);
        const transform = entity.getComponent(Transform);

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


    move(entity ,amount)
    {
        if(!entity.hasComponent(Transform))
        {
            console.warn("A Transform needs to be attached")
        }

        const transform = entity.getComponent(Transform);
        transform.move(amount);
    }



    getPolygonArea(entity) 
    {
        if(!entity.hasComponent(Polygon) || !entity.hasComponent(Transform))
        {
            console.warn("A Polygon and a Transform need to be attached")
            return 0;
        }

        const polygon = entity.getComponent(Polygon);
        const transform = entity.getComponent(Transform);

        const localArea = polygon.getLocalArea();
        const { x: sx, y: sy } = transform.scale;

        return localArea * Math.abs(sx * sy);
    }


    createPhysicalEntity(size = 20, shape = 'box' ,hasGravity = false, staticEntity = false, rotates = true)
    {

        if (typeof size !== 'number' || size <= 0) 
        {
            throw new Error(`Invalid size: ${size}`);
        }

        let entityShape;

        let isBox = shape === 'box';
        let isTriangle = shape === 'triangle';
        let isCircle = shape === 'circle';

        const entity = new Entity([new Transform(), new Rigidbody(staticEntity)]);
        
        const rb = entity.getComponent(Rigidbody);
        

        if( isBox || isTriangle)
        {
            entity.addComponent(new Polygon());

            entityShape = entity.getComponent(Polygon);

            if(isBox) entityShape.createBox(size);
            else if (isTriangle) entityShape.createTriangle(size);

        }
        else if (isCircle)
        {
            entity.addComponent(new Circle(size))
            entityShape = entity.getComponent(Circle);
        }
        else if (!isBox && !isTriangle && !isCircle) 
        {
            throw new Error(`Unsupported shape type: ${shape}`);
        }

 
        rb.affectedByGravity = hasGravity;
        
        if(!rotates)
        {
            rb.rotationalInertia = Infinity;
        }
        else
        {
            rb.rotationalInertia = this.calculateRotationalInertia(entity);
        }

        this.addEntity(entity);

        return entity;
    }

    addEntity(entity) 
    {
        if (!this.entities.has(entity)) this.entities.add(entity);     
    }

    removeEntity(entity) 
    {
        this.entities.delete(entity);
    }

    addEntityGroup(group) 
    {
        if (!this.entityGroups.has(group)) 
        {
            this.entityGroups.add(group);

            for (const entity of group.getEntities()) 
            {
                this.addEntity(entity);
            }
        }
    }

    removeEntityGroup(group) 
    {
        if (this.entityGroups.has(group)) 
        {
            this.entityGroups.delete(group);

            for (const entity of group.getEntities()) 
            {
                this.removeEntity(entity);
            }
        }
    }

    getAllPhysicalEntities() 
    {
        return Array.from(this.entities).filter(entity =>
            entity.hasComponent(Rigidbody) &&
            entity.hasComponent(Transform) &&
            (entity.hasComponent(Polygon) || entity.hasComponent(Circle))
        );
    }

    getAllEntities() 
    {
        return Array.from(this.entities);
    }

    getEntityById(id) 
    {
        for (const entity of this.entities) 
        {
            if (entity.id === id) return entity;
        }
        return null;
    }


}