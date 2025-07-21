export class Rigidbody
{
    constructor(position, density, restitution, isStatic, rotates) 
    {
        this.position = position;
        this.angle = 0;
        this.linearVelocity = {x:0,y:0};
        this.angularVelocity = 0;

        this.linearDamping =  {x:0,y:0};
        this.angularDamping = 0;

        this.mass = 1;
        this.force =  {x:0,y:0};
        this.torque = 0;

        this.restitution = restitution;
        this.inertia = Infinity;

        this.density = density;
        
        this.size = {w:1, h:1};
        this.radius = 1;

        this.vertices = [];

        this.isStatic = isStatic;
        this.rotates = rotates;

        this.type = "";
        this.types = ["box", "triangle", "circle"];
    }

    get isBox()
    {
        return this.type === this.types[0];
    }

    get isTriangle()
    {
        return this.type === this.types[1];
    }

    get isCircle()
    {
        return this.type === this.types[2];
    }

    get invMass()
    {
        if (this.mass === Infinity || this.mass === 0) return 0;
        return 1 / this.mass;
    }

    get invInertia()
    {
        return (this.inertia === Infinity || this.inertia=== 0) ? 0 : (1 / this.inertia);
    }


    get transformedVertices()
    {
        let cos = Math.cos(this.angle);
        let sin = Math.sin(this.angle);

        let pos = this.position;

        return this.vertices.map(({x,y}) => {
            return{
                x: pos.x + x * cos - y * sin,
                y: pos.y + x * sin + y * cos
            };
        });
    }


    get hasInfiniteMass()
    {
        return this.mass === Infinity;
    }

    move(amount)
    {
        this.position.x += amount.x;
        this.position.y += amount.y;
    }


    moveTo(amount)
    {
        this.position.x = amount.x;
        this.position.y = amount.y;
    }

    rotate(amount)
    {
        this.angle += amount;
    }

    rotateTo(amount)
    {
        this.angle = amount;
    }

    addForce(amount)
    {
        this.force = amount;
    }

    addTorque(amount)
    {
        this.torque = amount;
    }

    createBox() 
    {
        let halfW = this.size.w / 2;
        let halfH = this.size.h / 2;

        this.vertices = [
            { x: -halfW, y: -halfH },
            { x: halfW, y: -halfH },
            { x: halfW, y: halfH },
            { x: -halfW, y: halfH },
        ];

        this.type = this.types[0];
    }

   
    createTriangle() 
    {
        let halfW = this.size.w / 2;
        let h = this.size.h;

        this.vertices = [
            { x: -halfW, y: 0 },
            { x: halfW, y: 0 },
            { x: 0, y: -h }
        ];

        this.type = this.types[1];
    }

    createCircle()
    {
        this.type = this.types[2];
    }

    
    updateBody(time, gravity = {x:0, y: 9.8})
    {
        if(this.isStatic) return;

        let acceleration = {x: 0, y:0};

        acceleration.x += this.force.x;
        acceleration.y += this.force.y;

        this.linearVelocity.x += gravity.x * time;
        this.linearVelocity.y += gravity.y * time;

        this.position.x += this.linearVelocity.x * time;
        this.position.y += this.linearVelocity.y * time;

        this.angle += this.angularVelocity * time;

        this.force.x = 0;
        this.force.y = 0;
    }

}


// force = mass * acc
// acc = force / mass;

//FlatVector acceleration = this.force / this.Mass;
//this.linearVelocity += acceleration * time;


export function createBodyBox(position = {x:0, y:0}, size = {w:10,h:10}, density = 1, restitution = 0.5, isStatic = false, rotate = false)
{
    const body = new Rigidbody(position,density ,restitution, isStatic, rotate);
    body.size = size;
    const area = body.size.w * body.size.h;

    body.createBox();

    body.mass = Infinity;
    body.inertia = Infinity;

    if(!body.isStatic)
    {
        body.mass = area * body.density;
        body.inertia = (1 / 12) * body.mass * (body.size.w * body.size.w + body.size.h * body.size.h);
    }

    return body;
}

export function createBodyTriangle(position = {x:0, y:0}, size = {w:10,h:10}, density = 1, restitution = 0.5, isStatic = false)
{
    const body = new Rigidbody(position, density, restitution, isStatic);
    body.size = size;
    body.createTriangle();

    body.mass = Infinity;
    body.inertia = Infinity;

    const base = body.size.w;
    const height = body.size.h;

    if(!body.isStatic)
    {
        const area = 0.5 * body.size.w * body.size.h;
        body.mass = area * density;
        body.inertia = (body.mass * (base * base + height * height)) / 36;
    }

    return body;
}   

export function createBodyCircle(position, radius = 5,  density = 1, restitution = 0.5, isStatic = false)
{
    const body = new Rigidbody(position, density, restitution, isStatic);
    body.radius = radius;

    body.createCircle();

    body.mass = Infinity;
    body.inertia = Infinity;

    if(!body.isStatic)
    {
        const area = Math.PI * body.radius * body.radius;
        body.mass = area * body.density;
        body.inertia = 0.5 * body.mass * body.radius * body.radius;
    }

    return body;
}