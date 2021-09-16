/**
 *
 */

import { IMAGE_NAMES } from "../../Constants";
import { Entity } from "../Entity";
import { randomInt } from '../../Core/Utils';

/**
 * The different types of obstacles that can be placed in the game.
 * @type {string[]}
 */
const OBSTACLE_TYPES = [
    IMAGE_NAMES.TREE,
    IMAGE_NAMES.TREE_CLUSTER,
    IMAGE_NAMES.ROCK1,
    IMAGE_NAMES.ROCK2
];

export class Obstacle extends Entity {
    /**
     * Initialize an obstacle and make it a random type.
     *
     * @param {number} x
     * @param {number} y
     * @param {ImageManager} imageManager
     * @param {Canvas} canvas
     */
    constructor(x, y, imageManager, canvas) {
        super(x, y, imageManager, canvas);

        const typeIdx = randomInt(0, OBSTACLE_TYPES.length - 1);
        this.imageName = OBSTACLE_TYPES[typeIdx];
    }
}