export interface GameLoopCallbacks {
  update: (deltaTime: number) => void;
  fixedUpdate: (fixedDeltaTime: number) => void;
  render: () => void;
}

export class GameLoop {
  private running: boolean = false;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number;
  private readonly maxAccumulator: number;
  private animationFrameId: number | null = null;

  private callbacks: GameLoopCallbacks;

  constructor(
    callbacks: GameLoopCallbacks,
    fixedTimeStep: number = 1 / 60,
    maxAccumulator: number = 0.25
  ) {
    this.callbacks = callbacks;
    this.fixedTimeStep = fixedTimeStep;
    this.maxAccumulator = maxAccumulator;
  }

  start(): void {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now() / 1000;
    this.accumulator = 0;
    this.loop();
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (): void => {
    if (!this.running) return;

    const currentTime = performance.now() / 1000;
    let deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Prevent spiral of death
    if (deltaTime > this.maxAccumulator) {
      deltaTime = this.maxAccumulator;
    }

    this.accumulator += deltaTime;

    // Fixed update for physics/collision
    while (this.accumulator >= this.fixedTimeStep) {
      this.callbacks.fixedUpdate(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    // Variable update for input/animation
    this.callbacks.update(deltaTime);

    // Render
    this.callbacks.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  get isRunning(): boolean {
    return this.running;
  }
}
