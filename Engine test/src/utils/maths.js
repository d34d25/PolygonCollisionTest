export class Vector2D
{
    constructor(x = 0,y = 0)
    {
        this.x = x;
        this.y = y;
    }

    clone() 
    {
        return new Vector2D(this.x, this.y);
    }

    add(vector)
    {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    subtract(vector)
    {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    scale(scalar)
    {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    magnitude() 
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize()
    {
        const length = this.magnitude();
        if(length === 0)
        {
            this.x = 0;
            this.y = 0;
        }
        else
        {
            this.x /= length;
            this.y /= length;
        }

        return this;
    }

    normalized()
    {
        const length = this.magnitude();
        if (length === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / length, this.y / length);
    }

    dot(v)
    {
        return this.x * v.x + this.y * v.y;
    }

}


export function projectVertices(vertices, axis)
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


export function dotProduct(a, b)
{
    return a.x * b.x + a.y * b.y;
}

export function addVectors(v1, v2) 
{
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}

export function subtractVectors(v1, v2) 
{
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}

export function scaleVector(v, scalar) 
{
    return { x: v.x * scalar, y: v.y * scalar };
}

export function magnitude(v) 
{
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v) 
{
    const length = magnitude(v);
    if (length === 0) 
    {
        return { x: 0, y: 0 };
    }
    return { x: v.x / length, y: v.y / length };
}
