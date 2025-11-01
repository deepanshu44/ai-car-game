cat > game/src/entities/PlayerCar.js << 'EOF'
import * as THREE from 'three';

export class PlayerCar {
    constructor(config) {
        this.config = config;
        
        // Car mesh group
        this.mesh = null;
        
        // Movement properties
        this.speed = 0;
        this.maxSpeed = config.maxSpeed;
        this.acceleration = config.acceleration;
        this.deceleration = config.deceleration;
        this.lateralSpeed = 0;
        this.maxLateralSpeed = config.maxLateralSpeed;
        
        // Rewind mechanic properties
        this.isRewinding = false;
        this.rewindPower = 0;
        this.maxRewindPower = config.maxRewindPower;
        this.rewindChargeRate = config.rewindChargeRate;
        this.rewindDuration = config.rewindDuration;
        this.rewindTimer = 0;
        this.isMoving = false;
        
        // Boost properties
        this.isBoosting = false;
        this.boostMultiplier = 1;
        this.boostEndTime = 0;
        this.originalMaxSpeed = config.maxSpeed;
        
        // Headlights
        this.headlights = [];
        this.lightBeams = [];
        
        // Create the car
        this.create();
    }
    
    create() {
        this.mesh = new THREE.Group();
        
        // Car body
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = false;
        this.mesh.add(body);
        
        // Car roof
        const roofGeometry = new THREE.BoxGeometry(1.6, 0.8, 2);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xcc0000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.4;
        roof.position.z = -0.3;
        roof.castShadow = false;
        this.mesh.add(roof);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        
        const wheelPositions = [
            [-1.1, 0.4, 1.3],
            [1.1, 0.4, 1.3],
            [-1.1, 0.4, -1.3],
            [1.1, 0.4, -1.3]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            wheel.castShadow = false;
            this.mesh.add(wheel);
        });
        
        // Set initial position
        this.mesh.position.set(this.config.lanes.playerRight, 0, 0);
        
        // Create headlights
        this.createHeadlights();
    }
    
    createHeadlights() {
        // Headlight 1 (left)
        const headlight1 = new THREE.SpotLight(0xffffee, 1.5, 30, Math.PI / 6, 0.5);
        headlight1.position.set(-0.7, 1, 2);
        headlight1.target.position.set(-0.7, 0, 10);
        this.mesh.add(headlight1);
        this.mesh.add(headlight1.target);
        this.headlights.push(headlight1);
        
        // Headlight 2 (right)
        const headlight2 = new THREE.SpotLight(0xffffee, 1.5, 30, Math.PI / 6, 0.5);
        headlight2.position.set(0.7, 1, 2);
        headlight2.target.position.set(0.7, 0, 10);
        this.mesh.add(headlight2);
        this.mesh.add(headlight2.target);
        this.headlights.push(headlight2);
        
        // Create light beams on ground
        this.createLightBeams();
    }
    
    createLightBeams() {
        // Create gradient texture for headlight beam
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        const gradient = context.createRadialGradient(256, 512, 0, 256, 300, 450);
        gradient.addColorStop(0, 'rgba(255, 255, 230, 0.5)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 220, 0.35)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 200, 0.2)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 180, 0.1)');
        gradient.addColorStop(0.8, 'rgba(255, 255, 160, 0.05)');
        gradient.addColorStop(1, 'rgba(255, 255, 150, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create semi-circular fan shape for each headlight
        const segments = 32;
        const radius = 12;
        const angle = Math.PI * 0.5;
        
        for (let side = 0; side < 2; side++) {
            const vertices = [];
            const uvs = [];
            const indices = [];
            
            vertices.push(0, 0, 0);
            uvs.push(0.5, 1.0);
            
            for (let i = 0; i <= segments; i++) {
                const theta = -angle / 2 + (angle / segments) * i;
                const x = Math.sin(theta) * radius;
                const z = Math.cos(theta) * radius;
                
                vertices.push(x, 0, z);
                
                const u = 0.5 + Math.sin(theta) * 0.5;
                const v = 0.5 - Math.cos(theta) * 0.5;
                uvs.push(u, v);
            }
            
            for (let i = 0; i < segments; i++) {
                indices.push(0, i + 1, i + 2);
            }
            
            const beamGeometry = new THREE.BufferGeometry();
            beamGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            beamGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
            beamGeometry.setIndex(indices);
            beamGeometry.computeVertexNormals();
            
            const beamMaterial = new THREE.MeshBasicMaterial({ 
                map: texture,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            beam.position.set(side === 0 ? -0.7 : 0.7, 0.1, 2);
            this.mesh.add(beam);
            this.lightBeams.push(beam);
        }
    }
    
    update(input) {
        this.handleInput(input);
        this.updateRewindMechanic();
        this.updateBoost();
        this.constrainToRoad();
    }
    
    handleInput(input) {
        // Rewind mechanic
        if (input.rewind) {
            if (!this.isMoving || this.rewindPower < 50) {
                this.isRewinding = true;
                this.rewindPower = Math.min(
                    this.rewindPower + this.rewindChargeRate, 
                    this.maxRewindPower
                );
                
                if (this.isMoving && this.rewindPower < 50) {
                    this.isMoving = false;
                    this.speed = 0;
                    this.rewindTimer = 0;
                }
            }
        } else {
            if (this.isRewinding && this.rewindPower > 0) {
                this.isMoving = true;
                this.rewindTimer = this.rewindDuration;
                this.speed = this.maxSpeed * (this.rewindPower / this.maxRewindPower);
            }
            this.isRewinding = false;
        }
        
        // Braking
        if (input.brake && this.isMoving) {
            this.speed = Math.max(this.speed - this.deceleration * 2, 0);
            
            const speedRatio = this.speed / this.maxSpeed;
            this.rewindPower = this.maxRewindPower * speedRatio;
            
            if (this.speed === 0) {
                this.isMoving = false;
                this.rewindPower = 0;
                this.rewindTimer = 0;
            }
        }
        
        // Steering
        if (input.steerLeft) {
            this.lateralSpeed = Math.max(
                this.lateralSpeed - 0.005, 
                -this.maxLateralSpeed
            );
        } else if (input.steerRight) {
            this.lateralSpeed = Math.min(
                this.lateralSpeed + 0.005, 
                this.maxLateralSpeed
            );
        } else {
            this.lateralSpeed *= 0.9; // Friction
        }
        
        // Apply lateral movement
        this.mesh.position.x += this.lateralSpeed;
    }
    
    updateRewindMechanic() {
        if (this.isMoving && !this.isRewinding) {
            this.rewindTimer -= 16.67; // ~1 frame at 60fps
            
            if (this.rewindTimer <= 0) {
                this.isMoving = false;
                this.rewindPower = 0;
                this.speed = 0;
            } else {
                const timeRatio = this.rewindTimer / this.rewindDuration;
                this.speed = this.maxSpeed * timeRatio * (this.rewindPower / this.maxRewindPower);
                this.rewindPower = this.maxRewindPower * timeRatio;
            }
        }
    }
    
    updateBoost() {
        if (this.isBoosting && Date.now() >= this.boostEndTime) {
            this.isBoosting = false;
            this.boostMultiplier = 1;
            this.maxSpeed = this.originalMaxSpeed;
        }
    }
    
    constrainToRoad() {
        // Keep car within road boundaries
        this.mesh.position.x = Math.max(-8, Math.min(8, this.mesh.position.x));
    }
    
    activateBoost(duration = 5000) {
        this.isBoosting = true;
        this.boostMultiplier = 2;
        this.maxSpeed = this.originalMaxSpeed * this.boostMultiplier;
        this.boostEndTime = Date.now() + duration;
    }
    
    getPosition() {
        return this.mesh.position.clone();
    }
    
    getBoundingBox() {
        return {
            x: this.mesh.position.x,
            z: this.mesh.position.z,
            width: 2,
            length: 4
        };
    }
}
EOF

cat > game/src/systems/InputSystem.js << 'EOF'
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
EOF

cat > game/src/core/Camera.js << 'EOF'
import * as THREE from 'three';

export class Camera {
    constructor(config) {
        this.config = config;
        this.camera = null;
        this.cameraShakeOffset = { x: 0, y: 0, z: 0 };
        this.create();
    }
    
    create() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, -12);
        this.camera.lookAt(0, 0, 0);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    follow(targetMesh) {
        const baseX = targetMesh.position.x;
        const baseY = 5;
        const baseZ = targetMesh.position.z - 12;
        
        this.camera.position.x = baseX + this.cameraShakeOffset.x;
        this.camera.position.y = baseY + this.cameraShakeOffset.y;
        this.camera.position.z = baseZ + this.cameraShakeOffset.z;
        
        this.camera.lookAt(
            targetMesh.position.x + this.cameraShakeOffset.x * 0.5,
            0,
            targetMesh.position.z + 10
        );
    }
    
    shake(intensity, duration) {
        // Implementation for screen shake
        // (Can be expanded with more sophisticated shake logic)
    }
    
    applyCameraShake(offset) {
        this.cameraShakeOffset = offset;
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
    
    getCamera() {
        return this.camera;
    }
}
EOF

cat > game/src/core/Scene.js << 'EOF'
import * as THREE from 'three';

export class Scene extends THREE.Scene {
    constructor(config) {
        super();
        this.config = config;
        this.setupScene();
    }
    
    setupScene() {
        // Background
        this.background = new THREE.Color(0x0a0a1a);
        
        // Fog
        this.fog = new THREE.Fog(0x0a0a1a, 30, 120);
        
        // Lights
        this.setupLights();
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x505070, 0.6);
        this.add(ambientLight);
        
        // Directional light (moonlight)
        const directionalLight = new THREE.DirectionalLight(0x9999cc, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = false;
        this.add(directionalLight);
        
        // Hemisphere light
        const hemisphereLight = new THREE.HemisphereLight(0x8888bb, 0x444466, 0.5);
        this.add(hemisphereLight);
    }
    
    updateFog() {
        if (this.fog) {
            this.fog.near = 30 + Math.sin(Date.now() * 0.0005) * 5;
            this.fog.far = 120 + Math.sin(Date.now() * 0.0003) * 10;
        }
    }
    
    setBackgroundColor(color) {
        this.background = new THREE.Color(color);
        if (this.fog) {
            this.fog.color = new THREE.Color(color);
        }
    }
}
EOF

cat > game/src/core/Renderer.js << 'EOF'
import * as THREE from 'three';

export class Renderer {
    constructor(config) {
        this.config = config;
        this.renderer = null;
        this.create();
    }
    
    create() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = this.config.shadowsEnabled;
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    render(scene, camera) {
        this.renderer.render(scene, camera.getCamera());
    }
    
    onResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    getRenderer() {
        return this.renderer;
    }
}
EOF

cat > game/src/core/Game.js << 'EOF'
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
EOF

cat > game/src/ui/UI.js << 'EOF'
export class UI {
    constructor() {
        this.speedElement = document.getElementById('speed');
        this.distanceElement = document.getElementById('distance');
        this.rewindPowerElement = document.getElementById('rewind-power');
        this.rewindBarFillElement = document.getElementById('rewind-bar-fill');
        this.rewindBarContainer = document.getElementById('rewind-bar-container');
    }
    
    update(speed, distance, rewindPower) {
        // Update speed display
        this.speedElement.textContent = `Speed: ${Math.round(speed * 50)} km/h`;
        
        // Update distance display
        this.distanceElement.textContent = `Distance: ${Math.round(distance)} m`;
        
        // Update rewind power display
        this.rewindPowerElement.textContent = Math.round(rewindPower);
        this.rewindBarFillElement.style.width = rewindPower + '%';
        
        // Update rewind bar indicator
        if (rewindPower < 50) {
            this.rewindBarContainer.classList.add('can-rewind');
            this.rewindBarContainer.classList.remove('cannot-rewind');
        } else {
            this.rewindBarContainer.classList.add('cannot-rewind');
            this.rewindBarContainer.classList.remove('can-rewind');
        }
    }
    
    showGameOver(distance) {
        document.getElementById('final-distance').textContent = Math.round(distance);
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    showNotification(text, duration = 3000) {
        const notification = document.createElement('div');
        notification.textContent = text;
        notification.className = 'notification';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), duration);
    }
}
EOF
