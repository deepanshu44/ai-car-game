import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig.js';
import { Colors, RestrictedZones } from '../utils/Constants.js';
import { Pothole } from './objects/Pothole.js';

export class Road {
    constructor(scene) {
        this.scene = scene;
        this.segments = [];
        this.dividers = [];
        this.fences = [];
        this.potholes = [];
        this.laneMarkers = null; 
        this.markerData = [];
        
        this.createRoad();
        this.createLaneMarkers();
        this.createDividers();
        this.createFences();
        this.createEdgeStrips();
	this.spawnPotholes()
    }
    
    createRoad() {
        const roadGeometry = new THREE.PlaneGeometry(18, 500);
        const roadMaterial = new THREE.MeshLambertMaterial({ color: Colors.ROAD });
        for (let i = 0; i < 3; i++) {
            const road = new THREE.Mesh(roadGeometry, roadMaterial);
            road.rotation.x = -Math.PI / 2;
            road.position.z = i * 500 - 500;
            road.receiveShadow = true;
            this.scene.add(road);
            this.segments.push(road);
        }
        
        this.createGrass();
    }
    
    createGrass() {
        const grassTexture = this.createGrassTexture();
        const grassPatches = [
            { x: -84, color: Colors.GRASS_LIGHT },
            { x: -84, color: Colors.GRASS_DARK },
            { x: -84, color: Colors.GRASS_LIGHT },
            { x: 84, color: Colors.GRASS_MEDIUM },
            { x: 84, color: Colors.GRASS_DARK },
            { x: 84, color: Colors.GRASS_LIGHT }
        ];
        
        grassPatches.forEach((patch, index) => {
            const grassGeometry = new THREE.PlaneGeometry(150, 500);
            const grassMaterial = new THREE.MeshLambertMaterial({
                map: grassTexture,
                // color: patch.color
                color: Colors.GRASS_DARK
            });
            
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            grass.rotation.x = -Math.PI / 2;
            grass.position.x = patch.x;
            grass.position.z = (index % 3) * 166 - 166;
            grass.receiveShadow = true;
            this.scene.add(grass);
        });
    }
    
    createGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#2d5016';
        ctx.fillRect(0, 0, 512, 512);
        
        for (let i = 0; i < 15000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const shade = Math.random() * 60;
            const greenValue = 80 + shade;
            const blueValue = 20 + Math.random() * 30;
            
            ctx.fillStyle = `rgb(${Math.random() * 40}, ${greenValue}, ${blueValue})`;
            const size = Math.random() < 0.7 ? 1 : 2;
            ctx.fillRect(x, y, size, size);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 80);
        
        return texture;
    }
    
    createLaneMarkers() {
        const markerGeometry = new THREE.BoxGeometry(0.3, 0.1, 3);
        const markerMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const markerPositions = [-4.5, 4.5];
        
        // Count total markers needed
        const zStart = -600;
        const zEnd = 600;
        const spacing = 10;
        const markerCount = Math.floor((zEnd - zStart) / spacing) * markerPositions.length;
        
        // Create InstancedMesh
        this.laneMarkers = new THREE.InstancedMesh(
            markerGeometry, 
            markerMaterial, 
            markerCount
        );
        this.scene.add(this.laneMarkers);
        
        // Set up marker positions
        const matrix = new THREE.Matrix4();
        let index = 0;
        
        for (let z = zStart; z < zEnd; z += spacing) {
            markerPositions.forEach(x => {
                matrix.setPosition(x, 0, z);
                this.laneMarkers.setMatrixAt(index, matrix);
                
                this.markerData.push({ index, x, z });
                index++;
            });
        }
        
        this.laneMarkers.instanceMatrix.needsUpdate = true;
    }
    
    createDividers() {
        for (let baseOffset = 0; baseOffset < 3; baseOffset++) {
            const baseZ = baseOffset * 500 - 500;
            let segmentStart = null;
            
            for (let localZ = -250; localZ <= 250; localZ += 10) {
                const absoluteZ = baseZ + localZ;
                const inZone = this.isInRestrictedZone(0, absoluteZ);
                
                if (!inZone && segmentStart === null) {
                    segmentStart = localZ;
                } else if (inZone && segmentStart !== null) {
                    const divider = this.createDividerSegment(segmentStart, localZ - 10);
                    divider.position.set(0, 0, baseZ);
                    this.scene.add(divider);
                    this.dividers.push(divider);
                    segmentStart = null;
                }
		// else if (localZ === 250 && segmentStart !== null) {
                //     const divider = this.createDividerSegment(segmentStart, localZ);
                //     divider.position.set(0, 0, baseZ);
                //     this.scene.add(divider);
                //     this.dividers.push(divider);
                //     segmentStart = null;
                // }
            }
        }
    }
    
    // ✅ OPTIMIZED: Reuse geometries and materials
    createDividerSegment(startZ, endZ) {
        const dividerGroup = new THREE.Group();
        const length = endZ - startZ;
        
        if (length < 10) return dividerGroup;
        
        // // Main concrete barrier
        // const barrierShape = new THREE.Shape();
        // barrierShape.moveTo(-0.3, 0);
        // barrierShape.lineTo(-0.2, 0.5);
        // barrierShape.lineTo(-0.2, 0.7);
        // barrierShape.lineTo(0.2, 0.7);
        // barrierShape.lineTo(0.2, 0.5);
        // barrierShape.lineTo(0.3, 0);
        // barrierShape.lineTo(-0.3, 0);
        
        // const extrudeSettings = {
        //     steps: 1,
        //     depth: length,
        //     bevelEnabled: false
        // };
        
        // const barrierGeometry = new THREE.ExtrudeGeometry(barrierShape, extrudeSettings);
        // const barrierMaterial = new THREE.MeshLambertMaterial({ 
        //     color: 0xcccccc,
        //     flatShading: false
        // });
        // const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        // barrier.rotation.x = Math.PI / 2;
        // barrier.position.set(0, 0, startZ);
        // dividerGroup.add(barrier);
        
        // ✅ OPTIMIZED: Shared geometry and materials for reflectors
        if (!Road.reflectorGeometry) {
            Road.reflectorGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            Road.reflectorMaterialRed = new THREE.MeshBasicMaterial({ 
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.8
            });
            Road.reflectorMaterialOrange = new THREE.MeshBasicMaterial({ 
                color: 0xffaa00,
                emissive: 0xffaa00,
                emissiveIntensity: 0.8
            });
        }
        
        // Add reflective markers (reuse geometry and materials)
        for (let z = startZ; z < endZ; z += 15) {
            const reflectorColor = Math.floor(z / 15) % 2 === 0;
            const material = reflectorColor ? Road.reflectorMaterialRed : Road.reflectorMaterialOrange;
            
            const reflector = new THREE.Mesh(Road.reflectorGeometry, material);
            reflector.position.set(0, 0.75, z);
            dividerGroup.add(reflector);
        }
        
        // Yellow stripe
        const centerZ = (startZ + endZ) / 2;
        const stripeGeometry = new THREE.BoxGeometry(0.45, 0.08, length);
        const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.set(0, 0.4, centerZ);
        dividerGroup.add(stripe);
        
        return dividerGroup;
    }
    
    createFences() {
        for (let side of [-1, 1]) {
            const fenceX = side * 9.5;
            
            for (let baseOffset = 0; baseOffset < 3; baseOffset++) {
                const baseZ = baseOffset * 500 - 500;
                let segmentStart = null;
                
                for (let localZ = -250; localZ <= 250; localZ += 5) {
                    const absoluteZ = baseZ + localZ;
                    const inZone = this.isInRestrictedZone(0, absoluteZ);
                    
                    if (!inZone && segmentStart === null) {
                        segmentStart = localZ;
                    } else if (inZone && segmentStart !== null) {
                        const fence = this.createFenceSegment(fenceX, segmentStart, localZ - 5);
                        fence.position.set(0, 0, baseZ);
                        this.scene.add(fence);
                        this.fences.push(fence);
                        segmentStart = null;
                    } else if (localZ === 250 && segmentStart !== null) {
                        const fence = this.createFenceSegment(fenceX, segmentStart, localZ);
                        fence.position.set(0, 0, baseZ);
                        this.scene.add(fence);
                        this.fences.push(fence);
                        segmentStart = null;
                    }
                }
            }
        }
    }

    createFenceSegment(fenceX, startZ, endZ) {
	const fenceGroup = new THREE.Group();
	const length = endZ - startZ;
	const centerZ = (startZ + endZ) / 2;
	
	if (length < 5) return fenceGroup;
	
	// ✅ Create shared geometries and materials once
	if (!Road.postGeometry) {
            Road.postGeometry = new THREE.BoxGeometry(0.15, 1.2, 0.15);
            Road.postMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
            Road.railMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
	}
	
	// ✅ BETTER: Create InstancedMesh for posts in THIS segment
	const postCount = Math.floor(length / 5) + 1;
	const segmentPosts = new THREE.InstancedMesh(
            Road.postGeometry,
            Road.postMaterial,
            postCount
	);
	segmentPosts.castShadow = false;
	
	const matrix = new THREE.Matrix4();
	let index = 0;
	
	for (let z = startZ; z <= endZ; z += 5) {
            matrix.setPosition(fenceX, 0.6, z);
            segmentPosts.setMatrixAt(index, matrix);
            index++;
	}
	segmentPosts.instanceMatrix.needsUpdate = true;
	
	fenceGroup.add(segmentPosts);
	
	// Add rails
	if (length >= 10) {
            const railPositions = [0.3, 0.6, 0.9];
            railPositions.forEach(height => {
		const railGeometry = new THREE.BoxGeometry(0.1, 0.08, length);
		const rail = new THREE.Mesh(railGeometry, Road.railMaterial);
		rail.position.set(fenceX, height, centerZ);
		fenceGroup.add(rail);
            });
	}
	
	return fenceGroup;
    }
    
    // // ✅ OPTIMIZED: Reuse geometries and materials for fence
    // createFenceSegment(fenceX, startZ, endZ) {
    //     const fenceGroup = new THREE.Group();
    //     const length = endZ - startZ;
    //     const centerZ = (startZ + endZ) / 2;
        
    //     if (length < 5) return fenceGroup;
        
    //     // ✅ Create shared geometries and materials once
    //     if (!Road.postGeometry) {
    //         Road.postGeometry = new THREE.BoxGeometry(0.15, 1.2, 0.15);
    //         Road.postMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
    //         Road.railGeometry = new THREE.BoxGeometry(0.1, 0.08, 1);
    //         Road.railMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    //     }
        
    //     // Add posts (reuse geometry and material)
    //     for (let z = startZ; z <= endZ; z += 5) {
    //         const post = new THREE.Mesh(Road.postGeometry, Road.postMaterial);
    //         post.position.set(fenceX, 0.6, z);
    //         post.castShadow = false;
    //         fenceGroup.add(post);
    //     }
        
    //     // Add rails
    //     if (length >= 10) {
    //         const railPositions = [0.3, 0.6, 0.9];
    //         railPositions.forEach(height => {
    //             const railGeometry = new THREE.BoxGeometry(0.1, 0.08, length);
    //             const rail = new THREE.Mesh(railGeometry, Road.railMaterial);
    //             rail.position.set(fenceX, height, centerZ);
    //             fenceGroup.add(rail);
    //         });
    //     }
        
    //     return fenceGroup;
    // }
    
    createEdgeStrips() {
        [9, -9].forEach(x => {
            const stripeGeometry = new THREE.BoxGeometry(0.45, 0.08, 500);
            const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.position.set(x, 0, 0);
            this.scene.add(stripe);
        });
    }
    
    spawnPotholes() {
        const positions = [
            { x: -4, z: 40 }, { x: 3, z: 70 },
            // { x: -5, z: 140 }, { x: 2, z: 200 },
            { x: -3, z: 260 }, { x: 4, z: 290 }
        ];
        
        positions.forEach(pos => {
            if (!this.isInRestrictedZone(pos.x, pos.z)) {
                const pothole = new Pothole(this.scene, pos.x, pos.z);
                this.potholes.push(pothole);
            }
        });
    }
    
    isInRestrictedZone(x, z) {
        const normalizedZ = ((z % 350) + 350) % 350;
        
        for (let zone of RestrictedZones.intersections) {
            if (normalizedZ >= zone.start && normalizedZ <= zone.end) {
                if (x >= -45 && x <= 45) return true;
            }
        }
        return false;
    }
    
    // ✅ OPTIMIZED: Update lane markers with InstancedMesh
    update(worldSpeed) {
        this.segments.forEach(segment => {
            segment.position.z -= worldSpeed;
            if (segment.position.z < -500) {
                segment.position.z += 1500;
            }
        });
        
        this.dividers.forEach(divider => {
            divider.position.z -= worldSpeed;
            if (divider.position.z < -50) {
                divider.position.z += 350;
            }
        });

        // Update lane markers (InstancedMesh)
        const matrix = new THREE.Matrix4();
        this.markerData.forEach(marker => {
            marker.z -= worldSpeed;
            if (marker.z < -50) {
                marker.z += 1200; // Cycle back
            }
            matrix.setPosition(marker.x, 0, marker.z);
            this.laneMarkers.setMatrixAt(marker.index, matrix);
        });
        this.laneMarkers.instanceMatrix.needsUpdate = true;

        this.fences.forEach(fence => {
	    
            fence.position.z -= worldSpeed;
            if (fence.position.z < -50) {
                fence.position.z += 350;
            }
        });
        
        this.potholes.forEach(pothole => {
	    // pothole.position.x = Math.floor(Math.random() * 18) - 8
            pothole.update(worldSpeed);
        });
    }
    
    dispose() {
        // Clean up shared resources
        Road.reflectorGeometry?.dispose();
        Road.reflectorMaterialRed?.dispose();
        Road.reflectorMaterialOrange?.dispose();
        Road.postGeometry?.dispose();
        Road.postMaterial?.dispose();
        Road.railGeometry?.dispose();
        Road.railMaterial?.dispose();
    }
}

// Static properties for shared resources
Road.reflectorGeometry = null;
Road.reflectorMaterialRed = null;
Road.reflectorMaterialOrange = null;
Road.postGeometry = null;
Road.postMaterial = null;
Road.railGeometry = null;
Road.railMaterial = null;

// import * as THREE from 'three';
// import { GameConfig } from '../config/GameConfig.js';
// import { Colors, RestrictedZones } from '../utils/Constants.js';
// import { Pothole } from './objects/Pothole.js';

// export class Road {
//     constructor(scene) {
//         this.scene = scene;
//         this.segments = [];
//         this.dividers = [];
//         this.fences = [];
//         this.potholes = [];
//         this.markers = [];
        
//         this.createRoad();
//         this.createLaneMarkers();
//         this.createDividers();
//         this.createFences();
//         this.createEdgeStrips();
//         // this.spawnPotholes();
//     }
    
//     createRoad() {
//         const roadGeometry = new THREE.PlaneGeometry(18, 500);
//         const roadMaterial = new THREE.MeshLambertMaterial({ color: Colors.ROAD });
        
//         for (let i = 0; i < 3; i++) {
//             const road = new THREE.Mesh(roadGeometry, roadMaterial);
//             road.rotation.x = -Math.PI / 2;
//             road.position.z = i * 500 - 500;
//             road.receiveShadow = false;
//             this.scene.add(road);
//             this.segments.push(road);
//         }
        
//         this.createGrass();
//     }
    
//     createGrass() {
//         const grassTexture = this.createGrassTexture();
//         const grassPatches = [
//             { x: -34, color: Colors.GRASS_MEDIUM },
//             { x: -34, color: Colors.GRASS_DARK },
//             { x: -34, color: Colors.GRASS_LIGHT },
//             { x: 34, color: Colors.GRASS_MEDIUM },
//             { x: 34, color: Colors.GRASS_DARK },
//             { x: 34, color: Colors.GRASS_LIGHT }
//         ];
        
//         grassPatches.forEach((patch, index) => {
//             const grassGeometry = new THREE.PlaneGeometry(50, 500);
//             const grassMaterial = new THREE.MeshLambertMaterial({
//                 map: grassTexture,
//                 color: patch.color
//             });
            
//             const grass = new THREE.Mesh(grassGeometry, grassMaterial);
//             grass.rotation.x = -Math.PI / 2;
//             grass.position.x = patch.x;
//             grass.position.z = (index % 3) * 166 - 166;
//             grass.receiveShadow = false;
//             this.scene.add(grass);
//         });
//     }
    
//     createGrassTexture() {
//         const canvas = document.createElement('canvas');
//         canvas.width = 512;
//         canvas.height = 512;
//         const ctx = canvas.getContext('2d');
        
//         ctx.fillStyle = '#2d5016';
//         ctx.fillRect(0, 0, 512, 512);
        
//         for (let i = 0; i < 15000; i++) {
//             const x = Math.random() * 512;
//             const y = Math.random() * 512;
//             const shade = Math.random() * 60;
//             const greenValue = 80 + shade;
//             const blueValue = 20 + Math.random() * 30;
            
//             ctx.fillStyle = `rgb(${Math.random() * 40}, ${greenValue}, ${blueValue})`;
//             const size = Math.random() < 0.7 ? 1 : 2;
//             ctx.fillRect(x, y, size, size);
//         }
        
//         const texture = new THREE.CanvasTexture(canvas);
//         texture.wrapS = THREE.RepeatWrapping;
//         texture.wrapT = THREE.RepeatWrapping;
//         texture.repeat.set(8, 80);
        
//         return texture;
//     }
    
//     createLaneMarkers() {
//         const markerGeometry = new THREE.BoxGeometry(0.3, 0.1, 3);
//         const markerMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
//         const markerPositions = [-4.5, 4.5];
        
//         for (let z = -600; z < 600; z += 10) {
//             markerPositions.forEach(x => {
//                 const marker = new THREE.Mesh(markerGeometry, markerMaterial);
//                 marker.position.set(x, 0, z);
//                 this.scene.add(marker);
//                 this.markers.push(marker);
//             });
//         }
//     }
    
//     createDividers() {
//         for (let baseOffset = 0; baseOffset < 3; baseOffset++) {
//             const baseZ = baseOffset * 500 - 500;
//             let segmentStart = null;
            
//             for (let localZ = -250; localZ <= 250; localZ += 10) {
//                 const absoluteZ = baseZ + localZ;
//                 const inZone = this.isInRestrictedZone(0, absoluteZ);
                
//                 if (!inZone && segmentStart === null) {
//                     segmentStart = localZ;
//                 } else if (inZone && segmentStart !== null) {
//                     const divider = this.createDividerSegment(segmentStart, localZ - 10);
//                     divider.position.set(0, 0, baseZ);
//                     this.scene.add(divider);
//                     this.dividers.push(divider);
//                     segmentStart = null;
//                 } else if (localZ === 250 && segmentStart !== null) {
//                     const divider = this.createDividerSegment(segmentStart, localZ);
//                     divider.position.set(0, 0, baseZ);
//                     this.scene.add(divider);
//                     this.dividers.push(divider);
//                     segmentStart = null;
//                 }
//             }
//         }
//     }
    
//     createDividerSegment(startZ, endZ) {
//         const dividerGroup = new THREE.Group();
// 	const length = endZ - startZ;
	
// 	// Only create if segment is meaningful
// 	if (length < 10) return dividerGroup;
	
// 	// Main concrete barrier
// 	const barrierShape = new THREE.Shape();
// 	barrierShape.moveTo(-0.3, 0);
// 	barrierShape.lineTo(-0.2, 0.5);
// 	barrierShape.lineTo(-0.2, 0.7);
// 	barrierShape.lineTo(0.2, 0.7);
// 	barrierShape.lineTo(0.2, 0.5);
// 	barrierShape.lineTo(0.3, 0);
// 	barrierShape.lineTo(-0.3, 0);
	
// 	const extrudeSettings = {
//             steps: 1,
//             depth: length,
//             bevelEnabled: false
// 	};
	
// 	const barrierGeometry = new THREE.ExtrudeGeometry(barrierShape, extrudeSettings);
// 	const barrierMaterial = new THREE.MeshLambertMaterial({ 
//             color: 0xcccccc,
//             flatShading: false
// 	});
// 	const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
// 	barrier.rotation.x = Math.PI / 2;
// 	barrier.position.set(0, 0, startZ);
// 	dividerGroup.add(barrier);
	
// 	// Add reflective markers
// 	for (let z = startZ; z < endZ; z += 15) {
//             const reflectorColor = Math.floor(z / 15) % 2 === 0 ? 0xff0000 : 0xffaa00;
//             const reflector = new THREE.Mesh(
// 		new THREE.SphereGeometry(0.08, 8, 8),
// 		new THREE.MeshBasicMaterial({ 
//                     color: reflectorColor,
//                     emissive: reflectorColor,
//                     emissiveIntensity: 0.8
// 		})
//             );
//             reflector.position.set(0, 0.75, z);
//             dividerGroup.add(reflector);
// 	}
	
// 	// Yellow stripe
// 	const centerZ = (startZ + endZ) / 2;
// 	const stripeGeometry = new THREE.BoxGeometry(0.45, 0.08, length);
// 	const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
// 	const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
// 	stripe.position.set(0, 0.4, centerZ);
// 	dividerGroup.add(stripe);
	
// 	return dividerGroup;
//     }
    
//     createFences() {
//         for (let side of [-1, 1]) {
//             const fenceX = side * 9.5;
            
//             for (let baseOffset = 0; baseOffset < 3; baseOffset++) {
//                 const baseZ = baseOffset * 500 - 500;
//                 let segmentStart = null;
                
//                 for (let localZ = -250; localZ <= 250; localZ += 5) {
//                     const absoluteZ = baseZ + localZ;
//                     const inZone = this.isInRestrictedZone(0, absoluteZ);
                    
//                     if (!inZone && segmentStart === null) {
//                         segmentStart = localZ;
//                     } else if (inZone && segmentStart !== null) {
//                         const fence = this.createFenceSegment(fenceX, segmentStart, localZ - 5);
//                         fence.position.set(0, 0, baseZ);
//                         this.scene.add(fence);
//                         this.fences.push(fence);
//                         segmentStart = null;
//                     } else if (localZ === 250 && segmentStart !== null) {
//                         const fence = this.createFenceSegment(fenceX, segmentStart, localZ);
//                         fence.position.set(0, 0, baseZ);
//                         this.scene.add(fence);
//                         this.fences.push(fence);
//                         segmentStart = null;
//                     }
//                 }
//             }
//         }
//     }
    
//     createFenceSegment(fenceX, startZ, endZ) {
//         const fenceGroup = new THREE.Group();
//         const length = endZ - startZ;
//         const centerZ = (startZ + endZ) / 2;
        
//         if (length < 5) return fenceGroup;
        
//         for (let z = startZ; z <= endZ; z += 5) {
//             const postGeometry = new THREE.BoxGeometry(0.15, 1.2, 0.15);
//             const postMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
//             const post = new THREE.Mesh(postGeometry, postMaterial);
//             post.position.set(fenceX, 0.6, z);
//             post.castShadow = false;
//             fenceGroup.add(post);
//         }
        
//         if (length >= 10) {
//             const railPositions = [0.3, 0.6, 0.9];
//             railPositions.forEach(height => {
//                 const railGeometry = new THREE.BoxGeometry(0.1, 0.08, length);
//                 const railMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
//                 const rail = new THREE.Mesh(railGeometry, railMaterial);
//                 rail.position.set(fenceX, height, centerZ);
//                 fenceGroup.add(rail);
//             });
//         }
        
//         return fenceGroup;
//     }
    
//     createEdgeStrips() {
//         [9, -9].forEach(x => {
//             const stripeGeometry = new THREE.BoxGeometry(0.45, 0.08, 500);
//             const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
//             const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
//             stripe.position.set(x, 0, 0);
//             this.scene.add(stripe);
//         });
//     }
    
//     spawnPotholes() {
//         const positions = [
//             { x: -4, z: 40 }, { x: 3, z: 70 },
//             { x: -5, z: 140 }, { x: 2, z: 200 },
//             { x: -3, z: 260 }, { x: 4, z: 290 }
//         ];
        
//         positions.forEach(pos => {
//             if (!this.isInRestrictedZone(pos.x, pos.z)) {
//                 const pothole = new Pothole(this.scene, pos.x, pos.z);
//                 this.potholes.push(pothole);
//             }
//         });
//     }
    
//     isInRestrictedZone(x, z) {
//         const normalizedZ = ((z % 350) + 350) % 350;
        
//         for (let zone of RestrictedZones.intersections) {
//             if (normalizedZ >= zone.start && normalizedZ <= zone.end) {
//                 if (x >= -45 && x <= 45) return true;
//             }
//         }
//         return false;
//     }
    
//     update(worldSpeed) {
//         this.segments.forEach(segment => {
//             segment.position.z -= worldSpeed;
//             if (segment.position.z < -500) {
//                 segment.position.z += 1500;
//             }
//         });
        
//         this.dividers.forEach(divider => {
//             divider.position.z -= worldSpeed;
//             if (divider.position.z < -50) {
//                 divider.position.z += 350;
//             }
//         });

//         this.markers.forEach(marker => {
//             marker.position.z -= worldSpeed;
//             if (marker.position.z < -50) {
//                 marker.position.z += 350;
//             }
//         });

//         this.fences.forEach(fence => {
//             fence.position.z -= worldSpeed;
//             if (fence.position.z < -50) {
//                 fence.position.z += 350;
//             }
//         });
        
//         this.potholes.forEach(pothole => {
//             pothole.update(worldSpeed);
//         });
//     }
// }

