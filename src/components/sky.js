import Cloud from "./Cloud";
import { world } from "../../game";
import { Colors } from "../utils/Colors";

export class Sky {
  constructor() {
    this.mesh = new THREE.Object3D();
    this.nClouds = 20;
    this.clouds = [];
    const stepAngle = (Math.PI * 2) / this.nClouds;

    // Define a light purple color
    const lightPurple = new THREE.Color(0xc8a2c8); // You can adjust this hex code for the desired shade of light purple

    for (let i = 0; i < this.nClouds; i++) {
      const c = new Cloud(lightPurple); // Pass the color to the Cloud constructor
      this.clouds.push(c);
      var a = stepAngle * i;
      var h = world.seaRadius + 150 + Math.random() * 200;
      c.mesh.position.y = Math.sin(a) * h;
      c.mesh.position.x = Math.cos(a) * h;
      c.mesh.position.z = -300 - Math.random() * 500;
      c.mesh.rotation.z = a + Math.PI / 2;
      const scale = 1 + Math.random() * 2;
      c.mesh.scale.set(scale, scale, scale);
      this.mesh.add(c.mesh);
    }
  }

  tick(deltaTime) {
    for (var i = 0; i < this.nClouds; i++) {
      var c = this.clouds[i];
      c.tick(deltaTime);
    }
    this.mesh.rotation.z += game.speed * deltaTime;
  }
}

// Remove this line
// sky = new Sky();
