import * as THREE from 'three';

export class PoliceCar {
    constructor(scene, x, z) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.initialZ = z;
        
        this.createCar();
        this.group.position.set(x, 0, z);
        scene.add(this.group);
    }
    
    createCar() {
        // Police car body
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        this.group.add(body);
        
        // White stripe
        const stripeGeometry = new THREE.BoxGeometry(2.1, 0.5, 1.5);
        const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.y = 0.5;
        this.group.add(stripe);
        
        // Red/Blue lights
        const lightGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.3);
        const redLight = new THREE.Mesh(
            lightGeometry, 
            new THREE.MeshLambertMaterial({ color: 0xff0000 })
        );
        redLight.position.set(-0.5, 1.2, 1.5);
        this.group.add(redLight);
        
        const blueLight = new THREE.Mesh(
            lightGeometry, 
            new THREE.MeshLambertMaterial({ color: 0x0000ff })
        );
        blueLight.position.set(0.5, 1.2, 1.5);
        this.group.add(blueLight);
    }
    
    update(worldSpeed) {
        this.group.position.z -= worldSpeed;
        if (this.group.position.z < -50) {
            this.group.position.z += 350;
        }
    }
}

