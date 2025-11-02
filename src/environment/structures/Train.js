import * as THREE from 'three';
import { GameConfig } from '../../config/GameConfig';

export class Train {
    constructor(scene, z,distanceToSwitch) {
        this.scene = scene;
	this.group = new THREE.Group();
	this.scene.add(this.group);
	this.distanceToSwitch = distanceToSwitch
	this.group.position.set(0, 0, z);
	
        
        // Animation state
        this.state = {
            trainSpeed: 1.5,
            guardRailsOpen: true,
            targetArmRotation: 0,
            lightBlinkTimer: 0,
            isPaused: false,
            bellSwingAngle: 0,
            bellSwingDirection: 1
        };
        
        // Animation constants
        this.config = {
            activationDistance: 55,
            deactivationDistance: 35,
            armRotationSpeed: 0.055,
            lightBlinkSpeed: 0.08,
            bellSwingSpeed: 0.15,
            bellMaxAngle: 0.3
        };

        this.initSharedResources();
        this.createScene();
    }

    // ==================== INITIALIZATION ====================
    
    initSharedResources() {
        if (Train.resources) return;
        
        Train.resources = {
            // Geometries
            geometry: {
                wheel: new THREE.CylinderGeometry(0.65, 0.65, 0.5, 16),
                innerWheel: new THREE.CylinderGeometry(0.4, 0.4, 0.52, 16),
                brakeDisc: new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
                window: new THREE.BoxGeometry(1.5, 1.8, 0.05),
                frame: new THREE.BoxGeometry(1.6, 1.9, 0.08),
                acUnit: new THREE.BoxGeometry(0.8, 0.4, 0.8)
            },
            
            // Materials
            material: {
                wheel: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
                innerWheel: new THREE.MeshLambertMaterial({ color: 0x424242 }),
                brakeDisc: new THREE.MeshLambertMaterial({ color: 0x8b4513 }),
                window: new THREE.MeshLambertMaterial({
                    color: 0x1a237e,
                    transparent: true,
                    opacity: 0.8
                }),
                frame: new THREE.MeshLambertMaterial({ color: 0x263238 }),
                acUnit: new THREE.MeshLambertMaterial({ color: 0x616161 }),
                body: new THREE.MeshLambertMaterial({ color: 0xf5f5f5 }),
                bottom: new THREE.MeshLambertMaterial({ color: 0x37474f }),
                stripe: new THREE.MeshLambertMaterial({ color: 0xd32f2f }),
                roof: new THREE.MeshLambertMaterial({ color: 0xbdbdbd }),
                undercarriage: new THREE.MeshLambertMaterial({ color: 0x37474f })
            }
        };
    }

    createScene() {
        this.createRailroadTracks();
        this.createTrain();

        this.leftGuardRail = this.createCrossingGate(1);
        this.leftGuardRail.position.set(10, 0, -14);
        this.leftGuardRail.rotation.y = Math.PI;
        
        this.rightGuardRail = this.createCrossingGate(-1);
        this.rightGuardRail.position.set(-10, 0, 26);
        
        this.leftSign = this.createCrossingSign();
        this.leftSign.position.set(-13, 0, 14);
        this.leftSign.rotation.y = Math.PI / 2;
        
        this.rightSign = this.createCrossingSign();
        this.rightSign.position.set(13, 0, 26);
        this.rightSign.rotation.y = -Math.PI / 2;
    }

    // ==================== RAILROAD TRACKS ====================
    
    createRailroadTracks() {
        const trackGroup = new THREE.Group();
        const config = { length: 300, railHeight: 0.35 };
        
        this.addRails(trackGroup, config);
        this.addSleepers(trackGroup, config);
        this.addGravel(trackGroup, config);
        this.addRailClips(trackGroup, config);
        
        this.group.add(trackGroup);
        // return trackGroup;
    }

    addRails(group, config) {
        const railGeometry = new THREE.BoxGeometry(config.length, 0.12, 0.15);
        const railMaterial = new THREE.MeshLambertMaterial({ color: 0x707070 });
        
        const positions = [
            { x: 0, y: config.railHeight, z: -0.75 },
            { x: 0, y: config.railHeight, z: 0.75 }
        ];
        
        positions.forEach(pos => {
            const rail = new THREE.Mesh(railGeometry, railMaterial);
            rail.position.set(pos.x, pos.y, pos.z);
            rail.castShadow = true;
            group.add(rail);
        });
    }

    addSleepers(group, config) {
        const sleeperGeometry = new THREE.BoxGeometry(0.25, 0.18, 2.5);
        const sleeperMaterial = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
        
        const spacing = 1.2;
        const count = Math.floor(config.length / spacing);
        const sleepers = new THREE.InstancedMesh(sleeperGeometry, sleeperMaterial, count);
        sleepers.castShadow = true;
        sleepers.receiveShadow = true;
        
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < count; i++) {
            const x = -config.length / 2 + i * spacing;
            matrix.setPosition(x, 0.09, 0);
            sleepers.setMatrixAt(i, matrix);
        }
        sleepers.instanceMatrix.needsUpdate = true;
        
        group.add(sleepers);
    }

    addGravel(group, config) {
        const gravelGeometry = new THREE.BoxGeometry(config.length, 0.25, 5);
        const gravelMaterial = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
        const gravel = new THREE.Mesh(gravelGeometry, gravelMaterial);
        gravel.position.set(0, 0.05, 0);
        gravel.receiveShadow = true;
        group.add(gravel);
    }

    addRailClips(group, config) {
        const clipGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.08);
        const clipMaterial = new THREE.MeshLambertMaterial({ color: 0x424242 });
        
        const spacing = 1.2;
        const sleeperCount = Math.floor(config.length / spacing);
        const clipCount = sleeperCount * 2;
        const clips = new THREE.InstancedMesh(clipGeometry, clipMaterial, clipCount);
        
        const matrix = new THREE.Matrix4();
        let clipIndex = 0;
        
        for (let i = 0; i < sleeperCount; i++) {
            const x = -config.length / 2 + i * spacing;
            [-0.75, 0.75].forEach(z => {
                matrix.setPosition(x, config.railHeight, z);
                clips.setMatrixAt(clipIndex++, matrix);
            });
        }
        clips.instanceMatrix.needsUpdate = true;
        
        group.add(clips);
    }

    // ==================== TRAIN ====================
    
    createTrain() {
	this.train = new THREE.Group();
	this.train.position.set(-170, 0, 0)
	this.group.add(this.train);
	
	this.createLocomotive();

        for (let i = 0; i < 2; i++) {
            const car = this.createPassengerCar();
            car.position.x = -15 - (i * 16);
            this.train.add(car);
        }
        
        // return trainGroup;
    }

    createLocomotive() {
        const loco = new THREE.Group();
        
        this.addLocoBody(loco);
        this.addLocoNose(loco);
        this.addLocoCab(loco);
        this.addLocoRoof(loco);
        this.addLocoPantograph(loco);
        this.addLocoHeadlights(loco);
        this.addWheelSet(loco, [-3, -1, 1, 3]);
        this.addLocoUndercarriage(loco);
        
        this.train.add(loco);
    }

    addLocoBody(loco) {
        const bodyGeometry = new THREE.BoxGeometry(10, 4, 3.2);
        const body = new THREE.Mesh(bodyGeometry, Train.resources.material.body);
        body.position.set(0, 2.8, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        loco.add(body);
        
        const bottomGeometry = new THREE.BoxGeometry(10.1, 1.2, 3.3);
        const bottom = new THREE.Mesh(bottomGeometry, Train.resources.material.bottom);
        bottom.position.set(0, 1.4, 0);
        loco.add(bottom);
        
        const stripeGeometry = new THREE.BoxGeometry(10.2, 0.9, 3.25);
        const stripe = new THREE.Mesh(stripeGeometry, Train.resources.material.stripe);
        stripe.position.set(0, 2.2, 0);
        loco.add(stripe);
    }

    addLocoNose(loco) {
        const noseGeometry = new THREE.ConeGeometry(1.8, 4, 6);
        const nose = new THREE.Mesh(noseGeometry, Train.resources.material.body);
        nose.rotation.z = -Math.PI / 2;
        nose.position.set(7, 2.8, 0);
        nose.castShadow = true;
        loco.add(nose);
        
        const noseBottom = new THREE.Mesh(
            new THREE.ConeGeometry(1.8, 2, 6),
            Train.resources.material.bottom
        );
        noseBottom.rotation.z = -Math.PI / 2;
        noseBottom.position.set(7.5, 1.4, 0);
        loco.add(noseBottom);
        
        const noseStripe = new THREE.Mesh(
            new THREE.ConeGeometry(1.82, 1.5, 6),
            Train.resources.material.stripe
        );
        noseStripe.rotation.z = -Math.PI / 2;
        noseStripe.position.set(6.5, 2.2, 0);
        loco.add(noseStripe);
    }

    addLocoCab(loco) {
        // Front windshield
        const windshieldGeometry = new THREE.BoxGeometry(1.5, 1.5, 2.8);
        const windshield = new THREE.Mesh(windshieldGeometry, Train.resources.material.window);
        windshield.position.set(4.5, 3.5, 0);
        windshield.rotation.y = Math.PI / 12;
        windshield.scale.z = 0.02;
        loco.add(windshield);
        
        // Side cab windows
        [-1, 1].forEach(side => {
            const cabWindow = new THREE.Mesh(
                new THREE.BoxGeometry(2, 1.3, 0.05),
                Train.resources.material.window
            );
            cabWindow.position.set(2.5, 3.5, side * 1.63);
            loco.add(cabWindow);
        });
        
        // Doors
        [-1, 1].forEach(side => {
            const doorFrame = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 2.5, 1.2),
                Train.resources.material.frame
            );
            doorFrame.position.set(-2, 2.5, side * 1.62);
            loco.add(doorFrame);
            
            const doorWindow = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 1, 0.6),
                Train.resources.material.window
            );
            doorWindow.position.set(-2, 3.2, side * 1.62);
            loco.add(doorWindow);
        });
    }

    addLocoRoof(loco) {
        const roofGeometry = new THREE.BoxGeometry(8, 0.4, 2.6);
        const roof = new THREE.Mesh(roofGeometry, Train.resources.material.roof);
        roof.position.set(-1, 5.1, 0);
        loco.add(roof);
        
        // AC units
        const acUnits = new THREE.InstancedMesh(
            Train.resources.geometry.acUnit,
            Train.resources.material.acUnit,
            4
        );
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < 4; i++) {
            matrix.setPosition(-4 + i * 2.5, 5.5, 0);
            acUnits.setMatrixAt(i, matrix);
        }
        acUnits.instanceMatrix.needsUpdate = true;
        loco.add(acUnits);
    }

    addLocoPantograph(loco) {
        const pantographBase = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.3, 1),
            new THREE.MeshLambertMaterial({ color: 0x424242 })
        );
        pantographBase.position.set(0, 5.4, 0);
        loco.add(pantographBase);
        
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x212121 });
        
        const arm1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 1.5),
            armMaterial
        );
        arm1.position.set(0, 6, 0);
        arm1.rotation.z = Math.PI / 6;
        loco.add(arm1);
        
        const arm2 = arm1.clone();
        arm2.rotation.z = -Math.PI / 6;
        loco.add(arm2);
        
        const collector = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.08, 0.08),
            armMaterial
        );
        collector.position.set(0, 6.8, 0);
        loco.add(collector);
    }

    addLocoHeadlights(loco) {
        const headlightGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.3, 16);
        const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });
        
        const positions = [
            { x: 8.5, y: 4, z: 0 },
            { x: 8.5, y: 1.8, z: 0 }
        ];
        
        positions.forEach(pos => {
            const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
            headlight.rotation.z = Math.PI / 2;
            headlight.position.set(pos.x, pos.y, pos.z);
            loco.add(headlight);
        });
    }

    addLocoUndercarriage(loco) {
        const undercarriageGeometry = new THREE.BoxGeometry(9, 0.6, 2.8);
        const undercarriage = new THREE.Mesh(
            undercarriageGeometry,
            Train.resources.material.undercarriage
        );
        undercarriage.position.set(0, 1, 0);
        undercarriage.castShadow = true;
        loco.add(undercarriage);
        
        const coupling = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.3, 0.3),
            new THREE.MeshLambertMaterial({ color: 0x212121 })
        );
        coupling.position.set(-5.5, 1.2, 0);
        loco.add(coupling);
    }

    createPassengerCar() {
        const car = new THREE.Group();
        
        this.addCarBody(car);
        this.addCarRoof(car);
        this.addCarWindows(car);
        this.addCarDoors(car);
        this.addWheelSet(car, [-4, -2, 2, 4]);
        this.addCarUndercarriage(car);
        this.addCarCouplings(car);
        
        return car;
    }

    addCarBody(car) {
        const bodyGeometry = new THREE.BoxGeometry(12, 4, 3.2);
        const body = new THREE.Mesh(bodyGeometry, Train.resources.material.body);
        body.position.set(0, 2.8, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        car.add(body);
        
        const bottomGeometry = new THREE.BoxGeometry(12.1, 1.2, 3.3);
        const bottom = new THREE.Mesh(bottomGeometry, Train.resources.material.bottom);
        bottom.position.set(0, 1.4, 0);
        car.add(bottom);
        
        const stripeGeometry = new THREE.BoxGeometry(12.2, 0.9, 3.25);
        const stripe = new THREE.Mesh(stripeGeometry, Train.resources.material.stripe);
        stripe.position.set(0, 2.2, 0);
        car.add(stripe);
    }

    addCarRoof(car) {
        const roofGeometry = new THREE.BoxGeometry(12, 0.4, 2.8);
        const roof = new THREE.Mesh(roofGeometry, Train.resources.material.roof);
        roof.position.set(0, 5.1, 0);
        car.add(roof);
        
        // AC units
        const acUnits = new THREE.InstancedMesh(
            Train.resources.geometry.acUnit,
            Train.resources.material.acUnit,
            5
        );
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < 5; i++) {
            matrix.setPosition(-5 + i * 2.5, 5.5, 0);
            acUnits.setMatrixAt(i, matrix);
        }
        acUnits.instanceMatrix.needsUpdate = true;
        car.add(acUnits);
    }

    addCarWindows(car) {
        const windowCount = 6 * 2;
        const windows = new THREE.InstancedMesh(
            Train.resources.geometry.window,
            Train.resources.material.window,
            windowCount
        );
        const frames = new THREE.InstancedMesh(
            Train.resources.geometry.frame,
            Train.resources.material.frame,
            windowCount
        );
        
        const matrix = new THREE.Matrix4();
        let windowIndex = 0;
        
        for (let i = 0; i < 6; i++) {
            [-1, 1].forEach(side => {
                const x = -5 + i * 2;
                
                matrix.setPosition(x, 3.2, side * 1.63);
                windows.setMatrixAt(windowIndex, matrix);
                
                matrix.setPosition(x, 3.2, side * 1.62);
                frames.setMatrixAt(windowIndex, matrix);
                
                windowIndex++;
            });
        }
        
        windows.instanceMatrix.needsUpdate = true;
        frames.instanceMatrix.needsUpdate = true;
        
        car.add(windows, frames);
    }

    addCarDoors(car) {
        [-1, 1].forEach(side => {
            const door = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 2.5, 1.2),
                Train.resources.material.frame
            );
            door.position.set(5.5, 2.5, side * 1.62);
            car.add(door);
        });
    }

    addCarUndercarriage(car) {
        const undercarriageGeometry = new THREE.BoxGeometry(11, 0.6, 2.8);
        const undercarriage = new THREE.Mesh(
            undercarriageGeometry,
            Train.resources.material.undercarriage
        );
        undercarriage.position.set(0, 1, 0);
        undercarriage.castShadow = true;
        car.add(undercarriage);
    }

    addCarCouplings(car) {
        const couplingGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.3);
        const couplingMaterial = new THREE.MeshLambertMaterial({ color: 0x212121 });
        
        const frontCoupling = new THREE.Mesh(couplingGeometry, couplingMaterial);
        frontCoupling.position.set(6.5, 1.2, 0);
        car.add(frontCoupling);
        
        const rearCoupling = new THREE.Mesh(couplingGeometry, couplingMaterial);
        rearCoupling.position.set(-6.5, 1.2, 0);
        car.add(rearCoupling);
    }

    addWheelSet(parent, positions) {
        const totalWheels = positions.length * 2;
        
        const outerWheels = new THREE.InstancedMesh(
            Train.resources.geometry.wheel,
            Train.resources.material.wheel,
            totalWheels
        );
        outerWheels.castShadow = true;
        
        const innerWheels = new THREE.InstancedMesh(
            Train.resources.geometry.innerWheel,
            Train.resources.material.innerWheel,
            totalWheels
        );
        
        const brakeDiscs = new THREE.InstancedMesh(
            Train.resources.geometry.brakeDisc,
            Train.resources.material.brakeDisc,
            totalWheels
        );
        
        const matrix = new THREE.Matrix4();
        const rotation = new THREE.Quaternion();
        rotation.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        const scale = new THREE.Vector3(1, 1, 1);
        
        let wheelIndex = 0;
        positions.forEach(x => {
            // Left side
            matrix.compose(new THREE.Vector3(x, 0.65, 1.85), rotation, scale);
            outerWheels.setMatrixAt(wheelIndex, matrix);
            innerWheels.setMatrixAt(wheelIndex, matrix);
            
            matrix.setPosition(x, 0.65, 1.5);
            brakeDiscs.setMatrixAt(wheelIndex, matrix);
            wheelIndex++;
            
            // Right side
            matrix.compose(new THREE.Vector3(x, 0.65, -1.85), rotation, scale);
            outerWheels.setMatrixAt(wheelIndex, matrix);
            innerWheels.setMatrixAt(wheelIndex, matrix);
            
            matrix.setPosition(x, 0.65, -1.5);
            brakeDiscs.setMatrixAt(wheelIndex, matrix);
            wheelIndex++;
        });
        
        outerWheels.instanceMatrix.needsUpdate = true;
        innerWheels.instanceMatrix.needsUpdate = true;
        brakeDiscs.instanceMatrix.needsUpdate = true;
        
        parent.add(outerWheels, innerWheels, brakeDiscs);
    }

    // ==================== CROSSING GATE ====================
    
    createCrossingGate(side) {
        const gate = new THREE.Group();

        this.addGateBase(gate);
        this.addGatePole(gate);
        this.addGateControlBox(gate);
        this.addGateLights(gate);
        this.addGateCrossbuck(gate);
        this.addGateArm(gate, side);
        this.addGateCounterweight(gate, side);
        this.addGateBell(gate);
        
        this.group.add(gate);
        return gate;
    }

    addGateBase(gate) {
        const basePlateGeometry = new THREE.CylinderGeometry(0.6, 0.7, 0.3, 8);
        const basePlateMaterial = new THREE.MeshLambertMaterial({ color: 0x9e9e9e });
        const basePlate = new THREE.Mesh(basePlateGeometry, basePlateMaterial);
        basePlate.position.y = 0.15;
        basePlate.castShadow = true;
        basePlate.receiveShadow = true;
        gate.add(basePlate);
    }

    addGatePole(gate) {
        const poleGeometry = new THREE.CylinderGeometry(0.15, 0.18, 4, 12);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: 0xf9a825 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 2.3;
        pole.castShadow = true;
        gate.add(pole);
        
        // Black stripes
        for (let i = 0; i < 3; i++) {
            const stripe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.16, 0.16, 0.6, 12),
                new THREE.MeshLambertMaterial({ color: 0x212121 })
            );
            stripe.position.y = 1 + i * 1.3;
            gate.add(stripe);
        }
    }

    addGateControlBox(gate) {
        const controlBoxGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.5);
        const controlBoxMaterial = new THREE.MeshLambertMaterial({ color: 0x424242 });
        const controlBox = new THREE.Mesh(controlBoxGeometry, controlBoxMaterial);
        controlBox.position.set(0, 4.3, 0);
        controlBox.castShadow = true;
        gate.add(controlBox);
        
        const lightsHousing = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 1.2, 0.3),
            new THREE.MeshLambertMaterial({ color: 0x212121 })
        );
        lightsHousing.position.set(0, 5.3, 0.15);
        lightsHousing.castShadow = true;
        gate.add(lightsHousing);
    }

    addGateLights(gate) {
        const lightGeometry = new THREE.CircleGeometry(0.18, 16);
        const lightMaterial1 = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0
        });
        const lightMaterial2 = lightMaterial1.clone();
        
        const topLight = new THREE.Mesh(lightGeometry, lightMaterial1);
        topLight.position.set(0, 5.65, 0.31);
        gate.add(topLight);
        
        const bottomLight = new THREE.Mesh(lightGeometry, lightMaterial2);
        bottomLight.position.set(0, 4.95, 0.31);
        gate.add(bottomLight);
        
        gate.userData.topLight = topLight;
        gate.userData.bottomLight = bottomLight;
        gate.userData.topLightMaterial = lightMaterial1;
        gate.userData.bottomLightMaterial = lightMaterial2;
    }

    addGateCrossbuck(gate) {
        const crossbuck = new THREE.Group();
        crossbuck.position.set(0, 4.8, 0);
        
        const boardGeometry = new THREE.BoxGeometry(2, 0.35, 0.08);
        const boardMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        const board1 = new THREE.Mesh(boardGeometry, boardMaterial);
        board1.rotation.z = Math.PI / 4;
        board1.castShadow = true;
        crossbuck.add(board1);
        
        const board2 = new THREE.Mesh(boardGeometry, boardMaterial);
        board2.rotation.z = -Math.PI / 4;
        board2.castShadow = true;
        crossbuck.add(board2);
        
        // Borders
        const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const border1 = new THREE.Mesh(
            new THREE.BoxGeometry(2.1, 0.08, 0.09),
            borderMaterial
        );
        border1.rotation.z = Math.PI / 4;
        border1.position.z = -0.01;
        crossbuck.add(border1);
        
        const border2 = border1.clone();
        border2.rotation.z = -Math.PI / 4;
        crossbuck.add(border2);
        
        // Text simulation
        this.addCrossbuckText(crossbuck, 0.7, 8);   // RAILROAD
        this.addCrossbuckText(crossbuck, -0.7, 8);  // CROSSING
        
        gate.add(crossbuck);
    }

    addCrossbuckText(crossbuck, yPos, letterCount) {
        const letterGeometry = new THREE.BoxGeometry(0.12, 0.18, 0.02);
        const letterMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        for (let i = 0; i < letterCount; i++) {
            const letter = new THREE.Mesh(letterGeometry, letterMaterial);
            letter.position.set(-0.5 + i * 0.14, yPos, 0.05);
            crossbuck.add(letter);
        }
    }

    addGateArm(gate, side) {
        const armGroup = new THREE.Group();
        armGroup.position.set(0, 2.3, side * 0.3);
        
        const armLength = 10;
        const armGeometry = new THREE.BoxGeometry(armLength, 0.2, 0.25);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.set(side * armLength / 2, 0, 0);
        arm.castShadow = true;
        armGroup.add(arm);
        
        // Red stripes
        const redStripeMaterial = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
        for (let i = 0; i < 6; i++) {
            const stripe = new THREE.Mesh(
                new THREE.BoxGeometry(1.4, 0.22, 0.26),
                redStripeMaterial
            );
            stripe.position.set(side * (1.5 + i * 1.6), 0, 0);
            armGroup.add(stripe);
        }
        
        // Tip light
        const tipLightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const tipLightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0
        });
        const tipLight = new THREE.Mesh(tipLightGeometry, tipLightMaterial);
        tipLight.position.set(side * (armLength - 0.5), 0, 0);
        armGroup.add(tipLight);
        
        // Reflectors
        const reflectorGeometry = new THREE.CircleGeometry(0.15, 8);
        const reflectorMaterial = new THREE.MeshLambertMaterial({
	    color: 0xffeb3b,
	    emissive: 0xffeb3b,
            emissiveIntensity: 0.8
	});
        for (let i = 0; i < 4; i++) {
            const reflector = new THREE.Mesh(reflectorGeometry, reflectorMaterial);
            reflector.position.set(side * (2 + i * 2), 0, 0.13);
            armGroup.add(reflector);
        }
        
        gate.add(armGroup);
        gate.userData.arm = armGroup;
        gate.userData.tipLight = tipLight;
        gate.userData.tipLightMaterial = tipLightMaterial;
        gate.userData.side = side;
    }

    addGateCounterweight(gate, side) {
        const counterWeightGeometry = new THREE.BoxGeometry(1, 0.8, 0.8);
        const counterWeightMaterial = new THREE.MeshLambertMaterial({ color: 0x424242 });
        const counterWeight = new THREE.Mesh(counterWeightGeometry, counterWeightMaterial);
        counterWeight.position.set(-side * 0.8, 3, side * 0.3);
        counterWeight.castShadow = true;
        gate.add(counterWeight);
    }

    addGateBell(gate) {
        const bellHousingGeometry = new THREE.CylinderGeometry(0.25, 0.22, 0.4, 16);
        const bellHousingMaterial = new THREE.MeshLambertMaterial({ color: 0x424242 });
        const bellHousing = new THREE.Mesh(bellHousingGeometry, bellHousingMaterial);
        bellHousing.position.set(0, 3.5, 0.35);
        bellHousing.castShadow = true;
        gate.add(bellHousing);
        
        const clapperGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const clapper = new THREE.Mesh(clapperGeometry, bellHousingMaterial);
        clapper.position.set(0, 3.3, 0.35);
        gate.add(clapper);
        
        gate.userData.clapper = clapper;
    }

    // ==================== CROSSING SIGN ====================
    
    createCrossingSign() {
        const sign = new THREE.Group();
        
        // Sign post
        const postGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x757575 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 1.5;
        post.castShadow = true;
        sign.add(post);
        
        // Yellow warning sign
        const signGeometry = new THREE.CircleGeometry(0.6, 32);
        const signMaterial = new THREE.MeshLambertMaterial({ color: 0xffd600 });
        const signMesh = new THREE.Mesh(signGeometry, signMaterial);
        signMesh.position.set(0, 3.5, 0);
        signMesh.castShadow = true;
        sign.add(signMesh);
        
        // Black border
        const borderGeometry = new THREE.RingGeometry(0.6, 0.65, 32);
        const border = new THREE.Mesh(
            borderGeometry,
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        border.position.set(0, 3.5, 0.01);
        sign.add(border);
        
        // "X" symbol
        this.addXSymbol(sign);
        
        // "RR" letters
        this.addRRLetters(sign);
        
        this.group.add(sign);
        return sign;
    }

    addXSymbol(sign) {
        const xBarGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.02);
        const xBarMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const xBar1 = new THREE.Mesh(xBarGeometry, xBarMaterial);
        xBar1.position.set(0, 3.5, 0.02);
        xBar1.rotation.z = Math.PI / 4;
        sign.add(xBar1);
        
        const xBar2 = xBar1.clone();
        xBar2.rotation.z = -Math.PI / 4;
        sign.add(xBar2);
    }

    addRRLetters(sign) {
        const letterGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.02);
        const letterMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const r1 = new THREE.Mesh(letterGeometry, letterMaterial);
        r1.position.set(-0.15, 3.5, 0.02);
        sign.add(r1);
        
        const r2 = new THREE.Mesh(letterGeometry, letterMaterial);
        r2.position.set(0.15, 3.5, 0.02);
        sign.add(r2);
    }

    // ==================== ANIMATION ====================
    
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
    }

    update(worldSpeed) {
        // if (this.state.isPaused) return;
        
        this.updateTrainPosition(worldSpeed);
        this.updateGateLogic();
        this.updateGateArms();
        this.updateWarningLights();
        this.updateBell();
        // this.updateStatusDisplay();
    }

    updateTrainPosition(worldSpeed) {
        this.train.position.x += this.state.trainSpeed;
        this.group.position.z -= worldSpeed;
	// console.log("Train z = ", this.group.position.z);
        
        if (this.train.position.x > 150) {
            this.train.position.x = -150;
        }
	// console.log("this.distanceToSwitch = ", this.distanceToSwitch.dist,this.group.position.z);
	if (this.group.position.z < -50) {
	    // if (this.group.visible && this.distanceToSwitch.dist<350) {
	    if ((this.distanceToSwitch.dist+GameConfig.biome.transitionZoneLength)>350 && this.distanceToSwitch.dist<350) {
		this.group.position.z += 2*350;
	    }else {
		this.group.position.z += 350;
	    }
        }
    }

    updateGateLogic() {
        const distanceToCrossing = this.train.position.x;
        const { activationDistance, deactivationDistance } = this.config;
        
        const shouldClose = distanceToCrossing > -activationDistance && 
                           distanceToCrossing < deactivationDistance;
        
        if (shouldClose && this.state.guardRailsOpen) {
            this.state.targetArmRotation = 0;
            this.state.guardRailsOpen = false;
        } else if (!shouldClose && !this.state.guardRailsOpen) {
            this.state.targetArmRotation = Math.PI / 2;
            this.state.guardRailsOpen = true;
        }
    }

    updateGateArms() {
        [this.leftGuardRail, this.rightGuardRail].forEach(rail => {
            const arm = rail.userData.arm;
            const diff = this.state.targetArmRotation - arm.rotation.z;
            
            if (Math.abs(diff) > 0.01) {
                const step = Math.sign(diff) * this.config.armRotationSpeed;
                arm.rotation.z += step;
                
                // Clamp to target
                if (Math.abs(this.state.targetArmRotation - arm.rotation.z) < this.config.armRotationSpeed) {
                    arm.rotation.z = this.state.targetArmRotation;
                }
            }
        });
    }

    updateWarningLights() {
            this.state.lightBlinkTimer += this.config.lightBlinkSpeed;
            const blinkState = Math.floor(this.state.lightBlinkTimer) % 2;
            
            [this.leftGuardRail, this.rightGuardRail].forEach(rail => {
                rail.userData.topLightMaterial.opacity = blinkState === 0 ? 1 : 0;
                rail.userData.bottomLightMaterial.opacity = blinkState === 1 ? 1 : 0;
                rail.userData.tipLightMaterial.opacity = blinkState === 1 ? 0.8 : 0;
            });
        
    //     if (!this.state.guardRailsOpen) {
    //         this.state.lightBlinkTimer += this.config.lightBlinkSpeed;
    //         const blinkState = Math.floor(this.state.lightBlinkTimer) % 2;
            
    //         [this.leftGuardRail, this.rightGuardRail].forEach(rail => {
    //             rail.userData.topLightMaterial.opacity = blinkState === 0 ? 1 : 0;
    //             rail.userData.bottomLightMaterial.opacity = blinkState === 1 ? 1 : 0;
    //             rail.userData.tipLightMaterial.opacity = blinkState === 1 ? 0.8 : 0;
    //         });
    //     } else {
    //         [this.leftGuardRail, this.rightGuardRail].forEach(rail => {
    //             rail.userData.topLightMaterial.opacity = 0;
    //             rail.userData.bottomLightMaterial.opacity = 0;
    //             rail.userData.tipLightMaterial.opacity = 0;
    //         });
    //     }
    }

    updateBell() {
        if (!this.state.guardRailsOpen) {
            this.state.bellSwingAngle += this.config.bellSwingSpeed * this.state.bellSwingDirection;
            
            if (Math.abs(this.state.bellSwingAngle) > this.config.bellMaxAngle) {
                this.state.bellSwingDirection *= -1;
            }
            
            [this.leftGuardRail, this.rightGuardRail].forEach(rail => {
                rail.userData.clapper.rotation.x = this.state.bellSwingAngle;
            });
        } else {
            this.state.bellSwingAngle = 0;
            [this.leftGuardRail, this.rightGuardRail].forEach(rail => {
                rail.userData.clapper.rotation.x = 0;
            });
        }
    }

    updateStatusDisplay() {
        const distanceToCrossing = this.group.position.x;
        const distanceElement = document.getElementById('distance');
        const statusElement = document.getElementById('status');
        
        if (distanceElement) {
            distanceElement.textContent = Math.abs(distanceToCrossing).toFixed(0);
        }
        
        if (!statusElement) return;
        
        const isGateClosed = Math.abs(this.leftGuardRail.userData.arm.rotation.z - this.state.targetArmRotation) < 0.05;
        
        if (!this.state.guardRailsOpen) {
            if (isGateClosed) {
                if (Math.abs(distanceToCrossing) < 15) {
                    statusElement.textContent = '🚂 TRAIN PASSING - DO NOT CROSS';
                } else {
                    statusElement.textContent = '🛑 Gates Closed - Wait for Train';
                }
            } else {
                statusElement.textContent = '⚠️ Gates Closing - Train Approaching';
            }
        } else {
            if (isGateClosed) {
                statusElement.textContent = '✅ All Clear - Safe to Cross';
            } else {
                statusElement.textContent = '✅ Gates Opening - Clear';
            }
        }
    }

    // ==================== CLEANUP ====================
    
    dispose() {
        if (Train.resources) {
            Object.values(Train.resources.geometry).forEach(geo => geo?.dispose());
            Object.values(Train.resources.material).forEach(mat => mat?.dispose());
            Train.resources = null;
        }
    }
}

// Static property for shared resources
Train.resources = null;

// import * as THREE from 'three';

// export class Train {
//     constructor(scene) {
//         this.scene = scene;
//         // Animation variables
//         this.trainSpeed = 0.06;
//         this.guardRailsOpen = true;
//         this.targetArmRotation = 0;
//         this.lightBlinkTimer = 0;
//         this.isPaused = false;
//         this.bellSwingAngle = 0;
//         this.bellSwingDirection = 1;

//         // Initialize shared resources
//         this.initSharedResources();

//         this.tracks = this.createRailroadTracks();
//         this.train = this.createRealisticTrain();
//         this.train.position.set(-150, 0, 0);

//         this.leftGuardRail = this.createRealisticCrossingGate(1);
//         this.leftGuardRail.position.set(-10, 0, 14);
//         this.leftGuardRail.rotation.y = Math.PI;

//         this.rightGuardRail = this.createRealisticCrossingGate(-1);
//         this.rightGuardRail.position.set(10, 0, 26);

//         this.leftSign = this.createCrossingSign();
//         this.leftSign.position.set(-13, 0, 14);
//         this.leftSign.rotation.y = Math.PI / 2;

//         this.rightSign = this.createCrossingSign();
//         this.rightSign.position.set(13, 0, 26);
//         this.rightSign.rotation.y = -Math.PI / 2;
//     }

//     initSharedResources() {
//         if (!Train.sharedResources) {
//             Train.sharedResources = {
//                 // Wheel geometries
//                 wheelGeometry: new THREE.CylinderGeometry(0.65, 0.65, 0.5, 16),
//                 wheelMaterial: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
//                 innerWheelGeometry: new THREE.CylinderGeometry(0.4, 0.4, 0.52, 16),
//                 innerWheelMaterial: new THREE.MeshLambertMaterial({ color: 0x424242 }),
//                 brakeDiscGeometry: new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
//                 brakeDiscMaterial: new THREE.MeshLambertMaterial({ color: 0x8b4513 }),
                
//                 // Window materials
//                 windowGeometry: new THREE.BoxGeometry(1.5, 1.8, 0.05),
//                 windowMaterial: new THREE.MeshLambertMaterial({
//                     color: 0x1a237e,
//                     transparent: true,
//                     opacity: 0.8
//                 }),
//                 frameGeometry: new THREE.BoxGeometry(1.6, 1.9, 0.08),
//                 frameMaterial: new THREE.MeshLambertMaterial({ color: 0x263238 }),
                
//                 // AC units
//                 acUnitGeometry: new THREE.BoxGeometry(0.8, 0.4, 0.8),
//                 acUnitMaterial: new THREE.MeshLambertMaterial({ color: 0x616161 })
//             };
//         }
//     }

//     createRailroadTracks() {
//         const trackGroup = new THREE.Group();
//         const trackLength = 300;
//         const railHeight = 0.35;

//         // Rails (two parallel rails)
//         const railGeometry = new THREE.BoxGeometry(trackLength, 0.12, 0.15);
//         const railMaterial = new THREE.MeshLambertMaterial({ color: 0x707070 });

//         const leftRail = new THREE.Mesh(railGeometry, railMaterial);
//         leftRail.position.set(0, railHeight, -0.75);
//         leftRail.castShadow = true;
//         trackGroup.add(leftRail);

//         const rightRail = new THREE.Mesh(railGeometry, railMaterial);
//         rightRail.position.set(0, railHeight, 0.75);
//         rightRail.castShadow = true;
//         trackGroup.add(rightRail);

//         // ✅ OPTIMIZED: Sleepers with InstancedMesh
//         const sleeperGeometry = new THREE.BoxGeometry(0.25, 0.18, 2.5);
//         const sleeperMaterial = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
        
//         const sleeperCount = Math.floor(trackLength / 1.2);
//         const sleepers = new THREE.InstancedMesh(sleeperGeometry, sleeperMaterial, sleeperCount);
//         sleepers.castShadow = true;
//         sleepers.receiveShadow = true;
        
//         const matrix = new THREE.Matrix4();
//         for (let i = 0; i < sleeperCount; i++) {
//             const x = -trackLength/2 + i * 1.2;
//             matrix.setPosition(x, 0.09, 0);
//             sleepers.setMatrixAt(i, matrix);
//         }
//         sleepers.instanceMatrix.needsUpdate = true;
//         trackGroup.add(sleepers);

//         // Gravel bed
//         const gravelGeometry = new THREE.BoxGeometry(trackLength, 0.25, 5);
//         const gravelMaterial = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
//         const gravel = new THREE.Mesh(gravelGeometry, gravelMaterial);
//         gravel.position.set(0, 0.05, 0);
//         gravel.receiveShadow = true;
//         trackGroup.add(gravel);

//         // ✅ OPTIMIZED: Rail fasteners with InstancedMesh
//         const clipGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.08);
//         const clipMaterial = new THREE.MeshLambertMaterial({ color: 0x424242 });
        
//         const clipCount = sleeperCount * 2;
//         const clips = new THREE.InstancedMesh(clipGeometry, clipMaterial, clipCount);
        
//         let clipIndex = 0;
//         for (let i = 0; i < sleeperCount; i++) {
//             const x = -trackLength/2 + i * 1.2;
//             [-0.75, 0.75].forEach(z => {
//                 matrix.setPosition(x, railHeight, z);
//                 clips.setMatrixAt(clipIndex, matrix);
//                 clipIndex++;
//             });
//         }
//         clips.instanceMatrix.needsUpdate = true;
//         trackGroup.add(clips);

//         this.scene.add(trackGroup);
//     }

//     createRealisticTrain() {
//         const trainGroup = new THREE.Group();

//         // ===== LOCOMOTIVE =====
//         const locoBody = new THREE.Group();
        
//         // Main body
//         const bodyGeometry = new THREE.BoxGeometry(10, 4, 3.2);
//         const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
//         const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
//         body.position.set(0, 2.8, 0);
//         body.castShadow = true;
//         body.receiveShadow = true;
//         locoBody.add(body);

//         // Bottom section
//         const bottomSection = new THREE.Mesh(
//             new THREE.BoxGeometry(10.1, 1.2, 3.3),
//             new THREE.MeshLambertMaterial({ color: 0x37474f })
//         );
//         bottomSection.position.set(0, 1.4, 0);
//         locoBody.add(bottomSection);

//         // Red stripe
//         const stripeGeometry = new THREE.BoxGeometry(10.2, 0.9, 3.25);
//         const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
//         const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
//         stripe.position.set(0, 2.2, 0);
//         locoBody.add(stripe);

//         // Aerodynamic nose
//         const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
//         const noseGeometry = new THREE.ConeGeometry(1.8, 4, 6);
//         const nose = new THREE.Mesh(noseGeometry, noseMaterial);
//         nose.rotation.z = -Math.PI / 2;
//         nose.position.set(7, 2.8, 0);
//         nose.castShadow = true;
//         locoBody.add(nose);

//         // Nose bottom section
//         const noseBottom = new THREE.Mesh(
//             new THREE.ConeGeometry(1.8, 2, 6),
//             new THREE.MeshLambertMaterial({ color: 0x37474f })
//         );
//         noseBottom.rotation.z = -Math.PI / 2;
//         noseBottom.position.set(7.5, 1.4, 0);
//         locoBody.add(noseBottom);

//         // Red nose stripe
//         const noseStripe = new THREE.Mesh(
//             new THREE.ConeGeometry(1.82, 1.5, 6),
//             stripeMaterial
//         );
//         noseStripe.rotation.z = -Math.PI / 2;
//         noseStripe.position.set(6.5, 2.2, 0);
//         locoBody.add(noseStripe);

//         // Front windshield
//         const windshieldGeometry = new THREE.BoxGeometry(1.5, 1.5, 2.8);
//         const windshield = new THREE.Mesh(windshieldGeometry, Train.sharedResources.windowMaterial);
//         windshield.position.set(4.5, 3.5, 0);
//         windshield.rotation.y = Math.PI / 12;
//         windshield.scale.z = 0.02;
//         locoBody.add(windshield);

//         // Side cab windows (using shared materials)
//         for (let side of [-1, 1]) {
//             const cabWindow = new THREE.Mesh(
//                 new THREE.BoxGeometry(2, 1.3, 0.05),
//                 Train.sharedResources.windowMaterial
//             );
//             cabWindow.position.set(2.5, 3.5, side * 1.63);
//             locoBody.add(cabWindow);
//         }

//         // Doors with windows
//         for (let side of [-1, 1]) {
//             const doorFrame = new THREE.Mesh(
//                 new THREE.BoxGeometry(0.05, 2.5, 1.2),
//                 Train.sharedResources.frameMaterial
//             );
//             doorFrame.position.set(-2, 2.5, side * 1.62);
//             locoBody.add(doorFrame);

//             const doorWindow = new THREE.Mesh(
//                 new THREE.BoxGeometry(0.06, 1, 0.6),
//                 Train.sharedResources.windowMaterial
//             );
//             doorWindow.position.set(-2, 3.2, side * 1.62);
//             locoBody.add(doorWindow);
//         }

//         // Roof
//         const roofGeometry = new THREE.BoxGeometry(8, 0.4, 2.6);
//         const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xbdbdbd });
//         const roof = new THREE.Mesh(roofGeometry, roofMaterial);
//         roof.position.set(-1, 5.1, 0);
//         locoBody.add(roof);

//         // Pantograph base
//         const pantographBase = new THREE.Mesh(
//             new THREE.BoxGeometry(1.5, 0.3, 1),
//             new THREE.MeshLambertMaterial({ color: 0x424242 })
//         );
//         pantographBase.position.set(0, 5.4, 0);
//         locoBody.add(pantographBase);

//         // Pantograph arms
//         const armMaterial = new THREE.MeshLambertMaterial({ color: 0x212121 });
//         const arm1 = new THREE.Mesh(
//             new THREE.CylinderGeometry(0.08, 0.08, 1.5),
//             armMaterial
//         );
//         arm1.position.set(0, 6, 0);
//         arm1.rotation.z = Math.PI / 6;
//         locoBody.add(arm1);

//         const arm2 = arm1.clone();
//         arm2.rotation.z = -Math.PI / 6;
//         locoBody.add(arm2);

//         // Contact wire collector
//         const collector = new THREE.Mesh(
//             new THREE.BoxGeometry(2, 0.08, 0.08),
//             armMaterial
//         );
//         collector.position.set(0, 6.8, 0);
//         locoBody.add(collector);

//         // ✅ OPTIMIZED: AC units with InstancedMesh
//         const locoACUnits = new THREE.InstancedMesh(
//             Train.sharedResources.acUnitGeometry,
//             Train.sharedResources.acUnitMaterial,
//             4
//         );
//         const matrix = new THREE.Matrix4();
//         for (let i = 0; i < 4; i++) {
//             matrix.setPosition(-4 + i * 2.5, 5.5, 0);
//             locoACUnits.setMatrixAt(i, matrix);
//         }
//         locoACUnits.instanceMatrix.needsUpdate = true;
//         locoBody.add(locoACUnits);

//         // Headlights (emissive only, no point lights)
//         const headlightGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.3, 16);
//         const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });

//         const topHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
//         topHeadlight.rotation.z = Math.PI / 2;
//         topHeadlight.position.set(8.5, 4, 0);
//         locoBody.add(topHeadlight);

//         const bottomHeadlight = topHeadlight.clone();
//         bottomHeadlight.position.set(8.5, 1.8, 0);
//         locoBody.add(bottomHeadlight);

//         // ✅ OPTIMIZED: All locomotive wheels as InstancedMesh
//         const wheelPositions = [-3, -1, 1, 3];
//         const totalLocoWheels = wheelPositions.length * 2;

//         const locoOuterWheels = new THREE.InstancedMesh(
//             Train.sharedResources.wheelGeometry,
//             Train.sharedResources.wheelMaterial,
//             totalLocoWheels
//         );
//         locoOuterWheels.castShadow = true;

//         const locoInnerWheels = new THREE.InstancedMesh(
//             Train.sharedResources.innerWheelGeometry,
//             Train.sharedResources.innerWheelMaterial,
//             totalLocoWheels
//         );

//         const locoBrakeDiscs = new THREE.InstancedMesh(
//             Train.sharedResources.brakeDiscGeometry,
//             Train.sharedResources.brakeDiscMaterial,
//             totalLocoWheels
//         );

//         const rotation = new THREE.Quaternion();
//         rotation.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
//         const scale = new THREE.Vector3(1, 1, 1);

//         let wheelIndex = 0;
//         wheelPositions.forEach(x => {
//             // Left wheels
//             matrix.compose(new THREE.Vector3(x, 0.65, 1.85), rotation, scale);
//             locoOuterWheels.setMatrixAt(wheelIndex, matrix);
//             locoInnerWheels.setMatrixAt(wheelIndex, matrix);
            
//             const brakeRotation = new THREE.Quaternion();
//             brakeRotation.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
//             matrix.compose(new THREE.Vector3(x, 0.65, 1.5), brakeRotation, scale);
//             locoBrakeDiscs.setMatrixAt(wheelIndex, matrix);
//             wheelIndex++;
            
//             // Right wheels
//             matrix.compose(new THREE.Vector3(x, 0.65, -1.85), rotation, scale);
//             locoOuterWheels.setMatrixAt(wheelIndex, matrix);
//             locoInnerWheels.setMatrixAt(wheelIndex, matrix);
            
//             matrix.compose(new THREE.Vector3(x, 0.65, -1.5), brakeRotation, scale);
//             locoBrakeDiscs.setMatrixAt(wheelIndex, matrix);
//             wheelIndex++;
//         });

//         locoOuterWheels.instanceMatrix.needsUpdate = true;
//         locoInnerWheels.instanceMatrix.needsUpdate = true;
//         locoBrakeDiscs.instanceMatrix.needsUpdate = true;

//         locoBody.add(locoOuterWheels, locoInnerWheels, locoBrakeDiscs);

//         // Undercarriage
//         const undercarriageGeometry = new THREE.BoxGeometry(9, 0.6, 2.8);
//         const undercarriageMaterial = new THREE.MeshLambertMaterial({ color: 0x37474f });
//         const undercarriage = new THREE.Mesh(undercarriageGeometry, undercarriageMaterial);
//         undercarriage.position.set(0, 1, 0);
//         undercarriage.castShadow = true;
//         locoBody.add(undercarriage);

//         // Coupling mechanism
//         const coupling = new THREE.Mesh(
//             new THREE.BoxGeometry(0.6, 0.3, 0.3),
//             new THREE.MeshLambertMaterial({ color: 0x212121 })
//         );
//         coupling.position.set(-5.5, 1.2, 0);
//         locoBody.add(coupling);

//         trainGroup.add(locoBody);

//         // ===== PASSENGER CARS (2 cars) =====
//         for (let carIndex = 0; carIndex < 2; carIndex++) {
//             const carBody = new THREE.Group();
//             carBody.position.x = -15 - (carIndex * 16);

//             // Main car body
//             const carMainBody = new THREE.Mesh(
//                 new THREE.BoxGeometry(12, 4, 3.2),
//                 bodyMaterial
//             );
//             carMainBody.position.set(0, 2.8, 0);
//             carMainBody.castShadow = true;
//             carMainBody.receiveShadow = true;
//             carBody.add(carMainBody);

//             // Bottom section
//             const carBottom = new THREE.Mesh(
//                 new THREE.BoxGeometry(12.1, 1.2, 3.3),
//                 new THREE.MeshLambertMaterial({ color: 0x37474f })
//             );
//             carBottom.position.set(0, 1.4, 0);
//             carBody.add(carBottom);

//             // Car stripe
//             const carStripe = new THREE.Mesh(
//                 new THREE.BoxGeometry(12.2, 0.9, 3.25),
//                 stripeMaterial
//             );
//             carStripe.position.set(0, 2.2, 0);
//             carBody.add(carStripe);

//             // Car roof
//             const carRoof = new THREE.Mesh(
//                 new THREE.BoxGeometry(12, 0.4, 2.8),
//                 roofMaterial
//             );
//             carRoof.position.set(0, 5.1, 0);
//             carBody.add(carRoof);

//             // ✅ OPTIMIZED: AC units with InstancedMesh
//             const carACUnits = new THREE.InstancedMesh(
//                 Train.sharedResources.acUnitGeometry,
//                 Train.sharedResources.acUnitMaterial,
//                 5
//             );
//             for (let i = 0; i < 5; i++) {
//                 matrix.setPosition(-5 + i * 2.5, 5.5, 0);
//                 carACUnits.setMatrixAt(i, matrix);
//             }
//             carACUnits.instanceMatrix.needsUpdate = true;
//             carBody.add(carACUnits);

//             // ✅ OPTIMIZED: Passenger windows with InstancedMesh
//             const windowCount = 6 * 2; // 6 windows × 2 sides
//             const carWindows = new THREE.InstancedMesh(
//                 Train.sharedResources.windowGeometry,
//                 Train.sharedResources.windowMaterial,
//                 windowCount
//             );
//             const carFrames = new THREE.InstancedMesh(
//                 Train.sharedResources.frameGeometry,
//                 Train.sharedResources.frameMaterial,
//                 windowCount
//             );

//             let windowIndex = 0;
//             for (let i = 0; i < 6; i++) {
//                 for (let side of [-1, 1]) {
//                     const x = -5 + i * 2;
                    
//                     matrix.setPosition(x, 3.2, side * 1.63);
//                     carWindows.setMatrixAt(windowIndex, matrix);
                    
//                     matrix.setPosition(x, 3.2, side * 1.62);
//                     carFrames.setMatrixAt(windowIndex, matrix);
                    
//                     windowIndex++;
//                 }
//             }
//             carWindows.instanceMatrix.needsUpdate = true;
//             carFrames.instanceMatrix.needsUpdate = true;
//             carBody.add(carWindows, carFrames);

//             // Entry doors
//             for (let side of [-1, 1]) {
//                 const door = new THREE.Mesh(
//                     new THREE.BoxGeometry(0.08, 2.5, 1.2),
//                     Train.sharedResources.frameMaterial
//                 );
//                 door.position.set(5.5, 2.5, side * 1.62);
//                 carBody.add(door);
//             }

//             // ✅ OPTIMIZED: Car wheels with InstancedMesh
//             const carWheelPositions = [-4, -2, 2, 4];
//             const totalCarWheels = carWheelPositions.length * 2;

//             const carOuterWheels = new THREE.InstancedMesh(
//                 Train.sharedResources.wheelGeometry,
//                 Train.sharedResources.wheelMaterial,
//                 totalCarWheels
//             );
//             carOuterWheels.castShadow = true;

//             const carInnerWheels = new THREE.InstancedMesh(
//                 Train.sharedResources.innerWheelGeometry,
//                 Train.sharedResources.innerWheelMaterial,
//                 totalCarWheels
//             );

//             wheelIndex = 0;
//             carWheelPositions.forEach(x => {
//                 // Left wheels
//                 matrix.compose(new THREE.Vector3(x, 0.65, 1.85), rotation, scale);
//                 carOuterWheels.setMatrixAt(wheelIndex, matrix);
//                 carInnerWheels.setMatrixAt(wheelIndex, matrix);
//                 wheelIndex++;
                
//                 // Right wheels
//                 matrix.compose(new THREE.Vector3(x, 0.65, -1.85), rotation, scale);
//                 carOuterWheels.setMatrixAt(wheelIndex, matrix);
//                 carInnerWheels.setMatrixAt(wheelIndex, matrix);
//                 wheelIndex++;
//             });

//             carOuterWheels.instanceMatrix.needsUpdate = true;
//             carInnerWheels.instanceMatrix.needsUpdate = true;
//             carBody.add(carOuterWheels, carInnerWheels);

//             // Car undercarriage
//             const carUndercarriage = new THREE.Mesh(
//                 new THREE.BoxGeometry(11, 0.6, 2.8),
//                 undercarriageMaterial
//             );
//             carUndercarriage.position.set(0, 1, 0);
//             carUndercarriage.castShadow = true;
//             carBody.add(carUndercarriage);

//             // Couplings
//             const frontCoupling = new THREE.Mesh(
//                 new THREE.BoxGeometry(0.6, 0.3, 0.3),
//                 new THREE.MeshLambertMaterial({ color: 0x212121 })
//             );
//             frontCoupling.position.set(6.5, 1.2, 0);
//             carBody.add(frontCoupling);

//             const rearCoupling = frontCoupling.clone();
//             rearCoupling.position.set(-6.5, 1.2, 0);
//             carBody.add(rearCoupling);

//             trainGroup.add(carBody);
//         }

//         this.scene.add(trainGroup);
//         return trainGroup;
//     }

//     createRealisticCrossingGate(side) {
//         const gateGroup = new THREE.Group();

//         // Base plate
//         const basePlateGeometry = new THREE.CylinderGeometry(0.6, 0.7, 0.3, 8);
//         const basePlateMaterial = new THREE.MeshLambertMaterial({ color: 0x9e9e9e });
//         const basePlate = new THREE.Mesh(basePlateGeometry, basePlateMaterial);
//         basePlate.position.y = 0.15;
//         basePlate.castShadow = true;
//         basePlate.receiveShadow = true;
//         gateGroup.add(basePlate);

//         // Main support pole
//         const poleGeometry = new THREE.CylinderGeometry(0.15, 0.18, 4, 12);
//         const poleMaterial = new THREE.MeshLambertMaterial({ color: 0xf9a825 });
//         const pole = new THREE.Mesh(poleGeometry, poleMaterial);
//         pole.position.y = 2.3;
//         pole.castShadow = true;
//         gateGroup.add(pole);

//         // Black stripes on pole
//         for (let i = 0; i < 3; i++) {
//             const blackStripe = new THREE.Mesh(
//                 new THREE.CylinderGeometry(0.16, 0.16, 0.6, 12),
//                 new THREE.MeshLambertMaterial({ color: 0x212121 })
//             );
//             blackStripe.position.y = 1 + i * 1.3;
//             gateGroup.add(blackStripe);
//         }

//         // Control box
//         const controlBoxGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.5);
//         const controlBoxMaterial = new THREE.MeshLambertMaterial({ color: 0x424242 });
//         const controlBox = new THREE.Mesh(controlBoxGeometry, controlBoxMaterial);
//         controlBox.position.set(0, 4.3, 0);
//         controlBox.castShadow = true;
//         gateGroup.add(controlBox);

//         // Warning lights housing
//         const lightsHousingGeometry = new THREE.BoxGeometry(0.7, 1.2, 0.3);
//         const lightsHousingMaterial = new THREE.MeshLambertMaterial({ color: 0x212121 });
//         const lightsHousing = new THREE.Mesh(lightsHousingGeometry, lightsHousingMaterial);
//         lightsHousing.position.set(0, 5.3, 0.15);
//         lightsHousing.castShadow = true;
//         gateGroup.add(lightsHousing);

//         // Warning lights (no point lights, just emissive meshes)
//         const lightGeometry = new THREE.CircleGeometry(0.18, 16);
//         const lightMaterial1 = new THREE.MeshBasicMaterial({ 
//             color: 0xff0000,
//             transparent: true,
//             opacity: 0
//         });
//         const lightMaterial2 = lightMaterial1.clone();

//         const topLight = new THREE.Mesh(lightGeometry, lightMaterial1);
//         topLight.position.set(0, 5.65, 0.31);
//         gateGroup.add(topLight);

//         const bottomLight = new THREE.Mesh(lightGeometry, lightMaterial2);
//         bottomLight.position.set(0, 4.95, 0.31);
//         gateGroup.add(bottomLight);

//         // Crossbuck sign
//         const crossbuckGroup = new THREE.Group();
//         crossbuckGroup.position.set(0, 4.8, 0);

//         const boardGeometry = new THREE.BoxGeometry(2, 0.35, 0.08);
//         const boardMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

//         const board1 = new THREE.Mesh(boardGeometry, boardMaterial);
//         board1.rotation.z = Math.PI / 4;
//         board1.castShadow = true;
//         crossbuckGroup.add(board1);

//         const board2 = new THREE.Mesh(boardGeometry, boardMaterial);
//         board2.rotation.z = -Math.PI / 4;
//         board2.castShadow = true;
//         crossbuckGroup.add(board2);

//         // Black border
//         const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
//         const border1 = new THREE.Mesh(
//             new THREE.BoxGeometry(2.1, 0.08, 0.09),
//             borderMaterial
//         );
//         border1.rotation.z = Math.PI / 4;
//         border1.position.z = -0.01;
//         crossbuckGroup.add(border1);

//         const border2 = border1.clone();
//         border2.rotation.z = -Math.PI / 4;
//         crossbuckGroup.add(border2);

//         // "RAILROAD" text simulation
//         for (let i = 0; i < 8; i++) {
//             const letter = new THREE.Mesh(
//                 new THREE.BoxGeometry(0.12, 0.18, 0.02),
//                 new THREE.MeshBasicMaterial({ color: 0x000000 })
//             );
//             letter.position.set(-0.5 + i * 0.14, 0.7, 0.05);
//             crossbuckGroup.add(letter);
//         }

//         // "CROSSING" text simulation
//         for (let i = 0; i < 8; i++) {
//             const letter = new THREE.Mesh(
//                 new THREE.BoxGeometry(0.12, 0.18, 0.02),
//                 new THREE.MeshBasicMaterial({ color: 0x000000 })
//             );
//             letter.position.set(-0.5 + i * 0.14, -0.7, 0.05);
//             crossbuckGroup.add(letter);
//         }

//         gateGroup.add(crossbuckGroup);

//         // Gate arm mechanism housing
//         const armMechanismGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.4);
//         const armMechanism = new THREE.Mesh(armMechanismGeometry, controlBoxMaterial);
//         armMechanism.position.set(0, 4.3, side * 0.3);
//         gateGroup.add(armMechanism);

//         // Gate barrier arm (continued)
//         const armGroup = new THREE.Group();
//         armGroup.position.set(0, 4.5, side * 0.3);

//         const armLength = 10;
//         const armGeometry = new THREE.BoxGeometry(armLength, 0.2, 0.25);
//         const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
//         const arm = new THREE.Mesh(armGeometry, armMaterial);
//         arm.position.set(side * armLength/2, 0, 0);
//         arm.castShadow = true;
//         armGroup.add(arm);

//         // Red stripes on barrier arm
//         const redStripeMaterial = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
        
//         for (let i = 0; i < 6; i++) {
//             const stripe = new THREE.Mesh(
//                 new THREE.BoxGeometry(1.4, 0.22, 0.26),
//                 redStripeMaterial
//             );
//             stripe.position.set(side * (1.5 + i * 1.6), 0, 0);
//             armGroup.add(stripe);
//         }

//         // Red tip light on end of arm
//         const tipLightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
//         const tipLightMaterial = new THREE.MeshBasicMaterial({ 
//             color: 0xff0000,
//             transparent: true,
//             opacity: 0
//         });
//         const tipLight = new THREE.Mesh(tipLightGeometry, tipLightMaterial);
//         tipLight.position.set(side * (armLength - 0.5), 0, 0);
//         armGroup.add(tipLight);

//         // Reflectors on arm
//         for (let i = 0; i < 4; i++) {
//             const reflector = new THREE.Mesh(
//                 new THREE.CircleGeometry(0.15, 8),
//                 new THREE.MeshLambertMaterial({ color: 0xffeb3b })
//             );
//             reflector.position.set(side * (2 + i * 2), 0, 0.13);
//             armGroup.add(reflector);
//         }

//         gateGroup.add(armGroup);

//         // Counter-weight
//         const counterWeightGeometry = new THREE.BoxGeometry(1, 0.8, 0.8);
//         const counterWeight = new THREE.Mesh(counterWeightGeometry, controlBoxMaterial);
//         counterWeight.position.set(-side * 0.8, 4.5, side * 0.3);
//         counterWeight.castShadow = true;
//         gateGroup.add(counterWeight);

//         // Bell housing
//         const bellHousingGeometry = new THREE.CylinderGeometry(0.25, 0.22, 0.4, 16);
//         const bellHousingMaterial = new THREE.MeshLambertMaterial({ color: 0x424242 });
//         const bellHousing = new THREE.Mesh(bellHousingGeometry, bellHousingMaterial);
//         bellHousing.position.set(0, 3.5, 0.35);
//         bellHousing.castShadow = true;
//         gateGroup.add(bellHousing);

//         // Bell clapper
//         const clapperGeometry = new THREE.SphereGeometry(0.08, 8, 8);
//         const clapper = new THREE.Mesh(clapperGeometry, bellHousingMaterial);
//         clapper.position.set(0, 3.3, 0.35);
//         gateGroup.add(clapper);

//         // Store references for animation
//         gateGroup.userData.arm = armGroup;
//         gateGroup.userData.topLight = topLight;
//         gateGroup.userData.bottomLight = bottomLight;
//         gateGroup.userData.topLightMaterial = lightMaterial1;
//         gateGroup.userData.bottomLightMaterial = lightMaterial2;
//         gateGroup.userData.tipLight = tipLight;
//         gateGroup.userData.tipLightMaterial = tipLightMaterial;
//         gateGroup.userData.clapper = clapper;
//         gateGroup.userData.side = side;

//         this.scene.add(gateGroup);
//         return gateGroup;
//     }

//     createCrossingSign() {
//         const signGroup = new THREE.Group();

//         // Sign post
//         const postGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
//         const postMaterial = new THREE.MeshLambertMaterial({ color: 0x757575 });
//         const post = new THREE.Mesh(postGeometry, postMaterial);
//         post.position.y = 1.5;
//         post.castShadow = true;
//         signGroup.add(post);

//         // Round yellow warning sign
//         const signGeometry = new THREE.CircleGeometry(0.6, 32);
//         const signMaterial = new THREE.MeshLambertMaterial({ color: 0xffd600 });
//         const sign = new THREE.Mesh(signGeometry, signMaterial);
//         sign.position.set(0, 3.5, 0);
//         sign.castShadow = true;
//         signGroup.add(sign);

//         // Black border
//         const borderGeometry = new THREE.RingGeometry(0.6, 0.65, 32);
//         const border = new THREE.Mesh(
//             borderGeometry,
//             new THREE.MeshBasicMaterial({ color: 0x000000 })
//         );
//         border.position.set(0, 3.5, 0.01);
//         signGroup.add(border);

//         // "X" symbol in black
//         const xBar1 = new THREE.Mesh(
//             new THREE.BoxGeometry(0.8, 0.1, 0.02),
//             new THREE.MeshBasicMaterial({ color: 0x000000 })
//         );
//         xBar1.position.set(0, 3.5, 0.02);
//         xBar1.rotation.z = Math.PI / 4;
//         signGroup.add(xBar1);

//         const xBar2 = xBar1.clone();
//         xBar2.rotation.z = -Math.PI / 4;
//         signGroup.add(xBar2);

//         // "RR" letters
//         const letterGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.02);
//         const letterMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
//         const r1 = new THREE.Mesh(letterGeometry, letterMaterial);
//         r1.position.set(-0.15, 3.5, 0.02);
//         signGroup.add(r1);

//         const r2 = new THREE.Mesh(letterGeometry, letterMaterial);
//         r2.position.set(0.15, 3.5, 0.02);
//         signGroup.add(r2);

//         this.scene.add(signGroup);
//         return signGroup;
//     }
    
//     togglePause() {
//         this.isPaused = !this.isPaused;
//     }

//     update() {
//         if (!this.isPaused) {
//             // Move train
//             this.train.position.x += this.trainSpeed;

//             // Loop train
//             if (this.train.position.x > 150) {
//                 this.train.position.x = -150;
//             }

//             // Distance from crossing
//             const distanceToCrossing = this.train.position.x;
//             const displayDistance = Math.abs(distanceToCrossing).toFixed(0);
            
//             // Check if distance element exists before updating
//             const distanceElement = document.getElementById('distance');
//             if (distanceElement) {
//                 distanceElement.textContent = displayDistance;
//             }

//             const activationDistance = 50;
//             const deactivationDistance = 60;

//             // Guard rail logic - activate when train approaches
//             if (distanceToCrossing > -activationDistance && distanceToCrossing < deactivationDistance && this.guardRailsOpen) {
//                 this.targetArmRotation = Math.PI / 2; // Lower the gates
//                 this.guardRailsOpen = false;
                
//                 const statusElement = document.getElementById('status');
//                 if (statusElement) {
//                     statusElement.textContent = '⚠️ Gates Closing - Train Approaching';
//                 }
//             } else if ((distanceToCrossing < -activationDistance || distanceToCrossing > deactivationDistance) && !this.guardRailsOpen) {
//                 this.targetArmRotation = 0; // Raise the gates
//                 this.guardRailsOpen = true;
                
//                 const statusElement = document.getElementById('status');
//                 if (statusElement) {
//                     statusElement.textContent = '✅ Gates Opening - Clear';
//                 }
//             }

//             // Animate guard rail arms
//             const armRotationSpeed = 0.015;
//             [this.leftGuardRail, this.rightGuardRail].forEach(rail => {
//                 const arm = rail.userData.arm;
//                 if (Math.abs(arm.rotation.z - this.targetArmRotation) > 0.01) {
//                     if (arm.rotation.z < this.targetArmRotation) {
//                         arm.rotation.z = Math.min(this.targetArmRotation, arm.rotation.z + armRotationSpeed);
//                     } else {
//                         arm.rotation.z = Math.max(this.targetArmRotation, arm.rotation.z - armRotationSpeed);
//                     }
//                 }
//             });

//             // Warning lights - alternating blink pattern
//             if (!this.guardRailsOpen) {
//                 this.lightBlinkTimer += 0.08;
//                 const blinkState = Math.floor(this.lightBlinkTimer) % 2;

//                 [this.leftGuardRail, this.rightGuardRail].forEach(rail => {
//                     // Alternate between top and bottom lights
//                     rail.userData.topLightMaterial.opacity = blinkState === 0 ? 1 : 0;
//                     rail.userData.bottomLightMaterial.opacity = blinkState === 1 ? 1 : 0;
                    
//                     // Tip light blinks with bottom light
//                     rail.userData.tipLightMaterial.opacity = blinkState === 1 ? 0.8 : 0;
//                 });

//                 // Bell animation - swing back and forth
//                 this.bellSwingAngle += 0.15 * this.bellSwingDirection;
//                 if (Math.abs(this.bellSwingAngle) > 0.3) {
//                     this.bellSwingDirection *= -1;
//                 }
                
//                 [this.leftGuardRail, this.rightGuardRail].forEach(rail => {
//                     rail.userData.clapper.rotation.x = this.bellSwingAngle;
//                 });

//                 // Update status based on gate position
//                 if (Math.abs(this.leftGuardRail.userData.arm.rotation.z - this.targetArmRotation) < 0.05) {
//                     const statusElement = document.getElementById('status');
//                     if (statusElement) {
//                         if (Math.abs(distanceToCrossing) < 15) {
//                             statusElement.textContent = '🚂 TRAIN PASSING - DO NOT CROSS';
//                         } else {
//                             statusElement.textContent = '🛑 Gates Closed - Wait for Train';
//                         }
//                     }
//                 }
//             } else {
//                 // Turn off all lights when gates are open
//                 [this.leftGuardRail, this.rightGuardRail].forEach(rail => {
//                     rail.userData.topLightMaterial.opacity = 0;
//                     rail.userData.bottomLightMaterial.opacity = 0;
//                     rail.userData.tipLightMaterial.opacity = 0;
//                 });

//                 this.bellSwingAngle = 0;
//                 [this.leftGuardRail, this.rightGuardRail].forEach(rail => {
//                     rail.userData.clapper.rotation.x = 0;
//                 });

//                 if (Math.abs(this.leftGuardRail.userData.arm.rotation.z - this.targetArmRotation) < 0.05) {
//                     const statusElement = document.getElementById('status');
//                     if (statusElement) {
//                         statusElement.textContent = '✅ All Clear - Safe to Cross';
//                     }
//                 }
//             }
//         }
//     }

//     dispose() {
//         // Clean up shared resources if needed
//         if (Train.sharedResources) {
//             Object.values(Train.sharedResources).forEach(resource => {
//                 if (resource && resource.dispose) {
//                     resource.dispose();
//                 }
//             });
//             Train.sharedResources = null;
//         }
//     }
// }
