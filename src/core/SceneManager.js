import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig.js';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = this.createCamera();
        this.setupLighting();
    }
    
    createCamera() {
        const camera = new THREE.PerspectiveCamera(
            GameConfig.camera.fov,
            window.innerWidth / window.innerHeight,
            GameConfig.camera.near,
            GameConfig.camera.far
        );
        camera.position.set(0, 5, -10);
        camera.lookAt(0, 0, 0);
        return camera;
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404060, 0.4); //0x0a1a33
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }
}

