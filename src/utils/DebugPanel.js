class DebugPanel {
  constructor() {
    this.panel = document.createElement("div");
    this.panel.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 80%;
      max-height: 50%;
      overflow-y: auto;
    `;
    document.body.appendChild(this.panel);
  }

  log(message) {
    const line = document.createElement("div");
    line.textContent = `${new Date().toISOString().substr(11, 8)}: ${message}`;
    this.panel.appendChild(line);
    this.panel.scrollTop = this.panel.scrollHeight;

    // Keep only last 50 messages
    while (this.panel.children.length > 50) {
      this.panel.removeChild(this.panel.firstChild);
    }
  }
}

export const debugPanel = new DebugPanel();
