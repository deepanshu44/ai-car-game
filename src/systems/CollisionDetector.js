export class CollisionDetector {
    checkCarCollision(car1, car2, threshold = 2.5) {
        const dx = car1.position.x - car2.position.x;
        const dz = car1.position.z - car2.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < threshold;
    }
    
    checkPotholeCollision(playerCar, potholes) {
        for (const pothole of potholes) {
            const dx = playerCar.position.x - pothole.mesh.position.x;
            const dz = playerCar.position.z - pothole.mesh.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < pothole.radius + 1 && !pothole.hitRecently) {
                return pothole;
            }
        }
        return null;
    }
    
    checkTrafficCollisions(playerCar, trafficCars) {
        for (const car of trafficCars) {
            if (this.checkCarCollision(playerCar, car.mesh)) {
                return car;
            }
        }
        return null;
    }
}
