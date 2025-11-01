import * as THREE from 'three';

export class ColorUtils {
    static lerpColors(color1, color2, t) {
        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);
        return c1.lerp(c2, t);
    }
    
    static hexToRGB(hex) {
        return {
            r: ((hex >> 16) & 255) / 255,
            g: ((hex >> 8) & 255) / 255,
            b: (hex & 255) / 255
        };
    }
}
