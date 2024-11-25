import { debugPanel } from "../utils/DebugPanel";

class InputManager {
  constructor() {
    this.currentInput = { x: 0, y: 0 };
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    this.useTiltControls = false;
    this._orientationHandler = null;
    this.calibration = { beta: null, gamma: null };
  }

  async initialize() {
    if (!this.isMobile) {
      return;
    }

    return new Promise((resolve) => {
      const prompt = document.createElement("div");
      prompt.className = "mobile-control-prompt";
      prompt.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        padding: 20px;
        border-radius: 10px;
        z-index: 9999;
        color: white;
        text-align: center;
      `;

      prompt.innerHTML = `
        <div class="prompt-content">
          <h3>Choose Control Type</h3>
          <p>How would you like to control the airplane?</p>
          <button class="touch-control" style="margin: 10px; padding: 10px 20px;">Touch Controls</button>
          <button class="tilt-control" style="margin: 10px; padding: 10px 20px;">Tilt Controls</button>
        </div>
      `;

      const handleTouchControl = () => {
        this.useTiltControls = false;
        prompt.remove();
        resolve();
      };

      const handleTiltControl = async () => {
        try {
          if (typeof DeviceOrientationEvent.requestPermission === "function") {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === "granted") {
              this.enableTiltControls();
            }
          } else {
            this.enableTiltControls();
          }
        } catch (error) {}
        prompt.remove();
        resolve();
      };

      prompt
        .querySelector(".touch-control")
        .addEventListener("click", handleTouchControl);
      prompt
        .querySelector(".tilt-control")
        .addEventListener("click", handleTiltControl);

      document.body.appendChild(prompt);
    });
  }

  enableTiltControls() {
    this.useTiltControls = true;
    this._orientationHandler = this.handleOrientation.bind(this);
    window.addEventListener("deviceorientation", this._orientationHandler);
  }

  handleOrientation(event) {
    if (!this.calibration.beta) {
      this.calibration = { beta: event.beta, gamma: event.gamma };
      return;
    }

    const beta = (event.beta - this.calibration.beta) / 45;
    const gamma = (event.gamma - this.calibration.gamma) / 45;

    this.currentInput = {
      x: Math.max(-1, Math.min(1, gamma)),
      y: Math.max(-1, Math.min(1, -beta)),
    };
  }

  getInput() {
    return this.currentInput;
  }

  recalibrate() {
    this.calibration = { beta: null, gamma: null };
  }

  cleanup() {
    if (this._orientationHandler) {
      window.removeEventListener("deviceorientation", this._orientationHandler);
      this._orientationHandler = null;
    }
  }
}

export const inputManager = new InputManager();
