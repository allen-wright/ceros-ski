/**
 * Configuration for a single animation. Animations contain an array of images to play through. They can loop back
 * to the start when the full animation sequence has been played or they can not loop and just finish on the last image.
 * They can also have a callback set to fire when the animation sequence is complete.
 */

export class Animation {

    /**
     * @param {string[]} images
     * @param {boolean} looping
     * @param {Function} callback
     */
    constructor(images, looping, callback) {
        this.images = images;
        this.looping = looping;
        this.callback = callback;
    }

    /**
     * @returns {string[]}
     */
    getImages() {
        return this.images;
    }

    /**
     * @returns {boolean}
     */
    getLooping() {
        return this.looping;
    }

    /**
     * @returns {Function}
     */
    getCallback() {
        return this.callback;
    }
}