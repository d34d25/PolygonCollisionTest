import { Rigidbody, createBodyBox, createBodyCircle } from "../rigidbody.js";
export class TestPlayer {
  constructor(body, physWorld) {
    this.body = body;
    this.physWorld = physWorld;
    this.spawnCooldown = 0;
  }

  move(timeStep, keysPressed, mousePos, mouseClicked) {
    const speed = 100000;
    const rotSpeed = 30;

    if (keysPressed['w']) this.body.force.y -= speed;
    if (keysPressed['s']) this.body.force.y += speed;
    if (keysPressed['a']) this.body.force.x -= speed;
    if (keysPressed['d']) this.body.force.x += speed;

    if (keysPressed['q']) this.body.torque -= rotSpeed;
    if (keysPressed['e']) this.body.torque += rotSpeed;

    if (mouseClicked && this.spawnCooldown <= 0) {
      this.spawnBox(mousePos);
      this.spawnCooldown = 0.3;
    }

    this.spawnCooldown -= timeStep;
  }

  spawnBox(position) 
  {
    const newBody = createBodyBox({
      position: { x: position.x, y: position.y },
      size: { w: 20, h: 20 },
      density: 1,
      restitution: 0.5,
      linearDamping: { x: 0, y: 0 },
      angularDamping: 0,
      isStatic: false,
      staticFriction:0.6,
      dynamicFriction:0.4
    });

    this.physWorld.bodies.push(newBody);
  }

  spawnCircle(position) 
  {
    const newBody = createBodyCircle({
      position: { x: position.x, y: position.y },
      radius: 20,
      density: 1,
      restitution: 0.5,
      linearDamping: { x: 0, y: 0 },
      angularDamping: 0,
      isStatic: false
    });

    this.physWorld.bodies.push(newBody);
  }
}
