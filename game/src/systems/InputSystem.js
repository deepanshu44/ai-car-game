export class InputSystem {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    getInput() {
        return {
            rewind: this.keys[' '] || this.keys['arrowup'] || this.keys['w'],
            brake: this.keys['arrowdown'] || this.keys['s'],
            steerLeft: this.keys['arrowleft'] || this.keys['a'],
            steerRight: this.keys['arrowright'] || this.keys['d']
        };
    }
    
    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] || false;
    }
}
