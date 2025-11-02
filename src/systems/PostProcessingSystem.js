import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class PostProcessingSystem {
    constructor(renderer, scene, camera, config) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.config = config;
        
        this.composer = null;
        this.bokehPass = null;
        this.bloomPass = null;
        
        this.init();
    }
    
    init() {
        // Create composer
        this.composer = new EffectComposer(this.renderer);
        
        // Add render pass (base scene)
        const renderPass = new RenderPass(this.scene, this.camera.getCamera());
        this.composer.addPass(renderPass);
        
        // Add depth of field (bokeh) pass
        this.bokehPass = new BokehPass(this.scene, this.camera.getCamera(), {
            focus: 10,          // Focus distance (distance to sharp objects)
            aperture: 0.00005,  // Aperture (larger = more blur)
            maxblur: 0.01,      // Maximum blur amount
            width: window.innerWidth,
            height: window.innerHeight
        });
        this.composer.addPass(this.bokehPass);
        
        // Optional: Add bloom for glowing effects
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.3,    // Strength
            0.4,    // Radius
            0.85    // Threshold
        );
        // this.composer.addPass(this.bloomPass); // Uncomment to enable
        
        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    setFocus(distance) {
        if (this.bokehPass) {
            this.bokehPass.uniforms['focus'].value = distance;
        }
    }
    
    setAperture(value) {
        if (this.bokehPass) {
            this.bokehPass.uniforms['aperture'].value = value;
        }
    }
    
    setMaxBlur(value) {
        if (this.bokehPass) {
            this.bokehPass.uniforms['maxblur'].value = value;
        }
    }
    
    setIntensity(intensity) {
        // intensity: 0 = no blur, 1 = full blur
        this.setAperture(intensity * 0.0001);
        this.setMaxBlur(intensity * 0.02);
    }
    
    enable() {
        this.bokehPass.enabled = true;
    }
    
    disable() {
        this.bokehPass.enabled = false;
    }
    
    toggle() {
        this.bokehPass.enabled = !this.bokehPass.enabled;
    }
    
    render() {
        this.composer.render();
    }
    
    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.composer.setSize(width, height);
        
        if (this.bokehPass) {
            this.bokehPass.uniforms['aspect'].value = width / height;
        }
    }
}
