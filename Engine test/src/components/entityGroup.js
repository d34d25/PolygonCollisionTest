export class EntityGroup
{
    constructor(entities = []) 
    {
      this.entities = entities;
    }

    addEntity(entity) 
    {
      this.entities.push(entity);
    }

    removeEntity(entity) 
    {
      const index = this.entities.indexOf(entity);
      if (index !== -1) this.entities.splice(index, 1);
    }

    move(amount) 
    {
      for (const entity of this.entities) 
      {
        entity.move(amount);
      }
    }

    getEntitiesWithComponent(componentClass) 
    {
      return this.entities.filter(e => e.hasComponent(componentClass));
    }

}
