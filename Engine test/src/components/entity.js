//entity is the container for the rest of components

export class Entity
{
    static nextId = 1;

    constructor(components = [], hasCollisions = true) 
    {
        this.id = Entity.nextId++;
        this.components =  new Map();
        this.hasCollisions = hasCollisions;

        for (const component of components) 
        {
            this.addComponent(component);
        }
    }

    addComponent(component) 
    {
        if (this.components.has(component.constructor)) 
        {
            console.warn(`Component of type ${component.constructor.name} already exists!`);
            return false;
        }

        this.components.set(component.constructor, component);
    }

    getComponent(componentClass) 
    {
        return this.components.get(componentClass);
    }

    hasComponent(componentClass) 
    {
        return this.components.has(componentClass);
    }

    removeComponent(componentClass) 
    {
        this.components.delete(componentClass);
    }

}
