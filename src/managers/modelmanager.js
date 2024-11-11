import { loadingProgressManager } from "./loadingProgressManager";

export class ModelManager {
  constructor(path) {
    this.path = path;
    this.models = {};
  }

  load(modelName) {
    const promise = new Promise((resolve, reject) => {
      const loader = new THREE.OBJLoader();
      loader.load(
        this.path + "/" + modelName + ".obj",
        (obj) => {
          this.models[modelName] = obj;
          resolve();
        },
        function () {},
        reject
      );
    });
    loadingProgressManager.add(promise);
  }

  get(modelName) {
    if (typeof this.models[modelName] === "undefined") {
      throw new Error("Can't find model " + modelName);
    }
    return this.models[modelName];
  }
}

export const modelManager = new ModelManager("/models");
