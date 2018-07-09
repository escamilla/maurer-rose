function convertDegreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Represents a rose, also known as a rhodonea curve, which is a sinusoid expressed by the polar
 * equation `r = cos(k * theta)`.
 */
class Rose {
    private readonly context: CanvasRenderingContext2D;
    private readonly centerX: number;
    private readonly centerY: number;
    private readonly amplitude: number;
    private readonly k: number;
    private theta: number = 0;
    private readonly deltaTheta: number;
    private previousX: number = 0;
    private previousY: number = 0;

    /**
     * @param centerX The x value of the center of the rose.
     * @param centerY The y value of the center of the rose.
     * @param amplitude The length of each petal.
     * @param k The petal coefficient. If `k` is an integer, the curve will be rose-shaped with
     * `2k` petals if `k` is even, and `k` petals if `k` is odd.
     * @param deltaTheta The number of radians that the angle is increased every time the rose is
     * rendered.
     */
    public constructor(context: CanvasRenderingContext2D, centerX: number, centerY: number,
                       amplitude: number, k: number, deltaTheta: number) {
        this.context = context;
        this.centerX = centerX;
        this.centerY = centerY;
        this.amplitude = amplitude;
        this.k = k;
        this.deltaTheta = deltaTheta;
    }

    public render(): void {
        if (this.isComplete()) {
            return;
        }
        const x: number = this.centerX +
            (Math.sin(this.k * this.theta) * Math.cos(this.theta) * this.amplitude);
        const y: number = this.centerY +
            (Math.sin(this.k * this.theta) * Math.sin(this.theta) * this.amplitude);
        this.context.beginPath();
        this.context.moveTo(x, y);
        if (this.previousX !== 0 && this.previousY !== 0) {
            this.context.lineTo(this.previousX, this.previousY);
        }
        this.context.stroke();
        this.previousX = x;
        this.previousY = y;
        this.theta += this.deltaTheta;
    }

    public isComplete(): boolean {
        return this.theta >= Math.PI * 2;
    }
}

/**
 * Represents a Maurer rose, which is a closed shape consisting of some lines that connect some
 * points on a rose curve.
 */
class MaurerRose {
    private readonly context: CanvasRenderingContext2D;
    private readonly centerX: number;
    private readonly centerY: number;
    private readonly amplitude: number;
    private readonly n: number;
    private readonly d: number;
    private k: number = 0;
    private i: number = 0;
    private previousX: number;
    private previousY: number;

    /**
     * @param centerX The x value of the center of the rose.
     * @param centerY The y value of the center of the rose.
     * @param amplitude The length of each petal.
     * @param n The petal coefficient for the rose curve whose points the Maurer rose connects. The
     * rose curve will have `2k` petals if `k` is even, and `k` petals if `k` is odd.
     * @param d The number of degrees that the angle is increased every time a time a new line is
     * rendered.
     */
    public constructor(context: CanvasRenderingContext2D, centerX: number, centerY: number,
                       amplitude: number, n: number, d: number) {
        this.context = context;
        this.centerX = centerX;
        this.centerY = centerY;
        this.amplitude = amplitude;
        this.n = n;
        this.d = d;
        this.previousX = this.centerX;
        this.previousY = this.centerY;
    }

    public render(): void {
        if (this.isComplete()) {
            return;
        }
        const radius: number = Math.sin(this.n * convertDegreesToRadians(this.k)) * this.amplitude;
        const angle: number = convertDegreesToRadians(this.k);
        const x: number = this.centerX + (radius * Math.cos(angle));
        const y: number = this.centerY + (radius * Math.sin(angle));
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(this.previousX, this.previousY);
        this.context.stroke();
        this.previousX = x;
        this.previousY = y;
        this.k += this.d;
        this.i++;
    }

    public isComplete(): boolean {
        return this.i > 360;
    }
}

window.onload = (): void => {
    const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
    const width: number = canvas.width = window.innerWidth;
    const height: number = canvas.height = window.innerHeight;
    context.translate(width / 2, height / 2);
    context.scale(1, -1);
    const radius: number = Math.min(width, height) * 0.45;
    const maurerRose: MaurerRose = new MaurerRose(context, 0, 0, radius, 6, 71);
    const rose: Rose = new Rose(context, 0, 0, radius, 6, 0.02);
    function renderMaurerRose(): void {
        maurerRose.render();
        if (maurerRose.isComplete()) {
            renderRose();
        } else {
            requestAnimationFrame(renderMaurerRose);
        }
    }
    function renderRose(): void {
        rose.render();
        requestAnimationFrame(renderRose);
    }
    renderMaurerRose();
};
