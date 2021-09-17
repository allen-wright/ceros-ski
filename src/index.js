/**
 * The entry point for the game. Creates the game, kicks off any loading that's needed and then starts the game running.
 */

import '../css/game.css';
import { Game } from './Core/Game.js';

const startButton = document.getElementById('start');
startButton.addEventListener('click', () => {
    startButton.style.visibility = 'hidden';
    loadGame();
});

const resetButton = document.getElementById('reset');
resetButton.addEventListener('click', loadGame);

async function loadGame() {
    const skiGame = new Game();
    await skiGame.load();
    skiGame.run();
}

document.addEventListener('DOMContentLoaded', async () => {
    startButton.style.visibility = 'visible';
});