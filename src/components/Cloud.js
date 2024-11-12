export default class RainbowCloud {
  constructor() {
    this.mesh = new THREE.Object3D();
    const geom = new THREE.BoxGeometry(20, 20, 20);

    // More vibrant rainbow colors
    this.rainbowColors = [
      0xff0000, // Bright Red
      0xff7f00, // Bright Orange
      0xffff00, // Bright Yellow
      0x00ff00, // Bright Green
      0x0000ff, // Bright Blue
      0x8b00ff, // Bright Violet
    ];

    const nBlocs = 5 + Math.floor(Math.random() * 3); // Increased number of blocks
    for (let i = 0; i < nBlocs; i++) {
      const mat = new THREE.MeshPhongMaterial({
        color: this.rainbowColors[i % this.rainbowColors.length],
        emissive: this.rainbowColors[i % this.rainbowColors.length],
        emissiveIntensity: 0.5,
        shininess: 100,
      });
      const m = new THREE.Mesh(geom.clone(), mat);
      m.position.x = i * 12; // Slightly closer together
      m.position.y = Math.random() * 10;
      m.position.z = Math.random() * 10;
      m.rotation.y = Math.random() * Math.PI * 2;
      m.rotation.z = Math.random() * Math.PI * 2;
      const s = 0.8 + Math.random() * 0.5; // Larger scale
      m.scale.set(s, s, s);
      this.mesh.add(m);
      m.castShadow = true;
      m.receiveShadow = true;

      // Add a glow effect
      const glowMat = new THREE.MeshBasicMaterial({
        color: this.rainbowColors[i % this.rainbowColors.length],
        transparent: true,
        opacity: 0.5,
      });
      const glowMesh = new THREE.Mesh(geom.clone(), glowMat);
      glowMesh.scale.multiplyScalar(1.2);
      m.add(glowMesh);
    }

    // Add overall glow to the cloud
    const cloudGlow = new THREE.PointLight(0xffffff, 1, 100);
    cloudGlow.position.set(nBlocs * 6, 5, 5);
    this.mesh.add(cloudGlow);
  }

  tick(deltaTime) {
    const l = this.mesh.children.length;
    for (let i = 0; i < l; i++) {
      const m = this.mesh.children[i];
      if (m instanceof THREE.Mesh) {
        m.rotation.y += Math.random() * 0.02 * (i + 1);
        m.rotation.z += Math.random() * 0.03 * (i + 1);

        // Animate colors
        const hue = (Date.now() * 0.001 + i * 0.1) % 1;
        const color = new THREE.Color().setHSL(hue, 1, 0.5);
        m.material.color.set(color);
        m.material.emissive.set(color);

        if (m.children[0]) {
          m.children[0].material.color.set(color);
        }

        // Pulsating effect
        const s = 0.8 + Math.random() * 0.5;
        const pulseFactor = Math.sin(Date.now() * 0.005 + i) * 0.1 + 1;
        m.scale.set(s * pulseFactor, s * pulseFactor, s * pulseFactor);
      }
    }

    // Animate the overall glow
    const cloudGlow = this.mesh.children[this.mesh.children.length - 1];
    if (cloudGlow instanceof THREE.PointLight) {
      cloudGlow.intensity = 1 + Math.sin(Date.now() * 0.005) * 0.5;
    }
  }
}
