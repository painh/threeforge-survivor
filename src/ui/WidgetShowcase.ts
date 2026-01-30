import { Scene, Group } from 'three';
import {
  UIBox,
  UIText,
  UIButton,
  UISlider,
  UICheckbox,
  UIToggle,
  UIProgressBar,
} from '../../lib/three-troika-ui/src';

/**
 * UI 위젯 쇼케이스 팝업
 * 모든 UI 위젯을 한눈에 볼 수 있는 데모
 */
export class WidgetShowcase {
  private popupRoot: Group;
  private overlay: UIBox;
  private container: Group;
  private containerBg: UIBox;

  // 위젯들
  private widgets: Group;
  private button1: UIButton;
  private button2: UIButton;
  private button3: UIButton;
  private slider1: UISlider;
  private slider2: UISlider;
  private checkbox1: UICheckbox;
  private checkbox2: UICheckbox;
  private toggle1: UIToggle;
  private toggle2: UIToggle;
  private progressBar1: UIProgressBar;
  private progressBar2: UIProgressBar;
  private closeButton: UIButton;

  private _visible: boolean = false;
  private onCloseCallback: (() => void) | null = null;

  constructor() {
    this.popupRoot = new Group();
    this.popupRoot.position.z = 3;
    this.popupRoot.visible = false;

    // 반투명 오버레이
    this.overlay = new UIBox({
      width: 25,
      height: 20,
      color: 0x000000,
      opacity: 0.7,
    });
    this.popupRoot.add(this.overlay);

    // 팝업 컨테이너
    this.container = new Group();
    this.container.position.z = 0.1;

    // 팝업 배경
    this.containerBg = new UIBox({
      width: 8,
      height: 6,
      color: 0x1a1a2e,
      opacity: 0.95,
      borderRadius: 0.12,
    });
    this.container.add(this.containerBg);

    // 제목
    const titleBg = new UIBox({
      width: 7.6,
      height: 0.5,
      color: 0x2c3e50,
      opacity: 1,
      borderRadius: 0.06,
    });
    titleBg.position.set(0, 2.5, 0.01);
    this.container.add(titleBg);

    const titleText = new UIText({
      text: 'UI Widget Showcase',
      fontSize: 0.28,
      color: 0xf1c40f,
      anchorX: 'center',
      anchorY: 'middle',
    });
    titleText.position.set(0, 2.5, 0.02);
    this.container.add(titleText);

    // 위젯 컨테이너
    this.widgets = new Group();
    this.widgets.position.set(0, 0, 0.01);
    this.container.add(this.widgets);

    // === 버튼 섹션 ===
    const buttonLabel = new UIText({
      text: 'Buttons',
      fontSize: 0.18,
      color: 0x95a5a6,
      anchorX: 'left',
      anchorY: 'middle',
    });
    buttonLabel.position.set(-3.5, 1.8, 0);
    this.widgets.add(buttonLabel);

    this.button1 = new UIButton({
      text: 'Primary',
      width: 1.5,
      height: 0.4,
      fontSize: 0.16,
      color: 0x3498db,
      hoverColor: 0x2980b9,
      pressColor: 0x1a5276,
      onClick: () => console.log('Primary clicked'),
    });
    this.button1.position.set(-2.5, 1.3, 0);
    this.widgets.add(this.button1);

    this.button2 = new UIButton({
      text: 'Success',
      width: 1.5,
      height: 0.4,
      fontSize: 0.16,
      color: 0x2ecc71,
      hoverColor: 0x27ae60,
      pressColor: 0x1e8449,
      onClick: () => console.log('Success clicked'),
    });
    this.button2.position.set(-0.8, 1.3, 0);
    this.widgets.add(this.button2);

    this.button3 = new UIButton({
      text: 'Disabled',
      width: 1.5,
      height: 0.4,
      fontSize: 0.16,
      color: 0xe74c3c,
      hoverColor: 0xc0392b,
    });
    this.button3.setDisabled(true);
    this.button3.position.set(0.9, 1.3, 0);
    this.widgets.add(this.button3);

    // === 슬라이더 섹션 ===
    const sliderLabel = new UIText({
      text: 'Sliders',
      fontSize: 0.18,
      color: 0x95a5a6,
      anchorX: 'left',
      anchorY: 'middle',
    });
    sliderLabel.position.set(-3.5, 0.7, 0);
    this.widgets.add(sliderLabel);

    this.slider1 = new UISlider({
      width: 3,
      min: 0,
      max: 100,
      value: 75,
      showValue: true,
      fillColor: 0x3498db,
      onChange: (v) => console.log('Slider1:', v),
    });
    this.slider1.position.set(-1.8, 0.2, 0);
    this.widgets.add(this.slider1);

    this.slider2 = new UISlider({
      width: 3,
      min: 0,
      max: 10,
      value: 3,
      step: 1,
      showValue: true,
      fillColor: 0x9b59b6,
      onChange: (v) => console.log('Slider2:', v),
    });
    this.slider2.position.set(-1.8, -0.4, 0);
    this.widgets.add(this.slider2);

    // === 체크박스/토글 섹션 ===
    const checkLabel = new UIText({
      text: 'Checkbox & Toggle',
      fontSize: 0.18,
      color: 0x95a5a6,
      anchorX: 'left',
      anchorY: 'middle',
    });
    checkLabel.position.set(-3.5, -0.9, 0);
    this.widgets.add(checkLabel);

    this.checkbox1 = new UICheckbox({
      label: 'Sound Effects',
      checked: true,
      onChange: (v) => console.log('Checkbox1:', v),
    });
    this.checkbox1.position.set(-3.2, -1.35, 0);
    this.widgets.add(this.checkbox1);

    this.checkbox2 = new UICheckbox({
      label: 'Music',
      checked: false,
      onChange: (v) => console.log('Checkbox2:', v),
    });
    this.checkbox2.position.set(-3.2, -1.75, 0);
    this.widgets.add(this.checkbox2);

    this.toggle1 = new UIToggle({
      label: 'Dark Mode',
      value: true,
      onChange: (v) => console.log('Toggle1:', v),
    });
    this.toggle1.position.set(0.5, -1.35, 0);
    this.widgets.add(this.toggle1);

    this.toggle2 = new UIToggle({
      label: 'Notifications',
      value: false,
      onChange: (v) => console.log('Toggle2:', v),
    });
    this.toggle2.position.set(0.5, -1.75, 0);
    this.widgets.add(this.toggle2);

    // === 프로그레스 바 섹션 ===
    const progressLabel = new UIText({
      text: 'Progress Bars',
      fontSize: 0.18,
      color: 0x95a5a6,
      anchorX: 'left',
      anchorY: 'middle',
    });
    progressLabel.position.set(-3.5, -2.2, 0);
    this.widgets.add(progressLabel);

    this.progressBar1 = new UIProgressBar({
      width: 3,
      height: 0.2,
      value: 0.6,
      backgroundColor: 0x2c3e50,
      fillColor: 0x2ecc71,
    });
    this.progressBar1.position.set(-1.8, -2.55, 0);
    this.widgets.add(this.progressBar1);

    this.progressBar2 = new UIProgressBar({
      width: 3,
      height: 0.2,
      value: 0.3,
      backgroundColor: 0x2c3e50,
      fillColor: 0xe74c3c,
    });
    this.progressBar2.position.set(-1.8, -2.85, 0);
    this.widgets.add(this.progressBar2);

    // 닫기 버튼
    this.closeButton = new UIButton({
      text: 'Close',
      width: 1.8,
      height: 0.45,
      fontSize: 0.2,
      color: 0x34495e,
      hoverColor: 0x4a6278,
      onClick: () => this.hide(),
    });
    this.closeButton.position.set(2.8, -2.5, 0.02);
    this.container.add(this.closeButton);

    this.popupRoot.add(this.container);
  }

  addToScene(scene: Scene): void {
    scene.add(this.popupRoot);
  }

  removeFromScene(scene: Scene): void {
    scene.remove(this.popupRoot);
  }

  show(onClose?: () => void): void {
    this._visible = true;
    this.popupRoot.visible = true;
    this.onCloseCallback = onClose ?? null;
  }

  hide(): void {
    this._visible = false;
    this.popupRoot.visible = false;
    this.onCloseCallback?.();
  }

  get visible(): boolean {
    return this._visible;
  }

  /**
   * 업데이트 (토글 애니메이션용)
   */
  update(deltaTime: number): void {
    if (!this._visible) return;
    this.toggle1.update(deltaTime);
    this.toggle2.update(deltaTime);
  }

  /**
   * 버튼들 반환 (호버/클릭 체크용)
   */
  getButtons(): UIButton[] {
    return [this.button1, this.button2, this.button3, this.closeButton];
  }

  getSliders(): UISlider[] {
    return [this.slider1, this.slider2];
  }

  getCheckboxes(): UICheckbox[] {
    return [this.checkbox1, this.checkbox2];
  }

  getToggles(): UIToggle[] {
    return [this.toggle1, this.toggle2];
  }

  getCloseButton(): UIButton {
    return this.closeButton;
  }

  dispose(): void {
    this.overlay.dispose();
    this.containerBg.dispose();
    this.button1.dispose();
    this.button2.dispose();
    this.button3.dispose();
    this.slider1.dispose();
    this.slider2.dispose();
    this.checkbox1.dispose();
    this.checkbox2.dispose();
    this.toggle1.dispose();
    this.toggle2.dispose();
    this.progressBar1.dispose();
    this.progressBar2.dispose();
    this.closeButton.dispose();
  }
}
