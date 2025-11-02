import { Bridge } from '../structures/Bridge.js';
import { Intersection } from '../structures/Intersection.js'
import { CrossingTraffic } from '../../entities/CrossingTraffic.js';
// import { Train } from '../structures/Train.js'

export class CityBiome {
    constructor(scene,distanceToSwitch) {
        this.scene = scene;
        this.objects = [];
	this.distanceToSwitch = distanceToSwitch
	this.spawnIntersections()
	this.spawnCrossingTraffic()
	// this.spawnTrain()
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
        const bridge2 = new Bridge(this.scene, 450);
        this.objects.push(bridge1, bridge2);
    }

    update(worldSpeed) {
        this.objects.forEach(obj => {
            if (obj.update) {
                obj.update(worldSpeed);
            }
        });
    }

    show() {
        this.objects.forEach(obj => {
            // obj.visible = true;
	    obj.group.position.y = 0
        });
    }

    hide() {
        this.objects.forEach(obj => {
            // obj.visible = false;
	    obj.group.position.y = -100
        });
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

