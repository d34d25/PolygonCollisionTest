import { Transform } from "../components/transform.js";
import { dotProduct, projectVertices } from "./maths.js";

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
