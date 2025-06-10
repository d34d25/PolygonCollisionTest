function dotProduct(a,b)
{
    return a.x * b.x + a.y * b.y;
}


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

