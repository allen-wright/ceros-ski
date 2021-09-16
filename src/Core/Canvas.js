/**
 * The Canvas class is responsible for managing the HTML Canvas element and anything drawn to it. It incorporates a
 * drawing offset that all drawn entities to be positioned relative to giving the illusion of moving around in the
 * game world.
 */

export class Canvas {
    /** @type {number} */
    width = 0;

    /** @type {number} */
    height = 0;

    /**
     * @type {{x: number, y: number}}
     */
    drawOffset = {
        x: 0,
        y: 0
    };

    /**
     * Reference to the canvas context
     * @type {CanvasRenderingContext2D}
     */
    ctx = null;

    /**
     * Create a canvas of a specific size
     *
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.setupCanvas();
    }

    /**
     * Get the canvas DOM element and make it the proper size. Also ensure it compensates for device pixel scaling.
     */
    setupCanvas() {
        const canvas = document.getElementById('skiCanvas');
        canvas.width = this.width * window.devicePixelRatio;
        canvas.height = this.height * window.devicePixelRatio;
        canvas.style.width = this.width + 'px';
        canvas.style.height = this.height + 'px';

        this.ctx = canvas.getContext("2d");
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    /**
     * Erase the entire canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Set an offset so that everything drawn to the canvas is drawn relative to the coordinates passed in.
     *
     * @param {number} x
     * @param {number} y
     */
    setDrawOffset(x, y) {
        this.drawOffset.x = x;
        this.drawOffset.y = y;
    }

    /**
     * Draw an Image at the desired coordinates relative to the drawOffset position at the desired size.
     *
     * @param {Image} image
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    drawImage(image, x, y, width, height) {
        x -= this.drawOffset.x;
        y -= this.drawOffset.y;

        this.ctx.drawImage(image, x, y, width, height);
    }
}