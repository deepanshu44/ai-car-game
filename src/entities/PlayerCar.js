import * as THREE from 'three';
import { MeshFactory } from '../utils/MeshFactory.js';
import { Colors } from '../utils/Constants.js';
import { GameConfig } from '../config/GameConfig.js';

export class PlayerCar {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        
        // Physics properties
        this.speed = 0;
        this.lateralSpeed = 0;
        this.isMoving = false;
        this.isRewinding = false;
        
        // Rewind properties
        this.rewindPower = 0;
        this.rewindTimer = 0;
        
        this.createCar();
        this.createHeadlights();
        
        this.group.position.set(
            GameConfig.road.playerLane * GameConfig.road.laneWidth,
            0,
            0
        );
        
        scene.add(this.group);
    }
    
    createCar() {
        // Body
        const body = MeshFactory.createBox(2, 1, 4, Colors.PLAYER_CAR);
        body.position.y = 0.5;
        body.castShadow = true;
        this.group.add(body);
        
        // Roof
        const roof = MeshFactory.createBox(1.6, 0.8, 2, 0xcc0000);
        roof.position.set(0, 1.4, -0.3);
        roof.castShadow = true;
        this.group.add(roof);
        
        // Headlights
        const headlightGeometry = new THREE.BoxGeometry(0.2, 0.1, 1.2);
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 2
        });
        
        // Taillights
        const taillightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff3333,
            emissive: 0xff3333,
            emissiveIntensity: 1
        });
        
        const tailGeometry = new THREE.BoxGeometry(1, 0.01, 0.5);
        const centerTaillight = new THREE.Mesh(tailGeometry, taillightMaterial);
        centerTaillight.position.set(0, 0.8, -1.9);
        this.group.add(centerTaillight);
        
        const taillight1 = new THREE.Mesh(headlightGeometry, taillightMaterial);
        taillight1.position.set(-0.8, 0.8, -1.9);
        this.group.add(taillight1);
        
        const taillight2 = new THREE.Mesh(headlightGeometry, taillightMaterial);
        taillight2.position.set(0.8, 0.8, -1.9);
        this.group.add(taillight2);
        
        // Wheels
        this.createWheels();
    }
    
    createWheels() {
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        
        const positions = [
            [-1.1, 0.4, 1.3],
            [1.1, 0.4, 1.3],
            [-1.1, 0.4, -1.3],
            [1.1, 0.4, -1.3]
        ];
        
        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            wheel.castShadow = true;
            this.group.add(wheel);
        });
    }
    
    createHeadlights() {
        // Spotlights
        const headlight1 = new THREE.SpotLight(Colors.HEADLIGHT, 1.5, 30, Math.PI / 6, 0.5);
        headlight1.position.set(-0.7, 1, 2);
        headlight1.target.position.set(-0.7, 0, 10);
        this.group.add(headlight1);
        this.group.add(headlight1.target);
        
        // Beam visualization
        this.createHeadlightBeam();
    }
    
    createHeadlightBeam() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(256, 512, 0, 256, 300, 450);
        gradient.addColorStop(0, 'rgba(255, 255, 230, 0)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 220, 0.1)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 200, 0.3)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 180, 0.5)');
        gradient.addColorStop(0.8, 'rgba(255, 255, 160, 0.75)');
        gradient.addColorStop(1, 'rgba(255, 255, 150, 1)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(canvas);
        const beamGeometry = this.createBeamGeometry(12, Math.PI * 0.2);
        const beamMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(0, 0.1, 2);
        this.group.add(beam);
    }
    
    createBeamGeometry(radius, angle) {
        const segments = 32;
        const vertices = [0, 0, 0];
        const uvs = [0.5, 1.0];
        const indices = [];
        
        for (let i = 0; i <= segments; i++) {
            const theta = -angle / 2 + (angle / segments) * i;
            const x = Math.sin(theta) * radius;
            const z = Math.cos(theta) * radius;
            
            vertices.push(x, 0, z);
            uvs.push(0.5 + Math.sin(theta) * 0.5, 0.5 - Math.cos(theta) * 0.5);
        }
        
        for (let i = 0; i < segments; i++) {
            indices.push(0, i + 1, i + 2);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return geometry;
    }
    
    handleInput(input) {
        const config = GameConfig.physics;
        
        if (input.forward) {
            if (!this.isMoving || this.rewindPower < 90) {
                this.isRewinding = true;
                this.rewindPower = Math.min(
                    this.rewindPower + GameConfig.rewind.chargeRate,
                    GameConfig.rewind.maxPower
                );
            }
        } else {
            if (this.isRewinding && this.rewindPower > 0) {
                this.isMoving = true;
                this.rewindTimer = GameConfig.rewind.duration;
                this.speed = config.maxSpeed * (this.rewindPower / GameConfig.rewind.maxPower);
            }
            this.isRewinding = false;
        }
        
        // Braking
        if (input.backward && this.isMoving) {
            this.speed = Math.max(this.speed - config.deceleration * 2, 0);
            const speedRatio = this.speed / config.maxSpeed;
            this.rewindPower = GameConfig.rewind.maxPower * speedRatio;
            
            if (this.speed === 0) {
                this.isMoving = false;
                this.rewindPower = 0;
                this.rewindTimer = 0;
            }
        }
        
        // Auto-deceleration
        if (this.isMoving && !input.backward && !input.forward) {
            this.rewindTimer -= 16.67;
            
            if (this.rewindTimer <= 0) {
                this.isMoving = false;
                this.rewindPower = 0;
                this.speed = 0;
            } else {
                const timeRatio = this.rewindTimer / GameConfig.rewind.duration;
                this.speed *= 0.998;
                this.rewindPower *= timeRatio;
            }
        }
        
        // Steering
        if (input.left) {
            this.lateralSpeed = Math.min(this.lateralSpeed + 0.005, config.maxLateralSpeed);
        } else if (input.right) {
            this.lateralSpeed = Math.max(this.lateralSpeed - 0.005, -config.maxLateralSpeed);
        } else {
            this.lateralSpeed *= 0.9;
        }
        
        this.group.position.x += this.lateralSpeed;
        this.group.position.x = Math.max(-8, Math.min(8, this.group.position.x));
    }
    
    onPotholeHit() {
        this.speed *= 0.3;
        this.rewindPower *= 0.5;
    }
    
    get position() {
        return this.group.position;
    }
}
