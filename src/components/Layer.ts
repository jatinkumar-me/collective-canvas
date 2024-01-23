export default class BaseLayer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    //Singleton class
    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const context = this.canvas.getContext('2d');
        if (!context) {
            alert("Can't get 2d rendering context");
            return;
        }
        this.ctx = context;
        this.ctx.save();
    }
}
