import { WebGLRenderer } from 'three';
import { GameLoop } from './core/GameLoop';
import { InputManager } from './core/InputManager';
import { SceneManager } from './scenes/SceneManager';
import { GameScene } from './scenes/GameScene';
import { Camera2D } from './rendering/Camera2D';

export class Game {
  private renderer: WebGLRenderer;
  private gameLoop: GameLoop;
  private inputManager: InputManager;
  private sceneManager: SceneManager;
  private camera2D: Camera2D;

  constructor() {
    // Create renderer
    this.renderer = new WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x1a1a2e);
    document.body.appendChild(this.renderer.domElement);

    // Create input manager
    this.inputManager = new InputManager();

    // Create camera
    this.camera2D = new Camera2D({
      viewWidth: 20,
      viewHeight: 15,
      followSpeed: 8,
    });

    // Create scene manager
    this.sceneManager = new SceneManager();
    this.sceneManager.register('game', new GameScene(this.inputManager));

    // Create game loop
    this.gameLoop = new GameLoop({
      update: this.update.bind(this),
      fixedUpdate: this.fixedUpdate.bind(this),
      render: this.render.bind(this),
    });

    // Handle resize
    window.addEventListener('resize', this.onResize.bind(this));
  }

  async start(): Promise<void> {
    await this.sceneManager.switch('game');

    // Set camera target to player
    const gameScene = this.sceneManager.current as GameScene;
    if (gameScene) {
      this.camera2D.setTarget(gameScene.getPlayer());
    }

    this.gameLoop.start();
  }

  private update(deltaTime: number): void {
    this.sceneManager.update(deltaTime);
    this.camera2D.update(deltaTime);
  }

  private fixedUpdate(deltaTime: number): void {
    this.sceneManager.fixedUpdate(deltaTime);
  }

  private render(): void {
    const scene = this.sceneManager.current?.scene;
    if (scene) {
      this.renderer.render(scene, this.camera2D.camera);
    }
  }

  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera2D.resize(width, height);
  }

  destroy(): void {
    this.gameLoop.stop();
    this.inputManager.destroy();
    this.renderer.dispose();
    document.body.removeChild(this.renderer.domElement);
  }
}
