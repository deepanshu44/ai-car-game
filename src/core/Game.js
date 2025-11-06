import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig.js';
import { SceneManager } from './SceneManager.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from '../systems/InputHandler.js';
import { CollisionDetector } from '../systems/CollisionDetector.js';
import { CameraController } from '../systems/CameraController.js';
import { UIManager } from '../systems/UIManager.js';
import { PlayerCar } from '../entities/PlayerCar.js';
import { Road } from '../environment/Road.js';
import { BiomeManager } from '../environment/BiomeManager.js';
import { TrafficManager } from '../entities/TrafficManager.js';
import { Scenery } from '../environment/Scenery.js';
import { Weather } from '../environment/Weather.js';
import { BootScreen } from '../systems/StartUpScreen/StartUpScreen.js'
import { VehicleMetrics } from '../systems/VehicleMetrics.js';
import { PollutionTracker } from '../environment/PollutionTracker.js' 
import { AudioController } from '../systems/AudioController.js';

export class Game {
    constructor() {
        this.gameOver = false;
	this.gameStarted = false
        this.distance = 0;
        
        this.init();
    }
    
    init() {
        // Core systems
        this.sceneManager = new SceneManager();
        this.renderer = new Renderer();
        this.inputHandler = new InputHandler();
        this.collisionDetector = new CollisionDetector();
        this.uiManager = new UIManager(this.sceneManager.scene);
	// this.vehicleMetrics = new VehicleMetrics(this.sceneManager.scene)

	// Weather and environment
        this.weather = new Weather(this.sceneManager.scene);
        
        // Camera
        this.cameraController = new CameraController(this.sceneManager.camera);

	// Pollution Tracker
	this.pollutionTracker = new PollutionTracker()
        // Game entities
        this.playerCar = new PlayerCar(this.sceneManager.scene,this.sceneManager.camera);
        this.road = new Road(this.sceneManager.scene);
        this.trafficManager = new TrafficManager(this.sceneManager.scene);
	this.scenery = new Scenery(this.sceneManager.scene);
        this.biomeManager = new BiomeManager(this.sceneManager.scene);
        // Event listeners
        this.setupEventListeners();
	// new BootScreen()

	// on mobile
	if(navigator.maxTouchPoints>0){
	    this.setUpMobileControls() 
	}

    }
    
    setupEventListeners(){
	// document.getElementById('startGame').addEventListener('click', ()=>this.startGame());
        window.addEventListener('resize', () => this.onWindowResize());
        document.getElementById('restart').addEventListener('click', () => this.restart());
    }

    setUpMobileControls(){
	const controlDiv = document.getElementsByClassName("mobile-controls")[0]
	controlDiv.className = "mobile-controls.active"
	this.inputHandler.mobileScript()
	document.getElementById("pollutionPanel").style.bottom = "170px"
    }
    
    startGame() {
        // document.getElementById('overlay').style.display = 'none';
        // document.getElementsByClassName('boot-container')[0].style.display = 'none';
        this.gameStarted = true;
	// Start game loop
	this.gameLoop()
    }
    
    update() {
        if (this.gameOver) return;
        
        const input = this.inputHandler.getInputState();
        
        if (input.noclip) {
            this.handleNoclipMovement(input);
            return;
        }
        
        // Update player
        this.playerCar.handleInput(input);
        
        // Update distance
        this.distance += this.playerCar.speed;
        
        // Update world
        this.road.update(this.playerCar.speed);
        this.trafficManager.update(this.playerCar.speed, this.playerCar.position);
	this.scenery.update(this.playerCar.speed);
        this.biomeManager.update(this.distance,this.playerCar.speed);
	this.weather.update();
        
        // Update camera
        this.cameraController.update();
        this.cameraController.follow(this.playerCar.group);
        
        // Collision detection
        this.checkCollisions();
        
        // Update UI
        this.updateUI();
    }
    
    checkCollisions() {
        // Traffic collisions
        const trafficCollision = this.collisionDetector.checkTrafficCollisions(
            this.playerCar.group,
            this.trafficManager.getAllCars()
        );
        
        if (trafficCollision) {
            this.endGame();
        }
        
        // Pothole collisions
        const potholeHit = this.collisionDetector.checkPotholeCollision(
            this.playerCar.group,
            this.road.potholes
        );
        
        if (potholeHit) {
            this.playerCar.onPotholeHit();
            this.uiManager.flashSpeedIndicator('#ff0000', 500);
            this.cameraController.startShake(0.5, 300);
            potholeHit.hitRecently = true;
            setTimeout(() => potholeHit.hitRecently = false, 1000);
        }
    }
    
    updateUI() {
        this.uiManager.updateSpeed(this.playerCar.speed);
        this.uiManager.updateDistance(this.distance);
        this.uiManager.updateParked(this.playerCar.speed);
        this.uiManager.updateBattery();
        // this.uiManager.updateRewindPower(
        //     this.playerCar.rewindPower,
        //     !this.playerCar.isMoving || this.playerCar.rewindPower < 90
        // );
        this.uiManager.updateFPS();
	this.pollutionTracker.update(this.distance,this.playerCar.speed)
	
    }
    
    handleNoclipMovement(input) {
        const camera = this.sceneManager.camera;
        if (input.forward) camera.position.z += 5;
        if (input.backward) camera.position.z -= 5;
        if (input.left) camera.position.x += 0.5;
        if (input.right) camera.position.x -= 0.5;
        if (input.up) camera.position.y += 0.5;
        if (input.down) camera.position.y -= 0.5;
    }
    
    render() {
        this.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
    }
    
    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        this.update();
        this.render();
    }
    
    endGame() {
        this.gameOver = true;
        this.uiManager.showGameOver(this.distance);
    }
    
    restart() {
        window.location.reload();
    }
    
    onWindowResize() {
        this.cameraController.onWindowResize(window.innerWidth, window.innerHeight);
        this.renderer.onWindowResize(window.innerWidth, window.innerHeight);
    }
}
