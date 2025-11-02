import * as THREE from 'three';

export class Cave {
    constructor(scene, z) {
        this.scene = scene;
        this.group = new THREE.Group();
        // this.group.position.set(0, 0, z);
        scene.add(this.group);
    }
    
    createCave() {
	// Cylinder parameters
	const outerRadius = 100;    // Outer radius
	const innerRadius = 70;  // Inner radius (must be less than outerRadius)
	const height = 200;         // Height of the cylinder
	const radialSegments = 32;// Number of segments around the circumference

	// Outer cylinder (visible from outside and inside)
	const outerGeometry = new THREE.CylinderGeometry(
            outerRadius, outerRadius, height, radialSegments, 1, true // Open-ended
	);
	const outerMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide, // Render both sides
            shininess: 30
	});
	const outerCylinder = new THREE.Mesh(outerGeometry, outerMaterial);
	// outerCylinder.position.set(1, 0.5, 0);
	this.group.add(outerCylinder);

	// Inner cylinder (visible from inside and outside)
	const innerGeometry = new THREE.CylinderGeometry(
            innerRadius, innerRadius, height, radialSegments, 1, true // Open-ended
	);
	const innerMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide, // Render both sides
            shininess: 30
	});
	const innerCylinder = new THREE.Mesh(innerGeometry, innerMaterial);
	// innerCylinder.position.set(1, 0.5, 0);
	this.group.add(innerCylinder);

	// Create rings to fill the top and bottom gaps
	const ringGeometry = new THREE.RingGeometry(
            innerRadius, outerRadius, radialSegments, 1
	);
	const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00, // Match the outer cylinder color
            side: THREE.DoubleSide,
            shininess: 30
	});

	// Top ring
	const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
	topRing.position.y = height / 2;
	topRing.rotation.x = -Math.PI / 2; // Rotate to face upward
	this.group.add(topRing);

	// Bottom ring
	const bottomRing = new THREE.Mesh(ringGeometry, ringMaterial);
	bottomRing.position.y = -height / 2;
	bottomRing.rotation.x = Math.PI / 2; // Rotate to face downward
	this.group.add(bottomRing);
    }
    
    update(worldSpeed) {
        this.group.position.z -= worldSpeed;
        if (this.group.position.z < -50) {
            this.group.position.z += 350;
        }
    }
}

