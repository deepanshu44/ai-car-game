import * as THREE from 'three';

export class GeometryHelper {
    static createBox(width, height, depth, color) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({ color });
        return new THREE.Mesh(geometry, material);
    }
    
    static createCylinder(radiusTop, radiusBottom, height, color) {
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 16);
        const material = new THREE.MeshLambertMaterial({ color });
        return new THREE.Mesh(geometry, material);
    }
    
    static createSphere(radius, color, emissive = null) {
        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        const material = new THREE.MeshLambertMaterial({ 
            color,
            emissive: emissive || color,
            emissiveIntensity: emissive ? 1 : 0
        });
        return new THREE.Mesh(geometry, material);
    }
}
