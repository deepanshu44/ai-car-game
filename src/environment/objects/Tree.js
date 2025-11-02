import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export class SimpleTreeManager {
    constructor(scene) {
        this.scene = scene;
        this.trees = null;
        this.treeData = [];
        this.createTrees();
    }
    
    createSimpleTreeGeometry() {
	// Trunk (brown)
	const trunk = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
	trunk.translate(0, 1.5, 0);
	
	// Foliage (green)
	const foliage = new THREE.ConeGeometry(1.2, 3, 8);
	foliage.translate(0, 3.8, 0);
	
	// Set brown color for trunk vertices
	const trunkColors = [];
	const brownColor = new THREE.Color(0x8B4513); // Brown
	for (let i = 0; i < trunk.attributes.position.count; i++) {
            trunkColors.push(brownColor.r, brownColor.g, brownColor.b);
	}
	trunk.setAttribute('color', new THREE.Float32BufferAttribute(trunkColors, 3));
	
	// Set green color for foliage vertices
	const foliageColors = [];
	const greenColor = new THREE.Color(0x228b22); // Green
	for (let i = 0; i < foliage.attributes.position.count; i++) {
            foliageColors.push(greenColor.r, greenColor.g, greenColor.b);
	}
	foliage.setAttribute('color', new THREE.Float32BufferAttribute(foliageColors, 3));
	
	// Merge them
	const merged = mergeGeometries([trunk, foliage]);
	return merged;
    }

    createTrees() {
	const geometry = this.createSimpleTreeGeometry();
	// Enable vertex colors in material
	const material = new THREE.MeshLambertMaterial({ 
            vertexColors: true  // This makes it use vertex colors!
	});
	
	this.trees = new THREE.InstancedMesh(geometry, material, 100);
	this.trees.castShadow = true;
	this.scene.add(this.trees);
	
	this.matrix = new THREE.Matrix4();
	this.position = new THREE.Vector3();
	this.rotation = new THREE.Quaternion();
	this.scale = new THREE.Vector3();
	this.count = 0;
    }
    
    addTree(x, z) {
        if (this.count >= this.trees.count) {
            console.warn('Tree pool exhausted');
            return;
        }
        
        const sizeScale = 0.7 + Math.random() * 0.6;
        const rotationY = Math.random() * Math.PI * 2;
        
        this.position.set(x, 0, z);
        this.rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
        this.scale.set(sizeScale, sizeScale, sizeScale);
        
        this.matrix.compose(this.position, this.rotation, this.scale);
        this.trees.setMatrixAt(this.count, this.matrix);
        
        this.treeData.push({
            index: this.count,
            x: x,
            z: z,
            scale: sizeScale,
            rotation: rotationY
        });
        
        this.count++;
        this.trees.instanceMatrix.needsUpdate = true;
    }
    
    spawnTrees(RestrictedZones, Helpers) {
        for (let z = -50; z < 350; z += 12) {
            if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
                if (Math.random() > 0.4) {
                    this.addTree(-10 - Math.random() * 5, z);
                }
                if (Math.random() > 0.4) {
                    this.addTree(10 + Math.random() * 5, z);
                }
            }
        }
        
        for (let z = -50; z < 300; z += 25) {
            if (!Helpers.isInRestrictedZone(0, z, RestrictedZones.intersections)) {
                if (Math.random() > 0.6) {
                    this.addTree(-20 - Math.random() * 10, z);
                }
                if (Math.random() > 0.6) {
                    this.addTree(20 + Math.random() * 10, z);
                }
            }
        }
    }
    
    update(worldSpeed) {
        this.treeData.forEach(tree => {
            tree.z -= worldSpeed;
            
            if (tree.z < -50) {
                tree.z += 350;
            }
            
            this.position.set(tree.x, 0, tree.z);
            this.rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), tree.rotation);
            this.scale.set(tree.scale, tree.scale, tree.scale);
            
            this.matrix.compose(this.position, this.rotation, this.scale);
            this.trees.setMatrixAt(tree.index, this.matrix);
        });
        
        this.trees.instanceMatrix.needsUpdate = true;
    }
    
    dispose() {
        this.trees.geometry.dispose();
        this.trees.material.dispose();
        this.scene.remove(this.trees);
    }
}

// import * as THREE from 'three';

// export class Tree {
//     constructor(scene, x, z) {
//         this.scene = scene;
//         this.group = new THREE.Group();
//         this.initialZ = z;
        
//         this.createTree();
//         this.group.position.set(x, 0, z);
//         scene.add(this.group);
//     }
    
//     createTree() {
//         const treeType = Math.floor(Math.random() * 3);
//         const sizeScale = 0.7 + Math.random() * 0.6;
        
//         // Trunk
//         const trunkHeight = 2.5 + Math.random() * 1.5;
//         const trunkRadius = 0.25 + Math.random() * 0.15;
//         const trunkGeometry = new THREE.CylinderGeometry(
//             trunkRadius, 
//             trunkRadius + 0.1, 
//             trunkHeight, 
//             8
//         );
//         const trunkColors = [0x4a2511, 0x3d1f0f, 0x5c3317];
//         const trunkMaterial = new THREE.MeshLambertMaterial({ 
//             color: trunkColors[Math.floor(Math.random() * trunkColors.length)] 
//         });
//         const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
//         trunk.position.y = trunkHeight / 2;
//         trunk.castShadow = true;
//         this.group.add(trunk);
        
//         // Foliage based on type
//         if (treeType === 0) {
//             // Pine tree
//             const foliageGeometry = new THREE.ConeGeometry(1.2, 3, 8);
//             const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x1a5c1a });
//             const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
//             foliage.position.y = trunkHeight + 0.8;
//             foliage.castShadow = true;
//             this.group.add(foliage);
            
//             const foliage2 = new THREE.Mesh(
//                 new THREE.ConeGeometry(1, 2.5, 8),
//                 foliageMaterial
//             );
//             foliage2.position.y = trunkHeight + 1.5;
//             foliage2.castShadow = true;
//             this.group.add(foliage2);
            
//         } else if (treeType === 1) {
//             // Round tree
//             const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
//             const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
//             const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
//             foliage.position.y = trunkHeight + 0.3;
//             foliage.castShadow = true;
//             this.group.add(foliage);
            
//         } else {
//             // Oak tree
//             const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
//             const clusterPositions = [
//                 [0, trunkHeight + 0.8, 0, 1.3],
//                 [-0.6, trunkHeight + 0.3, 0.4, 0.9],
//                 [0.7, trunkHeight + 0.5, -0.3, 1],
//                 [0, trunkHeight + 1.3, 0, 0.8]
//             ];
            
//             clusterPositions.forEach(pos => {
//                 const cluster = new THREE.Mesh(
//                     new THREE.SphereGeometry(pos[3], 6, 6),
//                     foliageMaterial
//                 );
//                 cluster.position.set(pos[0], pos[1], pos[2]);
//                 cluster.castShadow = true;
//                 this.group.add(cluster);
//             });
//         }
        
//         this.group.scale.set(sizeScale, sizeScale, sizeScale);
//     }
    
//     update(worldSpeed) {
//         this.group.position.z -= worldSpeed;
//         if (this.group.position.z < -50) {
//             this.group.position.z += 350;
//         }
//     }
// }

