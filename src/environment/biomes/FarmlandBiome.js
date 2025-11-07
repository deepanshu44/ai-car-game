import * as THREE from 'three';
import { Helpers } from '../../utils/Helpers.js';
import { RestrictedZones } from '../../utils/Constants.js';
import { VegetableCart } from '../objects/VegetableCart.js'
import { Train } from '../structures/Train.js'
import { House } from '../objects/House.js'


export class FarmlandBiome {
    constructor(scene,distanceToSwitch) {
        this.scene = scene;
        this.objects = [];
        this.trains = [];
	this.houses = []
	this.distanceToSwitch = distanceToSwitch;
        // this.spawnFarmland();
	this.spawnTrain()
	// this.spawnHouses()
    }

    spawnTrain(){
	const train1 = new Train(this.scene,120,this.distanceToSwitch)
	const train2 = new Train(this.scene,300,this.distanceToSwitch)
	this.trains.push(train1,train2)
    }
    
    spawnFarmland() {
        // Farms
        this.createFarm(-20, 50);
        this.createFarm(22, 140);
        
        // Silos
        this.createSilo(-25, 80);
        this.createSilo(18, 200);
        
        // Windmills
        this.createWindmill(-28, 160);
        this.createWindmill(25, 240);
	
        // Crop fields
        for (let z = 40; z < 280; z += 40) {
            if (!Helpers.isInRestrictedZone(-15, z, RestrictedZones.intersections)) {
                this.createCropField(-15, z);
            }
            if (!Helpers.isInRestrictedZone(15, z, RestrictedZones.intersections)) {
                this.createCropField(15, z);
            }
        }
        
        // Wooden fences
        for (let z = 35; z < 280; z += 15) {
            if (!Helpers.isInRestrictedZone(-11, z, RestrictedZones.intersections)) {
                this.createFencePost(-11, z);
            }
            if (!Helpers.isInRestrictedZone(11, z, RestrictedZones.intersections)) {
                this.createFencePost(11, z);
            }
        }
        
        // Hay bales
        const hayPositions = [
            { x: -12, z: 70 }, { x: -14, z: 110 },
            { x: 13, z: 90 }, { x: 15, z: 150 },
            { x: -13, z: 180 }, { x: 12, z: 220 }
        ];
        
        hayPositions.forEach(pos => {
            if (!Helpers.isInRestrictedZone(pos.x, pos.z, RestrictedZones.intersections)) {
                this.createHayBale(pos.x, pos.z);
            }
        });

	// hayPositions.forEach((pos) => {
        //     if (!Helpers.isInRestrictedZone(pos.x, pos.z, RestrictedZones.intersections)) {
        //         const cart = new VegetableCart(this.scene,pos.x-10,pos.z-5)
	// 	this.objects.push({ mesh: cart.group, type: 'vegetablecart', initialZ: pos.z+5 })
        //     }
	// })

	// Spawn beside lamp
	const entry = this.scene.getObjectByName('lampPole');
	const matrix = new THREE.Matrix4();
	const position = new THREE.Vector3();

	entry.getMatrixAt(0, matrix);
	position.setFromMatrixPosition(matrix);

	// console.log("foundMesh",foundMesh.getMatrixAt(0, matrix))
        // const cart = new VegetableCart(this.scene,foundMesh.position.x,foundMesh.position.z+3)
	// this.objects.push({ mesh: cart.group, type: 'vegetablecart', initialZ: 0 })
    }

    spawnHouses(gltf) {
        const housePositions = [
            { x: -25, z: 30, color: 0xd2b48c },
            { x: 25, z: 60, color: 0xd2b48c },
            { x: -48, z: 220, color: 0xd2b48c },
            { x: 30, z: 250, color: 0xd2b48c },
            { x: -32, z: 280, color: 0xd2b48c },
            { x: -30, z: 150, color: 0xc9a86a },
            { x: 27, z: 200, color: 0xe8d4b0 },
            { x: -29, z: 270, color: 0xb89968 }
        ];
        if (gltf) {
	    housePositions.forEach(pos => {
		if (!Helpers.isInRestrictedZone(pos.x, pos.z, RestrictedZones.intersections)) {
		    // only one house is displayed at a time
		    // switch between the houses when biome changed (y,-y)
		    // which one to spawn first specified in the last
		    // argument
		    let root;
		    if (Math.random()>0.5) {
			root = gltf.scene.getObjectByName("Block_4")
		    } else {
			root = gltf.scene.getObjectByName("Block_3")
		    }
		    let clone = root.clone()
		    clone.scale.set(.04,.04,.04)
		    if (pos.x>0) {
			clone.position.set(pos.x+10,2,pos.z)
		    } else {
			clone.position.set(pos.x-10,2,pos.z)
		    }
		    this.scene.add(clone)
		    this.houses.push({group:clone});
		    clone.position.y = -500

		    // const spotLight = new THREE.SpotLight(0xffffdd, 50,20);
		    // const buildingX = clone.position.x
		    // const buildingZ = clone.position.z
		    // const buildingHeight = clone.position.y

		    // spotLight.position.set(buildingX + 5, 5.5, buildingZ-10); // ground level, offset from building
		    // spotLight.target.position.set(buildingX+50, buildingHeight * 5.7, buildingZ-50); // aim at upper facade
		    // spotLight.angle = Math.PI / 6;
		    // spotLight.penumbra = 20.3;
		    // spotLight.castShadow = false; // turn off shadows
		    // this.scene.add(spotLight)
		    // this.scene.add(spotLight.target);

		    // argument format match to that in else statement
		    // House class has group property which is used in
		    // update function
		    // this.houses.push({group:spotLight});
		    // spotLight.position.y = -500
		    // this.houses.push({group:spotLight2});

		}
            })
	} else {
	    housePositions.forEach(pos => {
		if (!Helpers.isInRestrictedZone(pos.x, pos.z, RestrictedZones.intersections)) {
		    const house = new House(this.scene, pos.x, pos.z, pos.color);
		    // house.group.position.y = -500
		    this.houses.push(house);
		    
		}
            })
	}
	return Promise.resolve()
    }
    
    createFarm(x, z) {
        const farmGroup = new THREE.Group();
        
        // Barn body
        const barnBody = new THREE.Mesh(
            new THREE.BoxGeometry(6, 4, 5),
            new THREE.MeshLambertMaterial({ color: 0x8b0000 })
        );
        barnBody.position.y = 2;
        barnBody.castShadow = false;
        farmGroup.add(barnBody);
        
        // Barn roof
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-3, 0);
        roofShape.lineTo(0, 2);
        roofShape.lineTo(3, 0);
        roofShape.lineTo(-3, 0);
        
        const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
            steps: 1,
            depth: 5,
            bevelEnabled: false
        });
        const roof = new THREE.Mesh(
            roofGeometry,
            new THREE.MeshLambertMaterial({ color: 0x4a4a4a })
        );
        roof.rotation.x = Math.PI / 2;
        roof.position.set(0, 4, -2.5);
        farmGroup.add(roof);
        
        // Door
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 2.5, 0.1),
            new THREE.MeshLambertMaterial({ color: 0x3d2817 })
        );
        door.position.set(0, 1.25, 2.55);
        farmGroup.add(door);
        
        // White cross on barn
        const crossH = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.2, 0.1),
            new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        crossH.position.set(0, 3, 2.6);
        farmGroup.add(crossH);
        
        const crossV = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 1, 0.1),
            new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        crossV.position.set(0, 3, 2.6);
        farmGroup.add(crossV);
        
        farmGroup.position.set(x, 0, z);
        this.scene.add(farmGroup);
        this.objects.push({ mesh: farmGroup, type: 'barn', initialZ: z });
    }
    
    createSilo(x, z) {
        const siloGroup = new THREE.Group();
        
        // Main cylinder
        const silo = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 5, 16),
            new THREE.MeshLambertMaterial({ color: 0xc0c0c0 })
        );
        silo.position.y = 2.5;
        siloGroup.add(silo);
        
        // Dome top
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshLambertMaterial({ color: 0xa0a0a0 })
        );
        dome.position.y = 5;
        siloGroup.add(dome);
        
        // Horizontal bands
        for (let i = 0; i < 4; i++) {
            const band = new THREE.Mesh(
                new THREE.CylinderGeometry(1.05, 1.05, 0.15, 16),
                new THREE.MeshLambertMaterial({ color: 0x808080 })
            );
            band.position.y = 1 + i * 1.2;
            siloGroup.add(band);
        }
        
        siloGroup.position.set(x, 0, z);
        this.scene.add(siloGroup);
        this.objects.push({ mesh: siloGroup, type: 'silo', initialZ: z });
    }
    
    createWindmill(x, z) {
        const windmillGroup = new THREE.Group();
        
        // Tower
        const tower = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 1, 4, 8),
            new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        tower.position.y = 2;
        windmillGroup.add(tower);
        
        // Nacelle
        const nacelle = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 1.2),
            new THREE.MeshLambertMaterial({ color: 0xe0e0e0 })
        );
        nacelle.position.y = 4.3;
        windmillGroup.add(nacelle);
        
        // Hub
        const hub = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16),
            new THREE.MeshLambertMaterial({ color: 0x404040 })
        );
        hub.rotation.z = Math.PI / 2;
        hub.position.set(0, 4.3, 0.8);
        windmillGroup.add(hub);
        
        // Blades
        windmillGroup.userData.blades = [];
        const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        for (let i = 0; i < 3; i++) {
            const blade = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 2, 0.4),
                bladeMaterial
            );
            blade.position.y = 1;
            
            const bladeArm = new THREE.Group();
            bladeArm.add(blade);
            bladeArm.rotation.z = (i * Math.PI * 2) / 3;
            bladeArm.position.set(0, 4.3, 0.8);
            windmillGroup.add(bladeArm);
            windmillGroup.userData.blades.push(bladeArm);
        }
        
        windmillGroup.position.set(x, 0, z);
        this.scene.add(windmillGroup);
        this.objects.push({ mesh: windmillGroup, type: 'windmill', initialZ: z });
    }
    
    createCropField(x, z) {
        const fieldGroup = new THREE.Group();
        const colors = [0x9d7e3a, 0xb8984a, 0xa88b3d];
        
        for (let row = 0; row < 8; row++) {
            const cropRow = new THREE.Mesh(
                new THREE.BoxGeometry(3, 0.3, 0.4),
                new THREE.MeshLambertMaterial({ color: colors[row % colors.length] })
            );
            cropRow.position.set(0, 0.15, -1.5 + row * 0.5);
            fieldGroup.add(cropRow);
        }
        
        fieldGroup.position.set(x, 0, z);
        this.scene.add(fieldGroup);
        this.objects.push({ mesh: fieldGroup, type: 'crops', initialZ: z });
    }
    
    createFencePost(x, z) {
        const fenceGroup = new THREE.Group();
        
        // Wooden fence posts
        for (let i = 0; i < 5; i++) {
            const post = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.8, 0.1),
                new THREE.MeshLambertMaterial({ color: 0x6b4423 })
            );
            post.position.set(i * 0.5, 0.4, 0);
            fenceGroup.add(post);
        }
        
        // Horizontal rails
        const rail1 = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.08, 0.08),
            new THREE.MeshLambertMaterial({ color: 0x8b5a3c })
        );
        rail1.position.set(1, 0.5, 0);
        fenceGroup.add(rail1);
        
        const rail2 = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.08, 0.08),
            new THREE.MeshLambertMaterial({ color: 0x8b5a3c })
        );
        rail2.position.set(1, 0.3, 0);
        fenceGroup.add(rail2);
        
        fenceGroup.position.set(x, 0, z);
        this.scene.add(fenceGroup);
        this.objects.push({ mesh: fenceGroup, type: 'fence', initialZ: z });
    }
    
    createHayBale(x, z) {
        const hayGroup = new THREE.Group();
        
        // Cylindrical hay bale
        const bale = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.6, 16),
            new THREE.MeshLambertMaterial({ color: 0xdaa520 })
        );
        bale.rotation.z = Math.PI / 2;
        bale.position.y = 0.5;
        hayGroup.add(bale);
        
        // Binding straps
        for (let i = 0; i < 2; i++) {
            const strap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.52, 0.52, 0.08, 16),
                new THREE.MeshLambertMaterial({ color: 0x8b4513 })
            );
            strap.rotation.z = Math.PI / 2;
            strap.position.set(0, 0.5, -0.2 + i * 0.4);
            hayGroup.add(strap);
        }
        
        hayGroup.position.set(x, 0, z);
        this.scene.add(hayGroup);
        this.objects.push({ mesh: hayGroup, type: 'hay', initialZ: z });
    }

    update(worldSpeed) {
        const time = Date.now() * 0.001;
        
        this.objects.forEach(obj => {
            obj.mesh.position.z -= worldSpeed;
            
            if (obj.mesh.position.z < -50) {
                obj.mesh.position.z += 350;
            }
            
            // Animate windmill blades
            if (obj.type === 'windmill' && obj.mesh.userData.blades) {
                obj.mesh.userData.blades.forEach(blade => {
                    blade.rotation.z += 0.02;
                });
            }

            // Gentle sway for crops
            if (obj.type === 'crops') {
                obj.mesh.rotation.z = Math.sin(time + obj.initialZ * 0.1) * 0.05;
            }
        });

	this.trains.forEach(obj => {
	    obj.update(worldSpeed);
	})

	this.houses.forEach(obj => {
            obj.group.position.z -= worldSpeed;
	    if (obj.group.position.z < -50) {
		obj.group.position.z += 350;
            }
        })
    }

    show() {
	console.log("show called")
        this.objects.forEach(obj => {
            // obj.mesh.visible = true;
	    obj.mesh.position.y = 0
        });

	this.trains.forEach(obj => {
            // obj.group.visible = true;
	    obj.group.position.y = 0
        });

	this.houses.forEach(obj => {
            // obj.group.visible = true;
	    obj.group.position.y = 2
        });
    }
    
    hide() {
        this.objects.forEach(obj => {
            // obj.mesh.visible = false;
	    obj.mesh.position.y = -100
        });

	this.trains.forEach(obj => {
            // obj.group.visible = false;
	    obj.group.position.y = -100
        });

	this.houses.forEach(obj => {
            // obj.group.visible = false;
	    obj.group.position.y = -100
        });
    }
    
    fadeOut(progress) {
        this.objects.forEach(obj => {
            obj.mesh.traverse(child => {
                if (child.material) {
                    child.material.opacity = 1 - progress;
                    child.material.transparent = true;
                }
            });
            
            if (progress > 0.8) {
                obj.mesh.visible = false;
            }
        });
        this.trains.forEach(obj => {
            obj.group.traverse(child => {
                if (child.material) {
                    child.material.opacity = 1 - progress;
                    child.material.transparent = true;
                }
            });
            
            if (progress > 0.8) {
                obj.group.visible = false;
            }
        });

    }
    
    fadeIn(progress) {
        this.objects.forEach(obj => {
            obj.mesh.visible = true;
            obj.mesh.traverse(child => {
                if (child.material) {
                    child.material.opacity = progress;
                    child.material.transparent = true;
                }
            });
        })
	this.trains.forEach(obj => {
            obj.group.visible = true;
	     obj.group.traverse(child => {
                if (child.material) {
                    child.material.opacity = progress;
                    child.material.transparent = true;
                }
            })
        });;
	
    }
}
