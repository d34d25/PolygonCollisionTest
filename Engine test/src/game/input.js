export class Input
{
    constructor()
    {
        this.keys = {};

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }


    handleKeyDown(e) 
    {
        this.keys[e.key.toLowerCase()] = true;
    }

    handleKeyUp(e) 
    {
        this.keys[e.key.toLowerCase()] = false;
    }

    isKeyDown(key) 
    {
        return !!this.keys[key.toLowerCase()];
    }

    
}