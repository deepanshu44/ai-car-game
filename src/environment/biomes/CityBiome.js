import * as THREE from 'three';
import { Bridge } from '../structures/Bridge.js';
import { Intersection } from '../structures/Intersection.js'
import { CrossingTraffic } from '../../entities/CrossingTraffic.js';
import { House } from '../objects/House.js'
import { RestrictedZones } from '../../utils/Constants.js';
import { Helpers } from '../../utils/Helpers.js';

// import { Train } from '../structures/Train.js'

export class CityBiome {
    constructor(scene,distanceToSwitch) {
        this.scene = scene;
        this.objects = [];
	this.houses = [];
	this.distanceToSwitch = distanceToSwitch
	this.spawnIntersections()
	this.spawnCrossingTraffic()
	// this.spawnHouses()
	// this.spawnBridges()
    }

    // spawnTrain(){
    // 	const train1 = new Train(this.scene,120)
    // 	const train2 = new Train(this.scene,300)
    // 	this.objects.push(train1,train2)
    // }

    spawnIntersections() {
        const intersection1 = new Intersection(this.scene,120,this.distanceToSwitch);
        const intersection2 = new Intersection(this.scene,300,this.distanceToSwitch);
        this.objects.push(intersection1, intersection2);
    }

    spawnCrossingTraffic() {
        const intersectionPositions = [120, 300];
        
        intersectionPositions.forEach(z => {
            for (let i = 0; i < 5; i++) {
                this.objects.push(
                    new CrossingTraffic(this.scene, -50 - i * 20, z,this.distanceToSwitch)
                );
            }
        });
    }

    spawnBridges() {
        const bridge1 = new Bridge(this.scene, 180);
        // const bridge2 = new Bridge(this.scene, 450);
        // this.objects.push(bridge1, bridge2);
        this.objects.push(bridge1);
    }

    spawnHouses(gltf) {
        const housePositions = [
            { x: -25, z: 30, color: 0xd2b48c },
            { x: 25, z: 60, color: 0xd2b48c },
            { x: -30, z: 150, color: 0xc9a86a },
            { x: 27, z: 200, color: 0xe8d4b0 },
            { x: -48, z: 220, color: 0xd2b48c },
            { x: 30, z: 250, color: 0xd2b48c },
            { x: -29, z: 270, color: 0xb89968 },
            { x: 32, z: 280, color: 0xd2b48c }
        ];
        
        // housePositions.forEach(pos => {
        //     if (!Helpers.isInRestrictedZone(pos.x, pos.z, RestrictedZones.intersections)) {
	// 	// only one house is displayed at a time
	// 	// switch between the houses when biome changed (y,-y)
	// 	// which one to spawn first specified in the last argument
        //         const house = new House(this.scene, pos.x, pos.z, pos.color);
	// 	// house.group.position.y = 50
        //         this.objects.push(house);
        //     }
        // });
	if (gltf) {
	    housePositions.forEach(pos => {
		if (!Helpers.isInRestrictedZone(pos.x, pos.z, RestrictedZones.intersections)) {
		    // only one house is displayed at a time
		    // switch between the houses when biome changed (y,-y)
		    // which one to spawn first specified in the last
		    // argument
		    let root,clone;
		    if (Math.random()>0.5) {
			root = gltf.scene.getObjectByName("Block_1")
			clone = root.clone()
			// clone.castShadow = true
			clone.traverse((child) => {
			    if (child.isMesh) {
				child.castShadow = true;
			    }
			});	

			// console.log("root = ", gltf.scene.getObjectByName("Block_1"));
		    } else {
			root = gltf.scene.getObjectByName("Block_2")
			clone = root.clone()
			clone.castShadow = true
		    }
		    
		    // Scale the geometry itself, not the object
		    // clone.traverse((child) => {
		    // 	if (child.isMesh) {
		    // 	    child.geometry.scale(0.4, 0.4, 0.4); // adjust to your needs
		    // 	}
		    // });
		    
		    // Now use normal scale
		    // clone.scale.set(1, 1, 1);
		    clone.scale.set(.04,.04,.04)
		    // clone.position.set(0,0,0)
		    this.scene.add(clone)
		    this.houses.push({group:clone});

		    const spotLight = new THREE.SpotLight(0xffffdd, 300,40);
		    // const spotLight = new THREE.DirectionalLight(0xffffdd, 1,2);
		    let buildingX,buildingZ,buildingHeight;
		    if (pos.x>0) {
			clone.position.set(pos.x+10,3,pos.z)
		    } else {
			clone.position.set(pos.x-10,3,pos.z)
		    }

		    // if (pos.x>0) {
		    // 	buildingX = clone.position.x
		    // 	buildingZ = clone.position.z
		    // 	buildingHeight = clone.position.y
		    // 	spotLight.position.set(buildingX - 15, 10, buildingZ-15); // ground level, offset from building
		    // } else {
			
		    // 	buildingX = clone.position.x
		    // 	buildingZ = clone.position.z
		    // 	buildingHeight = clone.position.y
		    // 	spotLight.position.set(buildingX + 15, 10, buildingZ-15); // ground level, offset from building
		    // }
		    // spotLight.target.position.set(buildingX, 10, buildingZ); // aim at upper facade
		    // spotLight.angle = Math.PI / 4;
		    // spotLight.penumbra = 0.3;
		    // spotLight.castShadow = false; // turn off shadows
		    // this.scene.add(spotLight)
		    // this.scene.add(spotLight.target);
		    // this.houses.push({group:spotLight});

		    // const spotLight2 = new THREE.SpotLight(0xffffdd, 111,20);

		    // spotLight2.position.set(buildingX + 5, 5.5, buildingZ+10); // ground level, offset from building
		    // spotLight2.target.position.set(buildingX+50, buildingHeight * 5.7, buildingZ-50); // aim at upper facade
		    // spotLight2.angle = Math.PI / 6;
		    // spotLight2.penumbra = 20.3;
		    // this.scene.add(spotLight2)
		    // this.scene.add(spotLight2.target);

		    // const helper = new THREE.SpotLightHelper(spotLight);
		    // this.scene.add(helper);
		    // this.houses.push({group:helper});
		    
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
    }

    update(worldSpeed) {
        this.objects.forEach(obj => {
            if (obj.update) {
                obj.update(worldSpeed);
            }
        });
	this.houses.forEach(obj => {
            obj.group.position.z -= worldSpeed;
	    if (obj.group.position.z < -50) {
		obj.group.position.z += 350;
            }
        })
    }

    show() {
        this.objects.forEach(obj => {
            // obj.visible = true;
	    obj.group.position.y = 0
        });
	this.houses.forEach(obj => {
            // obj.group.visible = false;
	    obj.group.position.y = 0
        });
    }

    hide() {
        this.objects.forEach(obj => {
            // obj.visible = false;
	    obj.group.position.y = -100
        });
	this.houses.forEach(obj => {
            // obj.group.visible = false;
	    obj.group.position.y = -100
        })
    }
    
    fadeOut(progress) {
	this.objects.forEach(obj => {
            // if (obj.group && (obj instanceof Intersection)) {
                obj.group.traverse(child => {
                    if (child.material) {
                        child.material.opacity = 1 - progress;
                        // child.material.opacity = 1
                        child.material.transparent = true;
                    }
                });
            // obj.group.visible = false;
            
                if (progress > 0.8) {
                    obj.group.visible = false;
                }
            // }
        })
    }
    
    fadeIn(progress) {
        // City objects fade in handled by Scenery manager
	this.objects.forEach(obj => {
            // if (obj.group && (obj instanceof Intersection)) {
                obj.group.visible = true;
                obj.group.traverse(child => {
                    if (child.material) {
                        child.material.opacity = progress;
                        // child.material.opacity = 0;
                        child.material.transparent = true;
                    }
                });
            // }
        })
    }
}

