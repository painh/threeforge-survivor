import { PerspectiveCamera, Vector3, Object3D } from 'three';

export interface Camera2DConfig {
  viewWidth?: number;
  viewHeight?: number;
  near?: number;
  far?: number;
  followSpeed?: number;
}

export class Camera2D {
  readonly camera: PerspectiveCamera;
  private target: Object3D | null = null;
  private followSpeed: number;
  private offset: Vector3 = new Vector3(0, 0, 10);
  private targetPosition: Vector3 = new Vector3();

  constructor(config: Camera2DConfig = {}) {
    const near = config.near ?? 0.1;
    const far = config.far ?? 1000;
    this.followSpeed = config.followSpeed ?? 5;

    // PerspectiveCamera - 2D 게임에 맞게 fov 조정
    this.camera = new PerspectiveCamera(
      60, // fov
      window.innerWidth / window.innerHeight,
      near,
      far
    );

    this.camera.position.set(0, 0, this.offset.z);
    this.camera.lookAt(0, 0, 0);
  }

  setTarget(target: Object3D | null): void {
    this.target = target;
    if (target) {
      this.targetPosition.copy(target.position);
      this.camera.position.x = target.position.x + this.offset.x;
      this.camera.position.y = target.position.y + this.offset.y;
    }
  }

  setOffset(x: number, y: number, z?: number): void {
    this.offset.set(x, y, z ?? this.offset.z);
  }

  setFollowSpeed(speed: number): void {
    this.followSpeed = speed;
  }

  update(deltaTime: number): void {
    if (!this.target) return;

    this.targetPosition.set(
      this.target.position.x + this.offset.x,
      this.target.position.y + this.offset.y,
      this.camera.position.z
    );

    // Smooth follow
    const lerpFactor = 1 - Math.exp(-this.followSpeed * deltaTime);
    this.camera.position.x += (this.targetPosition.x - this.camera.position.x) * lerpFactor;
    this.camera.position.y += (this.targetPosition.y - this.camera.position.y) * lerpFactor;
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  getWorldPosition(): Vector3 {
    return this.camera.position.clone();
  }

  screenToWorld(screenX: number, screenY: number, viewportWidth: number, viewportHeight: number): Vector3 {
    const ndcX = (screenX / viewportWidth) * 2 - 1;
    const ndcY = -(screenY / viewportHeight) * 2 + 1;

    // PerspectiveCamera에서 z=0 평면과의 교차점 계산
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const halfHeight = Math.tan(fovRad / 2) * this.camera.position.z;
    const halfWidth = halfHeight * this.camera.aspect;

    const worldX = this.camera.position.x + ndcX * halfWidth;
    const worldY = this.camera.position.y + ndcY * halfHeight;

    return new Vector3(worldX, worldY, 0);
  }
}
