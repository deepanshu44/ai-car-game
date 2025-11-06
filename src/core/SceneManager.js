import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig.js';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = this.createCamera();
	this.scene.timeOfTheDay = "day"
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
	//day
	let ambientLight,directionalLight;
        if (this.scene.timeOfTheDay === "day") {
            ambientLight = new THREE.AmbientLight(0xffffff, 0.2); //0x0a1a33
            directionalLight = new THREE.DirectionalLight(0xffffff, 2.8);
	    directionalLight.castShadow = true;
	    // Configure shadow properties
	    // directionalLight.shadow.mapSize.width = 2048;  // Shadow quality
	    // directionalLight.shadow.mapSize.height = 2048;
	    directionalLight.shadow.camera.near = 10.5;
	    directionalLight.shadow.camera.far = 200;
	    directionalLight.shadow.camera.left = -50;
	    directionalLight.shadow.camera.right = 50;
	    directionalLight.shadow.camera.top = 10;
	    directionalLight.shadow.camera.bottom = -50;

	    // const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
	    // this.scene.add(cameraHelper);
	    
	} else {
	    // night
            ambientLight = new THREE.AmbientLight(0x404060, 0.4);
            directionalLight = new THREE.DirectionalLight(0xffffff, 2.8);
	    // //0x0a1a33 0x404060
	    directionalLight.castShadow = true;
	    
	}
	// 0x404060
	this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        this.scene.add(ambientLight);
        
        // directionalLight.position.set(10, 20, 10);
        directionalLight.position.set(40, 50, 100);
        this.scene.add(directionalLight);
    }
}

