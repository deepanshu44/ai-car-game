import * as THREE from 'three';

export class VegetableCart {
    constructor(scene,x,z) {
	this.scene = scene;
	this.x = x;
	this.z = z;
	this.group = new THREE.Group()

	this.group.position.set(x,0,z)
	this.scene.add(this.group)
	this.group.scale.set(1.5, 1.5, 1.5); // 2x larger
	this.group.rotation.y = - Math.PI / 2

	this.createVegetableCart()
	this.createVendor()
    }

    createVegetableCart() {
        const cart = new THREE.Group();
        
        // Cart base platform
        const baseGeometry = new THREE.BoxGeometry(2.5, 0.1, 1.5);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 1.2;
        base.castShadow = true;
        cart.add(base);
        
        // Cart sides
        const sideGeometry = new THREE.BoxGeometry(2.5, 0.5, 0.05);
        const sideMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        
        const sideFront = new THREE.Mesh(sideGeometry, sideMaterial);
        sideFront.position.set(0, 1.5, 0.75);
        sideFront.castShadow = true;
        cart.add(sideFront);
        
        const sideBack = new THREE.Mesh(sideGeometry, sideMaterial);
        sideBack.position.set(0, 1.5, -0.75);
        sideBack.castShadow = true;
        cart.add(sideBack);
        
        const sideGeometry2 = new THREE.BoxGeometry(0.05, 0.5, 1.5);
        const sideLeft = new THREE.Mesh(sideGeometry2, sideMaterial);
        sideLeft.position.set(-1.25, 1.5, 0);
        sideLeft.castShadow = true;
        cart.add(sideLeft);
        
        const sideRight = new THREE.Mesh(sideGeometry2, sideMaterial);
        sideRight.position.set(1.25, 1.5, 0);
        sideRight.castShadow = true;
        cart.add(sideRight);
        
        // Vegetables - tomatoes
        for (let i = 0; i < 8; i++) {
            const tomatoGeometry = new THREE.SphereGeometry(0.12, 8, 8);
            const tomatoMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4500 });
            const tomato = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
            tomato.position.set(
                -0.8 + (i % 4) * 0.25,
                1.4 + Math.random() * 0.1,
                -0.4 + Math.floor(i / 4) * 0.3
            );
            tomato.castShadow = true;
            cart.add(tomato);
        }
        
        // Potatoes
        for (let i = 0; i < 8; i++) {
            const potatoGeometry = new THREE.SphereGeometry(0.1, 8, 6);
            const potatoMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
            const potato = new THREE.Mesh(potatoGeometry, potatoMaterial);
            potato.scale.set(1, 0.8, 1.1);
            potato.position.set(
                0.2 + (i % 4) * 0.25,
                1.4 + Math.random() * 0.1,
                -0.4 + Math.floor(i / 4) * 0.3
            );
            potato.castShadow = true;
            cart.add(potato);
        }
        
        // Green chilies
        for (let i = 0; i < 6; i++) {
            const chiliGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6);
            const chiliMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const chili = new THREE.Mesh(chiliGeometry, chiliMaterial);
            chili.rotation.z = Math.PI / 2 + Math.random() * 0.5;
            chili.position.set(
                -0.6 + (i % 3) * 0.2,
                1.4,
                0.2 + Math.floor(i / 3) * 0.3
            );
            chili.castShadow = true;
            cart.add(chili);
        }
        
        // Onions
        for (let i = 0; i < 6; i++) {
            const onionGeometry = new THREE.SphereGeometry(0.11, 8, 8);
            const onionMaterial = new THREE.MeshLambertMaterial({ color: 0x9370DB });
            const onion = new THREE.Mesh(onionGeometry, onionMaterial);
            onion.scale.set(1, 0.9, 1);
            onion.position.set(
                0.4 + (i % 3) * 0.25,
                1.4,
                0.2 + Math.floor(i / 3) * 0.3
            );
            onion.castShadow = true;
            cart.add(onion);
        }
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel1.rotation.z = Math.PI / 2;
        wheel1.position.set(-0.8, 0.3, 0.8);
        wheel1.castShadow = true;
        cart.add(wheel1);
        
        const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel2.rotation.z = Math.PI / 2;
        wheel2.position.set(-0.8, 0.3, -0.8);
        wheel2.castShadow = true;
        cart.add(wheel2);
        
        const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel3.rotation.z = Math.PI / 2;
        wheel3.position.set(0.8, 0.3, 0.8);
        wheel3.castShadow = true;
        cart.add(wheel3);
        
        const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel4.rotation.z = Math.PI / 2;
        wheel4.position.set(0.8, 0.3, -0.8);
        wheel4.castShadow = true;
        cart.add(wheel4);
        
        // Handle
        const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(1.5, 1.5, 0);
        handle.castShadow = true;
        cart.add(handle);
        
        // Canopy (colorful cloth)
        const canopyGeometry = new THREE.BoxGeometry(2.6, 0.05, 1.6);
        const canopyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B35 });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.y = 2.2;
        canopy.castShadow = true;
        cart.add(canopy);
        
        // Canopy poles
        for (let i = 0; i < 4; i++) {
            const poleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1, 8);
            const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.set(
                i % 2 === 0 ? -1.2 : 1.2,
                1.7,
                i < 2 ? -0.7 : 0.7
            );
            cart.add(pole);
        }
        
        // cart.position.x = -3;
        // cart.position.x = 0;
        this.group.add(cart);
	console.log(cart)
    }

    createVendor() {
          const vendor = new THREE.Group();
          
          // Legs
          const legGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.8, 8);
          const skinMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
          
          const leftLeg = new THREE.Mesh(legGeometry, skinMaterial);
          leftLeg.position.set(-0.15, 0.4, 0);
          leftLeg.castShadow = true;
          vendor.add(leftLeg);
          
          const rightLeg = new THREE.Mesh(legGeometry, skinMaterial);
          rightLeg.position.set(0.15, 0.4, 0);
          rightLeg.castShadow = true;
          vendor.add(rightLeg);
          
          // Pants
          const pantsGeometry = new THREE.CylinderGeometry(0.15, 0.13, 0.9, 8);
          const pantsMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
          const pants = new THREE.Mesh(pantsGeometry, pantsMaterial);
          pants.position.set(0, 0.45, 0);
          pants.castShadow = true;
          vendor.add(pants);
          
          // Body (torso)
          const torsoGeometry = new THREE.CylinderGeometry(0.25, 0.22, 0.7, 8);
          const shirtMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
          const torso = new THREE.Mesh(torsoGeometry, shirtMaterial);
          torso.position.set(0, 1.25, 0);
          torso.castShadow = true;
          vendor.add(torso);
          
          // Arms
          const armGeometry = new THREE.CylinderGeometry(0.08, 0.07, 0.6, 8);
          
          const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
          leftArm.position.set(-0.35, 1.2, 0);
          leftArm.rotation.z = 0.3;
          leftArm.castShadow = true;
          vendor.add(leftArm);
          
          const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
          rightArm.position.set(0.35, 1.2, 0);
          rightArm.rotation.z = -0.3;
          rightArm.castShadow = true;
          vendor.add(rightArm);
          
          // Head
          const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
          const headMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
          const head = new THREE.Mesh(headGeometry, headMaterial);
          head.position.set(0, 1.8, 0);
          head.castShadow = true;
          vendor.add(head);
          
          // Turban/cap
          const turbanGeometry = new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
          const turbanMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
          const turban = new THREE.Mesh(turbanGeometry, turbanMaterial);
          turban.position.set(0, 1.9, 0);
          turban.castShadow = true;
          vendor.add(turban);
          
          // Mustache
          const mustacheGeometry = new THREE.BoxGeometry(0.25, 0.03, 0.05);
          const mustacheMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
          const mustache = new THREE.Mesh(mustacheGeometry, mustacheMaterial);
          mustache.position.set(0, 1.75, 0.18);
          vendor.add(mustache);
          
          vendor.position.set(-4, 0, 1);
          vendor.rotation.y = Math.PI / 4;
          this.group.add(vendor);
      }
}
