import ThreeMeshUI from 'three-mesh-ui';
import { Scene, Color, Group } from 'three';

export class CreditPopup {
  private popupRoot: Group;
  private overlay: ThreeMeshUI.Block;
  private container: ThreeMeshUI.Block;
  private contentContainer: ThreeMeshUI.Block;
  private textBlock: ThreeMeshUI.Block;
  private confirmButton: ThreeMeshUI.Block;

  private _visible: boolean = false;
  private scrollOffset: number = 0;
  private maxScroll: number = 0;
  private contentHeight: number = 0;
  private visibleHeight: number = 2.8;

  private onCloseCallback: (() => void) | null = null;

  // 카메라 뷰 크기
  private viewWidth: number = 20;
  private viewHeight: number = 15;

  constructor() {
    this.popupRoot = new Group();
    this.popupRoot.position.z = 2;
    this.popupRoot.visible = false;

    // 반투명 오버레이 (전체 화면)
    this.overlay = new ThreeMeshUI.Block({
      width: 25,
      height: 20,
      backgroundColor: new Color(0x000000),
      backgroundOpacity: 0.7,
    });

    // 팝업 컨테이너
    this.container = new ThreeMeshUI.Block({
      width: 6,
      height: 4.2,
      backgroundColor: new Color(0x1a1a2e),
      backgroundOpacity: 0.95,
      borderRadius: 0.12,
      padding: 0.2,
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: '/assets/fonts/BMHANNA_11yrs_ttf.json',
      fontTexture: '/assets/fonts/BMHANNA.png',
    });

    // 제목
    const titleBlock = new ThreeMeshUI.Block({
      width: 5.6,
      height: 0.45,
      backgroundColor: new Color(0x2c3e50),
      backgroundOpacity: 1,
      borderRadius: 0.06,
      justifyContent: 'center',
      alignItems: 'center',
    });

    const titleText = new ThreeMeshUI.Text({
      content: '크레딧',
      fontSize: 0.28,
      fontColor: new Color(0xf1c40f),
    });
    titleBlock.add(titleText);

    // 스크롤 가능한 콘텐츠 영역 (클리핑 컨테이너)
    this.contentContainer = new ThreeMeshUI.Block({
      width: 5.6,
      height: this.visibleHeight,
      backgroundColor: new Color(0x16213e),
      backgroundOpacity: 1,
      borderRadius: 0.06,
      padding: 0.1,
      justifyContent: 'start',
      alignItems: 'center',
      hiddenOverflow: true,
    });

    // 텍스트 블록 (스크롤될 내용)
    this.textBlock = new ThreeMeshUI.Block({
      width: 5.4,
      height: 'auto',
      backgroundColor: new Color(0x16213e),
      backgroundOpacity: 0,
      justifyContent: 'start',
      alignItems: 'start',
    });

    this.contentContainer.add(this.textBlock);

    // 확인 버튼
    this.confirmButton = new ThreeMeshUI.Block({
      width: 1.8,
      height: 0.4,
      backgroundColor: new Color(0x27ae60),
      backgroundOpacity: 1,
      borderRadius: 0.08,
      justifyContent: 'center',
      alignItems: 'center',
    });

    const buttonText = new ThreeMeshUI.Text({
      content: '확인',
      fontSize: 0.2,
      fontColor: new Color(0xffffff),
    });
    this.confirmButton.add(buttonText);

    // 조립
    this.container.add(titleBlock);
    this.container.add(this.contentContainer);
    this.container.add(this.confirmButton);

    this.popupRoot.add(this.overlay);
    this.popupRoot.add(this.container);
  }

  setText(content: string): void {
    // 기존 텍스트 제거
    while (this.textBlock.children.length > 0) {
      this.textBlock.remove(this.textBlock.children[0]);
    }

    // 줄별로 텍스트 추가
    const lines = content.split('\n');
    this.contentHeight = lines.length * 0.22;
    this.maxScroll = Math.max(0, this.contentHeight - this.visibleHeight + 0.4);

    lines.forEach((line) => {
      const lineBlock = new ThreeMeshUI.Block({
        width: 5.4,
        height: 0.22,
        backgroundColor: new Color(0x16213e),
        backgroundOpacity: 0,
        justifyContent: 'start',
        alignItems: 'center',
      });

      const isHeader = line.startsWith('#');
      const isSubHeader = line.startsWith('##');
      const displayLine = line.replace(/^#+\s*/, '');

      // 빈 줄이 아닌 경우에만 텍스트 추가
      if (displayLine.trim().length > 0) {
        const text = new ThreeMeshUI.Text({
          content: displayLine,
          fontSize: isHeader ? (isSubHeader ? 0.16 : 0.2) : 0.13,
          fontColor: new Color(isHeader ? 0xf1c40f : 0xecf0f1),
        });
        lineBlock.add(text);
      }

      this.textBlock.add(lineBlock);
    });

    // 텍스트 블록 높이 설정
    this.textBlock.set({ height: this.contentHeight });
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
    // 텍스트 블록의 Y 위치 조절
    const topPosition = (this.visibleHeight / 2) - (this.contentHeight / 2) + this.scrollOffset;
    this.textBlock.position.y = topPosition;
  }

  getConfirmButton(): ThreeMeshUI.Block {
    return this.confirmButton;
  }

  addToScene(scene: Scene): void {
    scene.add(this.popupRoot);
  }

  removeFromScene(scene: Scene): void {
    scene.remove(this.popupRoot);
  }

  setPosition(x: number, y: number, cameraZ: number = 10): void {
    this.popupRoot.position.set(x, y, 6);
  }

  setViewSize(width: number, height: number): void {
    this.viewWidth = width;
    this.viewHeight = height;
  }
}
