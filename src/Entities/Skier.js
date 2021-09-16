/**
 * The skier is the entity controlled by the player in the game. The skier skis down the hill, can move at different
 * angles, and crashes into obstacles they run into. If caught by the rhino, the skier will get eaten and die.
 */

import { IMAGE_NAMES, DIAGONAL_SPEED_REDUCER, KEYS, ANIMATION_FRAME_SPEED_MS } from "../Constants";
import { Entity } from "./Entity";
import { Animation } from "../Core/Animation";
import { intersectTwoRects, Rect } from "../Core/Utils";

/**
 * The skier starts running at this speed. Saved in case speed needs to be reset at any point.
 * @type {number}
 */
const STARTING_SPEED = 1;

/**
 * The different states the skier can be in.
 * @type {string: string}
 */
const STATE_SKIING = "skiing";
const STATE_JUMPING = "jumping";
const STATE_CRASHED = "crashed";
const STATE_DEAD = "dead";

/**
 * The obstacles which cause the skier to initiate a jump when collided with.
 * @type {Set}
 */
const JUMP_INITIATING_OBSTACLES = new Set([
    IMAGE_NAMES.JUMP_RAMP
]);

/**
 * The obstacles which the skier can dodge when in the jumping state.
 * @type {Set}
 */
const JUMPABLE_OBSTACLES = new Set([
    IMAGE_NAMES.JUMP_RAMP,
    IMAGE_NAMES.ROCK1,
    IMAGE_NAMES.ROCK2,
])

/**
 * The different directions the skier can be facing.
 * @type {number}
 */
const DIRECTION_LEFT = 0;
const DIRECTION_LEFT_DOWN = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_RIGHT_DOWN = 3;
const DIRECTION_RIGHT = 4;

/**
 * Sequences of images that comprise the animations for the different states of the skier.
 * @type {string[]}
 */

const IMAGES_JUMPING = [
    IMAGE_NAMES.SKIER_JUMP1,
    IMAGE_NAMES.SKIER_JUMP2,
    IMAGE_NAMES.SKIER_JUMP3,
    IMAGE_NAMES.SKIER_JUMP4,
    IMAGE_NAMES.SKIER_JUMP5,
];

/**
 * Mapping of the image to display for the skier based upon which direction they're facing.
 * @type {{number: string}}
 */
const DIRECTION_IMAGES = {
    [DIRECTION_LEFT] : IMAGE_NAMES.SKIER_LEFT,
    [DIRECTION_LEFT_DOWN] : IMAGE_NAMES.SKIER_LEFTDOWN,
    [DIRECTION_DOWN] : IMAGE_NAMES.SKIER_DOWN,
    [DIRECTION_RIGHT_DOWN] : IMAGE_NAMES.SKIER_RIGHTDOWN,
    [DIRECTION_RIGHT] : IMAGE_NAMES.SKIER_RIGHT
};

export class Skier extends Entity {
    /**
     * The name of the current image being displayed for the skier.
     * @type {string}
     */
    imageName = IMAGE_NAMES.SKIER_DOWN;

    /**
     * What state the skier is currently in.
     * @type {string}
     */
    state = STATE_SKIING;

    /**
     * What direction the skier is currently facing.
     * @type {number}
     */
    direction = DIRECTION_DOWN;

    /**
     * How fast the skier is currently moving in the game world.
     * @type {number}
     */
    speed = STARTING_SPEED;

    /**
     * Stores all of the animations available for the different states of the skier.
     * @type {Animation[]}
     */
    animations = [];
    
    /**
     * The animation that the skier is currently using. Should be null unless the skier is in the jumping state,
     * as it is the only current animation the player doesn't have control over.
     * @type {Animation}
     */
    curAnimation = null;

    /**
     * The current frame of the current animation the skier is on.
     * @type {number}
     */
    curAnimationFrame = 0;

    /**
     * The time in ms of the last frame change. Used to provide a consistent framerate.
     * @type {number}
     */
    curAnimationFrameTime = Date.now();

    /**
     * Stored reference to the ObstacleManager
     * @type {ObstacleManager}
     */
    obstacleManager = null;

    /**
     * Init the skier.
     *
     * @param {number} x
     * @param {number} y
     * @param {ImageManager} imageManager
     * @param {ObstacleManager} obstacleManager
     * @param {Canvas} canvas
     */
    constructor(x, y, imageManager, obstacleManager, canvas) {
        super(x, y, imageManager, canvas);
        this.obstacleManager = obstacleManager;
        this.setupAnimations();
        this.setAnimation();
    }

    /**
     * Create and store the animations.
     */
    setupAnimations() {
        this.animations[STATE_JUMPING] = new Animation(
            IMAGES_JUMPING,
            false,
            this.finishJumping.bind(this)
        );
    }

    /**
     * Set the state and then set a new current animation based upon that state.
     *
     * @param {string} newState
     */
    setState(newState) {
        this.state = newState;
        this.setAnimation();
    }

    /**
     * Is the skier currently in the crashed state
     *
     * @returns {boolean}
     */
    isCrashed() {
        return this.state === STATE_CRASHED;
    }

    /**
     * Is the skier currently in the jumping state
     * @returns {boolean}
     */
    isJumping() {
        return this.state === STATE_JUMPING;
    }

    /**
     * Is the skier currently in the skiing state
     *
     * @returns {boolean}
     */
    isSkiing() {
        return this.state === STATE_SKIING;
    }

    /**
     * Is the skier currently in the dead state
     *
     * @returns {boolean}
     */
    isDead() {
        return this.state === STATE_DEAD;
    }

    /**
     * Set the current direction the skier is facing and update the image accordingly
     *
     * @param {number} direction
     */
    setDirection(direction) {
        this.direction = direction;
        this.setDirectionalImage();
    }

    /**
     * Set the skier's image based upon the direction they're facing.
     */
    setDirectionalImage() {
        this.imageName = DIRECTION_IMAGES[this.direction];
    }

    /**
     * Move the skier and check to see if they've hit an obstacle. The skier only moves in the skiing state.
     */
    update(gameTime) {
        if (this.isJumping() || this.isSkiing()) {
            this.move();
            this.checkIfHitObstacle();
        }

        if (this.isJumping()) {
            this.animate(gameTime);
        }
    }

    /**
     * Draw the skier if they aren't dead
     */
    draw() {
        if(this.isDead()) {
            return;
        }

        super.draw();
    }

    /**
     * Move the skier based upon the direction they're currently facing. This handles frame update movement.
     */
    move() {
        switch(this.direction) {
            case DIRECTION_LEFT_DOWN:
                this.moveSkierLeftDown();
                break;
            case DIRECTION_DOWN:
                this.moveSkierDown();
                break;
            case DIRECTION_RIGHT_DOWN:
                this.moveSkierRightDown();
                break;
            case DIRECTION_LEFT:
            case DIRECTION_RIGHT:
                // Specifically calling out that we don't move the skier each frame if they're facing completely horizontal.
                break;
        }
    }

    /**
     * Move the skier left. Since completely horizontal movement isn't frame based, just move incrementally based upon
     * the starting speed.
     */
    moveSkierLeft() {
        this.x -= STARTING_SPEED;
    }

    /**
     * Move the skier diagonally left in equal amounts down and to the left. Use the current speed, reduced by the scale
     * of a right triangle hypotenuse to ensure consistent traveling speed at an angle.
     */
    moveSkierLeftDown() {
        this.x -= this.speed / DIAGONAL_SPEED_REDUCER;
        this.y += this.speed / DIAGONAL_SPEED_REDUCER;
    }

    /**
     * Move the skier down at the speed they're traveling.
     */
    moveSkierDown() {
        this.y += this.speed;
    }

    /**
     * Move the skier diagonally right in equal amounts down and to the right. Use the current speed, reduced by the scale
     * of a right triangle hypotenuse to ensure consistent traveling speed at an angle.
     */
    moveSkierRightDown() {
        this.x += this.speed / DIAGONAL_SPEED_REDUCER;
        this.y += this.speed / DIAGONAL_SPEED_REDUCER;
    }

    /**
     * Move the skier right. Since completely horizontal movement isn't frame based, just move incrementally based upon
     * the starting speed.
     */
    moveSkierRight() {
        this.x += STARTING_SPEED;
    }

    /**
     * Move the skier up. Since moving up isn't frame based, just move incrementally based upon
     * the starting speed.
     */
    moveSkierUp() {
        this.y -= STARTING_SPEED;
    }

    /**
     * Handle keyboard input. If the skier is dead, don't handle any input.
     *
     * @param {string} inputKey
     * @returns {boolean}
     */
    handleInput(inputKey) {
        if(this.isDead()) {
            return false;
        }

        let handled = true;

        switch(inputKey) {
            case KEYS.LEFT:
                this.turnLeft();
                break;
            case KEYS.RIGHT:
                this.turnRight();
                break;
            case KEYS.UP:
                this.turnUp();
                break;
            case KEYS.DOWN:
                this.turnDown();
                break;
            case KEYS.SPACE:
                this.jump();
            default:
                handled = false;
        }

        return handled;
    }

    /**
     * Turn the skier left. If they're already completely facing left, move them left. Otherwise, change their direction
     * one step left. If they're in the crashed state, then first recover them from the crash.
     */
    turnLeft() {
        if(this.isCrashed()) {
            this.recoverFromCrash(DIRECTION_LEFT);
        }

        if(this.direction === DIRECTION_LEFT) {
            this.moveSkierLeft();
        }
        else {
            this.setDirection(this.direction - 1);
        }
    }

    /**
     * Turn the skier right. If they're already completely facing right, move them right. Otherwise, change their direction
     * one step right. If they're in the crashed state, then first recover them from the crash.
     */
    turnRight() {
        if(this.isCrashed()) {
            this.recoverFromCrash(DIRECTION_RIGHT);
        }

        if(this.direction === DIRECTION_RIGHT) {
            this.moveSkierRight();
        }
        else {
            this.setDirection(this.direction + 1);
        }
    }

    /**
     * Turn the skier up which basically means if they're facing left or right, then move them up a bit in the game world.
     * If they're in the crashed state, do nothing as you can't move up if you're crashed.
     */
    turnUp() {
        if(this.isCrashed()) {
            return;
        }

        if(this.direction === DIRECTION_LEFT || this.direction === DIRECTION_RIGHT) {
            this.moveSkierUp();
        }
    }

    /**
     * Turn the skier to face straight down. If they're crashed don't do anything to require them to move left or right
     * to escape an obstacle before skiing down again.
     */
    turnDown() {
        if(this.isCrashed()) {
            return;
        }

        this.setDirection(DIRECTION_DOWN);
    }

    /**
     * Advance to the next frame in the current animation if enough time has elapsed since the previous frame.
     *
     * @param {number} gameTime
     */
     animate(gameTime) {
        if(!this.curAnimation) {
            return;
        }

        if(gameTime - this.curAnimationFrameTime > ANIMATION_FRAME_SPEED_MS) {
            this.nextAnimationFrame(gameTime);
        }
    }

    /**
     * Increase the current animation frame and update the image based upon the sequence of images for the animation.
     * If the animation isn't looping, then finish the animation instead.
     *
     * @param {number} gameTime
     */
    nextAnimationFrame(gameTime) {
        const animationImages = this.curAnimation.getImages();

        this.curAnimationFrameTime = gameTime;
        this.curAnimationFrame++;
        if (this.curAnimationFrame >= animationImages.length) {
            if(!this.curAnimation.getLooping()) {
                this.finishAnimation();
                return;
            }

            this.curAnimationFrame = 0;
        }

        this.imageName = animationImages[this.curAnimationFrame];
    }

    /**
     * The current animation wasn't looping, so finish it by clearing out the current animation and firing the callback.
     */
    finishAnimation() {
        const animationCallback = this.curAnimation.getCallback();
        this.curAnimation = null;

        animationCallback.apply();
    }

    /**
     * Set the current animation, reset to the beginning of the animation and set the proper image to display.
     */
    setAnimation() {
        this.curAnimation = this.animations[this.state];
        if(!this.curAnimation) {
            return;
        }

        this.curAnimationFrame = 0;

        const animateImages = this.curAnimation.getImages();
        this.imageName = animateImages[this.curAnimationFrame];
    }

    /**
     * Make the skier jump. If they're crashed or currently jumping then do nothing, as we do not
     * want to allow infinitely-recurring jumps.
     */
    jump() {
        if(this.isCrashed() || this.isJumping()) {
            return;
        }

        this.setState(STATE_JUMPING);
    }

    /**
     * Callback to be fired after the jumping animation is finished. Returns the skier to the skiing
     * state.
     */
    finishJumping() {
        if(this.isCrashed()) {
            return;
        }

        this.state = STATE_SKIING;
    }

    /**
     * The skier has a bit different bounds calculating than a normal entity to make the collision with obstacles more
     * natural. We want te skier to end up in the obstacle rather than right above it when crashed, so move the bottom
     * boundary up.
     *
     * @returns {Rect}
     */
    getBounds() {
        const image = this.imageManager.getImage(this.imageName);
        return new Rect(
            this.x - image.width / 2,
            this.y - image.height / 2,
            this.x + image.width / 2,
            this.y - image.height / 4
        );
    }

    /**
     * Go through all the obstacles in the game and see if the skier collides with any of them. If so, determine
     * if the obstacle can initiate a jump, or can be jumped over while the skier is in the jumping state. If neither
     * apply, crash the skier.
     */
    checkIfHitObstacle() {
        const skierBounds = this.getBounds();

        const collision = this.obstacleManager.getObstacles().find((obstacle) => {
            const obstacleBounds = obstacle.getBounds();

            return intersectTwoRects(skierBounds, obstacleBounds);
        });

        if(collision) {
            const obstacle = collision.imageName;
            if (this.isJumping() && JUMPABLE_OBSTACLES.has(obstacle)) {
                return;
            } else if (this.isSkiing() && JUMP_INITIATING_OBSTACLES.has(obstacle)) {
                this.jump();
            } else {
                this.crash();
            }
        }
    }

    /**
     * Crash the skier. Set the state to crashed, set the speed to zero cause you can't move when crashed and update the
     * image.
     */
    crash() {
        this.state = STATE_CRASHED;
        this.speed = 0;
        this.imageName = IMAGE_NAMES.SKIER_CRASH;
    }

    /**
     * Change the skier back to the skiing state, get them moving again at the starting speed and set them facing
     * whichever direction they're recovering to.
     *
     * @param {number} newDirection
     */
    recoverFromCrash(newDirection) {
        this.state = STATE_SKIING;
        this.speed = STARTING_SPEED;
        this.setDirection(newDirection);
    }

    /**
     * Kill the skier by putting them into the "dead" state and stopping their movement.
     */
    die() {
        this.state = STATE_DEAD;
        this.speed = 0;
    }
}