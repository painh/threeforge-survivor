import { BaseScene } from './BaseScene';

export class SceneManager {
  private scenes: Map<string, BaseScene> = new Map();
  private currentScene: BaseScene | null = null;
  private currentSceneName: string | null = null;

  register(name: string, scene: BaseScene): void {
    this.scenes.set(name, scene);
  }

  async switch(name: string): Promise<void> {
    const scene = this.scenes.get(name);
    if (!scene) {
      throw new Error(`Scene "${name}" not found`);
    }

    if (this.currentScene) {
      this.currentScene.destroy();
    }

    this.currentScene = scene;
    this.currentSceneName = name;
    await scene.init();
  }

  update(deltaTime: number): void {
    this.currentScene?.update(deltaTime);
  }

  fixedUpdate(deltaTime: number): void {
    this.currentScene?.fixedUpdate(deltaTime);
  }

  get current(): BaseScene | null {
    return this.currentScene;
  }

  get currentName(): string | null {
    return this.currentSceneName;
  }
}
