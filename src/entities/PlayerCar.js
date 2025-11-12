import * as THREE from 'three';
import { MeshFactory } from '../utils/MeshFactory.js';
import { Colors } from '../utils/Constants.js';
import { GameConfig } from '../config/GameConfig.js';
import { AudioController } from '../systems/AudioController.js';
import { GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export class PlayerCar {
    constructor(scene,camera) {
        this.scene = scene;
        this.group = new THREE.Group();
	this.group.name = 'car';
        
        // Physics properties
        this.speed = 0;
        this.lateralSpeed = 0;
	this.carState = "stopped"
        
        // this.createCar();
	if (this.scene.timeOfTheDay !== "day") {
            this.createHeadlights();
	} 
	const loader = new GLTFLoader();
	// "Cartoon Low Poly Futuristic Car" (https://skfb.ly/oEnSD)
	// by antonmoek is licensed under Creative Commons Attribution
	// (http://creativecommons.org/licenses/by/4.0/).
	loader.load('/${__REPO_NAME__}/cartoon_low_poly_futuristic_car/scene.gltf', (gltf) => {
	    const car = gltf.scene;
	    car.scale.set(1.5, 1.5, 1.5);
	    car.position.y = 1.5;
	    // car.castShadow = true;
	    car.traverse((child) => {
		if (child.isMesh) {
		    child.castShadow = true;
		}
	    });

	    this.group.add(car);
	}, undefined, (error) => {
	    console.error('Error loading model:', error);
	})
        
	this.group.position.set(
            GameConfig.road.playerLane * GameConfig.road.laneWidth,
            0,
            0
        );
        this.audioController = new AudioController(camera)
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
        const headlight1 = new THREE.SpotLight(Colors.HEADLIGHT, 200, 30, Math.PI / 6, 0.5);
        headlight1.position.set(-0.7, 1, 2);
        headlight1.target.position.set(-0.7, 0, 10);
        this.group.add(headlight1);
        this.group.add(headlight1.target);

        const headlight2 = new THREE.SpotLight(Colors.HEADLIGHT, 200, 30, Math.PI / 6, 0.5);
        headlight2.position.set(0.7, 1, 2);
        headlight2.target.position.set(0.7, 0, 10);
        this.group.add(headlight2);
        this.group.add(headlight2.target);

        // Beam visualization
        // this.createHeadlightBeam();
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
        const indices = [];\n        
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
	    // boost initially when starting from speed 0
	    const speed = this.speed + (this.speed<0.3?(config.acceleration+0.01):config.acceleration)
	    // dont't trigger when accel pressed on while brakes
	    // actively pressed
	    if (this.carState !== "stopped" && this.carState !== "braking") {
		this.audioController.play("accelerate",{percSpeed:this.speed/GameConfig.physics.maxSpeed*100})
	    }
	    if (this.carState === "braking") {
		// this.audioController.play("brake",{percSpeed:this.speed/GameConfig.physics.maxSpeed*100/10})
		
	    }
	    this.carState = "moving"
	    this.speed = Math.min(speed, config.maxSpeed);
        } 
        
        // Braking
        if (input.backward) {
            this.speed = Math.max(this.speed - config.deceleration * 10, 0);
	    if (this.carState === "moving") {
	    }
	    if (this.speed !== 0 && this.carState === "braking") {
		this.audioController.play("brake",{percSpeed:this.speed/GameConfig.physics.maxSpeed*100/10})
	    }
	    this.carState = "braking"
	    // else {
	    // }

        }
        // Auto-deceleration
        if (!input.backward && !input.forward) {
            this.speed = Math.max(this.speed - config.deceleration, 0);
	    if (this.speed === 0) {
		this.carState = "stopped"
	    } else {
		let percSpeed = 2*this.speed/GameConfig.physics.maxSpeed*100
		if (percSpeed>100) {
		    percSpeed = 100
		}
		this.audioController.play("brake",{percSpeed})
		this.carState = "idleSlowing"
	    }
        }
        
        // Steering
        if (input.left) {
            this.lateralSpeed = Math.min(this.lateralSpeed + 0.005, config.maxLateralSpeed);
            // this.lateralSpeed = .2;
        } else if (input.right) {
            this.lateralSpeed = Math.max(this.lateralSpeed - 0.005, -config.maxLateralSpeed);
	    // carRotate -= 0.03*(this.speed/GameConfig.physics.maxSpeed)
            // this.lateralSpeed = -.2;
        } else {
            this.lateralSpeed *= 0.9;
        }

        this.group.position.x += this.lateralSpeed*this.speed*3.5;
        this.group.position.x = Math.max(-8, Math.min(8, this.group.position.x));
	this.group.rotation.y = Math.sin(this.lateralSpeed)*this.speed*3.5
	this.group.rotation.z = Math.sin(this.lateralSpeed)*this.speed/GameConfig.physics.maxSpeed
    }
    
    onPotholeHit() {
        this.speed *= 0.3;
        this.rewindPower *= 0.5;
    }
    
    get position() {
        return this.group.position;
    }
}