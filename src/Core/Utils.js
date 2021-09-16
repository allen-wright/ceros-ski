/**
 * A set of common utilities used throughout the game.
 */

/**
 * Return a random integer between min and max, inclusive of both.
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * A simple rectangle class denoted by top/left and bottom/right coordinates
 */
export class Rect {
    left = 0;
    top = 0;
    right = 0;
    bottom = 0;

    constructor(left, top, right, bottom) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
}

/**
 * Determine if there is an intersection (overlap) between two rectangles.
 *
 * @param {Rect} rect1
 * @param {Rect} rect2
 * @returns {boolean}
 */
export function intersectTwoRects(rect1, rect2) {
    return !(rect2.left > rect1.right ||
        rect2.right < rect1.left ||
        rect2.top > rect1.bottom ||
        rect2.bottom < rect1.top);
}

/**
 * Return a normalized vector pointing from the start coordinates to the end coordinates
 *
 * @param {number} startX
 * @param {number} startY
 * @param {number} endX
 * @param {number} endY
 * @returns {{x: number, y: number}}
 */
export function getDirectionVector(startX, startY, endX, endY) {
    let xDistance = endX - startX;
    let yDistance = endY - startY;

    const distance = Math.hypot(xDistance, yDistance);
    if (distance) {
        xDistance /= distance;
        yDistance /= distance;
    }

    return {
        x: xDistance,
        y: yDistance
    }
}