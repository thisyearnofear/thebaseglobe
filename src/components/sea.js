import { Colors } from "../utils/Colors";
import { world } from "../../game.js";

export class Sea {
  constructor() {
    var geom = new THREE.CylinderGeometry(
      world.seaRadius,
      world.seaRadius,
      world.seaLength,
      40,
      10
    );
    geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    this.waves = [];
    const arr = geom.attributes.position.array;
    for (let i = 0; i < arr.length / 3; i++) {
      this.waves.push({
        x: arr[i * 3 + 0],
        y: arr[i * 3 + 1],
        z: arr[i * 3 + 2],
        ang: Math.random() * Math.PI * 2,
        amp:
          world.wavesMinAmp +
          Math.random() * (world.wavesMaxAmp - world.wavesMinAmp),
        speed:
          world.wavesMinSpeed +
          Math.random() * (world.wavesMaxSpeed - world.wavesMinSpeed),
      });
    }
    var mat = new THREE.MeshPhongMaterial({
      color: Colors.blue,
      transparent: true,
      opacity: 0.8,
      flatShading: true,
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.receiveShadow = true;
  }

  tick(deltaTime) {
    var arr = this.mesh.geometry.attributes.position.array;
    for (let i = 0; i < arr.length / 3; i++) {
      var wave = this.waves[i];
      arr[i * 3 + 0] = wave.x + Math.cos(wave.ang) * wave.amp;
      arr[i * 3 + 1] = wave.y + Math.sin(wave.ang) * wave.amp;
      wave.ang += wave.speed * deltaTime;
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }

  updateColor(color) {
    this.mesh.material.color.setHex(color);
  }
}
