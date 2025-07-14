import { addVectors, clamp, crossProduct, dotProduct, multiplyVectors, subtractVectors, Vector2D } from "../utils/maths.js";
import { Rigidbody } from "../components/rigidbody.js";
import { Transform } from "../components/transform.js";
import { findContactPointsPolygon, SAT } from "../utils/collisions.js";
import { drawPoint } from "./render.js";

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
            let angularAcceleration = 0;

            if(rb.rotationalInertia !== Infinity)
            {
                angularAcceleration = rb.torque / rb.rotationalInertia;
            }

            rb.angularVelocity += angularAcceleration * dt;

            const angularDampingFactor = 1 - (rb.angularDamping ?? 0) * 0.01;
            rb.angularVelocity *= angularDampingFactor;

            transform.rotationRAD += rb.angularVelocity * dt;

            rb.torque = 0;

            // Calculate acceleration = force / mass
            let linearAccelerationX = 0;
            let linearAccelerationY = 0;
            
            if (rb.mass !== 0) 
            {
                linearAccelerationX = rb.force.x / rb.mass;
                linearAccelerationY = rb.force.y / rb.mass;
            }

            // Update linear velocity: velocity += acceleration * dt
            rb.linearVelocity.x += linearAccelerationX * dt;
            rb.linearVelocity.y += linearAccelerationY * dt;

            

            // Apply linear damping: velocity *= (1 - linearDamping * 0.01)
            const dampingFactor = 1 - rb.linearDamping * 0.01;
            rb.linearVelocity.x *= dampingFactor;
            rb.linearVelocity.y *= dampingFactor;


            if (rb.linearVelocity.magnitude() < 0.1) rb.linearVelocity = Vector2D.zero;
            if (Math.abs(rb.angularVelocity) < 0.1) rb.angularVelocity = 0;
            

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

    resolveCollisionsBasic(entityA, entityB)
    {
        if(!entityA.hasCollisions || !entityB.hasCollisions) return;

        let collisionResult = SAT(entityA, entityB);

        if(collisionResult.collision)
        {

            let half = 2;

            if (entityA.getComponent(Rigidbody).mass === Infinity || entityB.getComponent(Rigidbody).mass === Infinity)
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


    

    applyCorrectionForces(entityA, entityB, collisionResult, contactResult)
    {
        const bodyA = entityA.getComponent(Rigidbody);
        const bodyB = entityB.getComponent(Rigidbody);
        const transformA = entityA.getComponent(Transform);
        const transformB = entityB.getComponent(Transform);

        const contactList = [contactResult.contactOne, contactResult.contactTwo];

        const impulses = [];

        const raValues = [];
        const rbValues = [];

        for (let i = 0; i < contactResult.rContactCount; i++) 
        {
            let normal = collisionResult.normal;

            const contact = contactList[i];

            const ra = {
                x: contact.x - transformA.position.x,
                y: contact.y - transformA.position.y
            };

            const rb = {
                x: contact.x - transformB.position.x,
                y: contact.y - transformB.position.y
            };

            const raNormal = {x: -ra.y, y: ra.x};
            const rbNormal = {x: -rb.y, y: rb.x};

            const velA = {
                x: bodyA.linearVelocity.x + (-ra.y * bodyA.angularVelocity),
                y: bodyA.linearVelocity.y + (ra.x * bodyA.angularVelocity)
            };

            const velB = {
                x: bodyB.linearVelocity.x + (-rb.y * bodyB.angularVelocity),
                y: bodyB.linearVelocity.y + (rb.x * bodyB.angularVelocity)
            };

            const relativeVelocity = subtractVectors(velB, velA);


            let contactVelMagnitude = dotProduct(relativeVelocity, normal);

            if (contactVelMagnitude > 0) 
            {
                continue;
            }


            const raNormalDot = dotProduct(raNormal, normal);
            const rbNormalDot = dotProduct(rbNormal, normal);

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

            

            let denominator = (1 / bodyA.mass) + (1/bodyB.mass) + (raNormalDot * raNormalDot) * (1 / bodyA.rotationalInertia) + (rbNormalDot * rbNormalDot) * (1 / bodyB.rotationalInertia);            


            let j = -(1 + e) * contactVelMagnitude;

            j /= denominator;
            j /= contactResult.rContactCount;

            impulses.push({
                j: j,
                normal: normal
            });

            raValues[i] = ra;
            rbValues[i] = rb;

        }

        for (let i = 0; i < impulses.length; i++) 
        {
            const currentImpulse = impulses[i];
            const impulseVec = {
                x: currentImpulse.normal.x * currentImpulse.j,
                y: currentImpulse.normal.y * currentImpulse.j
            };

            const FIX = 0.025;

            bodyA.linearVelocity.x -= impulseVec.x * (1 / bodyA.mass);
            bodyA.linearVelocity.y -= impulseVec.y * (1 / bodyA.mass);
            bodyA.angularVelocity += -crossProduct(raValues[i], impulseVec) * (1 / bodyA.rotationalInertia) * FIX;

            bodyB.linearVelocity.x += impulseVec.x * (1 / bodyB.mass);
            bodyB.linearVelocity.y += impulseVec.y * (1 / bodyB.mass);
            bodyB.angularVelocity += crossProduct(rbValues[i], impulseVec) * (1 / bodyB.rotationalInertia) * FIX;
        }       
    }

    resolveCollisionsWRotations(entityA, entityB, ctx)
    {
        if(!entityA.hasCollisions || !entityB.hasCollisions) return;

        let collisionResult = SAT(entityA, entityB);

        if(collisionResult.collision)
        {

            let half = 1;

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


            let contactResult = findContactPointsPolygon(entityA,entityB);

            //this.logContactPoints(contactResult, ctx);

            this.applyCorrectionForces(entityA,entityB,collisionResult, contactResult);
        }        
    }


    logContactPoints(contactResult, ctx)
    {
            if (ctx && contactResult.rContactCount >= 1)
                drawPoint(ctx, contactResult.contactOne, 'red');
            if (ctx && contactResult.rContactCount === 2)
                drawPoint(ctx, contactResult.contactTwo, 'red');
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



