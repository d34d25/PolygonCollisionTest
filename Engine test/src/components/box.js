export class AABB
{
    constructor(transform, width = 1, height = 1)
    {
        if(transform.rotationRAD === 0) this.transform = transform;
        else throw new Error ("An AABB must be aligned with the axis");

        this.width = width;
        this.height = height;
    }
   
}