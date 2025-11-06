import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export class Bridge {
    constructor(scene, z) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.initialZ = z;
        
        this.createBridge();
        this.group.position.set(0, 0, z);
        scene.add(this.group);
    }
    
    createBridge() {
	this.sharedMaterials = {
            deck: new THREE.MeshLambertMaterial({ color: 0x444444 }),
            railing: new THREE.MeshLambertMaterial({ color: 0x666666 }),
            pillar: new THREE.MeshLambertMaterial({ color: 0x555555 }),
            lampPost: new THREE.MeshLambertMaterial({ color: 0x333333 }),
            lampHead: new THREE.MeshLambertMaterial({ color: 0x222222 }),
	    buld:new THREE.MeshBasicMaterial({ 
		color: 0xffffbb,
		emissive: 0xffffbb,
		emissiveIntensity: 1
            }),
            board: new THREE.MeshLambertMaterial({ color: 0x2a5f2a }),
            border: new THREE.MeshLambertMaterial({ color: 0xffffff })
	};
        // Bridge deck
        const deckGeometry = new THREE.BoxGeometry(80, 0.5, 12);
        // const deckMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const deck = new THREE.Mesh(deckGeometry, this.sharedMaterials.deck);
        deck.position.y = 8;
        deck.castShadow = false;
        this.group.add(deck);
        
        // Railings
        this.createRailings();
        
        // Support pillars
        this.createPillars();
        
        // Street lamps on bridge
        this.createBridgeLamps();
        
        // Location guide signs
        // this.createBridgeSigns();
        
        // Overhead signs
        this.createOverheadSigns();
        
        // Bridge cars
        this.createBridgeCars();
        
        // Shadow/underpass effect
        // this.createShadow();
    }
    
    createRailings() {
        const railingGeometry = new THREE.BoxGeometry(80, 1, 0.3);
        // const railingMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        
        const railingLeft = new THREE.Mesh(railingGeometry, this.sharedMaterials.railing);
        railingLeft.position.set(0, 8.75, -6);
        this.group.add(railingLeft);
        
        const railingRight = new THREE.Mesh(railingGeometry, this.sharedMaterials.railing);
        railingRight.position.set(0, 8.75, 6);
        this.group.add(railingRight);
    }
    
    createPillars() {
        const pillarGeometry = new THREE.BoxGeometry(2, 8, 2);
        // const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const pillarPositions = [-30, -15, 15, 30];
	
	const geometries = [];
	pillarPositions.forEach(x => {
            const geoL = pillarGeometry.clone();
            geoL.translate(x, 4, -8);
            geometries.push(geoL);
            
            const geoR = pillarGeometry.clone();
            geoR.translate(x, 4, 8);
            geometries.push(geoR);
	});
	
	const mergedGeometry = mergeGeometries(geometries);
	const pillars = new THREE.Mesh(mergedGeometry, this.sharedMaterials.pillar);
	this.group.add(pillars);
        // pillarPositions.forEach(x => {
        //     const pillarL = new THREE.Mesh(pillarGeometry, this.sharedMaterials.pillar);
        //     pillarL.position.set(x, 4, -8);
        //     pillarL.castShadow = false;
        //     this.group.add(pillarL);
            
        //     const pillarR = new THREE.Mesh(pillarGeometry, this.sharedMaterials.pillar);
        //     pillarR.position.set(x, 4, 8);
        //     pillarR.castShadow = false;
        //     this.group.add(pillarR);
        // });
    }
    
    createBridgeLamps() {
	const lampPositions = [-35, -20, -5, 10, 25];
	const count = lampPositions.length * 2;
	
	// Post
	const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 6);
	const postMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
	const postMesh = new THREE.InstancedMesh(postGeometry, postMaterial, count);
	
	const matrix = new THREE.Matrix4();
	let idx = 0;
	lampPositions.forEach(x => {
            matrix.setPosition(x, 9, -5.5);
            postMesh.setMatrixAt(idx++, matrix);
            
            matrix.setPosition(x, 9, 5.5);
            postMesh.setMatrixAt(idx++, matrix);
	});
	
	this.group.add(postMesh);
    }
    
    createSingleBridgeLamp(x, y, z) {
        const lampGroup = new THREE.Group();
        
        const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 6);
        // const postMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const post = new THREE.Mesh(postGeometry, this.sharedMaterials.lampPost);
        post.position.y = 1;
        lampGroup.add(post);
        
        const headGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.3);
        // const headMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const head = new THREE.Mesh(headGeometry, this.sharedMaterials.lampHead);
        head.position.y = 2.2;
        lampGroup.add(head);
        
        const bulbGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        // const bulbMaterial = new THREE.MeshBasicMaterial({ 
        //     color: 0xffffbb,
        //     emissive: 0xffffbb,
        //     emissiveIntensity: 1
        // });
        const bulb = new THREE.Mesh(bulbGeometry, this.sharedMaterials.bulb);
        bulb.position.y = 2;
        lampGroup.add(bulb);
        
        const light = new THREE.PointLight(0xffffcc, 0.8, 15);
        light.position.y = 2;
        lampGroup.add(light);
        
        lampGroup.position.set(x, y, z);
        this.group.add(lampGroup);
    }
    
    // createBridgeSigns() {
    //     this.createSingleBridgeSign(-25, 'CITY CENTER', '5 KM');
    // }
    
    // createSingleBridgeSign(x, topText, bottomText) {
    //     const signGroup = new THREE.Group();
        
    //     const postGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
    //     const postMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    //     const post = new THREE.Mesh(postGeometry, postMaterial);
    //     post.position.y = 1.5;
    //     post.position.z = -7;
    //     signGroup.add(post);
        
    //     const boardGeometry = new THREE.BoxGeometry(3, 1.5, 0.1);
    //     const boardMaterial = new THREE.MeshLambertMaterial({ color: 0x2a5f2a });
    //     const board = new THREE.Mesh(boardGeometry, boardMaterial);
    //     board.position.y = 3.5;
    //     board.position.z = -7;
    //     signGroup.add(board);
        
    //     const borderGeometry = new THREE.BoxGeometry(3.1, 1.6, 0.08);
    //     const borderMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    //     const border = new THREE.Mesh(borderGeometry, borderMaterial);
    //     border.position.y = 3.5;
    //     border.position.z = -7.05;
    //     signGroup.add(border);
        
    //     const texture = this.createSignTexture(topText, bottomText);
    //     const textMaterial = new THREE.MeshBasicMaterial({ 
    //         map: texture,
    //         transparent: true
    //     });
    //     const textPlane = new THREE.Mesh(
    //         new THREE.PlaneGeometry(2.8, 1.4),
    //         textMaterial
    //     );
    //     textPlane.position.y = 3.5;
    //     textPlane.position.z = -6.95;
    //     signGroup.add(textPlane);
        
    //     signGroup.position.set(x, 8, 0);
    //     this.group.add(signGroup);
    // }
    
    createSignTexture(topText, bottomText) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#2a5f2a';
        ctx.fillRect(0, 0, 512, 256);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(topText, 256, 80);
        
        ctx.font = '36px Arial';
        ctx.fillText(bottomText, 256, 180);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createOverheadSigns() {
        this.createSingleOverheadSign(0, 'DOWNTOWN ↑', 'AIRPORT →');
        this.createSingleOverheadSign(5, 'HIGHWAY 101', 'NORTH');
        this.createSingleOverheadSign(10, 'EXIT 42', 'NEXT 2 KM');
    }
    
    createSingleOverheadSign(x, topText, bottomText) {
        const signGroup = new THREE.Group();
        
        const boardGeometry = new THREE.BoxGeometry(5, 2, 0.15);
        const boardMaterial = new THREE.MeshLambertMaterial({ color: 0x2a5f2a });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.y = 5.5;
        signGroup.add(board);
        
        const borderGeometry = new THREE.BoxGeometry(5.1, 2.1, 0.12);
        const borderMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(0, 5.5, 0.08);
        signGroup.add(border);
        
        // Glowing lamps
        const lampPositions = [-2, -0.7, 0.7, 2];
        lampPositions.forEach(lampX => {
            const lampHousing = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 0.3, 6),
                new THREE.MeshLambertMaterial({ color: 0x222222 })
            );
            lampHousing.rotation.z = Math.PI / 2;
            lampHousing.rotation.x = Math.PI / 4;
            lampHousing.position.set(lampX, 6.7, 0.2);
            signGroup.add(lampHousing);
            
            const bulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshBasicMaterial({ 
                    color: 0xffffaa,
                    emissive: 0xffffaa,
                    emissiveIntensity: 1.2
                })
            );
            bulb.position.set(lampX, 6.6, 0.3);
            signGroup.add(bulb);
            
            const spotLight = new THREE.SpotLight(0xffffcc, 0.6, 5, Math.PI / 6, 0.5);
            spotLight.position.set(lampX, 6.7, 0.3);
            spotLight.target.position.set(lampX, 5.5, 0.1);
            signGroup.add(spotLight);
            signGroup.add(spotLight.target);
        });
        
        const texture = this.createOverheadSignTexture(topText, bottomText);
        const frontMaterial = new THREE.MeshBasicMaterial({ map: texture });
        
        const frontPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(4.8, 1.8),
            frontMaterial
        );
        frontPlane.position.set(0, 5.5, 0.08);
        signGroup.add(frontPlane);
        
        const backPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(4.8, 1.8),
            frontMaterial
        );
        backPlane.position.set(0, 5.5, -0.08);
        backPlane.rotation.y = Math.PI;
        signGroup.add(backPlane);
        
        signGroup.position.set(x, 2, -10);
        this.group.add(signGroup);
    }
    
    createOverheadSignTexture(topText, bottomText) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        // canvas.width = 512;
        // canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#001a00';
        ctx.fillRect(0, 0, 512, 256);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 62px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(topText, 256, 90);
        
        ctx.font = '58px Arial';
        ctx.fillText(bottomText, 256, 170);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createBridgeCars() {
        const bridgeCarColors = [0xff0000, 0x0000ff, 0xffff00, 0x00ff00];
        for (let i = 0; i < 4; i++) {
            const carBody = new THREE.Mesh(
                new THREE.BoxGeometry(2, 1, 4),
                new THREE.MeshLambertMaterial({ color: bridgeCarColors[i] })
            );
            carBody.position.set(-35 + i * 20, 9, Math.random() * 8 - 4);
            carBody.castShadow = false;
            this.group.add(carBody);
        }
    }
    
    createShadow() {
        const shadowGeometry = new THREE.PlaneGeometry(80, 12);
        const shadowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            side: THREE.FrontSide
        });
        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.15;
        this.group.add(shadow);
    }
    
    update(worldSpeed) {
        this.group.position.z -= worldSpeed;
        if (this.group.position.z < -50) {
            this.group.position.z += 350;
        }
    }
}

