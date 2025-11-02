import * as THREE from 'three';

export class House {
    constructor(scene, x, z, color = 0xd2b48c) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.initialZ = z;
        this.color = color;
        
        this.createHouse();
        this.group.position.set(x, 0, z);
        scene.add(this.group);
    }
    
    createHouse() {
        // House body
        const bodyGeometry = new THREE.BoxGeometry(4, 3, 4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: this.color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        this.group.add(body);
        
        // Roof
        const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 3.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.group.add(roof);
        
        // Door
        const doorGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.1);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x4a2511 });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 0.75, 2.05);
        this.group.add(door);
        
        // Windows
        const windowGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.1);
        const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb });
        
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(-1, 1.8, 2.05);
        this.group.add(window1);
        
        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(1, 1.8, 2.05);
        this.group.add(window2);
    }
    
    update(worldSpeed) {
        this.group.position.z -= worldSpeed;
        if (this.group.position.z < -50) {
            this.group.position.z += 350;
        }
    }
}

