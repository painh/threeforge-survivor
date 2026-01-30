import ThreeMeshUI from 'three-mesh-ui';
import {
  Scene,
  Color,
  Group,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
} from 'three';

export interface GameUIState {
  hp: number;
  maxHp: number;
  score: number;
  fps: number;
}

export class GameUI {
  private uiRoot: Group;

  // HP Bar (왼쪽 상단) - 순수 Three.js Mesh 사용
  private hpBarGroup: Group;
  private hpBarBg: Mesh;
  private hpDelayFill: Mesh;
  private hpBarFill: Mesh;
  private hpDelayMaterial: MeshBasicMaterial;
  private hpFillMaterial: MeshBasicMaterial;

  // HP 지연 애니메이션 상태
  private delayedHp: number = -1; // -1은 초기화 필요 표시
  private lastHp: number = -1;    // -1은 초기화 필요 표시
  private delayTimer: number = 0;
  private readonly DELAY_WAIT: number = 0.3;    // 지연 시작 전 대기 시간
  private readonly DELAY_SPEED: number = 100;   // 초당 감소/증가 속도 (1초에 100 HP)

  // Score (중앙 상단)
  private scoreContainer: ThreeMeshUI.Block;
  private scoreText: ThreeMeshUI.Text;

  // FPS Counter (왼쪽 상단, HP 아래)
  private fpsContainer: ThreeMeshUI.Block;
  private fpsText: ThreeMeshUI.Text;

  // Credit Button (오른쪽 하단)
  private creditButton: ThreeMeshUI.Block;

  private state: GameUIState = {
    hp: 100,
    maxHp: 100,
    score: 0,
    fps: 60,
  };

  // 카메라 뷰 크기 (fov 60, 거리 5에서의 실제 뷰 크기)
  private viewWidth: number = 12;
  private viewHeight: number = 5.7;

  constructor() {
    this.uiRoot = new Group();
    this.uiRoot.position.z = 1; // UI가 게임 오브젝트 위에 표시되도록

    // HP Bar - 순수 Three.js Mesh로 구현
    this.hpBarGroup = new Group();

    // HP Bar 배경 (검은색)
    const bgGeometry = new PlaneGeometry(2.8, 0.3);
    const bgMaterial = new MeshBasicMaterial({ color: 0x222222 });
    this.hpBarBg = new Mesh(bgGeometry, bgMaterial);
    this.hpBarBg.position.z = 0;
    this.hpBarGroup.add(this.hpBarBg);

    // 지연 게이지 (노란색) - HP bar보다 약간 작게
    const delayGeometry = new PlaneGeometry(2.68, 0.20);
    this.hpDelayMaterial = new MeshBasicMaterial({ color: 0xf1c40f });
    this.hpDelayFill = new Mesh(delayGeometry, this.hpDelayMaterial);
    this.hpDelayFill.position.z = 0.01;
    this.hpBarGroup.add(this.hpDelayFill);

    // HP Bar 채움 (녹색)
    const fillGeometry = new PlaneGeometry(2.7, 0.22);
    this.hpFillMaterial = new MeshBasicMaterial({ color: 0x2ecc71 });
    this.hpBarFill = new Mesh(fillGeometry, this.hpFillMaterial);
    this.hpBarFill.position.z = 0.02;
    this.hpBarGroup.add(this.hpBarFill);

    // Score Container (중앙 상단)
    this.scoreContainer = new ThreeMeshUI.Block({
      width: 2.5,
      height: 0.6,
      backgroundColor: new Color(0x000000),
      backgroundOpacity: 0.7,
      borderRadius: 0.08,
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '/assets/fonts/BMHANNA_11yrs_ttf.json',
      fontTexture: '/assets/fonts/BMHANNA.png',
    });

    this.scoreText = new ThreeMeshUI.Text({
      content: '0',
      fontSize: 0.35,
      fontColor: new Color(0xf1c40f),
    });
    this.scoreContainer.add(this.scoreText);

    // FPS Container (왼쪽 상단, HP 아래)
    this.fpsContainer = new ThreeMeshUI.Block({
      width: 1.2,
      height: 0.35,
      backgroundColor: new Color(0x000000),
      backgroundOpacity: 0.5,
      borderRadius: 0.04,
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '/assets/fonts/BMHANNA_11yrs_ttf.json',
      fontTexture: '/assets/fonts/BMHANNA.png',
    });

    this.fpsText = new ThreeMeshUI.Text({
      content: 'FPS: 60',
      fontSize: 0.15,
      fontColor: new Color(0x2ecc71),
    });
    this.fpsContainer.add(this.fpsText);

    // Credit Button (오른쪽 하단)
    this.creditButton = new ThreeMeshUI.Block({
      width: 1.6,
      height: 0.45,
      backgroundColor: new Color(0x34495e),
      backgroundOpacity: 0.85,
      borderRadius: 0.08,
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '/assets/fonts/BMHANNA_11yrs_ttf.json',
      fontTexture: '/assets/fonts/BMHANNA.png',
    });

    const creditText = new ThreeMeshUI.Text({
      content: 'Credit',
      fontSize: 0.2,
      fontColor: new Color(0xecf0f1),
    });
    this.creditButton.add(creditText);

    // UI 요소들을 그룹에 추가
    this.uiRoot.add(this.hpBarGroup);
    this.uiRoot.add(this.scoreContainer);
    this.uiRoot.add(this.fpsContainer);
    this.uiRoot.add(this.creditButton);

    // 초기 위치 설정
    this.updateLayout();
  }

  private updateLayout(): void {
    const halfW = this.viewWidth / 2;
    const halfH = this.viewHeight / 2;
    const margin = 0.3;

    // HP Bar: 왼쪽 상단
    this.hpBarGroup.position.set(-halfW + 1.7 + margin, halfH - 0.3 - margin, 0);

    // Score: 중앙 상단
    this.scoreContainer.position.set(0, halfH - 0.45 - margin, 0);

    // FPS: 왼쪽 상단, HP 아래
    this.fpsContainer.position.set(-halfW + 0.9 + margin, halfH - 1.0 - margin, 0);

    // Credit Button: 오른쪽 하단
    this.creditButton.position.set(halfW - 1.1 - margin, -halfH + 0.4 + margin, 0);
  }

  addToScene(scene: Scene): void {
    scene.add(this.uiRoot);
  }

  removeFromScene(scene: Scene): void {
    scene.remove(this.uiRoot);
  }

  update(state: Partial<GameUIState>, deltaTime: number = 0): void {
    Object.assign(this.state, state);

    const currentHp = this.state.hp;
    const maxHp = this.state.maxHp;

    // 첫 업데이트 시 초기화
    if (this.lastHp < 0) {
      this.lastHp = currentHp;
      this.delayedHp = currentHp;
    }

    const hpDiff = currentHp - this.lastHp;

    // HP 변화 감지
    if (hpDiff < 0) {
      // 데미지: 지연 타이머 시작 (지연 게이지는 그대로, HP바만 즉시 감소)
      this.delayTimer = this.DELAY_WAIT;
    } else if (hpDiff > 0) {
      // 회복: 지연 게이지를 현재 위치에서 시작 (HP바는 즉시 증가)
      this.delayTimer = 0;
    }

    // 지연 타이머 처리
    if (this.delayTimer > 0) {
      this.delayTimer -= deltaTime;
    } else {
      // 지연 게이지를 현재 HP로 점진적 이동
      if (this.delayedHp > currentHp) {
        // 데미지 후 지연 감소
        this.delayedHp = Math.max(currentHp, this.delayedHp - this.DELAY_SPEED * deltaTime);
      } else if (this.delayedHp < currentHp) {
        // 회복 후 지연 증가
        this.delayedHp = Math.min(currentHp, this.delayedHp + this.DELAY_SPEED * deltaTime);
      }
    }

    this.lastHp = currentHp;

    // HP 퍼센트 계산
    const hpPercent = Math.max(0, Math.min(1, currentHp / maxHp));
    const delayPercent = Math.max(0, Math.min(1, this.delayedHp / maxHp));

    // HP바 너비 계산
    const maxWidth = 2.7;
    const hpWidth = Math.max(0.01, maxWidth * hpPercent);
    const delayWidth = Math.max(0.01, maxWidth * delayPercent);

    // HP바 업데이트 (스케일로 너비 조절, 왼쪽 정렬)
    this.hpBarFill.scale.x = hpPercent;
    this.hpBarFill.position.x = -maxWidth / 2 * (1 - hpPercent);

    // 지연 게이지 업데이트
    this.hpDelayFill.scale.x = delayPercent;
    this.hpDelayFill.position.x = -maxWidth / 2 * (1 - delayPercent);


    // Update Score
    this.scoreText.set({ content: this.state.score.toString() });

    // Update FPS
    this.fpsText.set({ content: `FPS: ${this.state.fps}` });

    // FPS 색상 변경
    let fpsColor: Color;
    if (this.state.fps >= 55) {
      fpsColor = new Color(0x2ecc71); // 녹색
    } else if (this.state.fps >= 30) {
      fpsColor = new Color(0xf39c12); // 주황색
    } else {
      fpsColor = new Color(0xe74c3c); // 빨간색
    }
    this.fpsText.set({ fontColor: fpsColor });
  }

  // 렌더 루프에서 호출
  updateMeshUI(): void {
    ThreeMeshUI.update();
  }

  // 카메라 위치 따라가기 (게임 오브젝트보다 카메라에 더 가깝게)
  setPosition(x: number, y: number, cameraZ: number = 10): void {
    // 게임 오브젝트는 z=0에 있음
    // UI는 카메라(z=10)와 게임오브젝트(z=0) 사이에 배치해야 함
    // 카메라에서 가까울수록 UI가 작게 보이므로 적절한 거리 선택
    // z=5면 카메라에서 5 단위 떨어짐, 게임오브젝트보다 카메라에 가까움
    this.uiRoot.position.set(x, y, 5);
  }

  // 뷰 크기 업데이트
  setViewSize(width: number, height: number): void {
    this.viewWidth = width;
    this.viewHeight = height;
    this.updateLayout();
  }

  getState(): GameUIState {
    return { ...this.state };
  }

  getCreditButton(): ThreeMeshUI.Block {
    return this.creditButton;
  }

  getUIRoot(): Group {
    return this.uiRoot;
  }
}
