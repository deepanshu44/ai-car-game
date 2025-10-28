// game.js
class CarGame {
    constructor() {
	this.scene = null;
	this.camera = null;
	this.renderer = null;
	this.playerCar = null;
	this.policeCars = [];
	this.traffic = [];
	this.crossingTraffic = [];
	this.scenery = [];
	this.roadSegments = [];
	this.roadDividers = [];
	
	this.speed = 0;
	this.maxSpeed = 1.4;
	this.acceleration = 0.02;
	this.deceleration = 0.03;
	this.lateralSpeed = 0;
	this.maxLateralSpeed = 0.1;
	
	// Rewind mechanic properties - ADD THESE
	this.isRewinding = false;
	this.rewindPower = 0;
	this.maxRewindPower = 100;
	this.rewindChargeRate = 0.5;  // How fast it charges
	this.rewindDuration = 15000; // 15 seconds in milliseconds
	this.rewindTimer = 0;
	this.isMoving = false;
	
	this.distance = 0;
	this.gameOver = false;
	
	this.keys = {};
	
	this.laneWidth = 4.5;
	this.playerLane = 2.25;
	this.trafficLane = -2.25;
	
	this.init();
    }
    
    init() {
	// Scene setup
	this.scene = new THREE.Scene();
	// Don't set background here, let createNightSky() handle it
	
	// Camera
	this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
	);
	this.camera.position.set(0, 5, -10);
	this.camera.lookAt(0, 0, 0);
	
	// Renderer
	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(window.innerWidth, window.innerHeight);
	this.renderer.shadowMap.enabled = true;
	document.getElementById('game-container').appendChild(this.renderer.domElement);
	
	// Create night sky BEFORE lights
	this.createNightSky();
	
	// Lights - Adjust for night time
	const ambientLight = new THREE.AmbientLight(0x404060, 0.4);  // Darker, blueish ambient
	this.scene.add(ambientLight);
	
	const directionalLight = new THREE.DirectionalLight(0x8888bb, 0.5);  // Moonlight color, dimmer
	directionalLight.position.set(10, 20, 10);
	directionalLight.castShadow = true;
	this.scene.add(directionalLight);
	
	// Create game elements
	this.createRoad();
	this.createRoadDivider();
	this.createStreetLamps();
	this.createPlayerCar();
	this.createPlayerCarLights();
	this.createIntersection();
	this.spawnScenery();
	this.createClouds();  // Clouds at night (optional, can remove)
	this.spawnTraffic();
	
	// Event listeners
	window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
	window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
	window.addEventListener('resize', () => this.onWindowResize());
	
	document.getElementById('restart').addEventListener('click', () => this.restart());
	
	// Start game loop
	this.gameLoop();
    }
    
    createRoad() {
	const roadGeometry = new THREE.PlaneGeometry(18, 500);
	const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
	
	for (let i = 0; i < 3; i++) {
            const road = new THREE.Mesh(roadGeometry, roadMaterial);
            road.rotation.x = -Math.PI / 2;
            road.position.z = i * 500 - 500;
            road.receiveShadow = false;
            this.scene.add(road);
            this.roadSegments.push(road);
	}
	
	// Lane markers
	this.createLaneMarkers();
	
	// Create procedural grass texture
	const grassTexture = this.createGrassTexture();
	
	// Grass on sides with texture and color variation
	const grassPatches = [
            { x: -34, color: 0x3a7d44 },     // Medium green
            { x: -34, color: 0x2d5016 },     // Dark green
            { x: -34, color: 0x4a9d5a },     // Light green
            { x: 34, color: 0x3a7d44 },      // Medium green
            { x: 34, color: 0x2d5016 },      // Dark green
            { x: 34, color: 0x4a9d5a }       // Light green
	];
	
	grassPatches.forEach((patch, index) => {
            const grassGeometry = new THREE.PlaneGeometry(50, 500);
            const grassMaterial = new THREE.MeshLambertMaterial({ 
		map: grassTexture,
		color: patch.color
            });
            
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            grass.rotation.x = -Math.PI / 2;
            grass.position.x = patch.x;
            grass.position.z = (index % 3) * 166 - 166;  // Offset z positions
            grass.receiveShadow = false;
            this.scene.add(grass);
	});
    }

    createHighwayBridge(z) {
	const bridgeGroup = new THREE.Group();
	
	// Bridge deck (road surface)
	const deckGeometry = new THREE.BoxGeometry(80, 0.5, 12);
	const deckMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
	const deck = new THREE.Mesh(deckGeometry, deckMaterial);
	deck.position.y = 8;
	deck.castShadow = false;
	bridgeGroup.add(deck);
	
	// Bridge railings
	const railingGeometry = new THREE.BoxGeometry(80, 1, 0.3);
	const railingMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
	
	const railingLeft = new THREE.Mesh(railingGeometry, railingMaterial);
	railingLeft.position.set(0, 8.75, -6);
	bridgeGroup.add(railingLeft);
	
	const railingRight = new THREE.Mesh(railingGeometry, railingMaterial);
	railingRight.position.set(0, 8.75, 6);
	bridgeGroup.add(railingRight);
	
	// Support pillars
	const pillarGeometry = new THREE.BoxGeometry(2, 8, 2);
	const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
	
	const pillarPositions = [-30, -15, 15, 30];
	pillarPositions.forEach(x => {
            // Left side pillars
            const pillarL = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillarL.position.set(x, 4, -8);
            pillarL.castShadow = false;
            bridgeGroup.add(pillarL);
            
            // Right side pillars
            const pillarR = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillarR.position.set(x, 4, 8);
            pillarR.castShadow = false;
            bridgeGroup.add(pillarR);
	});
	
	// Add some bridge cars (stationary traffic on bridge)
	const bridgeCarColors = [0xff0000, 0x0000ff, 0xffff00, 0x00ff00];
	for (let i = 0; i < 4; i++) {
            const carBody = new THREE.Mesh(
		new THREE.BoxGeometry(2, 1, 4),
		new THREE.MeshLambertMaterial({ 
                    color: bridgeCarColors[i] 
		})
            );
            carBody.position.set(-35 + i * 20, 9, Math.random() * 8 - 4);
            carBody.castShadow = false;
            bridgeGroup.add(carBody);
	}
	
	// Bridge shadow/underpass effect
	const shadowGeometry = new THREE.PlaneGeometry(80, 12);
	const shadowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
	});
	const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
	shadow.rotation.x = -Math.PI / 2;
	shadow.position.y = 0.15;
	bridgeGroup.add(shadow);
	
	bridgeGroup.position.set(0, 0, z);
	this.scene.add(bridgeGroup);
	this.scenery.push({ mesh: bridgeGroup, type: 'bridge', initialZ: z });
    }

    createLiveIntersection(z) {
	const intersectionGroup = new THREE.Group();
	
	// Intersection road surface (crossing left-right)
	const crossRoadGeometry = new THREE.PlaneGeometry(80, 20);
	const crossRoadMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
	const crossRoad = new THREE.Mesh(crossRoadGeometry, crossRoadMaterial);
	crossRoad.rotation.x = -Math.PI / 2;
	crossRoad.position.y = 0.02;
	intersectionGroup.add(crossRoad);
	
	// Crosswalk lines
	const crosswalkMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
	for (let i = 0; i < 8; i++) {
            const line = new THREE.Mesh(
		new THREE.PlaneGeometry(1.5, 20),
		crosswalkMaterial
            );
            line.rotation.x = -Math.PI / 2;
            line.position.set(-12 + i * 3.5, 0.03, 0);
            intersectionGroup.add(line);
	}
	
	// Traffic lights
	this.createTrafficLight(intersectionGroup, -10, -12);
	this.createTrafficLight(intersectionGroup, -10, 12);
	this.createTrafficLight(intersectionGroup, 10, -12);
	this.createTrafficLight(intersectionGroup, 10, 12);
	
	intersectionGroup.position.set(0, 0, z);
	this.scene.add(intersectionGroup);
	this.scenery.push({ mesh: intersectionGroup, type: 'intersection', initialZ: z });
	
	// Spawn crossing traffic cars
	this.spawnCrossingTraffic(z);
    }

    createTrafficLight(parent, x, z) {
	const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
	const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
	const pole = new THREE.Mesh(poleGeometry, poleMaterial);
	pole.position.set(x, 1.5, z);
	parent.add(pole);
	
	// Light box
	const lightBoxGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
	const lightBoxMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
	const lightBox = new THREE.Mesh(lightBoxGeometry, lightBoxMaterial);
	lightBox.position.set(x, 3.4, z);
	parent.add(lightBox);
	
	// Red light
	const redLight = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshBasicMaterial({ 
		color: 0xff0000,
		emissive: 0xff0000,
		emissiveIntensity: 0.5
            })
	);
	redLight.position.set(x, 3.6, z);
	parent.add(redLight);
	
	// Yellow light
	const yellowLight = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x333300 })
	);
	yellowLight.position.set(x, 3.4, z);
	parent.add(yellowLight);
	
	// Green light
	const greenLight = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x003300 })
	);
	greenLight.position.set(x, 3.2, z);
	parent.add(greenLight);
    }

    spawnCrossingTraffic(intersectionZ) {
	// Create cars that move left-right across the intersection
	for (let i = 0; i < 3; i++) {
            const carGroup = new THREE.Group();
            
            const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
            const colors = [0xff00ff, 0x00ffff, 0xffa500];
            const bodyMaterial = new THREE.MeshLambertMaterial({ 
		color: colors[i] 
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.5;
            body.castShadow = false;
            carGroup.add(body);
            
            const roof = new THREE.Mesh(
		new THREE.BoxGeometry(1.6, 0.8, 2),
		bodyMaterial
            );
            roof.position.y = 1.4;
            roof.position.z = -0.3;
            carGroup.add(roof);
            
            // Position cars going left to right
            carGroup.position.set(-40 - i * 15, 0, intersectionZ + (Math.random() - 0.5) * 8);
            carGroup.rotation.y = Math.PI / 2;  // Face right
            
            this.scene.add(carGroup);
            this.crossingTraffic.push({ 
		mesh: carGroup, 
		speed: 0.3 + Math.random() * 0.2,
		intersectionZ: intersectionZ
            });
	}
    }
    
    createGrassTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = 512;
	canvas.height = 512;
	const ctx = canvas.getContext('2d');
	
	// Base grass color
	ctx.fillStyle = '#2d5016';
	ctx.fillRect(0, 0, 512, 512);
	
	// Add random grass blades/texture
	for (let i = 0; i < 15000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const shade = Math.random() * 60;
            const greenValue = 80 + shade;
            const blueValue = 20 + Math.random() * 30;
            
            ctx.fillStyle = `rgb(${Math.random() * 40}, ${greenValue}, ${blueValue})`;
            
            // Random size dots for variety
            const size = Math.random() < 0.7 ? 1 : 2;
            ctx.fillRect(x, y, size, size);
	}
	
	// Add some longer grass strokes
	for (let i = 0; i < 3000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const shade = Math.random() * 50;
            
            ctx.strokeStyle = `rgba(${Math.random() * 30}, ${100 + shade}, ${30 + shade}, 0.4)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 3, y + Math.random() * 5);
            ctx.stroke();
	}
	
	// Add darker patches for depth
	for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = 10 + Math.random() * 20;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(20, 50, 10, 0.3)');
            gradient.addColorStop(1, 'rgba(20, 50, 10, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
	}
	
	const texture = new THREE.CanvasTexture(canvas);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(8, 80);  // Repeat pattern for tiling
	
	return texture;
    }
    
    createLaneMarkers() {
	const markerGeometry = new THREE.BoxGeometry(0.3, 0.1, 3);
	const markerMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
	
	// Lane markers at -4.5 (between left lanes) and 4.5 (between right lanes)
	// Don't put markers at 0 (that's where the divider is)
	const markerPositions = [-4.5, 4.5];
	
	for (let z = -600; z < 600; z += 10) {
            markerPositions.forEach(x => {
		const marker = new THREE.Mesh(markerGeometry, markerMaterial);
		marker.position.set(x, 0.05, z);
		this.scene.add(marker);
		this.scenery.push({ mesh: marker, type: 'marker' });
            });
	}
    }

    // Add this method to the CarGame class, right after createLaneMarkers()

    createRoadDivider() {
	// Central barrier/divider - create multiple segments
	const dividerGeometry = new THREE.BoxGeometry(0.5, 0.5, 500);
	const dividerMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
	
	this.roadDividers = []; // Add this array to track dividers separately
	
	for (let i = 0; i < 3; i++) {
            const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
            divider.position.set(0, 0.25, i * 500 - 500);
            divider.castShadow = true;
            divider.receiveShadow = true;
            this.scene.add(divider);
            this.roadDividers.push(divider); // Add to separate array instead of scenery
	}
    }
    
    createPlayerCar() {
        const carGroup = new THREE.Group();
        
        // Car body
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
        const bodyMaterial = new THREE.MeshLambertMaterial({
	    color: 0xff0000,
	    metalness: 0.5,
	    roughness: 0.3,
	});
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        carGroup.add(body);
        
        // Car roof
        const roofGeometry = new THREE.BoxGeometry(1.6, 0.8, 2);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xcc0000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.4;
        roof.position.z = -0.3;
        roof.castShadow = true;
        carGroup.add(roof);

	const headlightGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 2,
        });

        // Taillights (glowing spheres)
        const taillightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff3333,
            emissive: 0xff3333,
            emissiveIntensity: 1,
        });
        const taillight1 = new THREE.Mesh(headlightGeometry, taillightMaterial);
        taillight1.position.set(-0.8, 0.8, -1.9);
        carGroup.add(taillight1);

        const taillight2 = new THREE.Mesh(headlightGeometry, taillightMaterial);
        taillight2.position.set(0.8, 0.8, -1.9);
        carGroup.add(taillight2);

        
	// Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        
        const wheelPositions = [
            [-1.1, 0.4, 1.3],
            [1.1, 0.4, 1.3],
            [-1.1, 0.4, -1.3],
            [1.1, 0.4, -1.3]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            wheel.castShadow = true;
            carGroup.add(wheel);
        });
        
        carGroup.position.set(this.playerLane * this.laneWidth, 0, 0);
        this.scene.add(carGroup);
        this.playerCar = carGroup;
    }
    
    createIntersection() {
	// Intersection at z = 100, moved to the side of the road
	const islandX = 20; // Move island to the right side, off the road
	
	const islandGeometry = new THREE.CylinderGeometry(8, 8, 0.3, 32);
	const islandMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
	const island = new THREE.Mesh(islandGeometry, islandMaterial);
	island.position.set(islandX, 0.15, 100);
	island.receiveShadow = true;
	this.scene.add(island);
	
	// Trees on island
	for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = islandX + Math.cos(angle) * 5;  // Offset by islandX
            const z = 100 + Math.sin(angle) * 5;
            this.createTree(x, z);
	}
    }
    
    createTree(x, z) {
	const treeGroup = new THREE.Group();
	
	// Random tree type: 0 = pine, 1 = round, 2 = oak
	const treeType = Math.floor(Math.random() * 3);
	
	// Random size variation
	const sizeScale = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
	
	// Trunk - varied height and width
	const trunkHeight = 2.5 + Math.random() * 1.5;
	const trunkRadius = 0.25 + Math.random() * 0.15;
	const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius + 0.1, trunkHeight, 8);
	const trunkColors = [0x4a2511, 0x3d1f0f, 0x5c3317];
	const trunkMaterial = new THREE.MeshLambertMaterial({ 
            color: trunkColors[Math.floor(Math.random() * trunkColors.length)] 
	});
	const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
	trunk.position.y = trunkHeight / 2;
	trunk.castShadow = true;
	treeGroup.add(trunk);
	
	// Foliage based on type
	if (treeType === 0) {
            // Pine tree - cone shape
            const foliageGeometry = new THREE.ConeGeometry(1.2, 3, 8);
            const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x1a5c1a });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = trunkHeight + 0.8;  // CHANGED: from +1.5 to +0.8
            foliage.castShadow = true;
            treeGroup.add(foliage);
            
            // Second layer
            const foliage2 = new THREE.Mesh(
		new THREE.ConeGeometry(1, 2.5, 8),
		foliageMaterial
            );
            foliage2.position.y = trunkHeight + 1.5;  // CHANGED: from +2.5 to +1.5
            foliage2.castShadow = true;
            treeGroup.add(foliage2);
            
	} else if (treeType === 1) {
            // Round tree - sphere
            const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
            const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = trunkHeight + 0.3;  // CHANGED: from +1.2 to +0.3
            foliage.castShadow = true;
            treeGroup.add(foliage);
            
	} else {
            // Oak tree - irregular clusters
            const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
            const clusterPositions = [
		[0, trunkHeight + 0.8, 0, 1.3],          // CHANGED: from +1.5 to +0.8
		[-0.6, trunkHeight + 0.3, 0.4, 0.9],     // CHANGED: from +1 to +0.3
		[0.7, trunkHeight + 0.5, -0.3, 1],       // CHANGED: from +1.2 to +0.5
		[0, trunkHeight + 1.3, 0, 0.8]           // CHANGED: from +2.2 to +1.3
            ];
            
            clusterPositions.forEach(pos => {
		const cluster = new THREE.Mesh(
                    new THREE.SphereGeometry(pos[3], 6, 6),
                    foliageMaterial
		);
		cluster.position.set(pos[0], pos[1], pos[2]);
		cluster.castShadow = true;
		treeGroup.add(cluster);
            });
	}
	
	treeGroup.scale.set(sizeScale, sizeScale, sizeScale);
	treeGroup.position.set(x, 0, z);
	this.scene.add(treeGroup);
	this.scenery.push({ mesh: treeGroup, type: 'tree', initialZ: z });
    }

    createBush(x, z) {
	const bushGroup = new THREE.Group();
	
	// Only 3 green color variants
	const bushColors = [
            0x2d5016,  // Dark green
            0x3a7d44,  // Medium green (grass green)
            0x4a9d5a   // Light green
	];
	
	// Random bush type
	const bushType = Math.floor(Math.random() * 2);
	const bushMaterial = new THREE.MeshLambertMaterial({ 
            color: bushColors[Math.floor(Math.random() * bushColors.length)]
	});
	
	if (bushType === 0) {
            // Round bush - single sphere, bigger
            const bushGeometry = new THREE.SphereGeometry(1.2 + Math.random() * 0.6, 8, 8);  // CHANGED: from 0.8+0.4 to 1.2+0.6
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            bush.position.y = 0.7;  // CHANGED: from 0.5 to 0.7
            bush.scale.y = 0.8; // Flatten slightly
            bush.castShadow = true;
            bushGroup.add(bush);
            
	} else {
            // Clustered bush - multiple small spheres
            const clusterCount = 4 + Math.floor(Math.random() * 3);  // CHANGED: from 3+3 to 4+3
            for (let i = 0; i < clusterCount; i++) {
		const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(0.6 + Math.random() * 0.4, 6, 6),  // CHANGED: from 0.4+0.3 to 0.6+0.4
                    bushMaterial
		);
		sphere.position.set(
                    (Math.random() - 0.5) * 1.5,  // CHANGED: from 1.2 to 1.5
                    0.4 + Math.random() * 0.4,
                    (Math.random() - 0.5) * 1.5   // CHANGED: from 1.2 to 1.5
		);
		sphere.castShadow = true;
		bushGroup.add(sphere);
            }
	}
	
	const scale = 1 + Math.random() * 0.5;  // CHANGED: from 0.6+0.5 to 1+0.5 (bigger)
	bushGroup.scale.set(scale, scale, scale);
	bushGroup.position.set(x, 0, z);
	this.scene.add(bushGroup);
	this.scenery.push({ mesh: bushGroup, type: 'bush', initialZ: z });
    }
    
    createStreetLamp(x, z) {
	const lampGroup = new THREE.Group();
	
	// Pole
	const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 5, 8);
	const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
	const pole = new THREE.Mesh(poleGeometry, poleMaterial);
	pole.position.y = 2.5;
	pole.castShadow = false;
	lampGroup.add(pole);
	
	// Lamp head (top box)
	const lampHeadGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.4);
	const lampHeadMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
	const lampHead = new THREE.Mesh(lampHeadGeometry, lampHeadMaterial);
	lampHead.position.y = 5.3;
	lampHead.castShadow = false;
	lampGroup.add(lampHead);
	
	// Light bulb (glowing part)
	const bulbGeometry = new THREE.SphereGeometry(0.3, 8, 8);
	const bulbMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffbb,
            emissive: 0xffffbb,
            emissiveIntensity: 1.5
	});
	const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
	bulb.position.y = 5;
	lampGroup.add(bulb);
	
	// Point light from the lamp
	const light = new THREE.PointLight(0xffffcc, .5, 20);
	light.position.y = 5;
	light.castShadow = false;
	lampGroup.add(light);
	
	// Realistic ground light pool with gradient fade - IMPROVED
	const canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 256;
	const context = canvas.getContext('2d');
	
	// Create radial gradient from bright center to transparent edge
	const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
	gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');    // Bright center
	gradient.addColorStop(0.3, 'rgba(255, 255, 180, 0.5)');  // Still bright
	gradient.addColorStop(0.6, 'rgba(255, 255, 150, 0.2)');  // Fading
	gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');      // Transparent edge
	
	context.fillStyle = gradient;
	context.fillRect(0, 0, 256, 256);
	
	const texture = new THREE.CanvasTexture(canvas);
	
	const lightPoolGeometry = new THREE.CircleGeometry(5, 32);  // Larger radius, more segments
	const lightPoolMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending  // Makes it glow nicely
	});
	const lightPool = new THREE.Mesh(lightPoolGeometry, lightPoolMaterial);
	lightPool.rotation.x = -Math.PI / 2;
	lightPool.position.y = 0.05;
	lampGroup.add(lightPool);
	
	lampGroup.position.set(x, 0, z);
	this.scene.add(lampGroup);
	this.scenery.push({ mesh: lampGroup, type: 'lamp', initialZ: z });
    }

    createStreetLamps() {
	// Place lamps on both sides of the road - LESS DENSE
	for (let z = -50; z < 300; z += 40) {  // CHANGED: from 25 to 40
            // Left side of road
            this.createStreetLamp(-9.5, z);
            
            // Right side of road
            this.createStreetLamp(9.5, z);
	}
    }

    createPlayerCarLights() {
	// Headlight 1 (left)
	const headlight1 = new THREE.SpotLight(0xffffee, 1.5, 30, Math.PI / 6, 0.5);
	headlight1.position.set(-0.7, 1, 2);
	headlight1.target.position.set(-0.7, 0, 10);
	this.playerCar.add(headlight1);
	this.playerCar.add(headlight1.target);
	
	// Create gradient texture with MORE distance fading
	const canvas = document.createElement('canvas');
	canvas.width = 512;
	canvas.height = 512;
	const context = canvas.getContext('2d');
	
	// Create radial gradient with MORE fade stops
	const gradient = context.createRadialGradient(256, 512, 0, 256, 300, 450);
	gradient.addColorStop(0, 'rgba(255, 255, 230, 0)');    // REDUCED: from 0.9 to 0.5 at car
	gradient.addColorStop(0.2, 'rgba(255, 255, 220, 0.1)'); // REDUCED: from 0.6 to 0.35
	gradient.addColorStop(0.4, 'rgba(255, 255, 200, 0.3)');  // REDUCED: from 0.3 to 0.2
	gradient.addColorStop(0.6, 'rgba(255, 255, 180, 0.5)');  // More gradual fade
	gradient.addColorStop(0.8, 'rgba(255, 255, 160, 0.75)'); // Almost gone
	gradient.addColorStop(1, 'rgba(255, 255, 150, 1)');      // Fully transparent
	
	context.fillStyle = gradient;
	context.fillRect(0, 0, 512, 512);
	
	const texture = new THREE.CanvasTexture(canvas);
	
	// Create SMALLER semi-circular fan shape - Left headlight
	const segments = 32;
	const radius = 12;  // REDUCED: from 18 to 12
	const angle = Math.PI * 0.2;  // REDUCED: from 0.7 (126°) to 0.5 (90°)
	
	const vertices1 = [];
	const uvs1 = [];
	const indices1 = [];
	
	// Center point (at car)
	vertices1.push(0, 0, 0);
	uvs1.push(0.5, 1.0);
	
	// Create arc vertices
	for (let i = 0; i <= segments; i++) {
            const theta = -angle / 2 + (angle / segments) * i;
            const x = Math.sin(theta) * radius;
            const z = Math.cos(theta) * radius;
            
            vertices1.push(x, 0, z);
            
            // UV coordinates for arc
            const u = 0.5 + Math.sin(theta) * 0.5;
            const v = 0.5 - Math.cos(theta) * 0.5;
            uvs1.push(u, v);
	}
	
	// Create triangle fan indices
	for (let i = 0; i < segments; i++) {
            indices1.push(0, i + 1, i + 2);
	}
	
	const beamGeometry1 = new THREE.BufferGeometry();
	beamGeometry1.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices1), 3));
	beamGeometry1.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs1), 2));
	beamGeometry1.setIndex(indices1);
	beamGeometry1.computeVertexNormals();
	
	const beamMaterial1 = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            opacity: 0.4,  // REDUCED: from 1 to 0.8
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
	});
	
	const beam1 = new THREE.Mesh(beamGeometry1, beamMaterial1);
	beam1.position.set(0, 0.1, 2);
	this.playerCar.add(beam1);
	
    }
    
    createPoliceCar(x, z) {
	const carGroup = new THREE.Group();
	
	// Police car body (black & white)
	const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
	const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
	const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
	body.position.y = 0.5;
	body.castShadow = true;
	carGroup.add(body);
	
	// White stripe
	const stripeGeometry = new THREE.BoxGeometry(2.1, 0.5, 1.5);
	const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
	const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
	stripe.position.y = 0.5;
	carGroup.add(stripe);
	
	// Red/Blue lights
	const lightGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.3);
	const redLight = new THREE.Mesh(lightGeometry, new THREE.MeshLambertMaterial({ color: 0xff0000 }));
	redLight.position.set(-0.5, 1.2, 1.5);
	const blueLight = new THREE.Mesh(lightGeometry, new THREE.MeshLambertMaterial({ color: 0x0000ff }));
	blueLight.position.set(0.5, 1.2, 1.5);
	carGroup.add(redLight);
	carGroup.add(blueLight);
	
	carGroup.position.set(x, 0, z);
	this.scene.add(carGroup);
	this.policeCars.push({ mesh: carGroup, initialZ: z });
    }

    createHouse(x, z) {
        const houseGroup = new THREE.Group();
        
        // House body
        const bodyGeometry = new THREE.BoxGeometry(4, 3, 4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xd2b48c });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        houseGroup.add(body);
        
        // Roof
        const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 3.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        houseGroup.add(roof);
        
        houseGroup.position.set(x, 0, z);
        this.scene.add(houseGroup);
        this.scenery.push({ mesh: houseGroup, type: 'house', initialZ: z });
    }

    createNightSky() {
	// Change sky to dark blue/black
	this.scene.background = new THREE.Color(0x000011); //0x0a0a1a
	this.scene.fog = new THREE.Fog(0x000011, 1, 2);  // CHANGED: Thicker fog, darker color, closer range
	
	// Create starfield - REDUCED
	const starGeometry = new THREE.BufferGeometry();
	const starCount = 300;
	const positions = new Float32Array(starCount * 3);
	
	for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 200;
            positions[i + 1] = 30 + Math.random() * 70;
            positions[i + 2] = (Math.random() - 0.5) * 200;
	}
	
	starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	
	const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.8
	});
	
	const stars = new THREE.Points(starGeometry, starMaterial);
	this.scene.add(stars);
	this.stars = stars;
	
	this.createMoon();
    }

    createMoon() {
	const moonGeometry = new THREE.SphereGeometry(3, 16, 16);
	const moonMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffcc,
            emissive: 0xffffaa,
            emissiveIntensity: 0.3
	});
	const moon = new THREE.Mesh(moonGeometry, moonMaterial);
	moon.position.set(40, 50, 100);
	this.scene.add(moon);
	this.moon = moon;
    }
    
    spawnScenery() {
	// Define zones where bridges and intersections will be
	// const bridgeZones = [
        //     { start: 170, end: 190 },
        //     { start: 440, end: 460 }
	// ];
	
	const intersectionZones = [
            { start: 110, end: 130 },
            { start: 370, end: 390 }
	];
	
	// Helper function to check if z position conflicts with special zones
	const isInRestrictedZone = (z) => {
            // Check bridges
            // for (let bridge of bridgeZones) {
	    // 	if (z >= bridge.start && z <= bridge.end) return true;
            // }
            // Check intersections
            for (let intersection of intersectionZones) {
		if (z >= intersection.start && z <= intersection.end) return true;
            }
            // Check original island intersection
            if (Math.abs(z - 100) < 15) return true;
            
            return false;
	};
	
	// Trees and bushes along the road - with zone checking
	for (let z = -50; z < 300; z += 12) {
            if (!isInRestrictedZone(z)) {  // ADDED CHECK
		if (Math.random() > 0.4) {
                    this.createTree(-10 - Math.random() * 5, z);
		} else {
                    this.createBush(-10 - Math.random() * 3, z);
		}
		
		if (Math.random() > 0.4) {
                    this.createTree(10 + Math.random() * 5, z);
		} else {
                    this.createBush(10 + Math.random() * 3, z);
		}
            }
	}
	
	// Additional bushes near road edge - with zone checking
	for (let z = -50; z < 300; z += 15) {
            if (!isInRestrictedZone(z)) {  // ADDED CHECK
		if (Math.random() > 0.5) {
                    this.createBush(-11 - Math.random() * 2, z);
		}
		if (Math.random() > 0.5) {
                    this.createBush(11 + Math.random() * 2, z);
		}
            }
	}
	
	// Background trees - with zone checking
	for (let z = -50; z < 300; z += 25) {
            if (!isInRestrictedZone(z)) {  // ADDED CHECK
		if (Math.random() > 0.6) {
                    this.createTree(-20 - Math.random() * 10, z);
		}
		if (Math.random() > 0.6) {
                    this.createTree(20 + Math.random() * 10, z);
		}
            }
	}
	
	// Dense bush clusters in far background - with zone checking
	for (let z = -50; z < 300; z += 20) {
            if (!isInRestrictedZone(z)) {  // ADDED CHECK
		if (Math.random() > 0.5) {
                    this.createBush(-18 - Math.random() * 8, z);
		}
		if (Math.random() > 0.5) {
                    this.createBush(18 + Math.random() * 8, z);
		}
            }
	}
	
	// Scattered tree groups - with zone checking
	for (let z = 0; z < 300; z += 50) {
            if (!isInRestrictedZone(z)) {  // ADDED CHECK
		const clusterX = (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 10);
		for (let i = 0; i < 2; i++) {
                    this.createTree(
			clusterX + (Math.random() - 0.5) * 5,
			z + (Math.random() - 0.5) * 10
                    );
		}
            }
	}
	
	// Add highway bridges occasionally
	this.createHighwayBridge(180);
	this.createHighwayBridge(450);  // Will loop back
	
	// Add live traffic intersections
	this.createLiveIntersection(120);
	this.createLiveIntersection(380);  // Will loop back
	
	// Houses - manually placed to avoid zones
	const housePositions = [
            { x: -15, z: 30 },
            { x: 15, z: 60 },
            { x: -18, z: 220 },
            { x: 20, z: 250 },
            { x: -22, z: 280 }
	];
	
	housePositions.forEach(pos => {
            if (!isInRestrictedZone(pos.z)) {
		this.createHouse(pos.x, pos.z);
            }
	});
	
	// Colored houses - manually placed
	const coloredHousePositions = [
            { x: -20, z: 150, color: 0xc9a86a },
            { x: 17, z: 200, color: 0xe8d4b0 },
            { x: -19, z: 270, color: 0xb89968 }
	];
	
	coloredHousePositions.forEach(pos => {
            if (!isInRestrictedZone(pos.z)) {
		this.createColoredHouse(pos.x, pos.z, pos.color);
            }
	});
	
	// Police cars - avoid zones
	const policePositions = [
            { x: -12, z: 80 },
            { x: 12, z: 240 }
	];
	
	policePositions.forEach(pos => {
            if (!isInRestrictedZone(pos.z)) {
		this.createPoliceCar(pos.x, pos.z);
            }
	});
    }

    createColoredHouse(x, z, color) {
	const houseGroup = new THREE.Group();
	
	// House body with custom color
	const bodyGeometry = new THREE.BoxGeometry(4, 3, 4);
	const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
	const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
	body.position.y = 1.5;
	body.castShadow = true;
	houseGroup.add(body);
	
	// Roof
	const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
	const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
	const roof = new THREE.Mesh(roofGeometry, roofMaterial);
	roof.position.y = 3.5;
	roof.rotation.y = Math.PI / 4;
	roof.castShadow = true;
	houseGroup.add(roof);
	
	// Door
	const doorGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.1);
	const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x4a2511 });
	const door = new THREE.Mesh(doorGeometry, doorMaterial);
	door.position.set(0, 0.75, 2.05);
	houseGroup.add(door);
	
	// Windows
	const windowGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.1);
	const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb });
	
	const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
	window1.position.set(-1, 1.8, 2.05);
	houseGroup.add(window1);
	
	const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
	window2.position.set(1, 1.8, 2.05);
	houseGroup.add(window2);
	
	houseGroup.position.set(x, 0, z);
	this.scene.add(houseGroup);
	this.scenery.push({ mesh: houseGroup, type: 'house', initialZ: z });
    }

    createClouds() {
	const cloudGroup = new THREE.Group();
	
	// Create 20 clouds scattered in the sky
	for (let i = 0; i < 20; i++) {
            const cloud = this.createSingleCloud();
            
            // Random position in sky
            cloud.position.set(
		-50 + Math.random() * 100,  // Spread across width
		20 + Math.random() * 30,     // Height in sky (20-50 units up)
		-100 + Math.random() * 400   // Spread along road
            );
            
            // Random rotation
            cloud.rotation.y = Math.random() * Math.PI * 2;
            
            // CHANGED: Make clouds bigger with larger scale
            const scale = 2 + Math.random() * 2;  // Scale from 2 to 4 (was 0.8 to 1.4)
            cloud.scale.set(scale, scale, scale);
            
            this.scene.add(cloud);
            this.scenery.push({ mesh: cloud, type: 'cloud' });
	}
    }

    createSingleCloud() {
	const cloudGroup = new THREE.Group();
	const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            // transparent: true,
            opacity: 0.8
	});
	
	// Create fluffy cloud with multiple spheres - BIGGER SPHERES
	const spherePositions = [
            [0, 0, 0, 2.5],       // Center, larger (was 1.2)
            [-2, 0.4, 1, 1.8],    // Left (was -1, 0.2, 0.5, 0.8)
            [2, 0.2, -0.6, 2],    // Right (was 1, 0.1, -0.3, 0.9)
            [0.6, 1, 0, 1.5],     // Top (was 0.3, 0.5, 0, 0.7)
            [-1, -0.4, -1, 1.3]   // Bottom (was -0.5, -0.2, -0.5, 0.6)
	];
	
	spherePositions.forEach(pos => {
            const geometry = new THREE.SphereGeometry(pos[3], 8, 8);
            const sphere = new THREE.Mesh(geometry, cloudMaterial);
            sphere.position.set(pos[0], pos[1], pos[2]);
            cloudGroup.add(sphere);
	});
	
	return cloudGroup;
    }
    
    spawnTraffic() {
	// Spawn traffic in both left lanes (for left-hand driving)
	for (let i = 0; i < 5; i++) {
            // Inner left lane
            this.createTrafficCar(50 + i * 40, -2.25);  // Change from 2.25 to -2.25
            // Outer left lane
            this.createTrafficCar(70 + i * 40, -6.75);  // Change from 6.75 to -6.75
	}
    }
    
    createTrafficCar(z, laneX) {
	const carGroup = new THREE.Group();
	
	// Car body
	const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
	const colors = [0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff];
	const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)],
	    metalness: 0.5,
	    roughness: 0.3,
	});
	const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
	body.position.y = 0.5;
	body.castShadow = true;
	carGroup.add(body);
	
	// Car roof
	const roofGeometry = new THREE.BoxGeometry(1.6, 0.8, 2);
	const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
	roof.position.y = 1.4;
	roof.position.z = -0.3;
	roof.castShadow = true;
	carGroup.add(roof);

	const headlightGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 2,
        });
        const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight1.position.set(-0.8, 0.8, -1.9);
        carGroup.add(headlight1);

        const headlight2 = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight2.position.set(0.8, 0.8, -1.9);
        carGroup.add(headlight2);

	// Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        
        const wheelPositions = [
            [-1.1, 0.4, 1.3],
            [1.1, 0.4, 1.3],
            [-1.1, 0.4, -1.3],
            [1.1, 0.4, -1.3]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            wheel.castShadow = true;
            carGroup.add(wheel);
        });
	
	carGroup.position.set(laneX, 0, z);  // Use laneX parameter instead of this.trafficLane
	this.scene.add(carGroup);
	this.traffic.push({ mesh: carGroup, speed: 0.5 + Math.random() * 0.3, lane: laneX });
    }
    
    handleInput() {
	if (this.gameOver) return;
	
	// Rewind mechanic - Hold space or up arrow to rewind
	// Can rewind when power is below 50% or when not moving
	if (this.keys[' '] || this.keys['arrowup'] || this.keys['w']) {
            if (!this.isMoving || this.rewindPower < 90) {  // CHANGED: Allow rewind below 50%
		this.isRewinding = true;
		this.rewindPower = Math.min(this.rewindPower + this.rewindChargeRate, this.maxRewindPower);
		
		// If we're rewinding while moving, stop the car first
		// if (this.isMoving && this.rewindPower < 80) {
                //     this.isMoving = false;
                //     this.speed = 0;
                //     this.rewindTimer = 0;
		// }
            }
	} else {
            // Release - launch the car!
            if (this.isRewinding && this.rewindPower > 0) {
		this.isMoving = true;
		this.rewindTimer = this.rewindDuration;
		this.speed = this.maxSpeed * (this.rewindPower / this.maxRewindPower);
            }
            this.isRewinding = false;
	}
	
	// Braking
	if ((this.keys['arrowdown'] || this.keys['s']) && this.isMoving) {
            this.speed = Math.max(this.speed - this.deceleration * 2, 0);
            
            // Update rewind power based on remaining speed
            const speedRatio = this.speed / this.maxSpeed;
            this.rewindPower = this.maxRewindPower * speedRatio;
            
            // Stop moving if speed reaches 0
            if (this.speed === 0) {
		this.isMoving = false;
		this.rewindPower = 0;
		this.rewindTimer = 0;
            }
	}
	
	// If car is moving, gradually slow down
	if (this.isMoving && !(this.keys['arrowdown'] || this.keys['s'])) {
            this.rewindTimer -= 16.67; // Approximately 1 frame at 60fps
            
            if (this.rewindTimer <= 0) {
		this.isMoving = false;
		this.rewindPower = 0;
		this.speed = 0;
            } else {
		// Gradually decrease speed over the duration
		const timeRatio = this.rewindTimer / this.rewindDuration;
		this.speed = this.maxSpeed * timeRatio * (this.rewindPower / this.maxRewindPower);
		
		// Gradually decrease rewind power as car slows down
		this.rewindPower = this.maxRewindPower * timeRatio;
            }
	}
	
	// Steering (works anytime)
	if (this.keys['arrowleft'] || this.keys['a']) {
            this.lateralSpeed = Math.min(this.lateralSpeed + 0.005, this.maxLateralSpeed);
	} else if (this.keys['arrowright'] || this.keys['d']) {
            this.lateralSpeed = Math.max(this.lateralSpeed - 0.005, -this.maxLateralSpeed);
	} else {
            this.lateralSpeed *= 0.9; // Friction
	}
	
	// Apply lateral movement
	this.playerCar.position.x += this.lateralSpeed;
	
	// Constrain to road
	this.playerCar.position.x = Math.max(-8, Math.min(8, this.playerCar.position.x));
    }
    
    update() {
	if (this.gameOver) return;
	
	this.handleInput();
	
	// Update distance
	this.distance += this.speed;
	
	// Move world towards player
	const worldSpeed = this.speed;

	if (this.scene.fog) {
            this.scene.fog.near = 30 + Math.sin(Date.now() * 0.0005) * 5;
            this.scene.fog.far = 120 + Math.sin(Date.now() * 0.0003) * 10;
	}
	
	// Update road segments
	this.roadSegments.forEach(segment => {
            segment.position.z -= worldSpeed;
            if (segment.position.z < -500) {
		segment.position.z += 1500;
            }
	});
	
	// Update road dividers
	this.roadDividers.forEach(divider => {
            divider.position.z -= worldSpeed;
            if (divider.position.z < -500) {
		divider.position.z += 1500;
            }
	});
	
	// Update scenery
	this.scenery.forEach(item => {
            item.mesh.position.z -= worldSpeed;
            if (item.mesh.position.z < -50) {
		item.mesh.position.z += 350;
            }
	});
	
	// Update traffic
	this.traffic.forEach(car => {
            car.mesh.position.z -= worldSpeed + car.speed;
            
            if (car.mesh.position.z < -30) {
		car.mesh.position.z = 250;
		car.mesh.position.x = car.lane;
            }
            
            const dx = this.playerCar.position.x - car.mesh.position.x;
            const dz = this.playerCar.position.z - car.mesh.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < 3) {
		this.endGame();
            }
	});
	
	// Update police cars
	this.policeCars.forEach(police => {
            police.mesh.position.z -= worldSpeed;
            if (police.mesh.position.z < -50) {
		police.mesh.position.z += 350;
            }
	});
	
	// Update camera
	this.camera.position.x = this.playerCar.position.x;
	this.camera.position.z = this.playerCar.position.z - 12;
	this.camera.lookAt(this.playerCar.position.x, 0, this.playerCar.position.z + 10);
	
	// Update UI
	document.getElementById('speed').textContent = `Speed: ${Math.round(this.speed * 50)} km/h`;
	document.getElementById('distance').textContent = `Distance: ${Math.round(this.distance)} m`;
	document.getElementById('rewind-power').textContent = Math.round(this.rewindPower);
	document.getElementById('rewind-bar-fill').style.width = this.rewindPower + '%';
	
	// UPDATE: Add visual feedback for rewind availability
	const rewindBarContainer = document.getElementById('rewind-bar-container');
	if (!this.isMoving || this.rewindPower < 90) {
            // Can rewind - green glowing border
            rewindBarContainer.classList.add('can-rewind');
            rewindBarContainer.classList.remove('cannot-rewind');
	} else {
            // Cannot rewind - red border
            rewindBarContainer.classList.add('cannot-rewind');
            rewindBarContainer.classList.remove('can-rewind');
	}
	if (this.stars) {
            this.stars.material.opacity = 0.6 + Math.sin(Date.now() * 0.001) * 0.2;
	}
	// Update crossing traffic (cars moving left-right)
	this.crossingTraffic.forEach(car => {
            // Move car from left to right
            car.mesh.position.x += car.speed;
            
            // Move with world
            car.mesh.position.z -= worldSpeed;
            
            // Reset when car goes off screen right
            if (car.mesh.position.x > 50) {
		car.mesh.position.x = -40;
            }
            
            // Respawn when goes behind player
            if (car.mesh.position.z < -50) {
		car.mesh.position.z += 350;
            }
            
            // Collision detection with player
            const dx = this.playerCar.position.x - car.mesh.position.x;
            const dz = this.playerCar.position.z - car.mesh.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < 3) {
		this.endGame();
            }
	});
    }
    
    endGame() {
        this.gameOver = true;
        document.getElementById('final-distance').textContent = Math.round(this.distance);
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    restart() {
        window.location.reload();
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        this.update();
        this.render();
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Start the game
const game = new CarGame();
