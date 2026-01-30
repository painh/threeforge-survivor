import {
  SpriteMaterial,
  Sprite,
  Texture,
  TextureLoader,
  NearestFilter,
  Color,
} from 'three';

export interface SpriteConfig {
  texture?: Texture;
  color?: number | string;
  width?: number;
  height?: number;
  opacity?: number;
}

export class SpriteRenderer {
  readonly sprite: Sprite;
  private material: SpriteMaterial;
  private static textureLoader = new TextureLoader();
  private static textureCache = new Map<string, Texture>();

  constructor(config: SpriteConfig = {}) {
    this.material = new SpriteMaterial({
      map: config.texture,
      color: config.color ?? 0xffffff,
      transparent: true,
      opacity: config.opacity ?? 1,
    });

    this.sprite = new Sprite(this.material);

    if (config.width !== undefined || config.height !== undefined) {
      const width = config.width ?? 1;
      const height = config.height ?? 1;
      this.sprite.scale.set(width, height, 1);
    }
  }

  static async loadTexture(url: string, pixelArt: boolean = true): Promise<Texture> {
    if (SpriteRenderer.textureCache.has(url)) {
      return SpriteRenderer.textureCache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      SpriteRenderer.textureLoader.load(
        url,
        (texture) => {
          if (pixelArt) {
            texture.minFilter = NearestFilter;
            texture.magFilter = NearestFilter;
          }
          SpriteRenderer.textureCache.set(url, texture);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  setTexture(texture: Texture): void {
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  setColor(color: number | string | Color): void {
    this.material.color.set(color);
  }

  setOpacity(opacity: number): void {
    this.material.opacity = opacity;
  }

  setSize(width: number, height: number): void {
    this.sprite.scale.set(width, height, 1);
  }

  setCenter(x: number, y: number): void {
    this.sprite.center.set(x, y);
  }

  flipX(flip: boolean): void {
    this.sprite.scale.x = Math.abs(this.sprite.scale.x) * (flip ? -1 : 1);
  }

  flipY(flip: boolean): void {
    this.sprite.scale.y = Math.abs(this.sprite.scale.y) * (flip ? -1 : 1);
  }

  setUVOffset(x: number, y: number): void {
    if (this.material.map) {
      this.material.map.offset.set(x, y);
    }
  }

  setUVRepeat(x: number, y: number): void {
    if (this.material.map) {
      this.material.map.repeat.set(x, y);
    }
  }

  createSpriteSheet(columns: number, rows: number): void {
    if (this.material.map) {
      this.material.map.repeat.set(1 / columns, 1 / rows);
    }
  }

  setSpriteFrame(column: number, row: number, columns: number, rows: number): void {
    if (this.material.map) {
      const offsetX = column / columns;
      const offsetY = 1 - (row + 1) / rows;
      this.material.map.offset.set(offsetX, offsetY);
    }
  }

  dispose(): void {
    this.material.dispose();
  }
}
