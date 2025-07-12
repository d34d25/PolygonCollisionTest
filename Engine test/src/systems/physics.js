import { dotProduct, subtractVectors } from "../utils/maths.js";
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

            if(rb.linearVelocity.x < 0.1) rb.linearVelocity.x = 0;
            if(rb.linearVelocity.y < 0.1) rb.linearVelocity.y = 0;

            // Calculate movement: velocity * dt
            const movementX = rb.linearVelocity.x * dt;
            const movementY = rb.linearVelocity.y * dt;

            // Update position
            transform.position.x += movementX;
            transform.position.y += movementY;

            // Reset force
            rb.force.x = 0;
            rb.force.y = 0;
        }
    }

    impulseCorrection(entityA, entityB, collisionResult)
    {
        const bodyA = entityA.getComponent(Rigidbody);
        const bodyB = entityB.getComponent(Rigidbody);

        let relativeVelocity = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);

        let e = Math.min(bodyA.bounciness, bodyB.bounciness);
        let j = (1 - e) * dotProduct(relativeVelocity, collisionResult.normal);

        j /= (1 / bodyA.mass) + (1/bodyB.mass);

        bodyA.linearVelocity.x += j /bodyA.mass * collisionResult.normal.x; 
        bodyA.linearVelocity.y += j /bodyA.mass * collisionResult.normal.y; 

        if(!bodyB.isStatic)
        {
            bodyB.linearVelocity.x -= j /bodyB.mass * collisionResult.normal.x; 
            bodyB.linearVelocity.y -= j /bodyB.mass * collisionResult.normal.y; 
        }    
    }

    resolveCollisions(entityA, entityB)
    {
        if(!entityA.hasCollisions || !entityB.hasCollisions) return;

        let collisionResult = SAT(entityA, entityB);

        if(collisionResult.collision)
        {
            const correction = {
                x: -collisionResult.normal.x * collisionResult.depth,
                y: -collisionResult.normal.y * collisionResult.depth
            };

            const correctionB = {
                x: collisionResult.normal.x * collisionResult.depth,
                y: collisionResult.normal.y * collisionResult.depth
            };

            entityA.move(correction);
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