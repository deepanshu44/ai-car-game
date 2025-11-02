import * as THREE from 'three';

export class Helpers {
    static isInRestrictedZone(x, z, zones) {
        const normalizedZ = ((z % 350) + 350) % 350;
        
        for (let zone of zones) {
            if (normalizedZ >= zone.start && normalizedZ <= zone.end) {
                if (x >= -45 && x <= 45) return true;
            }
        }
        return false;
    }
    
    static createGradientTexture(colors, size = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(
            size/2, size/2, 0, 
            size/2, size/2, size/2
        );
        
        colors.forEach(({ stop, color }) => {
            gradient.addColorStop(stop, color);
        });
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    static lerpColor(color1, color2, t) {
        return new THREE.Color(color1).lerp(new THREE.Color(color2), t);
    }
}
