import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class House {
    constructor(scene, x, z, color = 0xd2b48c) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.initialZ = z;
        this.color = color;
        
        this.createHouse();
	// 	const gltfLoader = new GLTFLoader();
	
	// const root = this.gltf.scene.getObjectByName(block)
	// // root.position.set(0,50,0)
	// this.group.add(root.clone());
	// gltfLoader.load( 'https://threejs.org/manual/examples/resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', ( gltf ) => {
	    // let obj = gltf.scene
	    // while(obj.children.length <= 1){
	    // 	obj = obj["children"][0]
	    // }
	    // console.log(obj.children)
	    // const childModel = obj.children[5]
	// console.log(gltf.scene.getObjectByName('Block_1'))

	    // scene.add( root );

	    // compute the box that contains all the stuff
	    // from root and below
	    // const box = new THREE.Box3().setFromObject( root );

	    // const boxSize = box.getSize( new THREE.Vector3() ).length();
	    // const boxCenter = box.getCenter( new THREE.Vector3() );

	    // // set the camera to frame the box
	    // frameArea( boxSize * 0.5, boxSize, boxCenter, camera );

	    // // update the Trackball controls to handle the new size
	    // controls.maxDistance = boxSize * 10;
	    // controls.target.copy( boxCenter );
	    // controls.update();

	// } )
        this.group.position.set(x*1.2, 0, z);
        this.group.rotation.y = x>0?-Math.PI/2:Math.PI/2
	// this.group.scale.set(.05,.05,.05)
        scene.add(this.group);
    }
    
    createHouse() {
	const farmhouse = this.group;

	// Main house body
	const houseGeometry = new THREE.BoxGeometry(10, 6, 8);
	const houseMaterial = new THREE.MeshLambertMaterial({ color: 0xd4a574 });
	const house = new THREE.Mesh(houseGeometry, houseMaterial);
	house.position.y = 3;
	house.castShadow = true;
	house.receiveShadow = true;
	farmhouse.add(house);

	// Roof
	const roofGeometry = new THREE.ConeGeometry(7, 4, 4);
	const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
	const roof = new THREE.Mesh(roofGeometry, roofMaterial);
	roof.position.y = 8;
	roof.rotation.y = Math.PI / 4;
	roof.castShadow = true;
	farmhouse.add(roof);

	// Chimney
	const chimneyGeometry = new THREE.BoxGeometry(0.8, 3, 0.8);
	const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 });
	const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
	chimney.position.set(3, 8.5, 2);
	chimney.castShadow = true;
	farmhouse.add(chimney);

	// Door
	const doorGeometry = new THREE.BoxGeometry(1.5, 3, 0.2);
	const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
	const door = new THREE.Mesh(doorGeometry, doorMaterial);
	door.position.set(0, 1.5, 4.1);
	farmhouse.add(door);

	// Windows
	const windowGeometry = new THREE.BoxGeometry(1.2, 1.2, 0.2);
	const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB });
	
	// Front windows
	const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
	window1.position.set(-2.5, 3, 4.1);
	farmhouse.add(window1);
	
	const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
	window2.position.set(2.5, 3, 4.1);
	farmhouse.add(window2);

	// Side windows
	const window3 = new THREE.Mesh(windowGeometry, windowMaterial);
	window3.position.set(5.1, 3, 0);
	window3.rotation.y = Math.PI / 2;
	farmhouse.add(window3);

	const window4 = new THREE.Mesh(windowGeometry, windowMaterial);
	window4.position.set(-5.1, 3, 0);
	window4.rotation.y = Math.PI / 2;
	farmhouse.add(window4);

	// Porch
	const porchGeometry = new THREE.BoxGeometry(6, 0.3, 2);
	const porchMaterial = new THREE.MeshLambertMaterial({ color: 0xa0826d });
	const porch = new THREE.Mesh(porchGeometry, porchMaterial);
	porch.position.set(0, 0.15, 5.5);
	porch.castShadow = true;
	farmhouse.add(porch);

	// Porch pillars
	const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2.5);
	const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
	
	for (let x of [-2.5, 2.5]) {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(x, 1.4, 5.5);
            pillar.castShadow = true;
            farmhouse.add(pillar);
	}

	// Porch roof
	const porchRoofGeometry = new THREE.BoxGeometry(6.5, 0.2, 2.5);
	const porchRoof = new THREE.Mesh(porchRoofGeometry, roofMaterial);
	porchRoof.position.set(0, 2.8, 5.5);
	porchRoof.castShadow = true;
	farmhouse.add(porchRoof);
        // // House body
        // const bodyGeometry = new THREE.BoxGeometry(4, 3, 4);
        // const bodyMaterial = new THREE.MeshLambertMaterial({ color: this.color });
        // const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        // body.position.y = 1.5;
        // body.castShadow = true;
        // this.group.add(body);
        
        // // Roof
        // const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
        // const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        // const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        // roof.position.y = 3.5;
        // roof.rotation.y = Math.PI / 4;
        // roof.castShadow = true;
        // this.group.add(roof);
        
        // // Door
        // const doorGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.1);
        // const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x4a2511 });
        // const door = new THREE.Mesh(doorGeometry, doorMaterial);
        // door.position.set(0, 0.75, 2.05);
        // this.group.add(door);
        
        // // Windows
        // const windowGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.1);
        // const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb });
        
        // const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        // window1.position.set(-1, 1.8, 2.05);
        // this.group.add(window1);
        
        // const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        // window2.position.set(1, 1.8, 2.05);
        // this.group.add(window2);
    }
    
    update(worldSpeed) {
        this.group.position.z -= worldSpeed;
        if (this.group.position.z < -50) {
            this.group.position.z += 350;
        }
	
    }

    // hide() {
    // 	this.group.position.y += worldSpeed
    //     this.objects.forEach(obj => {
    // 	    obj.mesh.position.y = -500
    //     });
    // }

    // show() {
    //     this.objects.forEach(obj => {
    // 	    obj.mesh.position.y = 50
    //     });
    // }
}

