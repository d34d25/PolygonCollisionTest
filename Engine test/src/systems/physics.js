import { addVectors, crossProduct, dotProduct, scaleVector, subtractVectors, Vector2D } from "../utils/maths.js";
import { Rigidbody } from "../components/rigidbody.js";
import { Transform } from "../components/transform.js";
import { circleVsCircle, circleVsPolygon, findContactPoints, SAT } from "../utils/collisions.js";
import { drawCircle } from "./render.js";
import { Polygon } from "../components/shapes/polygon.js";
import { Circle } from "../components/shapes/circle.js";

export class PhysicsEngine
{
    //refactor resolve collisions into one method
    
    constructor(entityManager, gravity = {x:0,y:9.8})
    {
        this.entityManager = entityManager;
        this.gravity = gravity;

        this.entities = this.entityManager.getAllPhysicalEntities();
        this.GRAVITY_MULTIPLIER = 100;


        this.contactList = [];
        this.impulses = [];
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

            let linearAccelerationX = 0;
            let linearAccelerationY = 0;
            

            

            if (rb.mass !== 0) 
            {
                linearAccelerationX = rb.force.x / rb.mass;
                linearAccelerationY = rb.force.y / rb.mass;
            }
            

            rb.linearVelocity.x += linearAccelerationX * dt;
            rb.linearVelocity.y += linearAccelerationY * dt;
            
            if(rb.affectedByGravity && rb.mass != Infinity)
            {
                rb.linearVelocity.x += this.gravity.x * this.GRAVITY_MULTIPLIER * dt;
                rb.linearVelocity.y += this.gravity.y * this.GRAVITY_MULTIPLIER * dt;
            }

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

    finalUpdate(dt)
    {
         for (let entity of this.entities)
        {
            const transform = entity.getComponent(Transform);
            const rb = entity.getComponent(Rigidbody);

            transform.position.x += rb.linearVelocity.x * dt;
            transform.position.y += rb.linearVelocity.y * dt;
        }
    }



    resolveCollisions(entityA, entityB, hasRotations = true , ctx = null)
    {
        if(hasRotations)
        {
            this.resolveCollisionsWRotations(entityA, entityB, ctx);
        }
        else
        {
            this.resolveCollisionsBasic(entityA, entityB);
        }

    }

    impulseCorrection(entityA, entityB, collisionResult, entityAStatic, entityBStatic)
    {
        const bodyA = entityA.getComponent(Rigidbody);
        const bodyB = entityB.getComponent(Rigidbody);

        let relativeVelocity = subtractVectors(bodyB.linearVelocity, bodyA.linearVelocity);

        if(dotProduct(relativeVelocity, collisionResult.normal) > 0) return;

        let e;

        if (bodyA.mass === Infinity || entityAStatic ) 
        {
            e = bodyB.restitution;
        } 
        else if (bodyB.mass === Infinity || entityBStatic) 
        {
            e = bodyA.restitution;
        } 
        else 
        {
            e = Math.min(bodyA.restitution, bodyB.restitution);
        }

        let j = -(1 + e) * dotProduct(relativeVelocity, collisionResult.normal);;

        j /= bodyA.inverseMass + bodyB.inverseMass;


        console.log("RelVel:", relativeVelocity);
        console.log("Dot(relVel, normal):", dotProduct(relativeVelocity, collisionResult.normal));
        console.log("Restitution e:", e);
        console.log("Impulse scalar j:", j);
        console.log("Impulse vector:", {
            x: j * collisionResult.normal.x,
            y: j * collisionResult.normal.y
        });
        console.log("Velocity before:", JSON.stringify(bodyA.linearVelocity));


        if(!entityAStatic)
        {
            bodyA.linearVelocity.x -= j * bodyA.inverseMass * collisionResult.normal.x;
            bodyA.linearVelocity.y -= j * bodyA.inverseMass * collisionResult.normal.y;


        }
        
        if(!entityBStatic)
        {
            bodyB.linearVelocity.x += j * bodyB.inverseMass * collisionResult.normal.x;
            bodyB.linearVelocity.y += j * bodyB.inverseMass * collisionResult.normal.y;

        }

        console.log("Velocity after:", JSON.stringify(bodyA.linearVelocity));


        
    }

    resolveCollisionsBasic(entityA, entityB)
    {
        let entityAStatic = entityA.getComponent(Rigidbody).mass === Infinity;
        let entityBStatic = entityB.getComponent(Rigidbody).mass === Infinity;

        if ((!entityA.hasCollisions || entityAStatic) && (!entityB.hasCollisions || entityBStatic)) 
        {
            return;
        }

        let collisionResult;

        if(entityA.hasComponent(Polygon) && entityB.hasComponent(Polygon))
        {
            collisionResult = SAT(this.entityManager ,entityA, entityB);
        }
        else if(entityA.hasComponent(Circle) && entityB.hasComponent(Circle))
        {
            collisionResult = circleVsCircle(entityA,entityB);
        }
        else if (entityA.hasComponent(Circle) && entityB.hasComponent(Polygon))
        {
            collisionResult = circleVsPolygon(this.entityManager, entityA,entityB);
        }
        else if (entityA.hasComponent(Polygon) && entityB.hasComponent(Circle))
        {
            collisionResult = circleVsPolygon(this.entityManager, entityB,entityA);
        }

        if(collisionResult.collision)
        {

            if(entityAStatic && entityBStatic)
            {
                return;
            }

            if (entityAStatic)
            {
                this.entityManager.move(entityB, { x: collisionResult.normal.x * collisionResult.depth,
                y: collisionResult.normal.y * collisionResult.depth});
            }
            else if (entityBStatic)
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

            this.impulseCorrection(entityA,entityB,collisionResult, entityAStatic, entityBStatic);
        }
    }


    countContactsOnEntity(entity, contactResult) 
    {
        let count = 0;
        if (!contactResult) return 0;
        
        const contacts = [contactResult.contactOne, contactResult.contactTwo].filter(Boolean);
        for (const c of contacts) {
            if (isContactOnEntity(c, entity)) count++;
        }
        return count;
    }

    applyCorrectionForces(entityA, entityB, collisionResult, contactResult, entityAStatic, entityBStatic)
    {
        const bodyA = entityA.getComponent(Rigidbody);
        const bodyB = entityB.getComponent(Rigidbody);
        const transformA = entityA.getComponent(Transform);
        const transformB = entityB.getComponent(Transform);

        this.contactList = contactResult ? [contactResult.contactOne, contactResult.contactTwo] : [];

        this.impulses = [];

        for (let i = 0; i < contactResult.rContactCount; i++) 
        {
            let normal = collisionResult.normal;

            const contact = this.contactList[i];

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

            if(dotProduct(relativeVelocity, collisionResult.normal) > 0) continue;

            let contactVelMagnitude = dotProduct(relativeVelocity, normal);

            if (contactVelMagnitude > 0) 
            {
                continue;
            }

            const raNormalDot = dotProduct(raNormal, normal);
            const rbNormalDot = dotProduct(rbNormal, normal);

            let e;

            if (entityAStatic) 
            {
                e = bodyB.restitution;
            } 
            else if (entityBStatic) 
            {
                
                e = bodyA.restitution;
            } 
            else 
            {
                e = Math.min(bodyA.restitution, bodyB.restitution);
            }

            if(entityA.hasComponent(Polygon) && entityB.hasComponent(Polygon))
            {
                const polyA = entityA.getComponent(Polygon);
                const polyB = entityB.getComponent(Polygon);
                let poly = polyA.localVertices.length < polyB.localVertices.length ? polyB : polyA;
        
                const vertexCount = poly.localVertices.length;

                if(contactResult.rContactCount > 1)
                {
                    e *= vertexCount;
                }
            }
            

            
            let denominator = bodyA.inverseMass + bodyB.inverseMass + (raNormalDot * raNormalDot) * bodyA.inverseRotateInertia + (rbNormalDot * rbNormalDot) * bodyB.inverseRotateInertia;            

            let j = -(1 + e) * contactVelMagnitude;
            j /= denominator;
            j /= contactResult.rContactCount;


            this.impulses.push({
                j: j,
                normal: normal,
                ra: ra,
                rb: rb
            });

        }

        for (let i = 0; i < this.impulses.length; i++) 
        {
            const { j, normal, ra, rb } = this.impulses[i];

            const impulseVec = {
                x: normal.x * j,
                y: normal.y * j
            };

            if (!ra || !rb) 
            {
                console.warn(`Impulse at index ${i} is missing ra/rb`, impulses[i]);
                continue;
            }
            
            console.log("j:", j);
            console.log("ra:", ra);
            console.log("rb:", rb);
            console.log("angularVelocity change A:", -crossProduct(ra, impulseVec) * bodyA.inverseRotateInertia);
            console.log("angularVelocity change B:", crossProduct(rb, impulseVec) * bodyB.inverseRotateInertia);

            bodyA.linearVelocity.x -= impulseVec.x * bodyA.inverseMass;
            bodyA.linearVelocity.y -= impulseVec.y * bodyA.inverseMass;
            bodyA.angularVelocity += -crossProduct(ra, impulseVec) * bodyA.inverseRotateInertia;

            bodyB.linearVelocity.x += impulseVec.x * bodyB.inverseMass;
            bodyB.linearVelocity.y += impulseVec.y * bodyB.inverseMass;
            bodyB.angularVelocity += crossProduct(rb, impulseVec) * bodyB.inverseRotateInertia;
            
        }       
    }   

    resolveCollisionsWRotations(entityA, entityB, ctx = null)
    {
        if(!entityA.hasCollisions || !entityB.hasCollisions) return;

        let entityAStatic = entityA.getComponent(Rigidbody).mass === Infinity;
        let entityBStatic = entityB.getComponent(Rigidbody).mass === Infinity;; 

        let collisionResult;

        if(entityA.hasComponent(Polygon) && entityB.hasComponent(Polygon))
        {
            collisionResult = SAT(this.entityManager ,entityA, entityB);
        }
        else if(entityA.hasComponent(Circle) && entityB.hasComponent(Circle))
        {
            collisionResult = circleVsCircle(entityA,entityB);
        }
        else if (entityA.hasComponent(Circle) && entityB.hasComponent(Polygon))
        {
            collisionResult = circleVsPolygon(this.entityManager, entityA,entityB);
        }
        else if (entityA.hasComponent(Polygon) && entityB.hasComponent(Circle))
        {
            collisionResult = circleVsPolygon(this.entityManager, entityB,entityA);
        }

        

        if(collisionResult.collision)
        {
          
            if(entityAStatic && entityBStatic)
            {
                return;
            }

            if (entityAStatic)
            {
                this.entityManager.move(entityB, { x: collisionResult.normal.x * collisionResult.depth,
                y: collisionResult.normal.y * collisionResult.depth});
            }
            else if (entityBStatic)
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


            let contactResult = findContactPoints(this.entityManager,entityA,entityB);//findContactPointsPolygon(this.entityManager,entityA,entityB);

            this.logContactPoints(contactResult, ctx);

            this.applyCorrectionForces(entityA,entityB,collisionResult, contactResult, entityAStatic, entityBStatic);
        }        
    }

    logContactPoints(contactResult, ctx)
    {
            if (ctx && contactResult.rContactCount >= 1)
                drawCircle(ctx, contactResult.contactOne, 'red');
            if (ctx && contactResult.rContactCount === 2)
                drawCircle(ctx, contactResult.contactTwo, 'red');
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



