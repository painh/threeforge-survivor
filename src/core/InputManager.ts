export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
  inventory: boolean;
}

export type InputAction = keyof InputState;
export type KeyPressCallback = (action: InputAction) => void;

export class InputManager {
  private state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
    inventory: false,
  };

  private keyMap: Record<string, keyof InputState> = {
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    Space: 'attack',
    KeyI: 'inventory',
  };

  // 토글형 키 (한 번 누르면 콜백 호출)
  private toggleKeys: Set<keyof InputState> = new Set(['inventory']);
  private onKeyPressCallbacks: KeyPressCallback[] = [];

  constructor() {
    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const action = this.keyMap[event.code];
    if (action) {
      event.preventDefault();

      // 토글 키는 누를 때만 콜백 호출
      if (this.toggleKeys.has(action) && !this.state[action]) {
        for (const callback of this.onKeyPressCallbacks) {
          callback(action);
        }
      }

      this.state[action] = true;
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    const action = this.keyMap[event.code];
    if (action) {
      event.preventDefault();
      this.state[action] = false;
    }
  };

  private handleBlur = (): void => {
    // Reset all keys when window loses focus
    this.state.up = false;
    this.state.down = false;
    this.state.left = false;
    this.state.right = false;
    this.state.attack = false;
    this.state.inventory = false;
  };

  /**
   * 키 입력 콜백 등록 (토글 키에 대해)
   */
  onKeyPress(callback: KeyPressCallback): () => void {
    this.onKeyPressCallbacks.push(callback);
    return () => {
      const index = this.onKeyPressCallbacks.indexOf(callback);
      if (index !== -1) {
        this.onKeyPressCallbacks.splice(index, 1);
      }
    };
  }

  getState(): Readonly<InputState> {
    return this.state;
  }

  getMovementVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    if (this.state.left) x -= 1;
    if (this.state.right) x += 1;
    if (this.state.up) y += 1;
    if (this.state.down) y -= 1;

    // Normalize diagonal movement
    const length = Math.sqrt(x * x + y * y);
    if (length > 0) {
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  isPressed(action: keyof InputState): boolean {
    return this.state[action];
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
  }
}
