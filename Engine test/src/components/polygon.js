export class Polygon
{
    constructor(color = 'blue')
    {
        this.localVertices = [];
        this.color = color;
    }

    getVertices()
    {
        return this.localVertices;
    }


}
