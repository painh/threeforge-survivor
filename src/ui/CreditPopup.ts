import { Scene, Group, Mesh } from 'three';
import { UIPanel, UIText, UIBox } from '../../lib/three-troika-ui/src';

export class CreditPopup {
  private popupRoot: Group;
  private overlay: UIBox;
  private container: UIPanel;
  private titleText: UIText;
  private contentPanel: UIPanel;
  private contentTexts: UIText[] = [];
  private confirmButton: UIPanel;
  private confirmButtonBg: UIBox;

  private _visible: boolean = false;
  private scrollOffset: number = 0;
  private maxScroll: number = 0;
  private contentHeight: number = 0;
  private visibleHeight: number = 2.8;

  private onCloseCallback: (() => void) | null = null;

  // 카메라 뷰 크기 (reserved for future use)
  // @ts-ignore
  private _viewWidth: number = 20;
  // @ts-ignore
  private _viewHeight: number = 15;

  constructor() {
    this.popupRoot = new Group();
    this.popupRoot.position.z = 2;
    this.popupRoot.visible = false;

    // 반투명 오버레이 (전체 화면)
    this.overlay = new UIBox({
      width: 25,
      height: 20,
      color: 0x000000,
      opacity: 0.7,
    });
    this.popupRoot.add(this.overlay);

    // 팝업 컨테이너
    this.container = new UIPanel({
      width: 6,
      height: 4.2,
      backgroundColor: 0x1a1a2e,
      backgroundOpacity: 0.95,
      borderRadius: 0.12,
      padding: 0.2,
      gap: 0.15,
      direction: 'vertical',
      justify: 'start',
      align: 'center',
    });
    this.container.position.z = 0.1;

    // 제목
    const titlePanel = new UIPanel({
      width: 5.6,
      height: 0.45,
      backgroundColor: 0x2c3e50,
      backgroundOpacity: 1,
      borderRadius: 0.06,
      direction: 'vertical',
      justify: 'center',
      align: 'center',
    });

    this.titleText = new UIText({
      text: '크레딧',
      fontSize: 0.28,
      color: 0xf1c40f,
      anchorX: 'center',
      anchorY: 'middle',
    });
    titlePanel.addChild(this.titleText);
    this.container.addChild(titlePanel);

    // 콘텐츠 영역 배경
    const contentBg = new UIBox({
      width: 5.6,
      height: this.visibleHeight,
      color: 0x16213e,
      opacity: 1,
      borderRadius: 0.06,
    });

    // 콘텐츠 패널 (스크롤될 내용)
    this.contentPanel = new UIPanel({
      width: 5.4,
      height: this.visibleHeight,
      padding: 0.1,
      gap: 0.02,
      direction: 'vertical',
      justify: 'start',
      align: 'start',
    });

    // 콘텐츠 영역 조립
    const contentWrapper = new Group();
    contentWrapper.add(contentBg);
    this.contentPanel.position.z = 0.01;
    contentWrapper.add(this.contentPanel);
    this.container.add(contentWrapper);

    // 확인 버튼
    this.confirmButtonBg = new UIBox({
      width: 1.8,
      height: 0.4,
      color: 0x27ae60,
      opacity: 1,
      borderRadius: 0.08,
    });

    this.confirmButton = new UIPanel({
      width: 1.8,
      height: 0.4,
      direction: 'vertical',
      justify: 'center',
      align: 'center',
    });
    this.confirmButton.add(this.confirmButtonBg);
    this.confirmButtonBg.position.z = -0.01;

    const buttonText = new UIText({
      text: '확인',
      fontSize: 0.2,
      color: 0xffffff,
      anchorX: 'center',
      anchorY: 'middle',
    });
    this.confirmButton.addChild(buttonText);

    // 버튼을 아래에 배치
    this.confirmButton.position.y = -1.7;
    this.container.add(this.confirmButton);

    this.popupRoot.add(this.container);
  }

  setText(content: string): void {
    // 기존 텍스트 제거
    for (const text of this.contentTexts) {
      text.dispose();
      this.contentPanel.remove(text);
    }
    this.contentTexts = [];

    // 줄별로 텍스트 추가
    const lines = content.split('\n');
    this.contentHeight = lines.length * 0.22;
    this.maxScroll = Math.max(0, this.contentHeight - this.visibleHeight + 0.4);

    let yPos = this.visibleHeight / 2 - 0.15;

    for (const line of lines) {
      const isHeader = line.startsWith('#');
      const isSubHeader = line.startsWith('##');
      const displayLine = line.replace(/^#+\s*/, '');

      const text = new UIText({
        text: displayLine || ' ',
        fontSize: isHeader ? (isSubHeader ? 0.16 : 0.2) : 0.13,
        color: isHeader ? 0xf1c40f : 0xecf0f1,
        anchorX: 'left',
        anchorY: 'top',
      });

      text.position.set(-2.6, yPos, 0.01);
      this.contentPanel.add(text);
      this.contentTexts.push(text);

      yPos -= 0.22;
    }
  }

  show(onClose?: () => void): void {
    this._visible = true;
    this.popupRoot.visible = true;
    this.scrollOffset = 0;
    this.updateScroll();
    this.onCloseCallback = onClose || null;
  }

  hide(): void {
    this._visible = false;
    this.popupRoot.visible = false;
    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }
  }

  get visible(): boolean {
    return this._visible;
  }

  scroll(delta: number): void {
    if (!this._visible) return;
    this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset + delta));
    this.updateScroll();
  }

  private updateScroll(): void {
    // 콘텐츠 패널의 Y 위치 조절
    this.contentPanel.position.y = this.scrollOffset;
  }

  getConfirmButton(): Mesh[] {
    return this.confirmButtonBg.getInteractiveMeshes();
  }

  addToScene(scene: Scene): void {
    scene.add(this.popupRoot);
  }

  removeFromScene(scene: Scene): void {
    scene.remove(this.popupRoot);
  }

  setPosition(x: number, y: number, _cameraZ: number = 10): void {
    this.popupRoot.position.set(x, y, 6);
  }

  setViewSize(width: number, height: number): void {
    this._viewWidth = width;
    this._viewHeight = height;
  }
}
