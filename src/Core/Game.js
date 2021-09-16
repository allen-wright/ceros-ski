/**
 * The main game class. This initializes the game as well as runs the game/render loop and initial handling of input.
 */

import { GAME_WIDTH, GAME_HEIGHT, IMAGES } from "../Constants";
import { ImageManager } from "./ImageManager";
import { Canvas } from './Canvas';
import { Skier } from "../Entities/Skier";
import { Rhino } from "../Entities/Rhino";
import { ObstacleManager } from "../Entities/Obstacles/ObstacleManager";
import { Rect } from './Utils';

export class Game {
    /**
     * Coordinates denoting the active rectangular space in the game world
     * @type {Rect}
     * */
    gameWindow = null;

    /**
     * Current game time
     * @type {number}
     */
    gameTime = Date.now();

    /**
     * Initialize the game and setup any input handling needed.
     */
    constructor() {
        this.init();
        this.setupInputHandling();
    }

    /**
     * Create all necessary game objects and initialize them as needed.
     */
    init() {
        this.canvas = new Canvas(GAME_WIDTH, GAME_HEIGHT);
        this.imageManager = new ImageManager();
        this.obstacleManager = new ObstacleManager(this.imageManager, this.canvas);

        this.skier = new Skier(0, 0, this.imageManager, this.obstacleManager, this.canvas);
        this.rhino = new Rhino(-500, -2000, this.imageManager, this.canvas);

        this.obstacleManager.placeInitialObstacles();
    }

    /**
     * Setup listeners for any input events we might need.
     */
    setupInputHandling() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Load any assets we need for the game to run. Return a promise so that we can wait on something until all assets
     * are loaded before running the game.
     *
     * @returns {Promise<void>}
     */
    async load() {
        await this.imageManager.loadImages(IMAGES);
    }

    /**
     * The main game loop. Clear the screen, update the game objects and then draw them.
     */
    run() {
        this.canvas.clearCanvas();

        this.updateGameWindow();
        this.drawGameWindow();

        requestAnimationFrame(this.run.bind(this));
    }

    /**
     * Do any updates needed to the game objects
     */
    updateGameWindow() {
        this.gameTime = Date.now();

        const previousGameWindow = this.gameWindow;
        this.calculateGameWindow();

        this.obstacleManager.placeNewObstacle(this.gameWindow, previousGameWindow);

        this.skier.update();
        this.rhino.update(this.gameTime, this.skier);
    }

    /**
     * Draw all entities to the screen, in the correct order. Also setup the canvas draw offset so that we see the
     * rectangular space denoted by the game window.
     */
    drawGameWindow() {
        this.canvas.setDrawOffset(this.gameWindow.left, this.gameWindow.top);

        this.skier.draw();
        this.rhino.draw();
        this.obstacleManager.drawObstacles();
    }

    /**
     * Calculate the game window (the rectangular space drawn to the screen). It's centered around the player and must
     * be updated since the player moves position.
     */
    calculateGameWindow() {
        const skierPosition = this.skier.getPosition();
        const left = skierPosition.x - (GAME_WIDTH / 2);
        const top = skierPosition.y - (GAME_HEIGHT / 2);

        this.gameWindow = new Rect(left, top, left + GAME_WIDTH, top + GAME_HEIGHT);
    }

    /**
     * Handle keypresses and delegate to any game objects that might have key handling of their own.
     *
     * @param {KeyboardEvent} event
     */
    handleKeyDown(event) {
        let handled = this.skier.handleInput(event.key);

        if(handled) {
            event.preventDefault();
        }
    }
}