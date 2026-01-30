import { WebGLRenderer, Raycaster, Vector2 } from 'three';
import { GameLoop } from './core/GameLoop';
import { InputManager } from './core/InputManager';
import { SceneManager } from './scenes/SceneManager';
import { GameScene } from './scenes/GameScene';
import { Camera2D } from './rendering/Camera2D';
import { GameUI } from './ui/GameUI';
import { CreditPopup } from './ui/CreditPopup';
import { InventoryScreen } from '../lib/threeforge/src/ui/InventoryScreen';

export class Game {
  private renderer: WebGLRenderer;
  private gameLoop: GameLoop;
  private inputManager: InputManager;
  private sceneManager: SceneManager;
  private camera2D: Camera2D;
  private gameUI: GameUI;
  private creditPopup: CreditPopup;
  private inventoryScreen: InventoryScreen | null = null;

  // 마우스 클릭 처리용
  private raycaster: Raycaster;
  private mouse: Vector2;

  // FPS 계산용
  private frameCount: number = 0;
  private fpsTime: number = 0;
  private currentFps: number = 60;

  constructor() {
    // Create renderer (stencil buffer 활성화 - UI 마스킹용)
    this.renderer = new WebGLRenderer({ antialias: false, stencil: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x1a1a2e);
    document.body.appendChild(this.renderer.domElement);

    // Create input manager
    this.inputManager = new InputManager();

    // Create camera
    this.camera2D = new Camera2D({
      viewWidth: 20,
      viewHeight: 15,
      followSpeed: 8,
    });

    // Create scene manager
    this.sceneManager = new SceneManager();
    this.sceneManager.register('game', new GameScene(this.inputManager));

    // Create game loop
    this.gameLoop = new GameLoop({
      update: this.update.bind(this),
      fixedUpdate: this.fixedUpdate.bind(this),
      render: this.render.bind(this),
    });

    // Create UI
    this.gameUI = new GameUI();
    this.creditPopup = new CreditPopup();

    // 마우스 클릭 처리 초기화
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    // Handle resize
    window.addEventListener('resize', this.onResize.bind(this));

    // 마우스 클릭 이벤트
    this.renderer.domElement.addEventListener('click', this.onClick.bind(this));

    // 마우스 휠 이벤트 (팝업 스크롤용)
    this.renderer.domElement.addEventListener('wheel', this.onWheel.bind(this));

    // 마우스 이동 이벤트 (드래그 아이콘용)
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  async start(): Promise<void> {
    await this.sceneManager.switch('game');

    // Set camera target to player
    const gameScene = this.sceneManager.current as GameScene;
    if (gameScene) {
      this.camera2D.setTarget(gameScene.getPlayer());
      // Add UI to scene
      this.gameUI.addToScene(gameScene.scene);
      this.creditPopup.addToScene(gameScene.scene);

      // 인벤토리 UI 생성
      const inventoryComp = gameScene.getPlayerInventory();
      if (inventoryComp) {
        this.inventoryScreen = new InventoryScreen({
          inventoryComponent: inventoryComp,
          showEquipment: true,
        });
        gameScene.scene.add(this.inventoryScreen);
      }
    }

    // I키로 인벤토리 토글
    this.inputManager.onKeyPress((action) => {
      if (action === 'inventory') {
        this.toggleInventory();
      }
    });

    // credit.txt 로드
    await this.loadCredits();

    this.gameLoop.start();
  }

  private toggleInventory(): void {
    if (!this.inventoryScreen) return;

    this.inventoryScreen.toggle();

    // 인벤토리 열릴 때 위치 설정 및 credit 버튼 숨김
    const inventoryVisible = this.inventoryScreen.isVisible();
    if (inventoryVisible) {
      this.updateInventoryPosition();
    }
    // 인벤토리가 열리면 credit 버튼 숨김 (z-index 충돌 방지)
    this.gameUI.setCreditButtonVisible(!inventoryVisible);
  }

  private updateInventoryPosition(): void {
    if (!this.inventoryScreen) return;

    // 카메라 뷰 범위 계산
    const camera = this.camera2D.camera;
    const fovRad = (camera.fov * Math.PI) / 180;
    const halfHeight = Math.tan(fovRad / 2) * camera.position.z;
    const halfWidth = halfHeight * camera.aspect;

    // 인벤토리를 화면 오른쪽에 배치 (화면 안에 들어오도록)
    const camPos = camera.position;
    // 화면 오른쪽 영역에 배치 (중심에서 오른쪽으로 약간 이동)
    const rightOffset = halfWidth * 0.4; // 화면 너비의 40% 오른쪽
    this.inventoryScreen.position.set(camPos.x + rightOffset, camPos.y, 5);
  }

  private async loadCredits(): Promise<void> {
    try {
      const response = await fetch('/credit.txt');
      const text = await response.text();
      this.creditPopup.setText(text);
    } catch (error) {
      console.error('Failed to load credits:', error);
      this.creditPopup.setText('Credits could not be loaded.');
    }
  }

  private update(deltaTime: number): void {
    this.sceneManager.update(deltaTime);
    this.camera2D.update(deltaTime);

    // FPS 계산
    this.frameCount++;
    this.fpsTime += deltaTime;
    if (this.fpsTime >= 1.0) {
      this.currentFps = Math.round(this.frameCount / this.fpsTime);
      this.frameCount = 0;
      this.fpsTime = 0;
    }

    // UI 위치 업데이트 (카메라 따라가기)
    const camPos = this.camera2D.camera.position;
    this.gameUI.setPosition(camPos.x, camPos.y, camPos.z);
    this.creditPopup.setPosition(camPos.x, camPos.y, camPos.z);

    // 인벤토리 UI 위치 및 업데이트
    if (this.inventoryScreen?.isVisible()) {
      this.updateInventoryPosition();
      this.inventoryScreen.update();
    }

    // UI 상태 업데이트
    const gameScene = this.sceneManager.current as GameScene;
    if (gameScene) {
      const playerHealth = gameScene.getPlayerHealth();
      this.gameUI.update({
        hp: playerHealth.current,
        maxHp: playerHealth.max,
        score: gameScene.getScore(),
        fps: this.currentFps,
      }, deltaTime);
    }

    // CreditPopup 업데이트 (stencil 설정 유지)
    if (this.creditPopup.visible) {
      this.creditPopup.update();
    }
  }

  private fixedUpdate(deltaTime: number): void {
    this.sceneManager.fixedUpdate(deltaTime);
  }

  private render(): void {
    // three-mesh-ui 업데이트 (일시정지 중에도 UI 렌더링 필요)
    this.gameUI.updateMeshUI();

    const scene = this.sceneManager.current?.scene;
    if (scene) {
      this.renderer.render(scene, this.camera2D.camera);
    }
  }

  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera2D.resize(width, height);
  }

  private onClick(event: MouseEvent): void {
    // 마우스 좌표를 정규화된 디바이스 좌표로 변환
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera2D.camera);

    const scene = this.sceneManager.current?.scene;
    if (!scene) return;

    // 팝업이 열려있으면 확인 버튼 체크
    if (this.creditPopup.visible) {
      const confirmMeshes = this.creditPopup.getConfirmButton();
      const confirmIntersects = this.raycaster.intersectObjects(confirmMeshes, true);
      if (confirmIntersects.length > 0) {
        this.creditPopup.hide();
        this.gameLoop.resume();
        return;
      }
      return; // 팝업 열려있으면 다른 클릭 무시
    }

    // 크레딧 버튼 클릭 체크
    const creditButton = this.gameUI.getCreditButton();
    const creditMeshes = creditButton.getInteractiveMeshes();
    const creditIntersects = this.raycaster.intersectObjects(creditMeshes, true);
    if (creditIntersects.length > 0) {
      this.gameLoop.pause();
      this.creditPopup.show(() => {
        this.gameLoop.resume();
      });
    }
  }

  private onWheel(event: WheelEvent): void {
    if (this.creditPopup.visible) {
      event.preventDefault();
      const scrollAmount = event.deltaY * 0.003;
      this.creditPopup.scroll(scrollAmount);
    }
  }

  private onMouseMove(event: MouseEvent): void {
    // 인벤토리가 열려있을 때만 처리
    if (!this.inventoryScreen?.isVisible()) {
      return;
    }

    // 마우스 좌표를 정규화된 디바이스 좌표로 변환
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 월드 좌표로 변환
    const worldPos = this.screenToWorld(this.mouse.x, this.mouse.y);

    // 드래그 중이면 드래그 아이콘 위치 업데이트
    if (this.inventoryScreen.isDragging()) {
      this.inventoryScreen.updateDragPosition(worldPos.x, worldPos.y);
    }

    // 인벤토리 슬롯 호버 체크 (툴팁용)
    this.checkInventoryHover(worldPos.x, worldPos.y);
  }

  /**
   * 인벤토리 슬롯 호버 체크
   */
  private checkInventoryHover(worldX: number, worldY: number): void {
    if (!this.inventoryScreen) return;

    const scene = this.sceneManager.current?.scene;
    if (!scene) return;

    // 레이캐스트로 인벤토리 슬롯 체크
    this.raycaster.setFromCamera(this.mouse, this.camera2D.camera);
    const interactiveObjects = this.inventoryScreen.getInteractiveObjects();
    const intersects = this.raycaster.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {
      // 슬롯 찾기
      let slotObj = intersects[0].object;
      while (slotObj && !(slotObj as any).isInventorySlot && !(slotObj as any).isEquipSlot) {
        slotObj = slotObj.parent as THREE.Object3D;
      }

      if (slotObj) {
        // 인벤토리 슬롯인 경우
        if ((slotObj as any).isInventorySlot) {
          const x = (slotObj as any).slotX;
          const y = (slotObj as any).slotY;
          const gameScene = this.sceneManager.current as GameScene;
          const inventory = gameScene?.getPlayerInventory()?.inventory;
          const item = inventory?.getItemAt(x, y) ?? null;

          // 로컬 좌표 계산
          const localX = worldX - this.inventoryScreen.position.x;
          const localY = worldY - this.inventoryScreen.position.y;
          this.inventoryScreen.setHoveredItem(item, localX, localY);
          return;
        }

        // 장비 슬롯인 경우
        if ((slotObj as any).isEquipSlot) {
          const slotId = (slotObj as any).slotId;
          const gameScene = this.sceneManager.current as GameScene;
          const equipment = gameScene?.getPlayerInventory()?.equipment;
          const item = equipment?.getEquipped(slotId) ?? null;

          // 로컬 좌표 계산
          const localX = worldX - this.inventoryScreen.position.x;
          const localY = worldY - this.inventoryScreen.position.y;
          this.inventoryScreen.setHoveredItem(item, localX, localY);
          return;
        }
      }
    }

    // 호버된 슬롯 없음
    this.inventoryScreen.clearHover();
  }

  /**
   * 정규화된 스크린 좌표를 월드 좌표로 변환
   */
  private screenToWorld(ndcX: number, ndcY: number): { x: number; y: number } {
    const camera = this.camera2D.camera;
    // PerspectiveCamera의 경우 - z=0 평면과의 교차점 계산
    const fovRad = (camera.fov * Math.PI) / 180;
    const halfHeight = Math.tan(fovRad / 2) * camera.position.z;
    const halfWidth = halfHeight * camera.aspect;
    const worldX = camera.position.x + ndcX * halfWidth;
    const worldY = camera.position.y + ndcY * halfHeight;
    return { x: worldX, y: worldY };
  }

  destroy(): void {
    this.gameLoop.stop();
    this.inputManager.destroy();
    this.renderer.dispose();
    document.body.removeChild(this.renderer.domElement);
  }
}
