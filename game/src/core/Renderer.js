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
