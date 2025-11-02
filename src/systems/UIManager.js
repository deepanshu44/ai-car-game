export class UIManager {
    constructor() {
        this.elements = {
            speed: document.getElementById('speed'),
            distance: document.getElementById('distance'),
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
        this.elements.speed.textContent = `Speed: ${Math.round(speed * 50)} km/h`;
    }
    
    updateDistance(distance) {
        this.elements.distance.textContent = `Distance: ${Math.round(distance)} m`;
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
        this.elements.finalDistance.textContent = Math.round(distance);
        this.elements.gameOver.classList.remove('hidden');
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
