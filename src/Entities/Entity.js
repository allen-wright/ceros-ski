/**
 * A basic game entity with a position and image to be displayed in the game.
 */

import {Rect} from "../Core/Utils";

export class Entity {
    /**
     * Represents the X position of the center of the entity.
     * @type {number}
     */
    x = 0;

    /**
     * Represents the Y position of the center of the entity.
     * @type {number}
     */
    y = 0;

    /**
     * The name of the current image being displayed for the entity.
     * @type {string}
     */
    imageName = '';

    /**
     * Stored reference to the ImageManager
     * @type {ImageManager}
     */
    imageManager = null;

    /**
     * Stored reference to the Canvas entity is drawn to
     * @type {Canvas}
     */
    canvas = null;

    /**
     * Initialize the entities position.
     *
     * @param {number} x
     * @param {number} y
     * @param {ImageManager} imageManager
     * @param {Canvas} canvas
     */
    constructor(x, y, imageManager, canvas) {
        this.x = x;
        this.y = y;
        this.imageManager = imageManager;
        this.canvas = canvas;
    }

    /**
     * @returns {{x: number, y: number}}
     */
    getPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }

    /**
     * Draw the entity to the canvas centered on the X,Y position.
     */
    draw() {
        const image = this.imageManager.getImage(this.imageName);
        const drawX = this.x - image.width / 2;
        const drawY = this.y - image.height / 2;

        this.canvas.drawImage(image, drawX, drawY, image.width, image.height);
    }

    /**
     * Return a bounding box in world space coordinates for the entity based upon the current image displayed.
     *
     * @returns {Rect}
     */
    getBounds() {
        const image = this.imageManager.getImage(this.imageName);
        return new Rect(
            this.x - image.width / 2,
            this.y - image.height / 2,
            this.x + image.width / 2,
            this.y
        );
    }

    /**
     * A default entity doesn't do anything on death but provide the option for specific types to die.
     */
    die() {
    }
}