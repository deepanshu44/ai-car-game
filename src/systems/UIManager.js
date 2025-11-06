import { VehicleMetrics } from './VehicleMetrics.js'
import { GameConfig } from '../config/GameConfig.js'

export class UIManager {
    constructor() {
        this.elements = {
            parked: document.getElementById('parked'),
            speed: document.getElementById('speed'),
            distance: document.getElementById('distance'),
            abstractL: document.querySelectorAll('.left>#abstract'),
            abstractR: document.querySelectorAll('.right>#abstract'),
            battery: document.getElementById('battery'),
            rewindPower: document.getElementById('rewind-power'),
            rewindBarFill: document.getElementById('rewind-bar-fill'),
            rewindBarContainer: document.getElementById('rewind-bar-container'),
            fps: document.getElementById('fps'),
            gameOver: document.getElementById('game-over'),
            finalDistance: document.getElementById('final-distance')
        };
        this.fpsCounter = { count: 0, lastTime: performance.now(), fps: 0 };
    }
    
    updateSpeed(speed) {
	const percOfMaxSpeed = speed/GameConfig.physics.maxSpeed*100;
	const abstractL = this.elements.abstractL
	const abstractR = this.elements.abstractR
	const len = abstractL.length
	if (speed === 0) {
	    // Set all elements to "#0000ff7d" by default
	    abstractR.forEach((element) => {
		element.style.backgroundColor = "#0000ff7d";
	    });
	    abstractL.forEach((element) => {
		element.style.backgroundColor = "#0000ff7d";
	    });
	}
	// #0000ff7d
	if (percOfMaxSpeed > 0 && percOfMaxSpeed <= 35) {
	    abstractR[0].style.backgroundColor = "blue";
	    abstractL[len - 1].style.backgroundColor = "blue";

	    // Set remaining elements to "#0000ff7d"
	    abstractR[1].style.backgroundColor = "#0000ff7d";
	    abstractR[2].style.backgroundColor = "#0000ff7d";
	    abstractL[len - 2].style.backgroundColor = "#0000ff7d";
	    abstractL[len - 3].style.backgroundColor = "#0000ff7d";
	    abstractR[3].style.backgroundColor = "#0000ff7d";
	    abstractL[len - 4].style.backgroundColor = "#0000ff7d";

	} else if (percOfMaxSpeed > 35 && percOfMaxSpeed <= 62) {
	    abstractR[0].style.backgroundColor = "blue";
	    abstractL[len - 2].style.backgroundColor = "blue";
	    abstractR[1].style.backgroundColor = "blue";
	    abstractL[len - 1].style.backgroundColor = "blue";

	    abstractR[2].style.backgroundColor = "#0000ff7d";
	    abstractL[len - 3].style.backgroundColor = "#0000ff7d";
	    abstractR[3].style.backgroundColor = "#0000ff7d";
	    abstractL[len - 4].style.backgroundColor = "#0000ff7d";

	} else if (percOfMaxSpeed > 59 && percOfMaxSpeed <= 95) {
	    abstractR[2].style.backgroundColor = "blue";
	    abstractL[len - 3].style.backgroundColor = "blue";
	    abstractR[0].style.backgroundColor = "blue";
	    abstractR[1].style.backgroundColor = "blue";
	    abstractL[len - 1].style.backgroundColor = "blue";
	    abstractL[len - 2].style.backgroundColor = "blue";
	    abstractR[3].style.backgroundColor = "#0000ff7d";
	    abstractL[len - 4].style.backgroundColor = "#0000ff7d";
	} else if (percOfMaxSpeed >= 95) {
	    abstractR[2].style.backgroundColor = "blue";
	    abstractL[len - 3].style.backgroundColor = "blue";
	    abstractR[0].style.backgroundColor = "blue";
	    abstractR[1].style.backgroundColor = "blue";
	    abstractL[len - 1].style.backgroundColor = "blue";
	    abstractL[len - 2].style.backgroundColor = "blue";
	    abstractR[3].style.backgroundColor = "blue";
	    abstractL[len - 4].style.backgroundColor = "blue";
	}
        this.elements.speed.children[0].textContent = `${Math.round(speed * 80)}`;

    }
    
    updateDistance(distance) {
        this.elements.distance.textContent = `${Math.round(distance)} m`;
    }

    updateParked(speed) {
	if (speed>0) {
	    this.elements.parked.style.color = `#505050`;
	} else {
	    this.elements.parked.style.color = `red`;
	}
    }

    updateBattery() {
	if (!this.elements.battery.children[0].style.width) {
	    this.elements.battery.children[0].style.width = this.elements.battery.children[0].offsetWidth+"px"
	}
	setTimeout(() => {
	    // |||||||||
	    this.elements.battery.children[0].innerHTML = "|||||"
	}, 2000)
    }
    
    updateRewindPower(power, canRewind) {
        this.elements.rewindPower.textContent = Math.round(power);
        this.elements.rewindBarFill.style.width = power + '%';
        
        if (canRewind) {
            this.elements.rewindBarContainer.classList.add('can-rewind');
            this.elements.rewindBarContainer.classList.remove('cannot-rewind');
        } else {
            this.elements.rewindBarContainer.classList.add('cannot-rewind');
            this.elements.rewindBarContainer.classList.remove('can-rewind');
        }
    }
    
    updateFPS() {
        this.fpsCounter.count++;
        const now = performance.now();
        
        if (now >= this.fpsCounter.lastTime + 1000) {
            this.fpsCounter.fps = this.fpsCounter.count;
            this.fpsCounter.count = 0;
            this.fpsCounter.lastTime = now;
            this.elements.fps.textContent = `FPS: ${this.fpsCounter.fps}`;
        }
    }
    
    showGameOver(distance) {
        this.elements.finalDistance.textContent = Math.round(distance)/1000;
        this.elements.gameOver.classList.remove('hidden');
	let shadowStyles = [ "peru","navy","purple"]
	let textShadowStyles = ["2px 1px","-2px 1px", "-2px -1px","2px -1px"]

	setInterval(() => {
	    document.getElementById("restart").style.boxShadow = `3px 3px 0px ${shadowStyles[0]},5px 5px 0px ${shadowStyles[1]}, 7px 7px 0px ${shadowStyles[2]}`;
	    shadowStyles.push(shadowStyles.shift())
	    document.querySelector("#game-over>h1").style.textShadow = `${textShadowStyles[0]} rgba(255, 68, 68, 0.5)`
	    textShadowStyles.push(textShadowStyles.shift())
	    // text-shadow: 2px 2px rgba(255, 68, 68, 0.5);
	}, 100)
	
    }
    
    flashSpeedIndicator(color = '#ff0000', duration = 500) {
        this.elements.speed.style.color = color;
        setTimeout(() => {
            this.elements.speed.style.color = 'white';
        }, duration);
    }
    
    showNotification(text, duration = 4000) {
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
        setTimeout(() => notification.remove(), duration);
    }
}
