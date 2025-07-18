import { Vector2D } from "../utils/maths.js";

export class Rigidbody
{
    constructor(linearVelocity = new Vector2D(0,0), angularVelocity = 0, force = new Vector2D(0,0), torque = 0 ,mass = 1, linearDamping = {x: 0.1, y: 0.1}, angularDamping = 1, rotationalInertia = 1, restitution = 0,  affectedByGravity = false)
    {
        this.BASE_MASS_MULTIPLIER = 10;

        this.linearVelocity = linearVelocity;
        this.angularVelocity = angularVelocity;

        this.force = force;
        this.torque = torque;

        this.rotationalInertia = rotationalInertia;

        this.linearDamping = linearDamping;
        this.angularDamping = angularDamping;

        this.mass = mass;
        this.restitution = restitution; //restitution is how bouncy it is

        this.affectedByGravity =  affectedByGravity;
    }

    get inverseMass()
    {
        if (this.mass === Infinity || this.mass === 0) return 0;
        return 1 / this.mass;
    }

    get inverseRotateInertia()
    {
        return (this.rotationalInertia === Infinity || this.rotationalInertia === 0) ? 0 : (1 / this.rotationalInertia);
    }

    get isStatic() 
    {
        return this.mass === Infinity;
    }

    get hasRotation()
    {
        return this.inverseRotateInertia !== Infinity;
    }

    setMass(amount)
    {
        this.mass = amount;
        console.log("Mass set to:", this.mass);
    }

    setInfiniteMass()
    {
        this.mass = Infinity;
    }   

    freezeRotation()
    {
        this.rotationalInertia = Infinity;
    }

    makeCompletelyStatic()
    {
        this.setInfiniteMass();
        this.freezeRotation();
    }

    resetForce()
    {
        this.force = Vector2D.zero;
        this.torque = 0;
    }

    scaleByMassInverse(vector) 
    {
        return vector.clone().scale(1 / this.mass);
    }

    addImpulse(impulseVector) 
    {
        this.linearVelocity.add(this.scaleByMassInverse(impulseVector));
    }

    addForce(amount)
    {
        this.force = amount;
    }

    addTorque(amount)
    {
        this.torque = amount * 10;
    }
    
}