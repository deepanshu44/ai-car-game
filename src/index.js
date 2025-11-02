import { Game } from './core/Game.js';

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Expose game instance for debugging
    window.game = game;
});
