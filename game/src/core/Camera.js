import * as THREE from 'three';

export class Camera {
    constructor(config) {
        this.config = config;
        this.camera = null;
        this.cameraShakeOffset = { x: 0, y: 0, z: 0 };
        this.create();
    }
    
    create() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, -12);
        this.camera.lookAt(0, 0, 0);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    follow(targetMesh) {
        const baseX = targetMesh.position.x;
        const baseY = 5;
        const baseZ = targetMesh.position.z - 12;
        
        this.camera.position.x = baseX + this.cameraShakeOffset.x;
        this.camera.position.y = baseY + this.cameraShakeOffset.y;
        this.camera.position.z = baseZ + this.cameraShakeOffset.z;
        
        this.camera.lookAt(
            targetMesh.position.x + this.cameraShakeOffset.x * 0.5,
            0,
            targetMesh.position.z + 10
        );
    }
    
    shake(intensity, duration) {
        // Implementation for screen shake
        // (Can be expanded with more sophisticated shake logic)
    }
    
    applyCameraShake(offset) {
        this.cameraShakeOffset = offset;
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
    
    getCamera() {
        return this.camera;
    }
}
