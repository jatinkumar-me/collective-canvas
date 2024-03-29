export default class BaseLayer {
    canvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error("Can't get 2d rendering context");
        }
        this.ctx = context;

        const previewCanvas = document.getElementById('canvas-preview') as HTMLCanvasElement;
        const previewCtx = previewCanvas.getContext('2d');
        if (!previewCtx) {
            throw new Error("Can't get 2d rendering context");
        }
        this.previewCanvas = previewCanvas;
        this.previewCtx = previewCtx;

        this.events();
    }

    events() {
        const clearCanvasButton = document.querySelector('#clear-canvas');
        if (!clearCanvasButton) {
            console.warn("clear canvas button not in the dom");
            return;
        }
        clearCanvasButton.addEventListener('click', this.handleClearCanvasClick.bind(this));

        const saveCanvasButton = document.querySelector('#save-canvas');
        if (!saveCanvasButton) {
            return;
        }
        saveCanvasButton.addEventListener('click', this.saveCanvas.bind(this));
    }

    private handleClearCanvasClick() {
        this.clearCanvas();
        this.onCanvasClear();
    }

    public onCanvasClear(): void {}

    public clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    saveCanvas() {
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'cc-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    public clearPreview() {
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
    }
}
