import * as THREE from 'three';

export class VehicleMetrics {
    constructor(scene) {
	this.scene = scene;

	this.createSpeedometer()
    }

    createSpeedometer(){
	const geometry = new THREE.PlaneGeometry( 1, 0.2 );
	const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	const plane = new THREE.Mesh( geometry, material );
	plane.position.set(8,5,-11.5)
	// plane.rotation.x = Math.PI/7
	this.scene.add( plane );
    }

}
