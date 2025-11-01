import { Game } from './core/Game.js';
import { GameConfig } from './config/GameConfig.js';

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game(GameConfig);
    game.init();
    game.start();
});
