export class UI {
    constructor() {
        this.speedElement = document.getElementById('speed');
        this.distanceElement = document.getElementById('distance');
        this.rewindPowerElement = document.getElementById('rewind-power');
        this.rewindBarFillElement = document.getElementById('rewind-bar-fill');
        this.rewindBarContainer = document.getElementById('rewind-bar-container');
    }
    
    update(speed, distance, rewindPower) {
        // Update speed display
        this.speedElement.textContent = `Speed: ${Math.round(speed * 50)} km/h`;
        
        // Update distance display
        this.distanceElement.textContent = `Distance: ${Math.round(distance)} m`;
        
        // Update rewind power display
        this.rewindPowerElement.textContent = Math.round(rewindPower);
        this.rewindBarFillElement.style.width = rewindPower + '%';
        
        // Update rewind bar indicator
        if (rewindPower < 50) {
            this.rewindBarContainer.classList.add('can-rewind');
            this.rewindBarContainer.classList.remove('cannot-rewind');
        } else {
            this.rewindBarContainer.classList.add('cannot-rewind');
            this.rewindBarContainer.classList.remove('can-rewind');
        }
    }
    
    showGameOver(distance) {
        document.getElementById('final-distance').textContent = Math.round(distance);
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    showNotification(text, duration = 3000) {
        const notification = document.createElement('div');
        notification.textContent = text;
        notification.className = 'notification';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), duration);
    }
}
