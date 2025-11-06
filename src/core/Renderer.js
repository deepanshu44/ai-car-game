import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig.js';
// import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/addons/postprocessing/RenderPass';
// import { BokehPass } from 'three/addons/postprocessing/BokehPass';

export class Renderer {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: GameConfig.rendering.antialias,
	    // logarithmicDepthBuffer: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = GameConfig.rendering.shadowsEnabled;
        // this.renderer.shadowMap.enabled = false;
        
        const container = document.getElementById('game-container');
        container.appendChild(this.renderer.domElement);
    }
    
    render(scene, camera) {
	// // Post-processing setup
	// const composer = new EffectComposer(this.renderer);
	// const renderPass = new RenderPass(scene, camera);
	// composer.addPass(renderPass);

	// // BokehPass for depth-of-field
	// const bokehPass = new BokehPass(scene, camera, {
	//     focus: 0,    // Distance to the focal plane
	//     aperture: 0, // Aperture size (blur intensity)
	//     maxblur: 0,  // Maximum blur amount
	// });
	// bokehPass.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);
	// composer.addPass(bokehPass);
	// composer.render();
        this.renderer.render(scene, camera);
    }
    
    onWindowResize(width, height) {
        this.renderer.setSize(width, height);
    }
}

