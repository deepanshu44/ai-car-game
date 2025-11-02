import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig.js';
export class MountainTunnel {
    constructor(centerZ) {
        this.centerZ = centerZ;
        this.entryZ = centerZ - 100;
        this.tunnelStartZ = centerZ - 50;
        this.tunnelEndZ = centerZ + 50;
        this.exitZ = centerZ + 100;
        
        this.mesh = new THREE.Group();
	this.mesh.position.set(0, 0, centerZ);
        this.lights = [];
        this.biomeSwitched = false;
        this.hidden = false
        this.create();
    }
    
    create() {
        // this.createMountain();
        this.createTunnel();
        // this.createSupportArches();
        // this.createTunnelLights();
        // this.createPortals();
        // this.createSigns();
        // this.createDetails();
    }

        createTunnel(){
	// Cylinder parameters
	const outerRadius = 12;    // Outer radius
	const innerRadius = 10;  // Inner radius (must be less than outerRadius)
	const height = GameConfig.biome.transitionZoneLength;         // Height of the cylinder
	const radialSegments = 8;// Number of segments around the circumference

	// Outer cylinder (visible from outside and inside)
	const outerGeometry = new THREE.CylinderGeometry(
            outerRadius, outerRadius, height, radialSegments, 1, true // Open-ended
	);
	const outerMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide, // Render both sides
            shininess: 30
	});
	const outerCylinder = new THREE.Mesh(outerGeometry, outerMaterial);
	this.mesh.add(outerCylinder);

	// Inner cylinder (visible from inside and outside)
	const innerGeometry = new THREE.CylinderGeometry(
            innerRadius, innerRadius, height, radialSegments, 1, true // Open-ended
	);
	const innerMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide, // Render both sides
            shininess: 30
	});
	const innerCylinder = new THREE.Mesh(innerGeometry, innerMaterial);
	this.mesh.add(innerCylinder);

	// Create rings to fill the top and bottom gaps
	const ringGeometry = new THREE.RingGeometry(
            innerRadius, outerRadius, radialSegments, 1
	);
	const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00, // Match the outer cylinder color
            side: THREE.DoubleSide,
            shininess: 30
	});

	// Top ring
	const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
	topRing.position.y = height / 2;
	topRing.rotation.x = -Math.PI / 2; // Rotate to face upward
	this.mesh.add(topRing);

	// Bottom ring
	const bottomRing = new THREE.Mesh(ringGeometry, ringMaterial);
	bottomRing.position.y = -height / 2;
	bottomRing.rotation.x = Math.PI / 2; // Rotate to face downward
	this.mesh.add(bottomRing);
	this.mesh.rotation.x = Math.PI / 2
    } 

    update(worldSpeed) {
        this.mesh.position.z -= worldSpeed;
	if (this.mesh.position.z < -GameConfig.biome.transitionZoneLength) {
            this.mesh.position.z += GameConfig.biome.transitionDistance;
        }
    }

    hide() {
	// don't dispose or destroy
        this.mesh.visible = false;
	this.hidden = true
    }
    
    shouldRespawn() {
	// FIXME: mesh spawns at eg.z:300, but this.mesh.position.z is 0
	// so if mesh at -200 for itself, will be at z:100 for the
	// world. -300 is temporary fix
        return this.mesh.position.z < -200-500;
    }
    
    respawn() {
        this.mesh.position.z += 1000;  // Next transition
        this.biomeSwitched = false;
	this.mesh.visible = true;
    }
    
    updateLighting(playerZ, scene) {
        const relativeZ = playerZ - this.mesh.position.z;
        const distToEntry = relativeZ - this.tunnelStartZ;
        const distToExit = this.tunnelEndZ - relativeZ;
        
        // Entry fade (0-50 units into tunnel)
        if (distToEntry > 0 && distToEntry < 50) {
            const fadeProgress = distToEntry / 50;
            return {
                ambientIntensity: this.lerp(0.6, 0.2, fadeProgress),
                skyColor: this.lerpColor(0x0a0a1a, 0x050505, fadeProgress),
                fogFar: this.lerp(120, 40, fadeProgress)
            };
        }
        // Inside tunnel
        else if (distToEntry >= 50 && distToExit >= 50) {
            return {
                ambientIntensity: 0.2,
                skyColor: 0x050505,
                fogFar: 40
            };
        }
        // Exit fade
        else if (distToExit > 0 && distToExit < 50) {
            const fadeProgress = 1 - (distToExit / 50);
            return {
                ambientIntensity: this.lerp(0.2, 0.6, fadeProgress),
                skyColor: this.lerpColor(0x050505, 0x87a96b, fadeProgress),
                fogFar: this.lerp(40, 120, fadeProgress)
            };
        }
        
        return null;
    }
    
    isPlayerInside(playerZ) {
        const relativeZ = playerZ - this.mesh.position.z;
        return relativeZ >= this.tunnelStartZ && relativeZ <= this.tunnelEndZ;
    }
    
    shouldSwitchBiome(playerZ) {
        const relativeZ = playerZ - this.mesh.position.z;
	// console.log("relativeZ = ", relativeZ,playerZ,this.mesh.position.z,this.centerZ);
        return relativeZ >= this.centerZ - 5 && 
            relativeZ <= this.centerZ + 5 && 
            !this.biomeSwitched;
    }
    
    markBiomeSwitched() {
        this.biomeSwitched = true;
    }

}

// import * as THREE from 'three';

// export class MountainTunnel {
//     constructor(scene,centerZ) {
// 	this.scene = scene
//         this.centerZ = centerZ;
//         this.entryZ = centerZ - 100;
//         this.tunnelStartZ = centerZ - 50;
//         this.tunnelEndZ = centerZ + 50;
//         this.exitZ = centerZ + 100;
        
//         this.mesh = new THREE.Group();
// 	// this.mesh.position.set(0, 0, centerZ);
//         this.lights = [];
//         this.biomeSwitched = false;
        
//         this.create();
// 	scene.add(this.mesh)
//     }
    
//     create() {
//         this.createMountain();
//         this.createTunnel();
//         this.createSupportArches();
//         this.createTunnelLights();
//         this.createPortals();
//         this.createSigns();
//     }
    
//     createMountain() {
//         // Mountain exterior - simplified box with peaked top
//         const mountainGroup = new THREE.Group();
        
//         // Left mountain side
//         const leftSideGeometry = new THREE.BoxGeometry(50, 30, 200);
//         const mountainMaterial = new THREE.MeshLambertMaterial({ 
//             color: 0x606060,
//             flatShading: true
//         });
//         const leftSide = new THREE.Mesh(leftSideGeometry, mountainMaterial);
//         leftSide.position.set(-35, 15, 0);
//         mountainGroup.add(leftSide);
        
//         // Right mountain side
//         const rightSide = new THREE.Mesh(leftSideGeometry, mountainMaterial);
//         rightSide.position.set(35, 15, 0);
//         mountainGroup.add(rightSide);
        
//         // Top peak (triangular prism)
//         const peakShape = new THREE.Shape();
//         peakShape.moveTo(-15, 0);
//         peakShape.lineTo(0, 15);
//         peakShape.lineTo(15, 0);
//         peakShape.lineTo(-15, 0);
        
//         const peakGeometry = new THREE.ExtrudeGeometry(peakShape, {
//             steps: 1,
//             depth: 200,
//             bevelEnabled: false
//         });
//         const peak = new THREE.Mesh(peakGeometry, mountainMaterial);
//         peak.rotation.x = Math.PI / 2;
//         peak.position.set(0, 30, -100);
//         mountainGroup.add(peak);
        
//         mountainGroup.position.z = this.centerZ;
//         this.mesh.add(mountainGroup);
//     }
    
//     createTunnel() {
//         const tunnelGroup = new THREE.Group();
        
//         // Main tunnel - half cylinder (arch)
//         const radius = 6;
//         const length = 100;
//         const radialSegments = 32;
//         const heightSegments = 1;
        
//         const tunnelGeometry = new THREE.CylinderGeometry(
//             radius,           // radiusTop
//             radius,           // radiusBottom
//             length,           // height (length of tunnel)
//             radialSegments,   // radialSegments
//             heightSegments,   // heightSegments
//             false,            // openEnded
//             0,                // thetaStart (start angle)
//             Math.PI           // thetaLength (only top half = arch)
//         );
        
//         // Concrete texture simulation
//         const tunnelMaterial = new THREE.MeshLambertMaterial({ 
//             color: 0x4a4a4a,
//             side: THREE.BackSide  // Inside surface visible
//         });
        
//         const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
//         tunnel.rotation.z = Math.PI / 2;  // Make it horizontal
//         tunnel.position.set(0, radius, this.centerZ);
        
//         tunnelGroup.add(tunnel);
        
//         // Tunnel floor (road continues)
//         const floorGeometry = new THREE.PlaneGeometry(12, length);
//         const floorMaterial = new THREE.MeshLambertMaterial({ 
//             color: 0x333333  // Same as road
//         });
//         const floor = new THREE.Mesh(floorGeometry, floorMaterial);
//         floor.rotation.x = -Math.PI / 2;
//         floor.position.set(0, 0.01, this.centerZ);
//         tunnelGroup.add(floor);
        
//         this.mesh.add(tunnelGroup);
//     }
    
//     createSupportArches() {
//         const archGroup = new THREE.Group();
//         const archMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
        
//         // Create arches every 10 units
//         for (let z = this.tunnelStartZ + 5; z < this.tunnelEndZ; z += 10) {
//             // Left pillar
//             const leftPillar = this.createPillar(archMaterial);
//             leftPillar.position.set(-5.5, 0, z);
//             archGroup.add(leftPillar);
            
//             // Right pillar
//             const rightPillar = this.createPillar(archMaterial);
//             rightPillar.position.set(5.5, 0, z);
//             archGroup.add(rightPillar);
            
//             // Top arch beam
//             const archBeam = this.createArchBeam(archMaterial);
//             archBeam.position.set(0, 5.5, z);
//             archGroup.add(archBeam);
//         }
        
//         this.mesh.add(archGroup);
//     }
    
//     createPillar(material) {
//         const pillarGeometry = new THREE.BoxGeometry(0.4, 5.5, 0.4);
//         const pillar = new THREE.Mesh(pillarGeometry, material);
//         pillar.position.y = 2.75;
//         return pillar;
//     }
    
//     createArchBeam(material) {
//         const beamGroup = new THREE.Group();
        
//         // Horizontal beam across top
//         const horizontalGeometry = new THREE.BoxGeometry(11, 0.4, 0.4);
//         const horizontal = new THREE.Mesh(horizontalGeometry, material);
//         beamGroup.add(horizontal);
        
//         // Diagonal supports (optional detail)
//         const diagonalGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.2);
        
//         const leftDiagonal = new THREE.Mesh(diagonalGeometry, material);
//         leftDiagonal.position.set(-4.5, -0.75, 0);
//         leftDiagonal.rotation.z = Math.PI / 6;
//         beamGroup.add(leftDiagonal);
        
//         const rightDiagonal = new THREE.Mesh(diagonalGeometry, material);
//         rightDiagonal.position.set(4.5, -0.75, 0);
//         rightDiagonal.rotation.z = -Math.PI / 6;
//         beamGroup.add(rightDiagonal);
        
//         return beamGroup;
//     }
    
//     createTunnelLights() {
//         const lightGroup = new THREE.Group();
        
//         // Create lights every 15 units, alternating sides
//         for (let z = this.tunnelStartZ; z < this.tunnelEndZ; z += 15) {
//             const side = ((z - this.tunnelStartZ) / 15) % 2 === 0 ? -1 : 1;
//             const x = side * 5;
            
//             // Light fixture (visual)
//             const fixtureGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.3);
//             const fixtureMaterial = new THREE.MeshBasicMaterial({ 
//                 color: 0xffaa66,
//                 emissive: 0xffaa66,
//                 emissiveIntensity: 1
//             });
//             const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
//             fixture.position.set(x, 5, z);
//             lightGroup.add(fixture);
            
//             // Point light
//             const pointLight = new THREE.PointLight(0xffaa66, 0.8, 15);
//             pointLight.position.set(x, 5, z);
//             lightGroup.add(pointLight);
            
//             this.lights.push(pointLight);
//         }
        
//         this.mesh.add(lightGroup);
//     }
    
//     createPortals() {
//         const portalGroup = new THREE.Group();
        
//         // Entry portal
//         const entryPortal = this.createPortal();
//         entryPortal.position.z = this.tunnelStartZ;
//         portalGroup.add(entryPortal);
        
//         // Exit portal
//         const exitPortal = this.createPortal();
//         exitPortal.position.z = this.tunnelEndZ;
//         exitPortal.rotation.y = Math.PI;  // Face opposite direction
//         portalGroup.add(exitPortal);
        
//         this.mesh.add(portalGroup);
//     }
    
//     createPortal() {
//         const portalGroup = new THREE.Group();
        
//         // Portal frame
//         const frameGeometry = new THREE.BoxGeometry(14, 8, 0.5);
//         const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
//         const frame = new THREE.Mesh(frameGeometry, frameMaterial);
//         frame.position.y = 4;
//         portalGroup.add(frame);
        
//         // Reflectors (orange/white stripes)
//         for (let i = 0; i < 8; i++) {
//             const reflectorGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.1);
//             const reflectorColor = i % 2 === 0 ? 0xff6600 : 0xffffff;
//             const reflectorMaterial = new THREE.MeshBasicMaterial({ 
//                 color: reflectorColor,
//                 emissive: reflectorColor,
//                 emissiveIntensity: 0.5
//             });
//             const reflector = new THREE.Mesh(reflectorGeometry, reflectorMaterial);
//             reflector.position.set(-6.5 + i * 1.8, 4, 0.3);
//             portalGroup.add(reflector);
//         }
        
//         return portalGroup;
//     }
    
//     createSigns() {
//         const signGroup = new THREE.Group();
        
//         // "TUNNEL AHEAD" sign
//         const sign1 = this.createSign('TUNNEL AHEAD');
//         sign1.position.set(-8, 3, this.tunnelStartZ - 30);
//         signGroup.add(sign1);
        
//         // "REDUCE SPEED" sign
//         const sign2 = this.createSign('REDUCE SPEED');
//         sign2.position.set(8, 3, this.tunnelStartZ - 15);
//         signGroup.add(sign2);
        
//         this.mesh.add(signGroup);
//     }
    
//     createSign(text) {
//         const signGroup = new THREE.Group();
        
//         // Sign post
//         const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
//         const postMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
//         const post = new THREE.Mesh(postGeometry, postMaterial);
//         post.position.y = 1.5;
//         signGroup.add(post);
        
//         // Sign board
//         const boardGeometry = new THREE.BoxGeometry(3, 1, 0.1);
//         const boardMaterial = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
//         const board = new THREE.Mesh(boardGeometry, boardMaterial);
//         board.position.y = 3;
//         signGroup.add(board);
        
//         // Text (simplified - just white stripe)
//         const textGeometry = new THREE.BoxGeometry(2.5, 0.6, 0.12);
//         const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
//         const textMesh = new THREE.Mesh(textGeometry, textMaterial);
//         textMesh.position.set(0, 3, 0.06);
//         signGroup.add(textMesh);
        
//         return signGroup;
//     }
    
//     update(worldSpeed) {
//         // Move tunnel with world
//         this.mesh.position.z -= worldSpeed;
//     }
    
//     shouldRespawn() {
//         return this.mesh.position.z < -200;
//     }
    
//     respawn() {
//         this.mesh.position.z += 1000;  // Next transition
//         this.biomeSwitched = false;
//     }
    
//     updateLighting(playerZ, scene) {
//         const relativeZ = playerZ - this.mesh.position.z;
//         const distToEntry = relativeZ - this.tunnelStartZ;
//         const distToExit = this.tunnelEndZ - relativeZ;
        
//         // Entry fade (0-50 units into tunnel)
//         if (distToEntry > 0 && distToEntry < 50) {
//             const fadeProgress = distToEntry / 50;
//             return {
//                 ambientIntensity: this.lerp(0.6, 0.2, fadeProgress),
//                 skyColor: this.lerpColor(0x0a0a1a, 0x050505, fadeProgress),
//                 fogFar: this.lerp(120, 40, fadeProgress)
//             };
//         }
//         // Inside tunnel
//         else if (distToEntry >= 50 && distToExit >= 50) {
//             return {
//                 ambientIntensity: 0.2,
//                 skyColor: 0x050505,
//                 fogFar: 40
//             };
//         }
//         // Exit fade
//         else if (distToExit > 0 && distToExit < 50) {
//             const fadeProgress = 1 - (distToExit / 50);
//             return {
//                 ambientIntensity: this.lerp(0.2, 0.6, fadeProgress),
//                 skyColor: this.lerpColor(0x050505, 0x87a96b, fadeProgress),
//                 fogFar: this.lerp(40, 120, fadeProgress)
//             };
//         }
        
//         return null;
//     }
    
//     isPlayerInside(playerZ) {
//         const relativeZ = playerZ - this.mesh.position.z;
//         return relativeZ >= this.tunnelStartZ && relativeZ <= this.tunnelEndZ;
//     }
    
//     shouldSwitchBiome(playerZ) {
//         const relativeZ = playerZ - this.mesh.position.z;
//         return relativeZ >= this.centerZ - 5 && 
//                relativeZ <= this.centerZ + 5 && 
//                !this.biomeSwitched;
//     }
    
//     markBiomeSwitched() {
//         this.biomeSwitched = true;
//     }
    
//     optimizeLights(playerZ) {
//         const relativeZ = playerZ - this.mesh.position.z;
        
//         this.lights.forEach(light => {
//             const distance = Math.abs(light.position.z - relativeZ);
//             light.visible = distance < 60;
//         });
//     }
    
//     lerp(start, end, t) {
//         return start + (end - start) * t;
//     }
    
//     lerpColor(color1, color2, t) {
//         const c1 = new THREE.Color(color1);
//         const c2 = new THREE.Color(color2);
//         return c1.lerp(c2, t).getHex();
//     }
    
//     dispose() {
//         this.mesh.traverse(child => {
//             if (child.geometry) child.geometry.dispose();
//             if (child.material) child.material.dispose();
//         });
//     }
// }
