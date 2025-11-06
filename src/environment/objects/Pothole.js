import * as THREE from 'three';

export class Pothole {
    constructor(scene, x, z) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.x = x;
        this.z = z;
        this.initialZ = z;
        this.radius = 1.0;
        this.warningDistance = 120;
        this.hitRecently = false;
        
        this.createPothole();
        this.group.position.set(x, 0, z);
        scene.add(this.group);
    }
    
    createPothole() {
        // Pothole crater
        const craterGeometry = new THREE.CircleGeometry(0.8 + Math.random() * 0.4, 16);
        const craterMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x1a1a1a,
            transparent: true,
            opacity: 0.9
        });
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.rotation.x = -Math.PI / 2;
        crater.position.y = 0.02;
        this.group.add(crater);
        
        // Cracked edges
        const edgeGeometry = new THREE.RingGeometry(0.8, 1.2, 16);
        const edgeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2a2a2a,
            transparent: true,
            opacity: 0.7
        });
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.rotation.x = -Math.PI / 2;
        edge.position.y = 0.03;
        this.group.add(edge);
        
        // Debris
        for (let i = 0; i < 3; i++) {
            const debris = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.05, 0.1),
                new THREE.MeshLambertMaterial({ color: 0x4a4a4a })
            );
            debris.position.set(
                (Math.random() - 0.5) * 1.5,
                0.03,
                (Math.random() - 0.5) * 1.5
            );
            debris.rotation.y = Math.random() * Math.PI;
            this.group.add(debris);
        }
        
        // Warning marker
        this.warning = this.createWarning();
        this.group.add(this.warning);
    }
    
    createWarning() {
        const warningGroup = new THREE.Group();
        
        const warningMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 1
        });
        
        // Exclamation bar
        const barGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.05);
        const bar = new THREE.Mesh(barGeometry, warningMaterial);
        bar.position.y = 0.5;
        warningGroup.add(bar);
        
        // Exclamation dot
        const dotGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.05);
        const dot = new THREE.Mesh(dotGeometry, warningMaterial);
        dot.position.y = 0;
        warningGroup.add(dot);
        
        // Background circle (hidden by default)
        const bgGeometry = new THREE.CircleGeometry(0, 0);
        const bgMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const bg = new THREE.Mesh(bgGeometry, bgMaterial);
        bg.position.z = -0.05;
        warningGroup.add(bg);
        
        warningGroup.position.set(0, 1.5, 0);
        warningGroup.visible = true;
        
        return warningGroup;
    }
    
    update(worldSpeed, playerPosition = null, camera = null) {
        this.group.position.z -= worldSpeed;
        this.z = this.group.position.z;
        
        if (this.group.position.z < -50) {
            this.group.position.z += 350;
            this.z = this.group.position.z;
        }
        
        if (playerPosition && camera) {
            const distanceToPlayer = this.group.position.z - playerPosition.z;
            
            if (distanceToPlayer > 0 && distanceToPlayer < this.warningDistance) {
                this.warning.visible = true;
                
                const time = Date.now() * 0.005;
                this.warning.position.y = 1.5 + Math.sin(time) * 0.3;
                this.warning.rotation.z = Math.sin(time * 2) * 0.2;
                this.warning.lookAt(camera.position);
                
                const urgency = 1 - (distanceToPlayer / this.warningDistance);
                this.warning.children.forEach(child => {
                    if (child.material.opacity !== undefined) {
                        child.material.opacity = 0.6 + urgency * 0.4;
                    }
                });
            } else {
                this.warning.visible = false;
            }
        }
    }
    
    get mesh() {
        return this.group;
    }
}

