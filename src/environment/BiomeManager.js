import * as THREE from 'three';
import { BiomeTypes } from '../utils/Constants.js';
import { CityBiome } from './biomes/CityBiome.js';
import { FarmlandBiome } from './biomes/FarmlandBiome.js';
import { GameConfig } from '../config/GameConfig.js';
import { MountainTunnel } from './MountainTunnel.js';

export class BiomeManager {
    constructor(scene) {
        this.scene = scene;
        this.currentBiome = BiomeTypes.CITY;
        this.targetBiome = BiomeTypes.CITY;
        this.nextBiomeSwitch = GameConfig.biome.transitionDistance;
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionStartDistance = 0;
	this.tunnelCreated = false
	this.distanceToSwitch = {dist:NaN}
        
        this.cityBiome = new CityBiome(scene,this.distanceToSwitch);
        this.farmlandBiome = new FarmlandBiome(scene,this.distanceToSwitch);
	this.createTunnel()
        // Start with city biome visible
        this.farmlandBiome.hide();
    }
    
    update(distance, worldSpeed) {
        // Check if we should start a transition
        if (!this.isTransitioning && 
            distance >= this.nextBiomeSwitch - GameConfig.biome.transitionZoneLength) {
            this.isTransitioning = true;
            this.transitionStartDistance = distance;
            this.transitionProgress = 0;
            this.targetBiome = this.currentBiome === BiomeTypes.CITY 
                ? BiomeTypes.FARMLAND 
                : BiomeTypes.CITY;
            
            this.showNotification(`APPROACHING ${this.targetBiome.toUpperCase()}`);
        }
        
        // Update transition progress
        if (this.isTransitioning) {
            const distanceInTransition = distance - this.transitionStartDistance;
            this.transitionProgress = Math.min(
                distanceInTransition / GameConfig.biome.transitionZoneLength,
                1
            );
            
            // this.applyTransition(this.transitionProgress);
            if (this.transitionProgress >= 1) {
		this.switchBiome()
                this.isTransitioning = false;
                this.currentBiome = this.targetBiome;
                this.nextBiomeSwitch += GameConfig.biome.transitionDistance;
            }
        }
	
	// Normal biome transition logic
        const distanceToSwitch = this.nextBiomeSwitch - distance;
	this.distanceToSwitch.dist = distanceToSwitch
	// console.log("updated",this.distanceToSwitch)

        // Create tunnel 200 units before switch
        // if (distanceToSwitch < 200 && distanceToSwitch > 195) {
        if (distanceToSwitch < 300 && distanceToSwitch > 295) {
            if (!this.tunnelCreated) {
		this.createTunnel();
                // this.createTransitionZone(this.nextBiomeSwitch);
                this.tunnelCreated = true;
		this.tunnel.hidden = false
            }
        }
	// Update tunnel if exists
        if (!this.tunnel.hidden) {
            this.tunnel.update(worldSpeed);
            
            // Check if player is inside tunnel
            this.inTunnel = this.tunnel.isPlayerInside(distance);
            
            // if (this.inTunnel) {
            //     // Switch biome at tunnel center
            //     if (this.tunnel.shouldSwitchBiome(distance)) {
            //         this.switchBiome();
            //         this.tunnel.markBiomeSwitched();
            //     }
            // }
            
            // Remove tunnel when far behind
            if (this.tunnel.shouldRespawn()) {
                // this.scene.remove(this.tunnel.mesh);
                // this.tunnel.dispose();
		// this.tunnel.hide()
                this.tunnelCreated = false;
                this.nextBiomeSwitch += this.biomeTransitionDistance;
            }
        }
        
        // Update active biome
	// FIXME: both biomes updated in eitherbiomes,
	// try saving save some fps by doing it once per biome
        this.farmlandBiome.update(worldSpeed);
	this.cityBiome.update(worldSpeed);
        // if (this.currentBiome === BiomeTypes.FARMLAND) {
        //     this.farmlandBiome.update(worldSpeed);
        // } else {
	//     this.cityBiome.update(worldSpeed)
	// }
    }

    createTunnel() {
        // this.tunnel = new MountainTunnel(this.nextBiomeSwitch);
        this.tunnel = new MountainTunnel(this.nextBiomeSwitch);
	// console.log("this.nextBiomeSwitch = ", this.nextBiomeSwitch);
        this.scene.add(this.tunnel.mesh);
        this.tunnelCreated = true;
        
        // console.log('Tunnel created at z:', this.nextBiomeSwitch);
    }
    
    // applyTunnelLighting(lighting) {
    //     // Find ambient light in scene
    //     this.scene.traverse(child => {
    //         if (child instanceof THREE.AmbientLight) {
    //             child.intensity = lighting.ambientIntensity;
    //         }
    //     });
    
    //     // Update sky color
    //     this.scene.background = new THREE.Color(lighting.skyColor);
    
    //     // Update fog
    //     if (this.scene.fog) {
    //         this.scene.fog.color = new THREE.Color(lighting.skyColor);
    //         this.scene.fog.far = lighting.fogFar;
    //     }
    // }

    switchBiome() {
	console.log("this.currentBiome = ", this.currentBiome);
        if (this.currentBiome === 'city') {
            this.currentBiome = 'farmland';
            this.cityBiome.hide();
            this.farmlandBiome.show();
            this.showNotification('ENTERING FARMLAND');
        } else {
            this.cityBiome.show();
            this.currentBiome = 'city';
            this.farmlandBiome.hide();
            this.cityBiome.show();
            this.showNotification('ENTERING CITY');
        }
    }

    applyTransition(progress) {
        const eased = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        if (this.targetBiome === BiomeTypes.FARMLAND) {
            this.cityBiome.fadeOut(eased);
            this.farmlandBiome.fadeIn(eased);
        } else {
            this.farmlandBiome.fadeOut(eased);
            this.cityBiome.fadeIn(eased);
        }
    }
    
    showNotification(text) {
        const notification = document.createElement('div');
        notification.textContent = text;
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '0 0 20px rgba(0,0,0,0.8)',
            zIndex: '100',
            pointerEvents: 'none',
            background: 'rgba(0,0,0,0.5)',
            padding: '15px 30px',
            borderRadius: '10px'
        });
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }
}

