import { SimpleTreeManager } from './objects/Tree.js';
import { BushManager } from './objects/Bush.js';
import { House } from './objects/House.js';
import { Cloud } from './objects/Cloud.js';
import { StreetLampManager } from './structures/StreetLamp.js';
import { Bridge } from './structures/Bridge.js';
// import { Intersection } from './structures/Intersection.js';
import { PoliceCar } from '../entities/PoliceCar.js';
import { RestrictedZones } from '../utils/Constants.js';
import { Helpers } from '../utils/Helpers.js';

export class Scenery {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        
        this.spawnAll();
    }
    
    spawnAll() {
        this.spawnTreesAndBushesAndLamps();
        this.spawnHouses();
        this.spawnClouds();
	// FIXME: frame drops -20fps on spawning bridges
        // this.spawnBridges();
        // this.spawnPoliceCars();


        // this.spawnIntersections();
        // this.spawnStreetLamps();
        // this.spawnBushes();
    }

    spawnTreesAndBushesAndLamps(){
	this.treeManager = new SimpleTreeManager(this.scene);
	this.treeManager.spawnTrees(RestrictedZones, Helpers);

	this.bushManager = new BushManager(this.scene);
	this.bushManager.spawnBushes(RestrictedZones, Helpers);
	
	this.lampManager = new StreetLampManager(this.scene);
	this.lampManager.spawnLamps(RestrictedZones, Helpers);
    }
    
    // spawnTrees() {
    //     for (let z = -50; z < 350; z += 12) {
    //         if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
    //             if (Math.random() > 0.4) {
    //                 const tree = new Tree(this.scene, -10 - Math.random() * 5, z);
    //                 this.objects.push(tree);
    //             }
    //             if (Math.random() > 0.4) {
    //                 const tree = new Tree(this.scene, 10 + Math.random() * 5, z);
    //                 this.objects.push(tree);
    //             }
    //         }
    //     }
        
    //     // Background trees
    //     for (let z = -50; z < 300; z += 25) {
    //         if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
    //             if (Math.random() > 0.6) {
    //                 const tree = new Tree(this.scene, -20 - Math.random() * 10, z);
    //                 this.objects.push(tree);
    //             }
    //             if (Math.random() > 0.6) {
    //                 const tree = new Tree(this.scene, 20 + Math.random() * 10, z);
    //                 this.objects.push(tree);
    //             }
    //         }
    //     }
    // }
    
    // spawnBushes() {
    //     for (let z = -50; z < 350; z += 12) {
    //         if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
    //             if (Math.random() > 0.6) {
    //                 const bush = new Bush(this.scene, -10 - Math.random() * 3, z);
    //                 this.objects.push(bush);
    //             }
    //             if (Math.random() > 0.6) {
    //                 const bush = new Bush(this.scene, 10 + Math.random() * 3, z);
    //                 this.objects.push(bush);
    //             }
    //         }
    //     }
        
    //     // Near road edge
    //     for (let z = -50; z < 300; z += 15) {
    //         if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
    //             if (Math.random() > 0.5) {
    //                 const bush = new Bush(this.scene, -11 - Math.random() * 2, z);
    //                 this.objects.push(bush);
    //             }
    //             if (Math.random() > 0.5) {
    //                 const bush = new Bush(this.scene, 11 + Math.random() * 2, z);
    //                 this.objects.push(bush);
    //             }
    //         }
    //     }
        
    //     // Background bushes
    //     for (let z = -50; z < 300; z += 20) {
    //         if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
    //             if (Math.random() > 0.5) {
    //                 const bush = new Bush(this.scene, -18 - Math.random() * 8, z);
    //                 this.objects.push(bush);
    //             }
    //             if (Math.random() > 0.5) {
    //                 const bush = new Bush(this.scene, 18 + Math.random() * 8, z);
    //                 this.objects.push(bush);
    //             }
    //         }
    //     }
    // }
    
    spawnHouses() {
        const housePositions = [
            { x: -15, z: 30, color: 0xd2b48c },
            { x: 15, z: 60, color: 0xd2b48c },
            { x: -18, z: 220, color: 0xd2b48c },
            { x: 20, z: 250, color: 0xd2b48c },
            { x: -22, z: 280, color: 0xd2b48c },
            { x: -20, z: 150, color: 0xc9a86a },
            { x: 17, z: 200, color: 0xe8d4b0 },
            { x: -19, z: 270, color: 0xb89968 }
        ];
        
        housePositions.forEach(pos => {
            if (!Helpers.isInRestrictedZone(pos.x, pos.z, RestrictedZones.intersections)) {
                const house = new House(this.scene, pos.x, pos.z, pos.color);
                this.objects.push(house);
            }
        });
    }
    
    spawnClouds() {
        for (let i = 0; i < 20; i++) {
            const cloud = new Cloud(
                this.scene,
                -50 + Math.random() * 100,
                20 + Math.random() * 30,
                -100 + Math.random() * 400
            );
            this.objects.push(cloud);
        }
    }
    
    // spawnStreetLamps() {
    //     for (let z = -50; z < 350; z += 40) {
    //         if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
    //             const lamp1 = new StreetLamp(this.scene, -9.5, z);
    //             const lamp2 = new StreetLamp(this.scene, 9.5, z);
    //             this.objects.push(lamp1, lamp2);
    //         }
    //     }
    // }
    
    spawnBridges() {
        const bridge1 = new Bridge(this.scene, 180);
        const bridge2 = new Bridge(this.scene, 450);
        this.objects.push(bridge1, bridge2);
    }
    
    spawnIntersections() {
        // const intersection1 = new Intersection(this.scene, 120);
        // const intersection2 = new Intersection(this.scene, 300);
        // this.objects.push(intersection1, intersection2);
    }
    
    spawnPoliceCars() {
        const policePositions = [
            { x: -12, z: 80 },
            { x: 12, z: 240 }
        ];
        
        policePositions.forEach(pos => {
            if (!Helpers.isInRestrictedZone(pos.x, pos.z, RestrictedZones.intersections)) {
                const police = new PoliceCar(this.scene, pos.x, pos.z);
                this.objects.push(police);
            }
        });
    }
    
    update(worldSpeed) {
        this.objects.forEach(obj => {
            if (obj.update) {
                obj.update(worldSpeed);
            }
        });
	this.treeManager.update(worldSpeed);
	this.bushManager.update(worldSpeed);
	this.lampManager.update(worldSpeed);

    }
    
    fadeOut(progress) {
        this.objects.forEach(obj => {
            if (obj.group && (obj instanceof Tree || obj instanceof Bush || obj instanceof House )) {
                obj.group.traverse(child => {
                    if (child.material) {
                        child.material.opacity = 1 - progress;
                        child.material.transparent = true;
                    }
                });
                
                if (progress > 0.8) {
                    obj.group.visible = false;
                }
            }
        });
    }
    
    fadeIn(progress) {
        this.objects.forEach(obj => {
            if (obj.group && (obj instanceof Tree || obj instanceof Bush || obj instanceof House)) {
                obj.group.visible = true;
                obj.group.traverse(child => {
                    if (child.material) {
                        child.material.opacity = progress;
                        child.material.transparent = true;
                    }
                });
            }
        });
    }
}
