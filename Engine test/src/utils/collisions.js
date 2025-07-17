import { Rigidbody } from "../components/rigidbody.js";
import { Circle } from "../components/shapes/circle.js";
import { Polygon } from "../components/shapes/polygon.js";
import { Transform } from "../components/transform.js";
import { almostEqual, almostEqualVector, DEFAULT_MARGIN, distance, dotProduct, normalize, projectCircle, projectVertices, subtractVectors } from "./maths.js";


function pointSegmentDistance(point, segment) 
{
    const ax = segment.a.x;
    const ay = segment.a.y;
    const bx = segment.b.x;
    const by = segment.b.y;
    const px = point.x;
    const py = point.y;

    const abx = bx - ax;
    const aby = by - ay;
    const apx = px - ax;
    const apy = py - ay;

    const abLenSq = abx * abx + aby * aby;

    // Project point onto the line (parametric t)
    let t = (apx * abx + apy * aby) / abLenSq;

    // Clamp t to the segment [0, 1]
    t = Math.max(0, Math.min(1, t));

    // Find closest point on the segment
    const closestX = ax + t * abx;
    const closestY = ay + t * aby;

    // Compute squared distance from point to closest point
    const dx = px - closestX;
    const dy = py - closestY;
    const distanceSqrd = dx * dx + dy * dy;

    return {
        distanceSqrd: distanceSqrd,
        closestPoint: {x: closestX, y: closestY}
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

export function findContactPointsPolygon(manager ,entityA, entityB) //out contact1, contact2, contactCount
{
    
    let worldVerticesA = manager.getWorldVertices(entityA);
    let worldVerticesB = manager.getWorldVertices(entityB);

    let contact1 = {x:0, y:0};
    let contact2 = {x:0, y:0};
    let contactCount = 0;

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

                let segment = {
                    a: currentVertexB,
                    b: nextVertexB
                };

                let psd = pointSegmentDistance(currentVertexA, segment);

                if(almostEqual(psd.distanceSqrd, minDistanceSq, DEFAULT_MARGIN))
                {
                    if (!almostEqualVector(psd.closestPoint, contact1, DEFAULT_MARGIN))
                    {
                        contact2 = psd.closestPoint;
                        contactCount = 2;
                    }
                }
                else if(psd.distanceSqrd === minDistanceSq)
                {
                    contact2 = psd.closestPoint;
                    contactCount = 2;
                }
                else if(psd.distanceSqrd < minDistanceSq)
                {
                    minDistanceSq = psd.distanceSqrd;
                    contactCount = 1;
                    contact1 = psd.closestPoint;
                }
                
            }
        }

    }
    
    return {contactOne: contact1, contactTwo: contact2, rContactCount: contactCount}; 
}

export function findContactPointsCircle()
{

}

export function findContactPointsPolygonCircle()
{
    
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