// audioManager.js
import { loadingProgressManager } from "./loadingProgressManager.js";

export class AudioManager {
  constructor() {
    this.buffers = {};
    this.loader = new THREE.AudioLoader();
    this.listener = new THREE.AudioListener();
    this.categories = {};
  }

  setCamera(camera) {
    camera.add(this.listener);
  }

  load(soundId, category, path) {
    const promise = new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (audioBuffer) => {
          this.buffers[soundId] = audioBuffer;
          if (category !== null) {
            if (!this.categories[category]) {
              this.categories[category] = [];
            }
            this.categories[category].push(soundId);
          }
          resolve();
        },
        () => {},
        reject
      );
    });
    loadingProgressManager.add(promise);
  }

  play(soundIdOrCategory, options = {}) {
    let soundId = soundIdOrCategory;
    const category = this.categories[soundIdOrCategory];
    if (category) {
      soundId = category[Math.floor(Math.random() * category.length)];
    }

    const buffer = this.buffers[soundId];
    const sound = new THREE.Audio(this.listener);
    sound.setBuffer(buffer);
    if (options.loop) {
      sound.setLoop(true);
    }
    if (options.volume) {
      sound.setVolume(options.volume);
    }
    sound.play();
  }
}

export const audioManager = new AudioManager();
