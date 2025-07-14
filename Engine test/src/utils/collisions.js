import { Transform } from "../components/transform.js";
import { almostEqual, almostEqualVector, DEFAULT_MARGIN, dotProduct, projectVertices } from "./maths.js";


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


export function findContactPointsPolygon(entityA, entityB) //out contact1, contact2, contactCount
{
    let worldVerticesA = entityA.getWorldVertices();
    let worldVerticesB = entityB.getWorldVertices();

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

export function SAT(entityA, entityB)
{
    let depth = Infinity;

    let normal = {x:0, y:0};

    let axis = { x: 0, y: 0 };
    let edge = { x: 0, y: 0 };

    let direction = { x: 0, y: 0 };

    let worldVerticesA = entityA.getWorldVertices();
    let worldVerticesB = entityB.getWorldVertices();

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
    

    let centerA = {x: entityA.getComponent(Transform).position.x, y: entityA.getComponent(Transform).position.y};
    let centerB = {x: entityB.getComponent(Transform).position.x, y: entityB.getComponent(Transform).position.y};

    direction.x = centerB.x - centerA.x;
    direction.y = centerB.y - centerA.y;
   
    if(dotProduct(direction, normal) < 0)
    {
        normal.x = -normal.x;
        normal.y = -normal.y;
    }

    return {collision: true, normal,depth};
}

export function AABBvsAABB(boxA, boxB)
{

}
