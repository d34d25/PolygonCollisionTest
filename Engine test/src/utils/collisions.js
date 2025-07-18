import { Rigidbody } from "../components/rigidbody.js";
import { Circle } from "../components/shapes/circle.js";
import { Polygon } from "../components/shapes/polygon.js";
import { Shape } from "../components/shapes/shape.js";
import { Transform } from "../components/transform.js";
import { addVectors, almostEqual, almostEqualVector, distance, distanceSquared, dotProduct, LengthSquared, normalize, projectCircle, projectVertices, scaleVector, subtractVectors } from "./maths.js";

const DEFAULT_MARGIN = 0.005;//1 * (10 ** -26.5);//(10 ** -26.5);

function pointSegmentDistance(p, a, b) 
{
    let ab = {x:b.x - a.x, y: b.y - a.y};

    let ap = {x: p.x - a.x, y: p.y - a.y};

    let proj = dotProduct(ab, ap);
    let abLenSq = LengthSquared(ab);
    let d = proj / abLenSq;

    let cp;

    if(d <= 0)
    {
        cp = a;
    }
    else if(d >= 1)
    {
        cp = b;
    }
    else
    {
        cp = addVectors(a, scaleVector(ab, d));
    }

    let distanceSqrd = distanceSquared(p, cp);

    return {
        distanceSqrd: distanceSqrd,
        closestPoint: cp
    };
}

function closestPointOnPolygon(circleCenter, vertices)
{
    let result = -1;

    let minDist = Infinity;

    for(let i = 0; i < vertices.length; i++)
    {
        let currentVertex = vertices[i];
        let dist = distance(currentVertex, circleCenter);

        if(dist < minDist)
        {
            minDist = dist;
            result = i;
        }
    }

    return result;
    
}

function findContactPointsPolygon(manager ,entityA, entityB, contactResult) //out contact1, contact2, contactCount
{
    
    let worldVerticesA = manager.getWorldVertices(entityA);
    let worldVerticesB = manager.getWorldVertices(entityB);

    contactResult.contact1 = {x:0, y:0};
    contactResult.contact2 = {x:0, y:0};
    contactResult.rContactCount = 0;

    let minDistanceSq = Infinity;

    for (let pass = 0;  pass < 2; pass++)
    {
        if(pass === 1)
        {
            let tempVertices = worldVerticesB;
            worldVerticesB = worldVerticesA;
            worldVerticesA = tempVertices;
        }

        for (let i = 0; i < worldVerticesA.length; i++)
        {
            let currentVertexA = worldVerticesA[i];

            for (let j = 0; j < worldVerticesB.length; j++)
            {
                let currentVertexB = worldVerticesB[j];
                let nextVertexB = worldVerticesB[(j + 1) % worldVerticesB.length];

                let psd = pointSegmentDistance(currentVertexA, currentVertexB, nextVertexB);

                if(almostEqual(psd.distanceSqrd, minDistanceSq, DEFAULT_MARGIN))
                {
                    if (!almostEqualVector(psd.closestPoint, contactResult.contact1, DEFAULT_MARGIN))
                    {
                        contactResult.contact2 = psd.closestPoint;
                        contactResult.contactCount = 2;
                    }
                }
                else if(psd.distanceSqrd < minDistanceSq)
                {
                    minDistanceSq = psd.distanceSqrd;
                    contactResult.contactCount = 1;
                    contactResult.contact1 = psd.closestPoint;
                }
                
            }
        }

    }
    
    return {contactResult}; 
}

function findContactPointsCircle(entityA, entityB, contactResult)
{
    const centerA = entityA.getComponent(Transform).position;
    const centerB = entityB.getComponent(Transform).position;
    const radiusA = entityA.getComponent(Circle).radius;

    let ab = subtractVectors(centerB,centerA);
    let dir = normalize(ab);

    let contactPoint = addVectors(centerA, scaleVector(dir,radiusA));

    contactResult.contact1 = contactPoint;
    contactResult.contactCount = 1;

    return {contactResult};
}


function findContactPointsPolygonCircle(manager, entityA, entityB)
{
    
}

export function findContactPoints(manager, entityA, entityB)
{

    let contactResult = {
        contact1: {x: 0, y: 0},
        contact2: {x: 0, y: 0},
        contactCount: 0
    };
    
    if(entityA.hasComponent(Polygon) && entityB.hasComponent(Polygon))
    {
        findContactPointsPolygon(manager, entityA, entityB, contactResult);
    }
    else if (entityA.hasComponent(Circle) && entityB.hasComponent(Circle))
    {
        findContactPointsCircle(entityA, entityB, contactResult);
    }
    else if (entityA.hasComponent(Polygon) && entityB.hasComponent(Circle))
    {
        findContactPointsPolygonCircle(manager, entityA, entityB);
    }
    else if (entityA.hasComponent(Circle) && entityB.hasComponent(Polygon))
    {
        findContactPointsPolygonCircle(manager, entityB, entityA);
    }

    return {contactOne: contactResult.contact1, contactTwo: contactResult.contact2, rContactCount: contactResult.contactCount}; 

}

export function SAT(manager, entityA, entityB)
{

    if(canEntityBeTested(entityA) || canEntityBeTested(entityB))
    {
        return;
    }

    let depth = Infinity;

    let normal = {x:0, y:0};

    let axis = { x: 0, y: 0 };
    let edge = { x: 0, y: 0 };

    let worldVerticesA = manager.getWorldVertices(entityA);
    let worldVerticesB = manager.getWorldVertices(entityB);

    for (let i = 0; i < worldVerticesA.length; i++)
    {
        let va = worldVerticesA[i];
        let vb = worldVerticesA[(i +1) % worldVerticesA.length];

        edge.x = vb.x - va.x;
        edge.y = vb.y - va.y;

        axis.x = -edge.y;
        axis.y = edge.x;

        let length = Math.hypot(axis.x, axis.y);

        if(length != 0)
        {
            axis.x /= length;
            axis.y /= length;
        }
        
        let projectedVertexA = projectVertices(worldVerticesA, axis);
        let projectedVertexB = projectVertices(worldVerticesB, axis);

        let minA = projectedVertexA.min;
        let maxA = projectedVertexA.max;

        let minB = projectedVertexB.min;
        let maxB = projectedVertexB.max;

        if(minA >= maxB || minB >= maxA)
        {
            return { collision: false };
        }

        let axisDepth = Math.min(maxB - minA, maxA - minB);

        if(axisDepth < depth)
        {
            depth = axisDepth;
            normal.x = axis.x;
            normal.y = axis.y;
        }

    }

    for (let i = 0; i < worldVerticesB.length; i++)
    {
        let va = worldVerticesB[i];
        let vb = worldVerticesB[(i +1) % worldVerticesB.length];

        edge.x = vb.x - va.x;
        edge.y = vb.y - va.y;

        axis.x = -edge.y;
        axis.y = edge.x;

        let length = Math.hypot(axis.x, axis.y);

        if(length != 0)
        {
            axis.x /= length;
            axis.y /= length;
        }
        
        let projectedVertexA = projectVertices(worldVerticesA, axis);
        let projectedVertexB = projectVertices(worldVerticesB, axis);

        let minA = projectedVertexA.min;
        let maxA = projectedVertexA.max;

        let minB = projectedVertexB.min;
        let maxB = projectedVertexB.max;

        if(minA >= maxB || minB >= maxA)
        {
            return { collision: false };
        }

        let axisDepth = Math.min(maxB - minA, maxA - minB);

        if(axisDepth < depth)
        {
            depth = axisDepth;
            normal.x = axis.x;
            normal.y = axis.y;
        }

    }
    
    let centerA = entityA.getComponent(Transform).position;
    let centerB = entityB.getComponent(Transform).position;

    let direction = subtractVectors(centerB,centerA);

    if(dotProduct(direction, normal) < 0)
    {
        normal.x = -normal.x;
        normal.y = -normal.y;
    }

    return {collision: true, normal,depth};
}


export function circleVsPolygon(manager,entityA, entityB)
{
    if(canEntityBeTested(entityA) || canEntityBeTested(entityB))
    {
        //return;
    }
    
    let normal = {x:0, y:0};
    let depth = Infinity;

    let axis = { x: 0, y: 0 };
    let edge = { x: 0, y: 0 };

    let projectedVertexB = {min:0, max: 0};
    let projectedCirlce = {min:0, max: 0};

    let minA = 0;
    let maxA = 0;

    let minB = 0;
    let maxB = 0; 


    let axisDepth = 0;

    const circleACenter = entityA.getComponent(Transform).position;
    const circleARadius = entityA.getComponent(Circle).radius;

    let worldVerticesB = manager.getWorldVertices(entityB);

    for (let i = 0; i < worldVerticesB.length; i++)
    {
        let va = worldVerticesB[i];
        let vb = worldVerticesB[(i +1) % worldVerticesB.length];

        edge.x = vb.x - va.x;
        edge.y = vb.y - va.y;

        axis.x = -edge.y;
        axis.y = edge.x;

        let length = Math.hypot(axis.x, axis.y);

        if(length != 0)
        {
            axis.x /= length;
            axis.y /= length;
        }

        projectedVertexB = projectVertices(worldVerticesB, axis);
        projectedCirlce = projectCircle(circleACenter, circleARadius, axis);

        minA = projectedVertexB.min;
        maxA = projectedVertexB.max;

        minB = projectedCirlce.min;
        maxB = projectedCirlce.max;

        if(minA >= maxB || minB >= maxA)
        {
            return { collision: false };
        }

        axisDepth = Math.min(maxB - minA, maxA - minB);

        if(axisDepth < depth)
        {
            depth = axisDepth;
            normal.x = axis.x;
            normal.y = axis.y;
        }

    }

    let closestPointIndex = closestPointOnPolygon(circleACenter, worldVerticesB);

    let closestPoint = worldVerticesB[closestPointIndex];

    axis = subtractVectors(closestPoint, circleACenter);

    projectedVertexB = projectVertices(worldVerticesB, axis);
    projectedCirlce = projectCircle(circleACenter, circleARadius, axis);

    minA = projectedVertexB.min;
    maxA = projectedVertexB.max;

    minB = projectedCirlce.min;
    maxB = projectedCirlce.max;

    if(minA >= maxB || minB >= maxA)
    {
        return { collision: false };
    }

    axisDepth = Math.min(maxB - minA, maxA - minB);

    if(axisDepth < depth)
    {
        depth = axisDepth;
        normal.x = axis.x;
        normal.y = axis.y;
    }

    let toCircle = subtractVectors(closestPoint, circleACenter);

    normal = normalize(normal);

    if (dotProduct(toCircle, normal) < 0)
    {
        normal.x = -normal.x;
        normal.y = -normal.y;
    }


    console.log('CIRCLE vs POLYGON COLLISION DETECTED', normal, depth);

    return {collision: true, normal, depth};
}

export function circleVsCircle(entityA, entityB)
{
    if(canEntityBeTested(entityA) || canEntityBeTested(entityB))
    {
        return;
    }

    let normal = 0;
    let depth = 0;

    const centerA = entityA.getComponent(Transform).position;
    const centerB = entityB.getComponent(Transform).position;

    const radiusA = entityA.getComponent(Circle).radius;
    const radiusB = entityB.getComponent(Circle).radius;

    const dist = distance(centerB, centerA);
    const radii = radiusA + radiusB;

    if(dist >= radii)
    {
        return {collision:false};
    }

    normal = subtractVectors(centerB, centerA);
    normal = normalize(normal);

    depth = radii - dist;

    return {collision: true, normal: normal, depth: depth};
}


export function AABBvsAABB(boxA, boxB)
{
    
}


function canEntityBeTested(entity)
{
    if (!((entity.hasComponent(Polygon) || entity.hasComponent(Circle)) && entity.hasComponent(Transform) && entity.hasComponent(Rigidbody))) 
    {
        console.warn("the entity has one of the required components missing (a polygon or a circle, a transform and a rigidbody)");
    }
}