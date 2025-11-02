// BushManager.js
import * as THREE from 'three';

export class BushManager {
    constructor(scene) {
        this.scene = scene;
        this.bushes = null;
        this.bushData = [];
        this.createBushes();
    }
    
    createBushes() {
        // Create bush geometry (sphere)
        const bushGeometry = new THREE.SphereGeometry(1.2, 8, 8);
        bushGeometry.translate(0, 0.7, 0); // Move up
        bushGeometry.scale(1, 0.8, 1); // Flatten slightly
        
        const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x3a7d2e });
        
        // Create instanced mesh for ~100 bushes
        this.bushes = new THREE.InstancedMesh(bushGeometry, bushMaterial, 100);
        this.bushes.castShadow = true;
        this.scene.add(this.bushes);
        
        this.matrix = new THREE.Matrix4();
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Quaternion();
        this.scale = new THREE.Vector3();
        this.count = 0;
    }
    
    addBush(x, z) {
        if (this.count >= this.bushes.count) {
            console.warn('Bush pool exhausted');
            return;
        }
        
        // Random size variation
        const sizeScale = 1 + Math.random() * 0.5;
        
        // Random rotation
        const rotationY = Math.random() * Math.PI * 2;
        
        this.position.set(x, 0, z);
        this.rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
        this.scale.set(sizeScale, sizeScale, sizeScale);
        
        this.matrix.compose(this.position, this.rotation, this.scale);
        this.bushes.setMatrixAt(this.count, this.matrix);
        
        this.bushData.push({
            index: this.count,
            x: x,
            z: z,
            scale: sizeScale,
            rotation: rotationY
        });
        
        this.count++;
        this.bushes.instanceMatrix.needsUpdate = true;
    }
    
    spawnBushes(RestrictedZones, Helpers) {
        // First loop - main bushes
        for (let z = -50; z < 350; z += 12) {
            if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
                if (Math.random() > 0.6) {
                    this.addBush(-10 - Math.random() * 3, z);
                }
                if (Math.random() > 0.6) {
                    this.addBush(10 + Math.random() * 3, z);
                }
            }
        }
        
        // Near road edge
        for (let z = -50; z < 300; z += 15) {
            if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
                if (Math.random() > 0.5) {
                    this.addBush(-11 - Math.random() * 2, z);
                }
                if (Math.random() > 0.5) {
                    this.addBush(11 + Math.random() * 2, z);
                }
            }
        }
        
        // Background bushes
        for (let z = -50; z < 300; z += 20) {
            if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
                if (Math.random() > 0.5) {
                    this.addBush(-18 - Math.random() * 8, z);
                }
                if (Math.random() > 0.5) {
                    this.addBush(18 + Math.random() * 8, z);
                }
            }
        }
    }
    
    update(worldSpeed) {
        this.bushData.forEach(bush => {
            bush.z -= worldSpeed;
            
            if (bush.z < -50) {
                bush.z += 400;
            }
            
            this.position.set(bush.x, 0, bush.z);
            this.rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), bush.rotation);
            this.scale.set(bush.scale, bush.scale, bush.scale);
            
            this.matrix.compose(this.position, this.rotation, this.scale);
            this.bushes.setMatrixAt(bush.index, this.matrix);
        });
        
        this.bushes.instanceMatrix.needsUpdate = true;
    }
    
    dispose() {
        this.bushes.geometry.dispose();
        this.bushes.material.dispose();
        this.scene.remove(this.bushes);
    }
}

// import * as THREE from 'three';

// export class Bush {
//     constructor(scene, x, z) {
//         this.scene = scene;
//         this.group = new THREE.Group();
//         this.initialZ = z;
        
//         this.createBush();
//         this.group.position.set(x, 0, z);
//         scene.add(this.group);
//     }
    
//     createBush() {
//         // const bushColors = [0x2d5016, 0x3a7d44, 0x4a9d5a];
//         const bushType = Math.floor(Math.random() * 2);
//         const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x3a7d2e });
//         // const bushMaterial = new THREE.MeshLambertMaterial({ 
//         //     color: bushColors[Math.floor(Math.random() * bushColors.length)]
//         // });
        
//         // Round bush
//         const bushGeometry = new THREE.SphereGeometry(1.2 + Math.random() * 0.6, 8, 8);
//         const bush = new THREE.InstancedMesh(bushGeometry, bushMaterial,1);
//         bush.position.y = 0.7;
//         bush.scale.y = 0.8;
//         bush.castShadow = true;
//         this.group.add(bush);
//         // if (bushType === 0) {
//         //     // Round bush
//         //     const bushGeometry = new THREE.SphereGeometry(1.2 + Math.random() * 0.6, 8, 8);
//         //     const bush = new THREE.InstancedMesh(bushGeometry, bushMaterial);
//         //     bush.position.y = 0.7;
//         //     bush.scale.y = 0.8;
//         //     bush.castShadow = true;
//         //     this.group.add(bush);
//         // }
// 	// else {
//         //     // Clustered bush
//         //     const clusterCount = 4 + Math.floor(Math.random() * 3);
//         //     for (let i = 0; i < clusterCount; i++) {
//         //         const sphere = new THREE.InstancedMesh(
//         //             new THREE.SphereGeometry(0.6 + Math.random() * 0.4, 6, 6),
//         //             bushMaterial
//         //         );
//         //         sphere.position.set(
//         //             (Math.random() - 0.5) * 1.5,
//         //             0.4 + Math.random() * 0.4,
//         //             (Math.random() - 0.5) * 1.5
//         //         );
//         //         sphere.castShadow = true;
//         //         this.group.add(sphere);
//         //     }
//         // }
        
//         const scale = 1 + Math.random() * 0.5;
//         // this.group.scale.set(scale, scale, scale);
//     }
    
//     update(worldSpeed) {
//         this.group.position.z -= worldSpeed;
//         if (this.group.position.z < -50) {
//             this.group.position.z += 350;
//         }
//     }
// }

