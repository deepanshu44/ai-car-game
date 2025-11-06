export class InputHandler {
    constructor() {
        this.keys = {};
        this.noclipMode = false;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.code === 'KeyN') {
                this.noclipMode = !this.noclipMode;
                console.log(`Noclip mode: ${this.noclipMode ? 'ON' : 'OFF'}`);
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

    }
    
    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] || false;
    }
    
    getInputState() {
        return {
            forward: this.isKeyPressed('w') || this.isKeyPressed('arrowup'),
            backward: this.isKeyPressed('s') || this.isKeyPressed('arrowdown'),
            left: this.isKeyPressed('a') || this.isKeyPressed('arrowleft'),
            right: this.isKeyPressed('d') || this.isKeyPressed('arrowright'),
            up: this.isKeyPressed(' '),
            down: this.isKeyPressed('enter'),
            noclip: this.noclipMode
        };
    }

    mobileScript(){
	// Get button elements
	const accelerateBtn = document.getElementById('mobile-accelerate');
	const brakeBtn = document.getElementById('mobile-brake');
	const leftBtn = document.getElementById('mobile-left');
	const rightBtn = document.getElementById('mobile-right');

	// Touch event listeners
	// Touch event listeners with fixes
	const buttons = [
	    { element: accelerateBtn, key: "w" },
	    { element: brakeBtn, key: "s" },
	    { element: leftBtn, key: "a" },
	    { element: rightBtn, key: "d" }
	];

	buttons.forEach(({ element, key }) => {
	    const handleStart = (e) => {
		e.preventDefault(); // Prevent scrolling/zooming
		this.keys[key] = true;
		element.classList.add('pressed');
	    };
	    
	    const handleEnd = (e) => {
		e.preventDefault();
		this.keys[key] = false;
		element.classList.remove('pressed');
	    };
	    
	    element.addEventListener('touchstart', handleStart, { passive: false });
	    element.addEventListener('touchend', handleEnd);
	    element.addEventListener('touchcancel', handleEnd); // Handle interruptions
	});
    }
    
    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}
