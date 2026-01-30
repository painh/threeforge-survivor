import {
  Scene,
  Group,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  ShapeGeometry,
  Shape,
} from 'three';
import { UIText, UIBox } from '../../lib/three-troika-ui/src';

interface LineData {
  text: string;
  isHeader: boolean;
  isSubHeader: boolean;
  yPos: number;
}

export class CreditPopup {
  private popupRoot: Group;
  private overlay: UIBox;
  private container: Group;
  private containerBg: UIBox;
  private titleText: UIText;
  private contentPanel: Group;
  private contentBg: UIBox;
  private confirmButtonBg: UIBox;
  private buttonText: UIText;

  // 가상 스크롤링 - 보이는 영역만 렌더링
  private allLines: LineData[] = [];
  private visibleTexts: Map<number, UIText> = new Map(); // lineIndex -> UIText
  private textPool: UIText[] = []; // 재사용 풀

  // 클리핑 마스크
  private clipMask: Mesh;

  // 스크롤바 UI
  private scrollbarTrack: Mesh;
  private scrollbarThumb: Mesh;
  private scrollbarThumbMaterial: MeshBasicMaterial;

  private _visible: boolean = false;
  private scrollOffset: number = 0;
  private maxScroll: number = 0;
  private contentHeight: number = 0;
  private visibleHeight: number = 2.8;
  private contentWidth: number = 5.2;
  private lineHeight: number = 0.22;
  private bufferLines: number = 2; // 위아래 버퍼 라인 수

  private onCloseCallback: (() => void) | null = null;

  // 카메라 뷰 크기 (reserved for future use)
  // @ts-ignore
  private _viewWidth: number = 20;
  // @ts-ignore
  private _viewHeight: number = 15;

  // Stencil 참조값
  private static readonly STENCIL_REF = 1;

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

    // 팝업 컨테이너 그룹
    this.container = new Group();
    this.container.position.z = 0.1;

    // 팝업 배경
    this.containerBg = new UIBox({
      width: 6,
      height: 4.2,
      color: 0x1a1a2e,
      opacity: 0.95,
      borderRadius: 0.12,
    });
    this.container.add(this.containerBg);

    // 제목 배경
    const titleBg = new UIBox({
      width: 5.6,
      height: 0.45,
      color: 0x2c3e50,
      opacity: 1,
      borderRadius: 0.06,
    });
    titleBg.position.set(0, 1.65, 0.01);
    this.container.add(titleBg);

    // 제목 텍스트
    this.titleText = new UIText({
      text: '크레딧',
      fontSize: 0.28,
      color: 0xf1c40f,
      anchorX: 'center',
      anchorY: 'middle',
    });
    this.titleText.position.set(0, 1.65, 0.02);
    this.container.add(this.titleText);

    // 콘텐츠 영역 배경
    this.contentBg = new UIBox({
      width: 5.6,
      height: this.visibleHeight,
      color: 0x16213e,
      opacity: 1,
      borderRadius: 0.06,
    });
    this.contentBg.position.set(0, 0.15, 0.01);
    this.container.add(this.contentBg);

    // 클리핑 마스크 생성 (stencil buffer 사용)
    const maskGeometry = this.createRoundedRectGeometry(this.contentWidth, this.visibleHeight - 0.1, 0.04);
    const maskMaterial = new MeshBasicMaterial({
      colorWrite: false,
      depthWrite: false,
      stencilWrite: true,
      stencilRef: CreditPopup.STENCIL_REF,
      stencilFunc: 519, // AlwaysStencilFunc
      stencilZPass: 7682, // ReplaceStencilOp
    });
    this.clipMask = new Mesh(maskGeometry, maskMaterial);
    this.clipMask.position.set(0, 0.15, 0.015);
    this.clipMask.renderOrder = 1;
    this.container.add(this.clipMask);

    // 콘텐츠 패널 (스크롤될 내용)
    this.contentPanel = new Group();
    this.contentPanel.position.set(0, 0.15, 0.02);
    this.contentPanel.renderOrder = 2;
    this.container.add(this.contentPanel);

    // 스크롤바 트랙 (배경)
    const trackGeometry = new PlaneGeometry(0.08, this.visibleHeight - 0.2);
    const trackMaterial = new MeshBasicMaterial({ color: 0x0a0f1a, transparent: true, opacity: 0.8 });
    this.scrollbarTrack = new Mesh(trackGeometry, trackMaterial);
    this.scrollbarTrack.position.set(2.65, 0.15, 0.03);
    this.scrollbarTrack.renderOrder = 3;
    this.container.add(this.scrollbarTrack);

    // 스크롤바 썸 (드래그 핸들)
    const thumbGeometry = new PlaneGeometry(0.06, 0.5);
    this.scrollbarThumbMaterial = new MeshBasicMaterial({ color: 0x3498db, transparent: true, opacity: 0.9 });
    this.scrollbarThumb = new Mesh(thumbGeometry, this.scrollbarThumbMaterial);
    this.scrollbarThumb.position.set(2.65, 0.15 + (this.visibleHeight - 0.2) / 2 - 0.25, 0.04);
    this.scrollbarThumb.renderOrder = 3;
    this.container.add(this.scrollbarThumb);

    // 확인 버튼
    this.confirmButtonBg = new UIBox({
      width: 1.8,
      height: 0.4,
      color: 0x27ae60,
      opacity: 1,
      borderRadius: 0.08,
    });
    this.confirmButtonBg.position.set(0, -1.7, 0.01);
    this.container.add(this.confirmButtonBg);

    this.buttonText = new UIText({
      text: '확인',
      fontSize: 0.2,
      color: 0xffffff,
      anchorX: 'center',
      anchorY: 'middle',
    });
    this.buttonText.position.set(0, -1.7, 0.02);
    this.container.add(this.buttonText);

    this.popupRoot.add(this.container);
  }

  private createRoundedRectGeometry(width: number, height: number, radius: number): ShapeGeometry {
    const shape = new Shape();
    const x = -width / 2;
    const y = -height / 2;
    const w = width;
    const h = height;
    const r = Math.min(radius, Math.min(w, h) / 2);

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    if (r > 0) shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    if (r > 0) shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    if (r > 0) shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    if (r > 0) shape.quadraticCurveTo(x, y, x + r, y);

    return new ShapeGeometry(shape);
  }

  setText(content: string): void {
    // 기존 데이터 초기화
    this.allLines = [];
    this.clearVisibleTexts();

    // 줄별로 데이터 파싱
    const lines = content.split('\n');
    this.contentHeight = lines.length * this.lineHeight;
    this.maxScroll = Math.max(0, this.contentHeight - this.visibleHeight + 0.4);

    let yPos = this.visibleHeight / 2 - 0.15;

    for (const line of lines) {
      const isHeader = line.startsWith('#');
      const isSubHeader = line.startsWith('##');
      const displayLine = line.replace(/^#+\s*/, '');

      this.allLines.push({
        text: displayLine || ' ',
        isHeader,
        isSubHeader,
        yPos,
      });

      yPos -= this.lineHeight;
    }

    // 스크롤바 썸 크기 업데이트
    this.updateScrollbarThumb();

    // 보이는 라인 업데이트
    this.updateVisibleLines();
  }

  private clearVisibleTexts(): void {
    // 모든 보이는 텍스트를 풀로 반환
    this.visibleTexts.forEach((text) => {
      this.contentPanel.remove(text);
      this.textPool.push(text);
    });
    this.visibleTexts.clear();
  }

  private getTextFromPool(): UIText {
    if (this.textPool.length > 0) {
      return this.textPool.pop()!;
    }
    // 새 텍스트 생성
    const text = new UIText({
      text: '',
      fontSize: 0.13,
      color: 0xecf0f1,
      anchorX: 'left',
      anchorY: 'top',
    });
    return text;
  }

  private returnTextToPool(text: UIText): void {
    this.contentPanel.remove(text);
    this.textPool.push(text);
  }

  private updateVisibleLines(): void {
    if (this.allLines.length === 0) return;

    // 보이는 영역 계산 (콘텐츠 패널 기준)
    const visibleTop = this.visibleHeight / 2;
    const visibleBottom = -this.visibleHeight / 2;

    // 스크롤 오프셋 적용하여 보이는 라인 범위 계산
    const scrolledTop = visibleTop - this.scrollOffset;
    const scrolledBottom = visibleBottom - this.scrollOffset;

    // 보이는 라인 인덱스 계산
    const firstVisibleIndex = Math.max(0, Math.floor((this.visibleHeight / 2 - 0.15 - scrolledTop) / this.lineHeight) - this.bufferLines);
    const lastVisibleIndex = Math.min(
      this.allLines.length - 1,
      Math.ceil((this.visibleHeight / 2 - 0.15 - scrolledBottom) / this.lineHeight) + this.bufferLines
    );

    // 더 이상 보이지 않는 라인 제거
    const toRemove: number[] = [];
    this.visibleTexts.forEach((_, index) => {
      if (index < firstVisibleIndex || index > lastVisibleIndex) {
        toRemove.push(index);
      }
    });
    toRemove.forEach((index) => {
      const text = this.visibleTexts.get(index)!;
      this.returnTextToPool(text);
      this.visibleTexts.delete(index);
    });

    // 새로 보이는 라인 추가
    for (let i = firstVisibleIndex; i <= lastVisibleIndex; i++) {
      if (!this.visibleTexts.has(i)) {
        const lineData = this.allLines[i];
        const text = this.getTextFromPool();

        // 텍스트 설정
        text.setText(lineData.text);
        text.setFontSize(lineData.isHeader ? (lineData.isSubHeader ? 0.16 : 0.2) : 0.13);
        text.setColor(lineData.isHeader ? 0xf1c40f : 0xecf0f1);

        text.position.set(-2.5, lineData.yPos, 0.01);
        this.contentPanel.add(text);
        this.visibleTexts.set(i, text);

        // Stencil 설정
        this.applyStencilToText(text);
      }
    }
  }

  private applyStencilToText(textElement: UIText): void {
    // onSync 콜백으로 메시 생성 후 한 번만 stencil 설정
    textElement.onSync(() => {
      textElement.traverse((child) => {
        if (child instanceof Mesh && child.material) {
          const material = child.material as MeshBasicMaterial;
          material.stencilWrite = false;
          material.stencilRef = CreditPopup.STENCIL_REF;
          material.stencilFunc = 514; // EqualStencilFunc
          material.stencilFail = 7680; // KeepStencilOp
          material.stencilZFail = 7680;
          material.stencilZPass = 7680;
          child.renderOrder = 2;
        }
      });
    });
  }

  private updateScrollbarThumb(): void {
    const trackHeight = this.visibleHeight - 0.2;
    const thumbHeight = Math.max(0.3, Math.min(trackHeight, (this.visibleHeight / Math.max(this.contentHeight, this.visibleHeight)) * trackHeight));

    // 썸 크기 업데이트
    this.scrollbarThumb.geometry.dispose();
    this.scrollbarThumb.geometry = new PlaneGeometry(0.06, thumbHeight);

    // 스크롤이 필요없으면 스크롤바 숨기기
    if (this.maxScroll <= 0) {
      this.scrollbarTrack.visible = false;
      this.scrollbarThumb.visible = false;
    } else {
      this.scrollbarTrack.visible = true;
      this.scrollbarThumb.visible = true;
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
    this.contentPanel.position.y = 0.15 + this.scrollOffset;

    // 스크롤바 썸 위치 업데이트
    if (this.maxScroll > 0) {
      const trackHeight = this.visibleHeight - 0.2;
      const thumbHeight = (this.scrollbarThumb.geometry as PlaneGeometry).parameters.height;
      const scrollableTrackHeight = trackHeight - thumbHeight;
      const scrollPercent = this.scrollOffset / this.maxScroll;
      const thumbY = 0.15 + (trackHeight / 2 - thumbHeight / 2) - (scrollPercent * scrollableTrackHeight);
      this.scrollbarThumb.position.y = thumbY;
    }

    // 보이는 라인 업데이트
    this.updateVisibleLines();
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

  // 매 프레임 호출 (현재는 특별한 작업 없음 - stencil은 onSync에서 설정됨)
  update(): void {
    // stencil은 텍스트 생성 시 onSync 콜백에서 설정됨
  }

  dispose(): void {
    // 보이는 텍스트 정리
    this.visibleTexts.forEach((text) => {
      text.dispose();
    });
    this.visibleTexts.clear();

    // 풀에 있는 텍스트 정리
    this.textPool.forEach((text) => {
      text.dispose();
    });
    this.textPool = [];

    this.allLines = [];
  }
}
