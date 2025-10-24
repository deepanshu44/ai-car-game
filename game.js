// game.js
class CarGame {
    constructor() {
	this.scene = null;
	this.camera = null;
	this.renderer = null;
	this.playerCar = null;
	this.policeCars = [];
	this.traffic = [];
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
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        
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
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Create game elements
        this.createRoad();
	this.createRoadDivider();
        this.createPlayerCar();
        this.createIntersection();
        this.spawnScenery();
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
            road.receiveShadow = true;
            this.scene.add(road);
            this.roadSegments.push(road);
	}
	
	// Lane markers
	this.createLaneMarkers();
	
	// Grass on sides
	const grassGeometry = new THREE.PlaneGeometry(50, 500);
	const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x3a7d44 });
	
	const grassLeft = new THREE.Mesh(grassGeometry, grassMaterial);
	grassLeft.rotation.x = -Math.PI / 2;
	grassLeft.position.x = -34;  // Change from -32.5 to -34
	grassLeft.receiveShadow = true;
	this.scene.add(grassLeft);
	
	const grassRight = new THREE.Mesh(grassGeometry, grassMaterial);
	grassRight.rotation.x = -Math.PI / 2;
	grassRight.position.x = 34;  // Change from 32.5 to 34
	grassRight.receiveShadow = true;
	this.scene.add(grassRight);
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
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
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
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a2511 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Foliage
        const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 3.5;
        foliage.castShadow = true;
        treeGroup.add(foliage);
        
        treeGroup.position.set(x, 0, z);
        this.scene.add(treeGroup);
        this.scenery.push({ mesh: treeGroup, type: 'tree', initialZ: z });
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
    
    spawnScenery() {
	// Trees along the road
	for (let z = -50; z < 300; z += 2) {
            if (Math.abs(z - 100) > 15) {
		const side = Math.random() > 0.5 ? 1 : -1;
		this.createTree(side * (10 + Math.random() * 5), z);
            }
	}
	
	// Houses
	this.createHouse(-15, 30);
	this.createHouse(15, 150);
	this.createHouse(-18, 220);
	
	// Police cars on roadside (stationary)
	this.createPoliceCar(-12, 80);
	this.createPoliceCar(12, 180);
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
            color: colors[Math.floor(Math.random() * colors.length)] 
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
