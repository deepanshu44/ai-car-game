import { Scene } from './Scene.js';
import { Camera } from './Camera.js';
import { Renderer } from './Renderer.js';
import { InputSystem } from '../systems/InputSystem.js';
import { PlayerCar } from '../entities/PlayerCar.js';
import { UI } from '../ui/UI.js';

export class Game {
    constructor(config) {
        this.config = config;
        this.isRunning = false;
        this.gameOver = false;
        
        // Core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Systems
        this.inputSystem = null;
        
        // Entities
        this.player = null;
        
        // UI
        this.ui = null;
        
        // Game state
        this.distance = 0;
    }
    
    init() {
        console.log('Initializing core systems...');
        
        // Initialize core components
        this.scene = new Scene(this.config);
        this.camera = new Camera(this.config);
        this.renderer = new Renderer(this.config);
        
        // Initialize systems
        this.inputSystem = new InputSystem();
        
        // Initialize player
        this.player = new PlayerCar(this.config);
        this.scene.add(this.player.mesh);
        
        // Initialize UI
        this.ui = new UI();
        
        console.log('Game initialized successfully!');
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.gameLoop());
        
        this.update();
        this.render();
    }
    
    update() {
        if (this.gameOver) return;
        
        // Get input
        const input = this.inputSystem.getInput();
        
        // Update player
        this.player.update(input);
        
        // Update distance
        this.distance += this.player.speed * 10;
        
        // Update camera
        this.camera.follow(this.player.mesh);
        
        // Update scene effects
        this.scene.updateFog();
        
        // Update UI
        this.ui.update(this.player.speed, this.distance, this.player.rewindPower);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    restart() {
        window.location.reload();
    }
}
