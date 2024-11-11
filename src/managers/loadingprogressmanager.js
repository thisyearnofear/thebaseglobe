// src/managers/LoadingProgressManager.js

export class LoadingProgressManager {
  constructor() {
    this.promises = [];
    this.textureLoader = new THREE.TextureLoader();
  }

  loadTexture(path) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        path,
        (texture) => {
          console.log("Texture loaded successfully:", path);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error("Error loading texture:", error);
          reject(error);
        }
      );
    });
  }

  add(promise) {
    this.promises.push(promise);
  }

  then(callback) {
    return Promise.all(this.promises).then(callback);
  }

  catch(callback) {
    return Promise.all(this.promises).catch(callback);
  }
}

export const loadingProgressManager = new LoadingProgressManager();
