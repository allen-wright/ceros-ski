/**
 * Handles loading of any images needed for the game.
 */

/**
 * Scale all images loaded by this amount
 * @type {number}
 * */
const SCALE = 0.5;

export class ImageManager {
    /**
     *  @type {Image[]}
     */
    loadedImages = [];

    constructor() {
    }

    /**
     * Load each of the passed in images and return a promise that resolves when all images are finished loading
     *
     * @param {Object[]} images
     * @returns {Promise<void>}
     */
    async loadImages(images) {
        const imagePromises = [];

        for (const image of images) {
            const imagePromise = this.loadSingleImage(image.name, image.url);
            imagePromises.push(imagePromise);
        }

        await Promise.all(imagePromises);
    }

    /**
     * Load a single image and return a promise that resolves when the image is finished loading.
     *
     * @param {string} name
     * @param {string} url
     * @returns {Promise<void>}
     */
    loadSingleImage(name, url) {
        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
                image.width *= SCALE;
                image.height *= SCALE;

                this.loadedImages[name] = image;
                resolve();
            };
            image.src = url;
        });
    }

    /**
     * Get a single Image by name
     *
     * @param {string} name
     * @returns {Image}
     */
    getImage(name) {
        return this.loadedImages[name];
    }
}