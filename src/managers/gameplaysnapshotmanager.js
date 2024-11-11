class GameplaySnapshotManager {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.snapshot = null;
    this.captureTime = 5000; // 5 seconds
    this.gameStartTime = null;
  }

  startCapture() {
    this.gameStartTime = Date.now();
    this.snapshot = null;
    this.checkAndCapture();
  }

  checkAndCapture() {
    if (this.snapshot) return;

    const currentTime = Date.now() - this.gameStartTime;
    if (currentTime >= this.captureTime) {
      this.captureSnapshot();
    } else {
      requestAnimationFrame(() => this.checkAndCapture());
    }
  }

  captureSnapshot() {
    this.renderer.render(this.scene, this.camera);
    const dataURL = this.renderer.domElement.toDataURL("image/jpeg", 0.7);
    this.snapshot = dataURL;
  }

  checkGameEnd(gameStatus) {
    if (gameStatus !== "playing" && this.snapshot) {
      this.displaySnapshot();
    }
  }

  getSnapshot() {
    return this.snapshot;
  }

  checkGameEnd(gameStatus) {
    if (gameStatus !== "playing" && this.snapshot) {
      this.displaySnapshot();
    }
  }

  displaySnapshot() {
    const snapshotImage = document.getElementById("gameplay-snapshot");
    const snapshotContainer = document.getElementById(
      "gameplay-snapshot-container"
    );

    if (this.snapshot) {
      snapshotImage.src = this.snapshot;
      snapshotContainer.style.display = "block";
    } else {
      snapshotContainer.style.display = "none";
    }
  }

  clearSnapshot() {
    this.snapshot = null;
  }
}

export default GameplaySnapshotManager;
