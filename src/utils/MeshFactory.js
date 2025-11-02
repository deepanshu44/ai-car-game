import * as THREE from 'three';

export class MeshFactory {
    static createBox(width, height, depth, color) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({ color });
        return new THREE.Mesh(geometry, material);
    }
    
    static createCylinder(radiusTop, radiusBottom, height, color, segments = 8) {
        const geometry = new THREE.CylinderGeometry(
            radiusTop, radiusBottom, height, segments
        );
        const material = new THREE.MeshLambertMaterial({ color });
        return new THREE.Mesh(geometry, material);
    }
    
    static createSphere(radius, color, segments = 8) {
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        const material = new THREE.MeshLambertMaterial({ color });
        return new THREE.Mesh(geometry, material);
    }
    
    static createEmissiveSphere(radius, color, intensity = 1) {
        const geometry = new THREE.SphereGeometry(radius, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color,
            emissive: color,
            emissiveIntensity: intensity
        });
        return new THREE.Mesh(geometry, material);
    }
}
