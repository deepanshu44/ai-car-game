import * as THREE from 'three';

export class CrossingTraffic {
    constructor(scene, x, intersectionZ,distanceToSwitch) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.speed = 0.4 + Math.random() * 0.3;
        this.intersectionZ = intersectionZ;
	this.distanceToSwitch = distanceToSwitch;
        
        this.createCar();
        this.group.position.set(x, 0, intersectionZ + (Math.random() - 0.5) * 10);
        this.group.rotation.y = Math.PI / 2;
        scene.add(this.group);
    }
    
    createCar() {
        const colors = [0xff00ff, 0x00ffff, 0xffa500, 0xff1493, 0x00ff7f];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = false;
        this.group.add(body);
        
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.8, 2),
            bodyMaterial
        );
        roof.position.y = 1.4;
        roof.position.z = -0.3;
        this.group.add(roof);
    }
    
    update(worldSpeed) {
        this.group.position.x += this.speed;
        this.group.position.z -= worldSpeed;
        
        if (this.group.position.x > 50) {
            this.group.position.x = -40;
        }
        
        if (this.group.position.z < -50) {
            if (this.distanceToSwitch.dist<350) {
		this.group.position.z += 2*350;
	    } else {
		this.group.position.z += 350;
	    }
        }
    }
}

