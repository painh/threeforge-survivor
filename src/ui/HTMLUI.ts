export interface GameUIState {
  hp: number;
  maxHp: number;
  score: number;
  fps: number;
}

export class HTMLUI {
  private container: HTMLDivElement;
  private hpBarFill: HTMLDivElement;
  private hpDelayFill: HTMLDivElement;
  private scoreText: HTMLDivElement;
  private fpsText: HTMLDivElement;
  private creditButton: HTMLDivElement;

  private delayedHp: number = 100;
  private lastHp: number = 100;
  private delayTimer: number = 0;
  private readonly DELAY_WAIT: number = 0.3;
  private readonly DELAY_SPEED: number = 100;

  private onCreditClick: (() => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'game-ui';
    this.container.innerHTML = `
      <style>
        #game-ui {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          font-family: 'Segoe UI', Arial, sans-serif;
          z-index: 1000;
        }
        #game-ui * {
          box-sizing: border-box;
        }
        .ui-hp-container {
          position: absolute;
          top: 20px;
          left: 20px;
          width: 250px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 8px;
          padding: 10px;
        }
        .ui-hp-bar {
          position: relative;
          width: 100%;
          height: 24px;
          background: #222;
          border-radius: 4px;
          overflow: hidden;
        }
        .ui-hp-delay {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: #f39c12;
          transition: width 0.1s ease-out;
        }
        .ui-hp-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: #2ecc71;
          transition: width 0.05s ease-out;
        }
        .ui-score-container {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          border-radius: 8px;
          padding: 10px 30px;
          text-align: center;
        }
        .ui-score {
          font-size: 32px;
          font-weight: bold;
          color: #f1c40f;
        }
        .ui-fps-container {
          position: absolute;
          top: 70px;
          left: 20px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          padding: 5px 10px;
        }
        .ui-fps {
          font-size: 14px;
          color: #2ecc71;
        }
        .ui-credit-button {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: #34495e;
          border-radius: 8px;
          padding: 10px 20px;
          cursor: pointer;
          pointer-events: auto;
          transition: background 0.2s;
        }
        .ui-credit-button:hover {
          background: #4a6278;
        }
        .ui-credit-button span {
          font-size: 16px;
          color: #ecf0f1;
        }
      </style>
      <div class="ui-hp-container">
        <div class="ui-hp-bar">
          <div class="ui-hp-delay"></div>
          <div class="ui-hp-fill"></div>
        </div>
      </div>
      <div class="ui-score-container">
        <div class="ui-score">0</div>
      </div>
      <div class="ui-fps-container">
        <div class="ui-fps">FPS: 60</div>
      </div>
      <div class="ui-credit-button">
        <span>Credit</span>
      </div>
    `;

    document.body.appendChild(this.container);

    this.hpBarFill = this.container.querySelector('.ui-hp-fill') as HTMLDivElement;
    this.hpDelayFill = this.container.querySelector('.ui-hp-delay') as HTMLDivElement;
    this.scoreText = this.container.querySelector('.ui-score') as HTMLDivElement;
    this.fpsText = this.container.querySelector('.ui-fps') as HTMLDivElement;
    this.creditButton = this.container.querySelector('.ui-credit-button') as HTMLDivElement;

    this.creditButton.addEventListener('click', () => {
      if (this.onCreditClick) {
        this.onCreditClick();
      }
    });
  }

  setCreditClickHandler(handler: () => void): void {
    this.onCreditClick = handler;
  }

  update(state: Partial<GameUIState>, deltaTime: number = 0): void {
    const currentHp = state.hp ?? 100;
    const maxHp = state.maxHp ?? 100;
    const score = state.score ?? 0;
    const fps = state.fps ?? 60;

    // HP delay animation
    const hpDiff = currentHp - this.lastHp;
    if (hpDiff < 0) {
      this.delayTimer = this.DELAY_WAIT;
    } else if (hpDiff > 0) {
      this.delayTimer = 0;
    }

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

    // Update UI
    const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    const delayPercent = Math.max(0, Math.min(100, (this.delayedHp / maxHp) * 100));

    this.hpBarFill.style.width = `${hpPercent}%`;
    this.hpDelayFill.style.width = `${delayPercent}%`;

    // HP color based on percentage
    if (hpPercent > 60) {
      this.hpBarFill.style.background = '#2ecc71';
      this.hpDelayFill.style.background = '#f1c40f';
    } else if (hpPercent > 30) {
      this.hpBarFill.style.background = '#f39c12';
      this.hpDelayFill.style.background = '#e67e22';
    } else {
      this.hpBarFill.style.background = '#e74c3c';
      this.hpDelayFill.style.background = '#c0392b';
    }

    // Score
    this.scoreText.textContent = score.toString();

    // FPS
    this.fpsText.textContent = `FPS: ${fps}`;
    if (fps >= 55) {
      this.fpsText.style.color = '#2ecc71';
    } else if (fps >= 30) {
      this.fpsText.style.color = '#f39c12';
    } else {
      this.fpsText.style.color = '#e74c3c';
    }
  }

  destroy(): void {
    this.container.remove();
  }
}
