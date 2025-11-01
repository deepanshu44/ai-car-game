# Create main project directory structure
mkdir -p game/src/core
mkdir -p game/src/entities
mkdir -p game/src/systems
mkdir -p game/src/environment
mkdir -p game/src/ui
mkdir -p game/src/utils
mkdir -p game/src/config
mkdir -p game/assets/textures
mkdir -p game/src/environment/biomes
mkdir -p game/assets/sounds

# Move existing files
cp index.html game/
cp style.css game/
cp game.js game/src/

# Core game engine files
touch game/src/core/Game.js
touch game/src/core/Scene.js
touch game/src/core/Camera.js
touch game/src/core/Renderer.js

# Entity files (game objects)
touch game/src/entities/PlayerCar.js
touch game/src/entities/TrafficCar.js
touch game/src/entities/CrossingCar.js
touch game/src/entities/Pothole.js
touch game/src/entities/SpeedBoost.js

# Environment files (scenery)
touch game/src/environment/Road.js
touch game/src/environment/RoadDivider.js
touch game/src/environment/RoadFences.js
touch game/src/environment/StreetLamps.js
touch game/src/environment/Tree.js
touch game/src/environment/Bush.js
touch game/src/environment/House.js
touch game/src/environment/PoliceCar.js
touch game/src/environment/Cloud.js
touch game/src/environment/Bridge.js
touch game/src/environment/Intersection.js

# Biome files
touch game/src/environment/biomes/CityBiome.js
touch game/src/environment/biomes/FarmlandBiome.js
touch game/src/environment/biomes/BiomeManager.js

# System files (game logic)
touch game/src/systems/InputSystem.js
touch game/src/systems/CollisionSystem.js
touch game/src/systems/SpawnSystem.js
touch game/src/systems/LoopSystem.js
touch game/src/systems/LightingSystem.js
touch game/src/systems/BiomeSystem.js

# UI files
touch game/src/ui/UI.js
touch game/src/ui/HUD.js
touch game/src/ui/GameOver.js
touch game/src/ui/Notifications.js

# Utility files
touch game/src/utils/TextureGenerator.js
touch game/src/utils/GeometryHelper.js
touch game/src/utils/MathUtils.js
touch game/src/utils/ColorUtils.js

# Configuration files
touch game/src/config/GameConfig.js
touch game/src/config/BiomeConfig.js
touch game/src/config/VehicleConfig.js

# Main entry point
touch game/src/main.js

# Create GameConfig.js
cat > game/src/config/GameConfig.js << 'EOF'
export const GameConfig = {
    // Game settings
    maxSpeed: 2,
    acceleration: 0.02,
    deceleration: 0.03,
    maxLateralSpeed: 0.1,
    
    // Rewind settings
    rewindChargeRate: 1.5,
    rewindDuration: 15000,
    maxRewindPower: 100,
    rewindThreshold: 50,
    
    // World settings
    laneWidth: 4.5,
    roadWidth: 18,
    sceneryLoopDistance: 350,
    roadLoopDistance: 1500,
    
    // Biome settings
    biomeTransitionDistance: 1000,
    transitionZoneLength: 200,
    
    // Performance settings
    shadowsEnabled: false,
    fogNear: 30,
    fogFar: 120,
    
    // Lane positions
    lanes: {
        playerLeft: 6.75,
        playerRight: 2.25,
        trafficLeft: -2.25,
        trafficRight: -6.75
    }
};
EOF

# Create BiomeConfig.js
cat > game/src/config/BiomeConfig.js << 'EOF'
export const BiomeConfig = {
    city: {
        skyColor: 0x0a0a1a,
        fogColor: 0x0a0a1a,
        ambientLightIntensity: 0.4,
        sceneryTypes: ['tree', 'bush', 'house', 'policeCar'],
        spawnDensity: {
            trees: 12,
            bushes: 15,
            houses: 5
        }
    },
    
    farmland: {
        skyColor: 0x87a96b,
        fogColor: 0x87a96b,
        ambientLightIntensity: 0.6,
        sceneryTypes: ['barn', 'silo', 'windmill', 'crops', 'fence', 'hay'],
        spawnDensity: {
            farms: 2,
            silos: 2,
            windmills: 2,
            cropFields: 7
        }
    }
};
EOF

# Create VehicleConfig.js
cat > game/src/config/VehicleConfig.js << 'EOF'
export const VehicleConfig = {
    player: {
        color: 0xff0000,
        width: 2,
        length: 4,
        height: 1
    },
    
    traffic: {
        colors: [0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff],
        speed: { min: 0.5, max: 0.8 },
        count: 10
    },
    
    crossing: {
        colors: [0xff00ff, 0x00ffff, 0xffa500, 0xff1493, 0x00ff7f],
        speed: { min: 0.4, max: 0.7 },
        count: 5
    }
};
EOF

# Create MathUtils.js
cat > game/src/utils/MathUtils.js << 'EOF'
export class MathUtils {
    static normalizeZ(z, loopDistance = 350) {
        return ((z % loopDistance) + loopDistance) % loopDistance;
    }
    
    static distance2D(x1, z1, x2, z2) {
        const dx = x1 - x2;
        const dz = z1 - z2;
        return Math.sqrt(dx * dx + dz * dz);
    }
    
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}
EOF

# Create ColorUtils.js
cat > game/src/utils/ColorUtils.js << 'EOF'
import * as THREE from 'three';

export class ColorUtils {
    static lerpColors(color1, color2, t) {
        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);
        return c1.lerp(c2, t);
    }
    
    static hexToRGB(hex) {
        return {
            r: ((hex >> 16) & 255) / 255,
            g: ((hex >> 8) & 255) / 255,
            b: (hex & 255) / 255
        };
    }
}
EOF

# Create GeometryHelper.js
cat > game/src/utils/GeometryHelper.js << 'EOF'
import * as THREE from 'three';

export class GeometryHelper {
    static createBox(width, height, depth, color) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({ color });
        return new THREE.Mesh(geometry, material);
    }
    
    static createCylinder(radiusTop, radiusBottom, height, color) {
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 16);
        const material = new THREE.MeshLambertMaterial({ color });
        return new THREE.Mesh(geometry, material);
    }
    
    static createSphere(radius, color, emissive = null) {
        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        const material = new THREE.MeshLambertMaterial({ 
            color,
            emissive: emissive || color,
            emissiveIntensity: emissive ? 1 : 0
        });
        return new THREE.Mesh(geometry, material);
    }
}
EOF

# Create package.json
cat > game/package.json << 'EOF'
{
  "name": "3d-car-driving-game",
  "version": "1.0.0",
  "description": "Hot Wheels style 3D driving game with biomes",
  "type": "module",
  "scripts": {
    "dev": "python3 -m http.server 8000",
    "start": "python3 -m http.server 8000"
  },
  "keywords": ["game", "3d", "threejs", "driving"],
  "author": "",
  "license": "MIT"
}
EOF

# Create main.js template
cat > game/src/main.js << 'EOF'
import { Game } from './core/Game.js';
import { GameConfig } from './config/GameConfig.js';

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game(GameConfig);
    game.init();
    game.start();
});
EOF

# Create Game.js core module
cat > game/src/core/Game.js << 'EOF'
import * as THREE from 'three';
import { Scene } from './Scene.js';
import { Camera } from './Camera.js';
import { Renderer } from './Renderer.js';
import { InputSystem } from '../systems/InputSystem.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { BiomeSystem } from '../systems/BiomeSystem.js';
import { PlayerCar } from '../entities/PlayerCar.js';
import { UI } from '../ui/UI.js';

export class Game {
    constructor(config) {
        this.config = config;
        this.isRunning = false;
        this.gameOver = false;
        
        // Core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Systems
        this.inputSystem = null;
        this.collisionSystem = null;
        this.spawnSystem = null;
        this.biomeSystem = null;
        
        // Entities
        this.player = null;
        
        // UI
        this.ui = null;
        
        // Game state
        this.distance = 0;
        this.speed = 0;
    }
    
    init() {
        // Initialize core components
        this.scene = new Scene(this.config);
        this.camera = new Camera(this.config);
        this.renderer = new Renderer(this.config);
        
        // Initialize systems
        this.inputSystem = new InputSystem();
        this.collisionSystem = new CollisionSystem();
        this.spawnSystem = new SpawnSystem(this.scene, this.config);
        this.biomeSystem = new BiomeSystem(this.scene, this.config);
        
        // Initialize player
        this.player = new PlayerCar(this.config);
        this.scene.add(this.player.mesh);
        
        // Initialize UI
        this.ui = new UI();
        
        // Spawn initial world
        this.spawnSystem.spawnInitialWorld();
        
        console.log('Game initialized successfully!');
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.gameLoop());
        
        this.update();
        this.render();
    }
    
    update() {
        if (this.gameOver) return;
        
        // Update systems
        const input = this.inputSystem.getInput();
        this.player.update(input);
        
        this.distance += this.player.speed * 10;
        this.speed = this.player.speed;
        
        this.biomeSystem.update(this.distance);
        this.spawnSystem.update(this.speed);
        this.collisionSystem.update(this.player, this.spawnSystem.entities);
        
        // Update camera
        this.camera.follow(this.player.mesh);
        
        // Update UI
        this.ui.update(this.speed, this.distance, this.player.rewindPower);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    restart() {
        window.location.reload();
    }
}
EOF
