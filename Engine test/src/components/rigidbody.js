import { Vector2D } from "../utils/maths.js";

export class Rigidbody
{
    constructor(isStatic = false, linearVelocity = new Vector2D(0,0), angularVelocity = 0, force = new Vector2D(0,0), torque = 0 ,mass = 1, linearDamping = {x: 1, y: 1}, angularDamping = 1, rotationalInertia = 1, restitution = 0,  affectedByGravity = false)
    {
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

        this.isStatic = isStatic;
    }

    get inverseMass()
    {
        if(this.mass != 0) return 1/ this.mass;
        else return 0;
    }

    freezeRotation()
    {
        this.rotationalInertia = Infinity;
    }

    makeCompletelyStatic()
    {
        this.isStatic = true;
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