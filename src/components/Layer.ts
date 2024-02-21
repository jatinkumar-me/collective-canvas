export default class BaseLayer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    //Singleton class
    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error("Can't get 2d rendering context");
        }
        this.ctx = context;
        this.ctx.save();
        this.events();
    }

    events() {
        const clearCanvasButton = document.querySelector('#clear-canvas');
        if (!clearCanvasButton) {
            console.warn("clear canvas button not in the dom");
            return;
        }
        clearCanvasButton.addEventListener('click', this.clearCanvas.bind(this));
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
