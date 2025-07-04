export function shapeOverlapDiagonal(polygonA, polygonB)
{
    let polyA = polygonA;
    let polyB = polygonB;

    // Perform two passes: first check if any diagonal from polyA intersects polyB's edges,
    // then swap and check if any diagonal from polyB intersects polyA's edges.

    for (let pass = 0; pass < 2; pass++) //the same as for (let pass = 0; pass <= 1; pass++)
    {
        if(pass === 1)
        {
            let temp = polyA;
            polyA = polyB;
            polyB = temp;
        }
        
        let worldVerticesA = polyA.getVertices(); // world-space vertices
        let worldVerticesB = polyB.getVertices();

        let polyACenter = { x: polyA.x, y: polyA.y }; // only the center of the first polygon is needed

        for (let p = 0; p < worldVerticesA.length; p++)
        {
            //defining diagonals
            let r1s = polyACenter; //diagonal start
            let r1e = worldVerticesA[p]; //diagonal end

            for (let q = 0; q < worldVerticesB.length; q++)
            {
                //defining edges
                let r2s = worldVerticesB[q]; //start of the edge (a vertex)
                let r2e = worldVerticesB[(q + 1) % worldVerticesB.length]; //end of the edge (the following vertex, then wraps around to the first one)

                //line vs line collision math
                let h = (r2e.x - r2s.x) * (r1s.y - r1e.y) - (r1s.x - r1e.x) * (r2e.y - r2s.y);

                if(h === 0) continue;

                let t1 = ((r2s.y - r2e.y) * (r1s.x - r2s.x) + (r2e.x - r2s.x) * (r1s.y - r2s.y)) / h;
                let t2 = ((r1s.y - r1e.y) * (r1s.x - r2s.x) + (r1e.x - r1s.x) * (r1s.y - r2s.y)) / h;


                if (t1 >= 0 && t1 < 1 && t2 >= 0 && t2 < 1) 
                {
                    return true;
                }
            }       
        }
    
    }
    
    return false;
}





//SAT

function dotProduct(a,b)
{
    return a.x * b.x + a.y * b.y;
}

function projectVertices(vertices, axis)
{
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < vertices.length; i++)
    {
        let projection = dotProduct(vertices[i], axis);
        if(projection < min) min = projection;
        if(projection > max) max = projection;
    }

    return { min, max };
}

function getLength(vector)
{
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

function normalizeVector(vector)
{
    const length = getLength(vector);
    if(length === 0) return { x: 0, y: 0 };
    return {x: vector.x / length,y: vector.y / length};
}

function getCentroid(vertices)
{
    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < vertices.length; i++)
    {
        let v = vertices[i];

        sumX += v.x;
        sumY += v.y;
    }

    return {x: sumX / vertices.length, y: sumY / vertices.length};
}

export function SAT(polygonA, polygonB)
{
    let depth = Infinity;
    let normal = {x:0, y:0};

    let worldVerticesA = polygonA.getVertices(); // world-space vertices
    let worldVerticesB = polygonB.getVertices();

    for (let i = 0; i < worldVerticesA.length; i++)
    {
        let va = worldVerticesA[i]; //start point of the edge
        let vb = worldVerticesA[(i +1) % worldVerticesA.length]; //end point of the edge

        let edge = {x: vb.x - va.x, y: vb.y - va.y};

        let axis = {x: -edge.y, y: edge.x}; //normal of the edge

        axis = normalizeVector(axis);

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
            normal = axis;
        }
    }

    for (let i = 0; i < worldVerticesB.length; i++)
    {
        let va = worldVerticesB[i];
        let vb = worldVerticesB[(i +1) % worldVerticesB.length];

        let edge = {x: vb.x - va.x,y: vb.y - va.y};

        let axis = {x: -edge.y,y: edge.x};

        axis = normalizeVector(axis);

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
            normal = axis;
        }
    }
    
    let centerA = {x: polygonA.x, y: polygonA.y};
    let centerB = {x: polygonB.x, y: polygonB.y};

    let direction = {x: centerB.x - centerA.x, y: centerB.y - centerA.y};

    if(dotProduct(direction, normal) < 0)
    {
        normal = {x: -normal.x, y: -normal.y};
    }

    return {collision: true, normal,depth};
}






























export function SAT_CCD(polygonA, polygonB, velocityA, velocityB) {
    let t_enter = 0; // earliest time of collision (max of all axis enters)
    let t_exit = 1;  // latest time of separation (min of all axis exits)
    let collisionNormal = null;
    let minDepth = Infinity;

    let worldVerticesA = polygonA.getVertices();
    let worldVerticesB = polygonB.getVertices();

    // Relative velocity of B to A
    let relativeVelocity = {
        x: velocityB.x - velocityA.x,
        y: velocityB.y - velocityA.y
    };

    // Helper function to test one polygon's edges
    function testAxes(vertices) {
        for (let i = 0; i < vertices.length; i++) {
            let va = vertices[i];
            let vb = vertices[(i + 1) % vertices.length];
            let edge = { x: vb.x - va.x, y: vb.y - va.y };
            let axis = normalizeVector({ x: -edge.y, y: edge.x });

            let projA = projectVertices(worldVerticesA, axis);
            let projB = projectVertices(worldVerticesB, axis);

            let minA = projA.min, maxA = projA.max;
            let minB = projB.min, maxB = projB.max;

            let v_proj = dotProduct(relativeVelocity, axis);

            // Check for static overlap first
            if (v_proj === 0) {
                if (minA >= maxB || minB >= maxA) {
                    // No collision possible on this axis
                    return false;
                } else {
                    // Overlapping whole frame: t_enter=0, t_exit=1 on this axis
                    continue;
                }
            }

            // Calculate entry and exit times on this axis
            let t0 = (minA - maxB) / v_proj;
            let t1 = (maxA - minB) / v_proj;
            if (t0 > t1) [t0, t1] = [t1, t0]; // swap so t0 <= t1

            // Update global t_enter and t_exit intervals
            if (t0 > t_enter) {
                t_enter = t0;
                // Keep track of collision normal with minimum t_enter
                collisionNormal = axis;
            }
            if (t1 < t_exit) {
                t_exit = t1;
            }

            if (t_enter > t_exit || t_exit < 0 || t_enter > 1) {
                // No collision in [0,1]
                return false;
            }
        }
        return true;
    }

    if (!testAxes(worldVerticesA)) return { collision: false };
    if (!testAxes(worldVerticesB)) return { collision: false };

    // If for some reason collisionNormal is null, fallback:
    if (!collisionNormal) {
        collisionNormal = { x: 1, y: 0 }; // or any default normal vector
    }

   

    // Adjust normal direction to point from A to B
    let centerA = { x: polygonA.x, y: polygonA.y };
    let centerB = { x: polygonB.x, y: polygonB.y };
    let dir = { x: centerB.x - centerA.x, y: centerB.y - centerA.y };
  
    if (dotProduct(dir, collisionNormal) < 0) {
        collisionNormal = { x: -collisionNormal.x, y: -collisionNormal.y };
    }
    // Clamp t_enter to [0,1]
    t_enter = Math.max(0, Math.min(1, t_enter));

    return {
        collision: true,
        normal: collisionNormal,
        time: t_enter
    };
}
