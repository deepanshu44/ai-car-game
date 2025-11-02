import * as THREE from 'three';
import { MeshFactory } from '../utils/MeshFactory.js';

export class TrafficCar {
    constructor(scene, z, laneX) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.speed = 0.5 + Math.random() * 0.3;
        this.lane = laneX;
        
        this.createCar();
        this.group.position.set(laneX, 0, z);
        scene.add(this.group);
    }
    
    createCar() {
        const colors = [0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const body = MeshFactory.createBox(2, 1, 4, color);
        body.position.y = 0.5;
        body.castShadow = true;
        this.group.add(body);
        
        const roof = MeshFactory.createBox(1.6, 0.8, 2, color);
        roof.position.set(0, 1.4, -0.3);
        roof.castShadow = true;
        this.group.add(roof);
        
        this.createWheels();
        this.createLights();
    }
    
    createWheels() {
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const positions = [[-1.1, 0.4, 1.3], [1.1, 0.4, 1.3], [-1.1, 0.4, -1.3], [1.1, 0.4, -1.3]];
        
        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            wheel.castShadow = true;
            this.group.add(wheel);
        });
    }
    
    createLights() {
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 2
        });
        
        const headlight1 = MeshFactory.createSphere(0.2, 0xffffcc);
        headlight1.position.set(-0.8, 0.8, -1.9);
        this.group.add(headlight1);
        
        const headlight2 = MeshFactory.createSphere(0.2, 0xffffcc);
        headlight2.position.set(0.8, 0.8, -1.9);
        this.group.add(headlight2);
    }
    
    update(worldSpeed) {
        this.group.position.z -= worldSpeed + this.speed;
        
        if (this.group.position.z < -30) {
            this.group.position.z = 250;
            this.group.position.x = this.lane;
        }
    }
}
