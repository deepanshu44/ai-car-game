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
