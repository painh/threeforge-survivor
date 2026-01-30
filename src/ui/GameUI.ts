import { Scene, Group, Mesh, PlaneGeometry, MeshBasicMaterial } from 'three';
import { UIPanel, UIText, UIBox } from '../../lib/three-troika-ui/src';

export interface GameUIState {
  hp: number;
  maxHp: number;
  score: number;
  fps: number;
}

export class GameUI {
  private uiRoot: Group;

  // HP Bar (왼쪽 상단) - 순수 Three.js Mesh 사용 (지연 애니메이션 때문에)
  private hpBarGroup: Group;
  private hpBarBg: Mesh;
  private hpDelayFill: Mesh;
  private hpBarFill: Mesh;
  private hpDelayMaterial: MeshBasicMaterial;
  private hpFillMaterial: MeshBasicMaterial;

  // HP 지연 애니메이션 상태
  private delayedHp: number = -1;
  private lastHp: number = -1;
  private delayTimer: number = 0;
  private readonly DELAY_WAIT: number = 0.3;
  private readonly DELAY_SPEED: number = 100;

  // Score (중앙 상단) - troika-ui
  private scorePanel: UIPanel;
  private scoreText: UIText;

  // FPS Counter (왼쪽 상단, HP 아래) - troika-ui
  private fpsPanel: UIPanel;
  private fpsText: UIText;

  // Credit Button (오른쪽 하단) - troika-ui
  private creditButton: UIPanel;
  private creditButtonBg: UIBox;

  private state: GameUIState = {
    hp: 100,
    maxHp: 100,
    score: 0,
    fps: 60,
  };

  // 카메라 뷰 크기
  private viewWidth: number = 12;
  private viewHeight: number = 5.7;

  constructor() {
    this.uiRoot = new Group();
    this.uiRoot.position.z = 1;

    // HP Bar - 순수 Three.js Mesh로 구현 (지연 애니메이션)
    this.hpBarGroup = new Group();

    const bgGeometry = new PlaneGeometry(2.8, 0.3);
    const bgMaterial = new MeshBasicMaterial({ color: 0x222222 });
    this.hpBarBg = new Mesh(bgGeometry, bgMaterial);
    this.hpBarBg.position.z = 0;
    this.hpBarGroup.add(this.hpBarBg);

    const delayGeometry = new PlaneGeometry(2.68, 0.20);
    this.hpDelayMaterial = new MeshBasicMaterial({ color: 0xf1c40f });
    this.hpDelayFill = new Mesh(delayGeometry, this.hpDelayMaterial);
    this.hpDelayFill.position.z = 0.01;
    this.hpBarGroup.add(this.hpDelayFill);

    const fillGeometry = new PlaneGeometry(2.7, 0.22);
    this.hpFillMaterial = new MeshBasicMaterial({ color: 0x2ecc71 });
    this.hpBarFill = new Mesh(fillGeometry, this.hpFillMaterial);
    this.hpBarFill.position.z = 0.02;
    this.hpBarGroup.add(this.hpBarFill);

    // Score Panel - troika-ui
    this.scorePanel = new UIPanel({
      width: 2.5,
      height: 0.6,
      backgroundColor: 0x000000,
      backgroundOpacity: 0.7,
      borderRadius: 0.08,
    });

    this.scoreText = new UIText({
      text: '0',
      fontSize: 0.35,
      color: 0xf1c40f,
      anchorX: 'center',
      anchorY: 'middle',
    });
    this.scoreText.position.z = 0.01;
    this.scorePanel.add(this.scoreText);

    // FPS Panel - troika-ui
    this.fpsPanel = new UIPanel({
      width: 1.4,
      height: 0.35,
      backgroundColor: 0x000000,
      backgroundOpacity: 0.5,
      borderRadius: 0.04,
    });

    this.fpsText = new UIText({
      text: 'FPS: 60',
      fontSize: 0.15,
      color: 0x2ecc71,
      anchorX: 'center',
      anchorY: 'middle',
    });
    this.fpsText.position.z = 0.01;
    this.fpsPanel.add(this.fpsText);

    // Credit Button - troika-ui
    this.creditButtonBg = new UIBox({
      width: 1.6,
      height: 0.45,
      color: 0x34495e,
      opacity: 0.85,
      borderRadius: 0.08,
    });

    this.creditButton = new UIPanel({
      width: 1.6,
      height: 0.45,
    });
    this.creditButton.add(this.creditButtonBg);
    this.creditButtonBg.position.z = -0.01;

    const creditText = new UIText({
      text: 'Credit',
      fontSize: 0.2,
      color: 0xecf0f1,
      anchorX: 'center',
      anchorY: 'middle',
    });
    creditText.position.z = 0.01;
    this.creditButton.add(creditText);

    // UI 요소들을 그룹에 추가
    this.uiRoot.add(this.hpBarGroup);
    this.uiRoot.add(this.scorePanel);
    this.uiRoot.add(this.fpsPanel);
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
    this.scorePanel.position.set(0, halfH - 0.45 - margin, 0);

    // FPS: 왼쪽 상단, HP 아래
    this.fpsPanel.position.set(-halfW + 0.9 + margin, halfH - 1.0 - margin, 0);

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
      this.delayTimer = this.DELAY_WAIT;
    } else if (hpDiff > 0) {
      this.delayTimer = 0;
    }

    // 지연 타이머 처리
    if (this.delayTimer > 0) {
      this.delayTimer -= deltaTime;
    } else {
      if (this.delayedHp > currentHp) {
        this.delayedHp = Math.max(currentHp, this.delayedHp - this.DELAY_SPEED * deltaTime);
      } else if (this.delayedHp < currentHp) {
        this.delayedHp = Math.min(currentHp, this.delayedHp + this.DELAY_SPEED * deltaTime);
      }
    }

    this.lastHp = currentHp;

    // HP 퍼센트 계산
    const hpPercent = Math.max(0, Math.min(1, currentHp / maxHp));
    const delayPercent = Math.max(0, Math.min(1, this.delayedHp / maxHp));

    const maxWidth = 2.7;

    // HP바 업데이트
    this.hpBarFill.scale.x = hpPercent;
    this.hpBarFill.position.x = -maxWidth / 2 * (1 - hpPercent);

    // 지연 게이지 업데이트
    this.hpDelayFill.scale.x = delayPercent;
    this.hpDelayFill.position.x = -maxWidth / 2 * (1 - delayPercent);

    // Update Score
    this.scoreText.setText(this.state.score.toString());

    // Update FPS
    this.fpsText.setText(`FPS: ${this.state.fps}`);

    // FPS 색상 변경
    let fpsColor: number;
    if (this.state.fps >= 55) {
      fpsColor = 0x2ecc71; // 녹색
    } else if (this.state.fps >= 30) {
      fpsColor = 0xf39c12; // 주황색
    } else {
      fpsColor = 0xe74c3c; // 빨간색
    }
    this.fpsText.setColor(fpsColor);
  }

  // 렌더 루프에서 호출 (troika는 자동 업데이트)
  updateMeshUI(): void {
    // troika-three-text는 자동으로 업데이트됨
  }

  setPosition(x: number, y: number, _cameraZ: number = 10): void {
    this.uiRoot.position.set(x, y, 5);
  }

  setViewSize(width: number, height: number): void {
    this.viewWidth = width;
    this.viewHeight = height;
    this.updateLayout();
  }

  getState(): GameUIState {
    return { ...this.state };
  }

  getCreditButton(): UIBox {
    return this.creditButtonBg;
  }

  getUIRoot(): Group {
    return this.uiRoot;
  }

  setCreditButtonVisible(visible: boolean): void {
    this.creditButton.visible = visible;
  }
}
