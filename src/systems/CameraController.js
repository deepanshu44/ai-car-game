import { GameConfig } from '../config/GameConfig.js';

export class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.shakeOffset = { x: 0, y: 0, z: 0 };
        this.isShaking = false;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeStartTime = 0;
    }
    
    follow(target) {
        const baseX = target.position.x;
        const baseY = GameConfig.camera.offsetY;
        const baseZ = target.position.z + GameConfig.camera.offsetZ;
        
        this.camera.position.x = baseX + this.shakeOffset.x;
        this.camera.position.y = baseY + this.shakeOffset.y;
        this.camera.position.z = baseZ + this.shakeOffset.z;
        
        this.camera.lookAt(
            target.position.x + this.shakeOffset.x * 0.5,
            0,
            target.position.z + 10
        );
    }
    
    startShake(intensity, duration) {
        this.isShaking = true;
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeStartTime = Date.now();
    }
    
    update() {
        if (!this.isShaking) return;
        
        const elapsed = Date.now() - this.shakeStartTime;
        
        if (elapsed >= this.shakeDuration) {
            this.isShaking = false;
            this.shakeOffset = { x: 0, y: 0, z: 0 };
            return;
        }
        
        const progress = elapsed / this.shakeDuration;
        const currentIntensity = this.shakeIntensity * (1 - progress);
        
        this.shakeOffset = {
            x: (Math.random() - 0.5) * currentIntensity,
            y: (Math.random() - 0.5) * currentIntensity,
            z: (Math.random() - 0.5) * currentIntensity * 0.5
        };
    }
    
    onWindowResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
