/**
 * Manages all of the obstacles that exist in the game world. It sets the initial world up with a random placement of
 * obstacles, places new obstacles as the skier moves throughout the world and displays them all to the screen.
 */

import { GAME_WIDTH, GAME_HEIGHT } from '../../Constants';
import {randomInt, Rect} from '../../Core/Utils';
import { Obstacle } from "./Obstacle";

/**
 * Ensures that obstacles aren't too close together
 * @type {number}
 */
const DISTANCE_BETWEEN_OBSTACLES = 50;

/**
 * Distance away from the starting position to place obstacles so the player has some initial room to move
 * @type {number}
 */
const STARTING_OBSTACLE_GAP = 100;

/**
 * The number of starting obstacles is based upon game size, so that difficulty stays the same regardless of screen size.
 * This works to configure the starting number of obstacles.
 * @type {number}
 */
const STARTING_OBSTACLE_REDUCER = 300;

/**
 * The chance that a new obstacle will be placed as the skier is moving. A lower number increases the chances.
 * @type {number}
 */
const NEW_OBSTACLE_CHANCE = 8;

export class ObstacleManager {
    /**
     * All obstacles that exist in the game
     * @type {Obstacle[]}
     */
    obstacles = [];

    /**
     * Stored reference to the ImageManager
     * @type {ImageManager}
     */
    imageManager = null;

    /**
     * Stored reference to the Canvas obstacles are drawn to
     * @type {Canvas}
     */
    canvas = null;

    /**
     * Init the Obstacle Manager.
     *
     * @param {ImageManager} imageManager
     * @param {Canvas} canvas
     */
    constructor(imageManager, canvas) {
        this.imageManager = imageManager;
        this.canvas = canvas;
    }

    /**
     * @returns {Obstacle[]}
     */
    getObstacles() {
        return this.obstacles;
    }

    /**
     * Loop through and draw all obstacles
     */
    drawObstacles() {
        this.obstacles.forEach((obstacle) => {
            obstacle.draw();
        });
    }

    /**
     * Place initial obstacles. Mimics the original SkiFree game in that obstacles are only initially placed below the
     * skier.
     */
    placeInitialObstacles() {
        const numberObstacles = Math.ceil((GAME_WIDTH / STARTING_OBSTACLE_REDUCER) * (GAME_HEIGHT / STARTING_OBSTACLE_REDUCER));

        const placementArea = new Rect(
            -GAME_WIDTH / 2,
            STARTING_OBSTACLE_GAP,
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2
        );

        for(let i = 0; i < numberObstacles; i++) {
            this.placeRandomObstacle(placementArea);
        }

        this.obstacles.sort((obstacle1, obstacle2) => {
            return obstacle1.getPosition().y - obstacle2.getPosition().y;
        });
    }

    /**
     * Place a new obstacle while the game is running. If the game window has moved, we want to figure out which direction(s)
     * it has moved in and try to place a new obstacle offscreen (so player doesn't see it pop in) in that direction(s).
     *
     * @param {Rect} gameWindow
     * @param {Rect} previousGameWindow
     */
    placeNewObstacle(gameWindow, previousGameWindow) {
        const shouldPlaceObstacle = randomInt(1, NEW_OBSTACLE_CHANCE);
        if(shouldPlaceObstacle !== NEW_OBSTACLE_CHANCE) {
            return;
        }

        if(gameWindow.left < previousGameWindow.left) {
            this.placeObstacleLeft(gameWindow);
        }
        else if(gameWindow.left > previousGameWindow.left) {
            this.placeObstacleRight(gameWindow);
        }

        if(gameWindow.top < previousGameWindow.top) {
            this.placeObstacleTop(gameWindow);
        }
        else if(gameWindow.top > previousGameWindow.top) {
            this.placeObstacleBottom(gameWindow);
        }
    };

    /**
     * Place an obstacle to the left of the game window
     *
     * @param {Rect} gameWindow
     */
    placeObstacleLeft(gameWindow) {
        const placementArea = new Rect(gameWindow.left, gameWindow.top, gameWindow.left, gameWindow.bottom);
        this.placeRandomObstacle(placementArea);
    }

    /**
     * Place an obstacle to the right of the game window
     *
     * @param {Rect} gameWindow
     */
    placeObstacleRight(gameWindow) {
        const placementArea = new Rect(gameWindow.right, gameWindow.top, gameWindow.right, gameWindow.bottom);
        this.placeRandomObstacle(placementArea);
    }

    /**
     * Place an obstacle above the game window
     *
     * @param {Rect} gameWindow
     */
    placeObstacleTop(gameWindow) {
        const placementArea = new Rect(gameWindow.left, gameWindow.top, gameWindow.right, gameWindow.top);
        this.placeRandomObstacle(placementArea);
    }

    /**
     * Place an obstacle below the game window
     *
     * @param {Rect} gameWindow
     */
    placeObstacleBottom(gameWindow) {
        const placementArea = new Rect(gameWindow.left, gameWindow.bottom, gameWindow.right, gameWindow.bottom);
        this.placeRandomObstacle(placementArea);
    }

    /**
     * Place a random obstacle somewhere within the placement area. Obstacles are distanced from each other rather than
     * right on top of one another, so an open space must be calculated.
     *
     * @param {Rect} placementArea
     */
    placeRandomObstacle(placementArea) {
        let position;
        while(!position) {
            position = this.calculateOpenPosition(placementArea);
        }

        const newObstacle = new Obstacle(position.x, position.y, this.imageManager, this.canvas);

        this.obstacles.push(newObstacle);
    }

    /**
     * Find a position within the passed in area to place an obstacle, ensuring that the obstacle is
     * DISTANCE_BETWEEN_OBSTACLES distance away from any other obstacle. If the calculated position doesn't meet that
     * criteria, return null.
     *
     * @param placementArea
     * @returns {null|{x: number, y: number}}
     */
    calculateOpenPosition(placementArea) {
        const x = randomInt(placementArea.left, placementArea.right);
        const y = randomInt(placementArea.top, placementArea.bottom);

        const foundCollision = this.obstacles.find((obstacle) => {
            return (
                x > (obstacle.x - DISTANCE_BETWEEN_OBSTACLES) &&
                x < (obstacle.x + DISTANCE_BETWEEN_OBSTACLES) &&
                y > (obstacle.y - DISTANCE_BETWEEN_OBSTACLES) &&
                y < (obstacle.y + DISTANCE_BETWEEN_OBSTACLES)
            );
        });

        if(foundCollision) {
            return null;
        }
        else {
            return {
                x: x,
                y: y
            };
        }
    }
}