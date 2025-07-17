import { crossProduct, dotProduct, subtractVectors, Vector2D } from "../utils/maths.js";
import { Rigidbody } from "../components/rigidbody.js";
import { Transform } from "../components/transform.js";
import { findContactPointsPolygon, SAT } from "../utils/collisions.js";
import { drawPoint } from "./render.js";

export class PhysicsEngine
{
    //refactor resolve collisions into one method
    
    constructor(entityManager, gravity = {x:0,y:9.8})
    {
        this.entityManager = entityManager;
        this.gravity = gravity;

        this.entities = this.entityManager.getAllPhysicalEntities();
    }

    update(dt)
    {

        this.entities = this.entityManager.getAllPhysicalEntities();

        for (let entity of this.entities)
        { 
            const transform = entity.getComponent(Transform);
            const rb = entity.getComponent(Rigidbody);

            //Rotation
            let angularAcceleration = 0;

            if(rb.rotationalInertia !== Infinity)
            {
                angularAcceleration = rb.torque / rb.rotationalInertia;
            }

            rb.angularVelocity += angularAcceleration * dt;

            rb.angularVelocity *= Math.exp(-rb.angularDamping * dt);

            if (Math.abs(rb.angularVelocity) < 0.1 * dt) rb.angularVelocity = 0;

            transform.rotationRAD += rb.angularVelocity * dt;

            rb.torque = 0;

            //Position

            if(rb.affectedByGravity && rb.mass != Infinity)
            {
                rb.linearVelocity.x += this.gravity.x * dt;
                rb.linearVelocity.y += this.gravity.y * dt;
            }

            let linearAccelerationX = 0;
            let linearAccelerationY = 0;
            
            if (rb.mass !== 0) 
            {
                linearAccelerationX = rb.force.x / rb.mass;
                linearAccelerationY = rb.force.y / rb.mass;
            }

            rb.linearVelocity.x += linearAccelerationX * dt;
            rb.linearVelocity.y += linearAccelerationY * dt;

            rb.linearVelocity.x *= Math.exp(-rb.linearDamping.x * dt); 
            rb.linearVelocity.y *= Math.exp(-rb.linearDamping.y * dt);
            
            if (rb.linearVelocity.magnitude() < 0.1 * dt) rb.linearVelocity = Vector2D.zero;
            
            transform.position.x += rb.linearVelocity.x * dt;
            transform.position.y += rb.linearVelocity.y * dt;

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

        if(dotProduct(relativeVelocity, collisionResult.normal) > 0) return;

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

    resolveCollisionsBasicPolygon(entityA, entityB)
    {
        if(!entityA.hasCollisions || !entityB.hasCollisions) return;

        let collisionResult = SAT(this.entityManager ,entityA, entityB);

        if(collisionResult.collision)
        {

            if(entityA.getComponent(Rigidbody).mass === Infinity && entityB.getComponent(Rigidbody).mass === Infinity)
            {
                return;
            }

            if (entityA.getComponent(Rigidbody).mass === Infinity)
            {
                this.entityManager.move(entityB, { x: collisionResult.normal.x * collisionResult.depth,
                y: collisionResult.normal.y * collisionResult.depth});
            }
            else if (entityB.getComponent(Rigidbody).mass === Infinity)
            {
                this.entityManager.move(entityA,{x: -collisionResult.normal.x * collisionResult.depth,
                y: -collisionResult.normal.y * collisionResult.depth});
            }
            else
            {
                this.entityManager.move(entityA, {x: -collisionResult.normal.x * collisionResult.depth / 2,
                y: -collisionResult.normal.y * collisionResult.depth / 2 });

                this.entityManager.move(entityB, {x: collisionResult.normal.x * collisionResult.depth / 2,
                y: collisionResult.normal.y * collisionResult.depth / 2 });
            }

            this.impulseCorrection(entityA,entityB,collisionResult);
        }
    }

    applyCorrectionForces(entityA, entityB, collisionResult, contactResult)
    {
        const bodyA = entityA.getComponent(Rigidbody);
        const bodyB = entityB.getComponent(Rigidbody);
        const transformA = entityA.getComponent(Transform);
        const transformB = entityB.getComponent(Transform);

        const contactList = contactResult ? [contactResult.contactOne, contactResult.contactTwo] : [];

        const impulses = [];

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

            if(dotProduct(relativeVelocity, collisionResult.normal) > 0) return;

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
                normal: normal,
                ra: ra,
                rb: rb
            });

        }

        for (let i = 0; i < impulses.length; i++) 
        {
            const { j, normal, ra, rb } = impulses[i];

            const impulseVec = {
                x: normal.x * j,
                y: normal.y * j
            };

            if (!ra || !rb) 
            {
                console.warn(`Impulse at index ${i} is missing ra/rb`, impulses[i]);
                continue;
            }

            const FIX = 0.025;

            

            const invInertiaA = (bodyA.rotationalInertia === Infinity || bodyA.rotationalInertia === 0) ? 0 : (1 / bodyA.rotationalInertia);
            const invInertiaB = (bodyB.rotationalInertia === Infinity || bodyB.rotationalInertia === 0) ? 0 : (1 / bodyB.rotationalInertia);


            bodyA.linearVelocity.x -= impulseVec.x * bodyA.inverseMass;
            bodyA.linearVelocity.y -= impulseVec.y * bodyA.inverseMass;
            bodyA.angularVelocity += -crossProduct(ra, impulseVec) * invInertiaA;

            bodyB.linearVelocity.x += impulseVec.x * bodyB.inverseMass;
            bodyB.linearVelocity.y += impulseVec.y * bodyB.inverseMass;
            bodyB.angularVelocity += crossProduct(rb, impulseVec) * invInertiaB;
        }       
    }

    resolveCollisionsWRotationsPolygon(entityA, entityB ,ctx = null)
    {
        if(!entityA.hasCollisions || !entityB.hasCollisions) return;

        let collisionResult = SAT(this.entityManager ,entityA, entityB);

        if(collisionResult.collision)
        {
          
            if(entityA.getComponent(Rigidbody).mass === Infinity && entityB.getComponent(Rigidbody).mass === Infinity)
            {
                return;
            }

            if (entityA.getComponent(Rigidbody).mass === Infinity)
            {
                this.entityManager.move(entityB, { x: collisionResult.normal.x * collisionResult.depth,
                y: collisionResult.normal.y * collisionResult.depth});
            }
            else if (entityB.getComponent(Rigidbody).mass === Infinity)
            {
                this.entityManager.move(entityA,{x: -collisionResult.normal.x * collisionResult.depth,
                y: -collisionResult.normal.y * collisionResult.depth});
            }
            else
            {
                this.entityManager.move(entityA, {x: -collisionResult.normal.x * collisionResult.depth / 2,
                y: -collisionResult.normal.y * collisionResult.depth / 2 });

                this.entityManager.move(entityB, {x: collisionResult.normal.x * collisionResult.depth / 2,
                y: collisionResult.normal.y * collisionResult.depth / 2 });
            }


            let contactResult = findContactPointsPolygon(this.entityManager,entityA,entityB);

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



