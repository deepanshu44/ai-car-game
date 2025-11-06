import * as THREE from 'three';

export class Cloud {
    constructor(scene, x, y, z) {
        this.scene = scene;
        this.group = new THREE.Group();
        
        this.createCloud();
        this.group.position.set(x, y*2, z);
        
        const scale = 2 + Math.random() * 2;
        this.group.scale.set(scale, scale, scale);
        this.group.rotation.y = Math.random() * Math.PI * 2;
        
        scene.add(this.group);
    }
    
    createCloud() {
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            opacity: 0.8
        });
        
        const spherePositions = [
            [0, 0, 0, 2.5],
            [-2, 0.4, 1, 1.8],
            [2, 0.2, -0.6, 2],
            [0.6, 1, 0, 1.5],
            [-1, -0.4, -1, 1.3]
        ];
        
        spherePositions.forEach(pos => {
            const geometry = new THREE.SphereGeometry(pos[3], 8, 8);
            const sphere = new THREE.Mesh(geometry, cloudMaterial);
            sphere.position.set(pos[0], pos[1], pos[2]);
            this.group.add(sphere);
        });
    }
    
    update(worldSpeed) {
        this.group.position.z -= worldSpeed;
        if (this.group.position.z < -50) {
            this.group.position.z += 350;
        }
    }
}

