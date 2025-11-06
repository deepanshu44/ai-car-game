import { TrafficCar } from './TrafficCar.js';
import { CrossingTraffic } from './CrossingTraffic.js';

export class TrafficManager {
    constructor(scene) {
        this.scene = scene;
        this.trafficCars = [];
        this.crossingCars = [];
        
        this.spawnTraffic();
        this.spawnCrossingTraffic();
    }
    
    spawnTraffic() {
        for (let i = 0; i < 3; i++) {
            this.trafficCars.push(new TrafficCar(this.scene, 50 + i * 40, -2.25));
            this.trafficCars.push(new TrafficCar(this.scene, 70 + i * 40, 6.75));
        }
    }
    
    spawnCrossingTraffic() {
        // const intersectionPositions = [120, 300];
        
        // intersectionPositions.forEach(z => {
        //     for (let i = 0; i < 5; i++) {
        //         this.crossingCars.push(
        //             new CrossingTraffic(this.scene, -50 - i * 20, z)
        //         );
        //     }
        // });
    }
    
    update(worldSpeed, playerPosition) {
        this.trafficCars.forEach(car => car.update(worldSpeed));
        this.crossingCars.forEach(car => car.update(worldSpeed));
    }
    
    getAllCars() {
        return [
            ...this.trafficCars.map(car => ({ mesh: car.group })),
            ...this.crossingCars.map(car => ({ mesh: car.group }))
        ];
    }
}

