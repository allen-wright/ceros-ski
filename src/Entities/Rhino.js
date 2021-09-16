/**
 * The rhino chases after a target and eats the target when they come in contact with one another. Also has a few
 * different animations that it cycles between depending upon the rhino's state.
 */

import { ANIMATION_FRAME_SPEED_MS, IMAGE_NAMES } from "../Constants";
import { Entity } from "./Entity";
import { Animation } from "../Core/Animation";
import { intersectTwoRects, getDirectionVector } from "../Core/Utils";

/**
 * The rhino starts running at this speed. Saved in case speed needs to be reset at any point.
 * @type {number}
 */
const STARTING_SPEED = 10.5;

/**
 * The different states the rhino can be in.
 * @type {string}
 */
const STATE_RUNNING = "running";
const STATE_EATING = "eating";
const STATE_CELEBRATING = "celebrating";

/**
 * Sequences of images that comprise the animations for the different states of the rhino.
 * @type {string[]}
 */
const IMAGES_RUNNING = [
    IMAGE_NAMES.RHINO_RUN1,
    IMAGE_NAMES.RHINO_RUN2
];
const IMAGES_EATING = [
    IMAGE_NAMES.RHINO_EAT1,
    IMAGE_NAMES.RHINO_EAT2,
    IMAGE_NAMES.RHINO_EAT3,
    IMAGE_NAMES.RHINO_EAT4
];
const IMAGES_CELEBRATING = [
    IMAGE_NAMES.RHINO_CELEBRATE1,
    IMAGE_NAMES.RHINO_CELEBRATE2
];

export class Rhino extends Entity {
    /**
     * The name of the current image being displayed for the rhino.
     * @type {string}
     */
    imageName = IMAGE_NAMES.RHINO;

    /**
     * What state the rhino is currently in.
     * @type {string}
     */
    state = STATE_RUNNING;

    /**
     * How fast the rhino is currently moving in the game world.
     * @type {number}
     */
    speed = STARTING_SPEED;

    /**
     * Stores all of the animations available for the different states of the rhino.
     * @type {Animation[]}
     */
    animations = [];

    /**
     * The animation that the rhino is currently using. Typically matches the state the rhino is in.
     * @type {Animation}
     */
    curAnimation = null;

    /**
     * The current frame of the current animation the rhino is on.
     * @type {number}
     */
    curAnimationFrame = 0;

    /**
     * The time in ms of the last frame change. Used to provide a consistent framerate.
     * @type {number}
     */
    curAnimationFrameTime = Date.now();

    /**
     * Initialize the rhino, get the animations setup and set the starting animation which will be based upon the
     * starting state.
     *
     * @param {number} x
     * @param {number} y
     * @param {ImageManager} imageManager
     * @param {Canvas} canvas
     */
    constructor(x, y, imageManager, canvas) {
        super(x, y, imageManager, canvas);
        this.setupAnimations();
        this.setAnimation();
    }

    /**
     * Create and store the animations.
     */
    setupAnimations() {
        this.animations[STATE_RUNNING] = new Animation(
            IMAGES_RUNNING,
            true,
            null
        );

        this.animations[STATE_EATING] = new Animation(
            IMAGES_EATING,
            false,
            this.celebrate.bind(this)
        );

        this.animations[STATE_CELEBRATING] = new Animation(
            IMAGES_CELEBRATING,
            true,
            null
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
     * Is the rhino currently in the running state.
     *
     * @returns {boolean}
     */
    isRunning() {
        return this.state === STATE_RUNNING;
    }

    /**
     * Update the rhino by moving it, seeing if it caught its target and then update the animation if needed. Currently
     * it only moves if it's running.
     *
     * @param {number} gameTime
     * @param {Entity} target
     */
    update(gameTime, target) {
        if(this.isRunning()) {
            this.move(target);
            this.checkIfCaughtTarget(target);
        }

        this.animate(gameTime);
    }

    /**
     * Move the rhino if it's in the running state. The rhino moves by going directly towards its target, disregarding
     * any obstacles.
     *
     * @param {Entity} target
     */
    move(target) {
        if(!this.isRunning()) {
            return;
        }

        const targetPosition = target.getPosition();
        const moveDirection = getDirectionVector(this.x, this.y, targetPosition.x, targetPosition.y);

        this.x += moveDirection.x * this.speed;
        this.y += moveDirection.y * this.speed;
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
     * Does the rhino collide with its target. If so, trigger the target as caught.
     *
     * @param {Entity} target
     */
    checkIfCaughtTarget(target) {
        const rhinoBounds = this.getBounds();
        const targetBounds = target.getBounds();

        if (intersectTwoRects(rhinoBounds, targetBounds)) {
            this.caughtTarget(target);
        }
    }

    /**
     * The target was caught, so trigger its death and set the rhino to the eating state.
     *
     * @param {Entity} target
     */
    caughtTarget(target) {
        target.die();

        this.setState(STATE_EATING);
    }

    /**
     * The rhino has won, trigger the celebration state.
     */
    celebrate() {
        this.setState(STATE_CELEBRATING);
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
}