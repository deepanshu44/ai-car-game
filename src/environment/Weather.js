import * as THREE from 'three';

export class Weather {
    constructor(scene) {
        this.scene = scene;
        this.stars = null;
        this.moon = null;
        
        this.createNightSky();
        this.createMoon();
    }
    
    createNightSky() {
        this.scene.background = new THREE.Color(0x000011); // 0x0a1a33
        this.scene.fog = new THREE.Fog(0x000011, 1, 300);
        
        // Starfield
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 300;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 200;
            positions[i + 1] = 30 + Math.random() * 70;
            positions[i + 2] = (Math.random() - 0.5) * 200;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.8
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }
    
    createMoon() {
        const moonGeometry = new THREE.SphereGeometry(3, 16, 16);
        const moonMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffcc,
            emissive: 0xffffaa,
            emissiveIntensity: 0.3
        });
        this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
        this.moon.position.set(40, 50, 100);
        this.scene.add(this.moon);
    }
    
    update() {
        if (this.stars) {
            this.stars.material.opacity = 0.6 + Math.sin(Date.now() * 0.001) * 0.2;
        }
    }
    
    transitionToFarmland(progress) {
        const cityColor = new THREE.Color(0x0a0a1a);
        const farmColor = new THREE.Color(0x87a96b);
        const currentColor = cityColor.clone().lerp(farmColor, progress);
        
        this.scene.background = currentColor;
        if (this.scene.fog) {
            this.scene.fog.color = currentColor;
        }
    }
    
    transitionToCity(progress) {
        const farmColor = new THREE.Color(0x87a96b);
        const cityColor = new THREE.Color(0x0a0a1a);
        const currentColor = farmColor.clone().lerp(cityColor, progress);
        
        this.scene.background = currentColor;
        if (this.scene.fog) {
            this.scene.fog.color = currentColor;
        }
    }
}

