import * as THREE from 'three';
import { GameConfig } from '../../config/GameConfig';

export class Intersection {
    constructor(scene, z,distanceToSwitch) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.initialZ = z;
        this.group.position.set(0, 0, z);
	this.distanceToSwitch = distanceToSwitch
        this.createIntersection();
        scene.add(this.group);
    }
    
    createIntersection() {
        // Intersection road surface
        const crossRoadGeometry = new THREE.PlaneGeometry(100, 24);
        const crossRoadMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
        const crossRoad = new THREE.Mesh(crossRoadGeometry, crossRoadMaterial);
        crossRoad.rotation.x = -Math.PI / 2;
        crossRoad.position.y = 0.02;
        this.group.add(crossRoad);
        
        // Crosswalk lines
        this.createCrosswalk();
        
        // Traffic lights
        this.createTrafficLights();
        
        // Road signs
        this.createRoadSigns();
    }
    
    createCrosswalk() {
        const crosswalkMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        for (let i = 0; i < 6; i++) {
            const line = new THREE.Mesh(
                new THREE.PlaneGeometry(1.8, 24),
                crosswalkMaterial
            );
            line.rotation.x = -Math.PI / 2;
            line.position.set(-8 + i * 3.2, 0.03, 0);
            this.group.add(line);
        }
    }
    
    createTrafficLights() {
        this.createSingleTrafficLight(-10, -14, 'red');
        this.createSingleTrafficLight(-10, 14, 'red');
        this.createSingleTrafficLight(10, -14, 'green');
        this.createSingleTrafficLight(10, 14, 'green');
    }
    
    createSingleTrafficLight(x, z, activeColor) {
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3.5, 8);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(x, 1.75, z);
        this.group.add(pole);
        
        const lightBoxGeometry = new THREE.BoxGeometry(0.35, 1, 0.35);
        const lightBoxMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const lightBox = new THREE.Mesh(lightBoxGeometry, lightBoxMaterial);
        lightBox.position.set(x, 4, z);
        this.group.add(lightBox);
        
        // Red light
        const redLight = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 8, 8),
            new THREE.MeshBasicMaterial({ 
                color: activeColor === 'red' ? 0xff0000 : 0x330000,
                emissive: activeColor === 'red' ? 0xff0000 : 0x000000,
                emissiveIntensity: activeColor === 'red' ? 0.8 : 0
            })
        );
        redLight.position.set(x, 4.35, z);
        this.group.add(redLight);
        
        // Yellow light
        const yellowLight = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x333300 })
        );
        yellowLight.position.set(x, 4, z);
        this.group.add(yellowLight);
        
        // Green light
        const greenLight = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 8, 8),
            new THREE.MeshBasicMaterial({ 
                color: activeColor === 'green' ? 0x00ff00 : 0x003300,
                emissive: activeColor === 'green' ? 0x00ff00 : 0x000000,
                emissiveIntensity: activeColor === 'green' ? 0.8 : 0
            })
        );
        greenLight.position.set(x, 3.65, z);
        this.group.add(greenLight);
        
        // Point light for active signal
        if (activeColor === 'red' || activeColor === 'green') {
            const signalLight = new THREE.PointLight(
                activeColor === 'red' ? 0xff0000 : 0x00ff00,
                0.5,
                10
            );
            signalLight.position.set(x, activeColor === 'red' ? 4.35 : 3.65, z);
            this.group.add(signalLight);
        }
    }
    
    createRoadSigns() {
        this.createSingleSign(-12, -16, 'YIELD');
        this.createSingleSign(12, 16, 'STOP');
    }
    
    createSingleSign(x, z, text) {
        const signGroup = new THREE.Group();
        
        const postGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 1.25;
        signGroup.add(post);
        
        let boardGeometry, boardColor;
        
        if (text === 'STOP') {
            boardGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 8);
            boardColor = 0xff0000;
        } else {
            boardGeometry = new THREE.ConeGeometry(0.8, 1.4, 3);
            boardColor = 0xffff00;
        }
        
        const boardMaterial = new THREE.MeshLambertMaterial({ color: boardColor });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.y = 2.8;
        board.position.z = -0.1;
        board.rotation.y = Math.PI / 2;
        board.rotation.x = Math.PI / 2;
        if (text === 'YIELD') board.rotation.z = Math.PI;
        signGroup.add(board);
        
        const borderMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        let border;
        if (text === 'STOP') {
            border = new THREE.Mesh(
                new THREE.CylinderGeometry(0.85, 0.85, 0.08, 8),
                borderMaterial
            );
        } else {
            border = new THREE.Mesh(
                new THREE.ConeGeometry(0.85, 1.5, 3),
                borderMaterial
            );
            border.rotation.z = Math.PI;
        }
        border.position.y = 2.8;
        border.position.z = -0.1;
        border.rotation.y = Math.PI / 2;
        border.rotation.x = Math.PI / 2;
        signGroup.add(border);
        
        signGroup.position.set(x, 0, z);
        this.group.add(signGroup);
    }
    
    update(worldSpeed) {
        this.group.position.z -= worldSpeed;
        if (this.group.position.z < -50) {
	    // if (this.group.visible &&
	    // this.distanceToSwitch.dist<350) {

	    // check if nextSpawnLoc is inside tunnel
	    // +50 added to deal with interection spawning halfway
	    // through the tunnel
	    if ((this.distanceToSwitch.dist+GameConfig.biome.transitionZoneLength+50)>350 && this.distanceToSwitch.dist<350) {
		this.group.position.z += 2*350;
	    } else {
		this.group.position.z += 350;
	    }
        }
	// console.log("this.distanceToSwitch = ", this.distanceToSwitch.dist,this.distanceToSwitch.dist,GameConfig.biome.transitionZoneLength,(this.distanceToSwitch.dist+GameConfig.biome.transitionZoneLength)>350 && this.distanceToSwitch.dist<350);
    }
}

