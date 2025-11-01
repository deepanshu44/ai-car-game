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
