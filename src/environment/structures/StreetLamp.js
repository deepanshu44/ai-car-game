// StreetLampManager.js
import * as THREE from 'three';

export class StreetLampManager {
    constructor(scene) {
        this.scene = scene;
        this.lampData = [];
        this.createLamps();
    }
    
    createLamps() {
        // Create shared geometries and materials
        if (!StreetLampManager.poleGeometry) {
            StreetLampManager.poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 5, 8);
            StreetLampManager.poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            
            StreetLampManager.lampHeadGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.4);
            StreetLampManager.lampHeadMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
            
            StreetLampManager.bulbGeometry = new THREE.SphereGeometry(0.3, 8, 8);
	    if (this.scene.timeOfTheDay !== "day") {
		
		StreetLampManager.bulbMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0xffffbb,
                    emissive: 0xffffbb,
                    emissiveIntensity: 1.5
		});
	    } else {
		StreetLampManager.bulbMaterial = new THREE.MeshBasicMaterial();
	    }
            
            StreetLampManager.lightPoolTexture = this.createLightPoolTexture();
            StreetLampManager.lightPoolGeometry = new THREE.CircleGeometry(5, 32);
            StreetLampManager.lightPoolMaterial = new THREE.MeshBasicMaterial({ 
                map: StreetLampManager.lightPoolTexture,
                transparent: true,
                opacity: 1,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
        }
        
        // Count lamps needed (will be set in spawnLamps)
        this.lampCount = 0;
        
        this.matrix = new THREE.Matrix4();
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Quaternion();
        this.scale = new THREE.Vector3(1, 1, 1);
    }
    
    createLightPoolTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 180, 0.5)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 150, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 256, 256);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    spawnLamps(RestrictedZones, Helpers) {
        // Count total lamps needed
        let count = 0;
        for (let z = -50; z < 350; z += 40) {
            if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
                count += 2; // Left and right side
            }
        }
        
        // Create InstancedMeshes for each lamp component
        this.poles = new THREE.InstancedMesh(
            StreetLampManager.poleGeometry,
            StreetLampManager.poleMaterial,
            count
        );
        this.poles.castShadow = true;
	this.poles.name = "lampPole"
        this.scene.add(this.poles);
        
        this.lampHeads = new THREE.InstancedMesh(
            StreetLampManager.lampHeadGeometry,
            StreetLampManager.lampHeadMaterial,
            count
        );
        this.lampHeads.castShadow = true;
        this.scene.add(this.lampHeads);
        
        this.bulbs = new THREE.InstancedMesh(
            StreetLampManager.bulbGeometry,
            StreetLampManager.bulbMaterial,
            count
        );
        this.scene.add(this.bulbs);
        
	if (this.scene.timeOfTheDay !== "day") {
            this.lightPools = new THREE.InstancedMesh(
		StreetLampManager.lightPoolGeometry,
		StreetLampManager.lightPoolMaterial,
		count
            );
	}
        this.scene.add(this.lightPools);
        
        // Position all lamps
        let index = 0;
        for (let z = -50; z < 350; z += 40) {
            if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
                // Left lamp
                this.addLamp(-9.5, z, index);
                index++;
                
                // Right lamp
                this.addLamp(9.5, z, index);
                index++;
            }
        }
        
        this.poles.instanceMatrix.needsUpdate = true;
        this.lampHeads.instanceMatrix.needsUpdate = true;
        this.bulbs.instanceMatrix.needsUpdate = true;
        this.scene.timeOfTheDay !== "day"?this.lightPools.instanceMatrix.needsUpdate = true:null;
        
        this.lampCount = index;
    }
    
    addLamp(x, z, index) {
        // Pole
        this.position.set(x, 2.5, z);
        this.rotation.set(0, 0, 0, 1);
        this.matrix.compose(this.position, this.rotation, this.scale);
        this.poles.setMatrixAt(index, this.matrix);
	
        // Lamp head
        this.position.set(x, 5.3, z);
        this.matrix.compose(this.position, this.rotation, this.scale);
        this.lampHeads.setMatrixAt(index, this.matrix);
        
        // Bulb
        this.position.set(x, 5, z);
        this.matrix.compose(this.position, this.rotation, this.scale);
        this.bulbs.setMatrixAt(index, this.matrix);
        
        // Light pool (rotated to lay flat)
        this.position.set(x, 0.05, z);
        this.rotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        this.matrix.compose(this.position, this.rotation, this.scale);
        this.scene.timeOfTheDay !== "day"?this.lightPools.setMatrixAt(index, this.matrix):null;
        
        // Store data for updates
        this.lampData.push({ index, x, z });
    }
    
    update(worldSpeed) {
        this.rotation.set(0, 0, 0, 1);
        const poolRotation = new THREE.Quaternion();
        poolRotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        
        this.lampData.forEach(lamp => {
            lamp.z -= worldSpeed;
            
            if (lamp.z < -50) {
                lamp.z += 350;
            }
            
            // Update pole
            this.position.set(lamp.x, 2.5, lamp.z);
            this.matrix.compose(this.position, this.rotation, this.scale);
            this.poles.setMatrixAt(lamp.index, this.matrix);
            
            // Update lamp head
            this.position.set(lamp.x, 5.3, lamp.z);
            this.matrix.compose(this.position, this.rotation, this.scale);
            this.lampHeads.setMatrixAt(lamp.index, this.matrix);
            
            // Update bulb
            this.position.set(lamp.x, 5, lamp.z);
            this.matrix.compose(this.position, this.rotation, this.scale);
            this.bulbs.setMatrixAt(lamp.index, this.matrix);
            
            // Update light pool
            this.position.set(lamp.x, 0.05, lamp.z);
            this.matrix.compose(this.position, poolRotation, this.scale);
            this.scene.timeOfTheDay !== "day"?this.lightPools.setMatrixAt(lamp.index, this.matrix):null;
        });
        
        this.poles.instanceMatrix.needsUpdate = true;
        this.lampHeads.instanceMatrix.needsUpdate = true;
        this.bulbs.instanceMatrix.needsUpdate = true;
        this.scene.timeOfTheDay !== "day"?this.lightPools.instanceMatrix.needsUpdate = true:null;
    }
    
    dispose() {
        StreetLampManager.poleGeometry?.dispose();
        StreetLampManager.poleMaterial?.dispose();
        StreetLampManager.lampHeadGeometry?.dispose();
        StreetLampManager.lampHeadMaterial?.dispose();
        StreetLampManager.bulbGeometry?.dispose();
        StreetLampManager.bulbMaterial?.dispose();
        StreetLampManager.lightPoolGeometry?.dispose();
        StreetLampManager.lightPoolMaterial?.dispose();
        StreetLampManager.lightPoolTexture?.dispose();
        
        this.scene.remove(this.poles, this.lampHeads, this.bulbs, this.lightPools);
    }
}

// Static properties for shared resources
StreetLampManager.poleGeometry = null;
StreetLampManager.poleMaterial = null;
StreetLampManager.lampHeadGeometry = null;
StreetLampManager.lampHeadMaterial = null;
StreetLampManager.bulbGeometry = null;
StreetLampManager.bulbMaterial = null;
StreetLampManager.lightPoolGeometry = null;
StreetLampManager.lightPoolMaterial = null;
StreetLampManager.lightPoolTexture = null;

// import * as THREE from 'three';

// export class StreetLamp {
//     constructor(scene, x, z) {
//         this.scene = scene;
//         this.group = new THREE.Group();
//         this.initialZ = z;
        
//         this.createLamp();
//         this.group.position.set(x, 0, z);
//         scene.add(this.group);
//     }
    
//     createLamp() {
//         // Pole
//         const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 5, 8);
//         const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
//         const pole = new THREE.Mesh(poleGeometry, poleMaterial);
//         pole.position.y = 2.5;
//         pole.castShadow = false;
//         this.group.add(pole);
        
//         // Lamp head
//         const lampHeadGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.4);
//         const lampHeadMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
//         const lampHead = new THREE.Mesh(lampHeadGeometry, lampHeadMaterial);
//         lampHead.position.y = 5.3;
//         lampHead.castShadow = false;
//         this.group.add(lampHead);
        
//         // Light bulb
//         const bulbGeometry = new THREE.SphereGeometry(0.3, 8, 8);
//         const bulbMaterial = new THREE.MeshBasicMaterial({ 
//             color: 0xffffbb,
//             emissive: 0xffffbb,
//             emissiveIntensity: 1.5
//         });
//         const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
//         bulb.position.y = 5;
//         this.group.add(bulb);
        
//         // Point light
//         const light = new THREE.PointLight(0xffffcc, 0.5, 20);
//         light.position.y = 5;
//         light.castShadow = false;
//         this.group.add(light);
        
//         // Ground light pool
//         this.createLightPool();
//     }
    
//     createLightPool() {
//         const canvas = document.createElement('canvas');
//         canvas.width = 256;
//         canvas.height = 256;
//         const context = canvas.getContext('2d');
        
//         const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
//         gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
//         gradient.addColorStop(0.3, 'rgba(255, 255, 180, 0.5)');
//         gradient.addColorStop(0.6, 'rgba(255, 255, 150, 0.2)');
//         gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        
//         context.fillStyle = gradient;
//         context.fillRect(0, 0, 256, 256);
        
//         const texture = new THREE.CanvasTexture(canvas);
//         const lightPoolGeometry = new THREE.CircleGeometry(5, 32);
//         const lightPoolMaterial = new THREE.MeshBasicMaterial({ 
//             map: texture,
//             transparent: true,
//             opacity: 1,
//             side: THREE.DoubleSide,
//             blending: THREE.AdditiveBlending
//         });
//         const lightPool = new THREE.Mesh(lightPoolGeometry, lightPoolMaterial);
//         lightPool.rotation.x = -Math.PI / 2;
//         lightPool.position.y = 0.05;
//         this.group.add(lightPool);
//     }
    
//     update(worldSpeed) {
//         this.group.position.z -= worldSpeed;
//         if (this.group.position.z < -50) {
//             this.group.position.z += 350;
//         }
//     }
// }

