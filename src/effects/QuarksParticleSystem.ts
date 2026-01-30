import {
  BatchedParticleRenderer,
  ParticleSystem,
  SphereEmitter,
  RenderMode,
  IntervalValue,
  ConstantValue,
  ConstantColor,
  SizeOverLife,
  PiecewiseBezier,
  Bezier,
  SpeedOverLife,
} from 'three.quarks';
import {
  Scene,
  Vector3,
  Vector4,
  Color,
  AdditiveBlending,
  MeshBasicMaterial,
} from 'three';

export class QuarksParticleSystem {
  private batchRenderer: InstanceType<typeof BatchedParticleRenderer>;
  private scene: Scene | null = null;

  constructor() {
    this.batchRenderer = new BatchedParticleRenderer();
  }

  addToScene(scene: Scene): void {
    this.scene = scene;
    scene.add(this.batchRenderer);
  }

  removeFromScene(scene: Scene): void {
    scene.remove(this.batchRenderer);
    this.scene = null;
  }

  emitHitEffect(position: Vector3): void {
    if (!this.scene) return;

    const material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    // 빨간색/주황색 파티클
    const hitSystem = new ParticleSystem({
      duration: 0.5,
      looping: false,
      startLife: new IntervalValue(0.2, 0.4),
      startSpeed: new IntervalValue(2, 5),
      startSize: new IntervalValue(0.1, 0.25),
      startColor: new ConstantColor(new Vector4(1, 0.3, 0.1, 1) as any),
      worldSpace: true,
      maxParticle: 20,
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [
        {
          time: 0,
          count: new ConstantValue(12),
          cycle: 1,
          interval: 0.01,
          probability: 1,
        },
      ],
      shape: new SphereEmitter({ radius: 0.1, thickness: 1 }),
      material: material,
      renderMode: RenderMode.BillBoard,
      renderOrder: 1,
    } as any);

    hitSystem.addBehavior(
      new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.8, 0.3, 0), 0]]))
    );
    hitSystem.addBehavior(
      new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.5, 0.2, 0), 0]]))
    );

    hitSystem.emitter.position.copy(position);
    hitSystem.emitter.position.z = 0.5;
    this.scene.add(hitSystem.emitter);

    this.batchRenderer.addSystem(hitSystem);

    // 자동 정리
    setTimeout(() => {
      this.batchRenderer.deleteSystem(hitSystem);
      if (this.scene) {
        this.scene.remove(hitSystem.emitter);
      }
      material.dispose();
    }, 600);
  }

  emitDeathEffect(
    position: Vector3,
    color: Color = new Color(0xff4444)
  ): void {
    if (!this.scene) return;

    const material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    // Color를 Vector4로 변환
    const colorVec = new Vector4(color.r, color.g, color.b, 1);

    // 메인 컬러 파티클
    const deathSystem = new ParticleSystem({
      duration: 1,
      looping: false,
      startLife: new IntervalValue(0.4, 0.8),
      startSpeed: new IntervalValue(2, 5),
      startSize: new IntervalValue(0.2, 0.45),
      startColor: new ConstantColor(colorVec as any),
      worldSpace: true,
      maxParticle: 30,
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [
        {
          time: 0,
          count: new ConstantValue(20),
          cycle: 1,
          interval: 0.01,
          probability: 1,
        },
      ],
      shape: new SphereEmitter({ radius: 0.2, thickness: 1 }),
      material: material,
      renderMode: RenderMode.BillBoard,
      renderOrder: 1,
    } as any);

    deathSystem.addBehavior(
      new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1.2, 0.5, 0), 0]]))
    );
    deathSystem.addBehavior(
      new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.3, 0.1, 0), 0]]))
    );

    deathSystem.emitter.position.copy(position);
    deathSystem.emitter.position.z = 0.5;
    this.scene.add(deathSystem.emitter);

    this.batchRenderer.addSystem(deathSystem);

    // 자동 정리
    setTimeout(() => {
      this.batchRenderer.deleteSystem(deathSystem);
      if (this.scene) {
        this.scene.remove(deathSystem.emitter);
      }
      material.dispose();
    }, 1200);
  }

  update(deltaTime: number): void {
    this.batchRenderer.update(deltaTime);
  }

  dispose(): void {
    // BatchedRenderer가 모든 시스템을 관리
  }
}
