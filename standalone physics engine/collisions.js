import { dotProduct, subtractVectors, scaleVector, addVectors, almostEqual, almostEqualVector, lengthSquared, distanceSquared, distance } from "./maths.js";
import { Mainfold } from "./mainfold.js";

export function SAT(bodyA, bodyB)
{
    let depth = Infinity;

    let normal = {x:0, y:0};

    let axis = { x: 0, y: 0 };
    let edge = { x: 0, y: 0 };

    let worldVerticesA = bodyA.transformedVertices;
    let worldVerticesB = bodyB.transformedVertices;

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

    let centerA = bodyA.position;
    let centerB = bodyB.position;

    let direction = subtractVectors(centerB,centerA);

    if(dotProduct(direction, normal) < 0)
    {
        normal.x = -normal.x;
        normal.y = -normal.y;
    }

    
    
    
    return {collision: true, normal: normal ,depth: depth};
}

export function circleVsPolygon(bodyA, bodyB)
{
    if (!bodyA.isCircle) return false;

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

    let circleCenter = bodyA.position;
    let circleRadius = bodyA.radius;

    let worldVertices = bodyB.transformedVertices;

    for (let i = 0; i < worldVertices.length; i++)
    {
        let va = worldVertices[i];
        let vb = worldVertices[(i +1) % worldVertices.length];

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

        projectedVertexB = projectVertices(worldVertices, axis);
        projectedCirlce = projectCircle(circleCenter, circleRadius, axis);

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

    let closestPoint = worldVertices[closestPointIndex];

    axis = subtractVectors(closestPoint, circleCenter);

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

    let toCircle = subtractVectors(closestPoint, circleCenter);

    normal = normalize(normal);

    if (dotProduct(toCircle, normal) < 0)
    {
        normal.x = -normal.x;
        normal.y = -normal.y;
    }

    return {collision: true, normal, depth};
}

export function circleVsCircle(bodyA, bodyB)
{
    let normal = {x:0, y:0};
    let depth = Infinity;

    let centerA = bodyA.position;
    let centerB = bodyB.position;

    let radiusA = bodyA.radius;
    let radiusB = bodyB.radius;

    let dist = distance(centerB, centerA);
    let radii = radiusA + radiusB;

    if(dist >= radii)
    {
        return {collision:false};
    }

    normal = subtractVectors(centerB, centerA);
    normal = normalize(normal);

    depth = radii - dist;

    return {collision: true, normal: normal, depth: depth};
}


export function findContactPoints(bodyA, bodyB)
{
    let contactInfo = null;

    if((bodyA.isBox || bodyA.isTriangle) && (bodyB.isBox || bodyB.isTriangle))
    {
        contactInfo = contactPointsPolygon(bodyA, bodyB);
    }
    else if (bodyA.isCircle && bodyB.isCircle)
    {
        contactInfo = contactPointsCircle(bodyA, bodyB);
    }
    else if ((bodyA.isBox || bodyA.isTriangle) && bodyB.isCircle)
    {
        contactInfo = contactPointsPolygonCircle(bodyA, bodyB);
    }
    else if ((bodyB.isBox || bodyB.isTriangle) && bodyA.isCircle)
    {
        contactInfo = contactPointsPolygonCircle(bodyB, bodyA);
    }
    else
    {
        console.error("one of the polygons has an unsupported shape");
    }

    return contactInfo;
}

function contactPointsPolygon(bodyA, bodyB)
{
    let contact1 = null;
    let contact2 = null;
    let contactCount = 0;

    let verticesA = bodyA.transformedVertices;

    let verticesB = bodyB.transformedVertices;

    let minDistSq = Infinity;

    for(let i = 0; i < verticesA.length; i++)
    {
        let p = verticesA[i];

        for(let j = 0; j < verticesB.length; j++)
        {
            let va = verticesB[j];
            let vb = verticesB[(j + 1) % verticesB.length];

            let pointSegDist = pointSegmentDistance(p, va ,vb);
            let distSq = pointSegDist.distanceSqrd;
            let cp = pointSegDist.closestPoint;

            if(almostEqual(distSq, minDistSq))
            {
                if(!almostEqualVector(cp, contact1))
                {
                    contact2 = cp;
                    contactCount = 2;
                }
                
            }
            else if (distSq < minDistSq)
            {
                minDistSq = distSq;
                contactCount = 1;
                contact1 = cp;
            }
            
            
        }

    }

    for(let i = 0; i < verticesB.length; i++)
    {
        let p = verticesB[i];
        
        for(let j = 0; j < verticesA.length; j++)
        {
            let va = verticesA[j];
            let vb = verticesA[(j + 1) % verticesA.length];

            let pointSegDist = pointSegmentDistance(p, va ,vb);
            let distSq = pointSegDist.distanceSqrd;
            let cp = pointSegDist.closestPoint;
            
            if(almostEqual(distSq, minDistSq))
            {
                if(!almostEqualVector(cp, contact1))
                {
                    contact2 = cp;
                    contactCount = 2;
                }
                
            }
            else if (distSq < minDistSq)
            {
                minDistSq = distSq;
                contactCount = 1;
                contact1 = cp;
            }
            
        }
    }

    return {
        contact1: contact1,
        contact2: contact2,
        contactCount: contactCount
    };
    
}

function contactPointsPolygonCircle(bodyA, bodyB, result)
{
    
}

function contactPointsCircle(bodyA, bodyB, result)
{
    
}









function projectVertices(vertices, axis)
{
    let min = Infinity;
    let max = -Infinity;

    const length = Math.hypot(axis.x, axis.y);
    const normalizedAxis = { x: axis.x / length, y: axis.y / length };

    for (let i = 0; i < vertices.length; i++)
    {
        const projection = dotProduct(vertices[i], normalizedAxis);
        if (projection < min) min = projection;
        if (projection > max) max = projection;
    }

    return { min, max };
}

function projectCircle(center, radius, axis)
{
    let min = 1;
    let max = -1;

    let dir = normalize(axis);
    let dirAndRadius = scaleVector(dir, radius);

    let p1 = addVectors(center, dirAndRadius);
    let p2 = subtractVectors(center, dirAndRadius);

    min = dotProduct(p1, dir);
    max = dotProduct(p2, dir);

    if(min > max)
    {
        let temp = max;
        max = min;
        min = temp;
    }

    return{min: min, max: max};
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

function pointSegmentDistance(p, a, b) 
{
    let ab = {x:b.x - a.x, y: b.y - a.y};

    let ap = {x: p.x - a.x, y: p.y - a.y};

    let proj = dotProduct(ab, ap);
    let abLenSq = lengthSquared(ab);
    let d = proj / abLenSq;

    let cp = {x:0, y:0};

    if(d <= 0)
    {
        cp.x = a.x;
        cp.y = a.y;
    }
    else if(d >= 1)
    {
        cp.x = b.x;
        cp.y = b.y;
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

function arePointsCollinear(P0, P1, P2) {
    // Assuming P0, P1, P2 are objects with x and y properties (e.g., {x: 10, y: 20})
    const x0 = P0.x, y0 = P0.y;
    const x1 = P1.x, y1 = P1.y;
    const x2 = P2.x, y2 = P2.y;
    
    // Calculate the cross product of vectors P0P1 and P0P2
    const crossProduct = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
    
    const EPSILON = 1e-6;  // tolerance for floating point precision
    return Math.abs(crossProduct) < EPSILON;
}
