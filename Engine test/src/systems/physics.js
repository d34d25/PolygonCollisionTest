import { dotProduct, subtractVectors, Vector2D } from "../utils/maths.js";
import { Rigidbody } from "../components/rigidbody.js";
import { Transform } from "../components/transform.js";
import { SAT } from "../utils/collisions.js";

export class PhysicsEngine
{
    constructor(entities = [])
    {
        this.entities = entities;

        for (let entity of entities) 
        {
            this.warn(entity);
        }
    }


    update(dt)
    {
        for (let entity of this.entities)
        {
            this.warn(entity);

            const transform = entity.getComponent(Transform);
            const rb = entity.getComponent(Rigidbody);

            // Update rotation
            transform.rotationRAD += rb.angularVelocity * dt;

            // Calculate acceleration = force / mass
            let accelerationX = 0;
            let accelerationY = 0;
            
            if (rb.mass !== 0) 
            {
                accelerationX = rb.force.x / rb.mass;
                accelerationY = rb.force.y / rb.mass;
            }

            // Update linear velocity: velocity += acceleration * dt
            rb.linearVelocity.x += accelerationX * dt;
            rb.linearVelocity.y += accelerationY * dt;

            // Apply linear damping: velocity *= (1 - linearDamping * 0.01)
            const dampingFactor = 1 - rb.linearDamping * 0.01;
            rb.linearVelocity.x *= dampingFactor;
            rb.linearVelocity.y *= dampingFactor;

            //rb.linearVelocity.normalize();

            if(rb.linearVelocity.magnitude() < 1) rb.linearVelocity = Vector2D.zero;
            

            // Calculate movement: velocity * dt
            const movementX = rb.linearVelocity.x * dt;
            const movementY = rb.linearVelocity.y * dt;

            // Update position
            transform.position.x += movementX;
            transform.position.y += movementY;

            // Reset force
            rb.force.x = 0;
            rb.force.y = 0;

            //console.log("x pos:" + transform.position.x);
            //console.log("y pos:" + transform.position.y);
        }
    }

    impulseCorrection(entityA, entityB, collisionResult)
    {
        const bodyA = entityA.getComponent(Rigidbody);
        const bodyB = entityB.getComponent(Rigidbody);

        let relativeVelocity = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);

        let e;

        if (bodyA.mass === Infinity) 
        {
            e = bodyB.restitution;
        } 
        else if (bodyB.mass === Infinity) 
        {
            e = bodyA.restitution;
        } 
        else 
        {
            e = Math.min(bodyA.restitution, bodyB.restitution);
        }

        let j = -(1 + e) * dotProduct(relativeVelocity, collisionResult.normal);;

        j /= (1 / bodyA.mass) + (1/bodyB.mass);

        bodyA.linearVelocity.x -= j /bodyA.mass * collisionResult.normal.x; 
        bodyA.linearVelocity.y -= j /bodyA.mass * collisionResult.normal.y; 

        bodyB.linearVelocity.x += j /bodyB.mass * collisionResult.normal.x; 
        bodyB.linearVelocity.y += j /bodyB.mass * collisionResult.normal.y;
    }

    resolveCollisions(entityA, entityB)
    {
        if(!entityA.hasCollisions || !entityB.hasCollisions) return;

        let collisionResult = SAT(entityA, entityB);

        if(collisionResult.collision)
        {

            let half = 2;

            if (entityB.getComponent(Rigidbody).mass === Infinity)
            {
                half = 1;
            }
            else
            {
                half = 2;
            }

            const correction = {
                x: -collisionResult.normal.x * collisionResult.depth / half,
                y: -collisionResult.normal.y * collisionResult.depth / half 
            };

            const correctionB = {
                x: collisionResult.normal.x * collisionResult.depth /half,
                y: collisionResult.normal.y * collisionResult.depth /half
            };

            entityA.moveIfNotStatic(correction);
            entityB.moveIfNotStatic(correctionB);

            this.impulseCorrection(entityA,entityB,collisionResult);
        }
    }


    warn(entity)
    {
        let hasRB = entity.hasComponent(Rigidbody);
        let hasTransform = entity.hasComponent(Transform);

        if (!hasRB || !hasTransform) {
            let entityId = entity.id;
            console.warn(`Entity ${entityId} is missing components: 
            ${
                !hasRB ? 'Rigidbody ' : ''
            }${
                !hasTransform ? 'Transform' : ''
            }`);
        }
    }
}