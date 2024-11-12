import Colors from "../utils/Colors";
import game from "../../game";

export default class Pilot {
  constructor(pilotType = "human") {
    this.mesh = new THREE.Object3D();
    this.angleHairs = 0;
    this.pilotType = pilotType;

    switch (pilotType) {
      case "frog":
        this.createFrogPilot();
        break;
      case "nouns":
        this.createNounsPilot();
        break;
      case "human":
      default:
        this.createHumanPilot();
        break;
    }
  }

  createHumanPilot() {
    this.mesh = new THREE.Object3D();
    this.angleHairs = 0;

    var bodyGeom = new THREE.BoxGeometry(15, 15, 15);
    var bodyMat = new THREE.MeshPhongMaterial({
      color: Colors.brown,
      flatShading: true,
    });
    var body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.set(2, -12, 0);
    this.mesh.add(body);

    var faceGeom = new THREE.BoxGeometry(10, 10, 10);
    var faceMat = new THREE.MeshLambertMaterial({ color: Colors.pink });
    var face = new THREE.Mesh(faceGeom, faceMat);
    this.mesh.add(face);

    var hairGeom = new THREE.BoxGeometry(4, 4, 4);
    var hairMat = new THREE.MeshLambertMaterial({ color: Colors.brown });
    var hair = new THREE.Mesh(hairGeom, hairMat);
    hair.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 2, 0));
    var hairs = new THREE.Object3D();

    this.hairsTop = new THREE.Object3D();

    for (var i = 0; i < 12; i++) {
      var h = hair.clone();
      var col = i % 3;
      var row = Math.floor(i / 3);
      var startPosZ = -4;
      var startPosX = -4;
      h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);
      h.geometry.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 1));
      this.hairsTop.add(h);
    }
    hairs.add(this.hairsTop);

    var hairSideGeom = new THREE.BoxGeometry(12, 4, 2);
    hairSideGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(-6, 0, 0));
    var hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
    var hairSideL = hairSideR.clone();
    hairSideR.position.set(8, -2, 6);
    hairSideL.position.set(8, -2, -6);
    hairs.add(hairSideR);
    hairs.add(hairSideL);

    var hairBackGeom = new THREE.BoxGeometry(2, 8, 10);
    var hairBack = new THREE.Mesh(hairBackGeom, hairMat);
    hairBack.position.set(-1, -4, 0);
    hairs.add(hairBack);
    hairs.position.set(-5, 5, 0);

    this.mesh.add(hairs);

    var glassGeom = new THREE.BoxGeometry(5, 5, 5);
    var glassMat = new THREE.MeshLambertMaterial({ color: Colors.brown });
    var glassR = new THREE.Mesh(glassGeom, glassMat);
    glassR.position.set(6, 0, 3);
    var glassL = glassR.clone();
    glassL.position.z = -glassR.position.z;

    var glassAGeom = new THREE.BoxGeometry(11, 1, 11);
    var glassA = new THREE.Mesh(glassAGeom, glassMat);
    this.mesh.add(glassR);
    this.mesh.add(glassL);
    this.mesh.add(glassA);

    var earGeom = new THREE.BoxGeometry(2, 3, 2);
    var earL = new THREE.Mesh(earGeom, faceMat);
    earL.position.set(0, 0, -6);
    var earR = earL.clone();
    earR.position.set(0, 0, 6);
    this.mesh.add(earL);
    this.mesh.add(earR);
  }

  createFrogPilot() {
    // Helper function to randomize vertices for a bumpy effect
    function addBumpEffect(geometry, bumpStrength) {
      const vertices = geometry.attributes.position.array;
      for (let i = 0; i < vertices.length; i += 3) {
        const offset = (Math.random() - 0.5) * bumpStrength;
        vertices[i] += offset; // x-coordinate
        vertices[i + 1] += offset; // y-coordinate
        vertices[i + 2] += offset; // z-coordinate
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }

    // Body geometry with a bumpy surface
    const bodyGeom = new THREE.SphereGeometry(7.5, 32, 32);
    addBumpEffect(bodyGeom, 0.2); // Add bumpiness to the body geometry

    // Material for the body
    const bodyMat = new THREE.MeshPhongMaterial({
      color: Colors.green,
      flatShading: false,
      shininess: 30,
    });

    // Body mesh
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    this.mesh.add(body);

    // Eyes geometry and material
    const eyeGeom = new THREE.SphereGeometry(2, 32, 32);
    const eyeMat = new THREE.MeshPhongMaterial({
      color: Colors.white,
      flatShading: false,
      shininess: 100,
    });

    // Left eye
    const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.position.set(3, 4, 4);
    this.mesh.add(eyeL);

    // Right eye (clone of the left eye)
    const eyeR = eyeL.clone();
    eyeR.position.set(3, 4, -4);
    this.mesh.add(eyeR);

    // Pupils geometry and material
    const pupilGeom = new THREE.SphereGeometry(1, 32, 32);
    const pupilMat = new THREE.MeshPhongMaterial({
      color: Colors.black,
      flatShading: false,
      shininess: 100,
    });

    // Left pupil
    const pupilL = new THREE.Mesh(pupilGeom, pupilMat);
    pupilL.position.set(4, 4, 4);
    this.mesh.add(pupilL);

    // Right pupil (clone of the left pupil)
    const pupilR = pupilL.clone();
    pupilR.position.set(4, 4, -4);
    this.mesh.add(pupilR);

    // Mouth
    const mouthShape = new THREE.Shape();
    mouthShape.moveTo(-3, 0);
    mouthShape.quadraticCurveTo(0, -2, 3, 0);
    const mouthGeom = new THREE.ShapeGeometry(mouthShape);
    const mouthMat = new THREE.MeshPhongMaterial({
      color: Colors.darkGreen,
      side: THREE.DoubleSide,
    });
    const mouth = new THREE.Mesh(mouthGeom, mouthMat);
    mouth.position.set(3, -2, 0);
    mouth.rotation.x = Math.PI * 0.5;
    this.mesh.add(mouth);

    // Tongue
    const tongueGeom = new THREE.BoxGeometry(1, 0.5, 4);
    const tongueMat = new THREE.MeshPhongMaterial({
      color: Colors.red,
      flatShading: false,
    });
    const tongue = new THREE.Mesh(tongueGeom, tongueMat);
    tongue.position.set(3, -2, 2);
    tongue.rotation.x = Math.PI * 0.25;
    this.mesh.add(tongue);

    // Webbed feet
    const footShape = new THREE.Shape();
    footShape.moveTo(-1.5, 0);
    footShape.lineTo(-0.5, 2);
    footShape.lineTo(0.5, 2);
    footShape.lineTo(1.5, 0);
    footShape.lineTo(-1.5, 0);
    const footGeom = new THREE.ShapeGeometry(footShape);
    const footMat = new THREE.MeshPhongMaterial({
      color: Colors.darkGreen,
      side: THREE.DoubleSide,
      flatShading: false,
    });

    const positions = [
      { x: -3, y: -7, z: 3 },
      { x: 3, y: -7, z: 3 },
      { x: -3, y: -7, z: -3 },
      { x: 3, y: -7, z: -3 },
    ];

    positions.forEach((pos) => {
      const foot = new THREE.Mesh(footGeom, footMat);
      foot.position.set(pos.x, pos.y, pos.z);
      foot.rotation.x = Math.PI * 0.5;
      this.mesh.add(foot);
    });

    // Vocal sac
    const vocalSacGeom = new THREE.SphereGeometry(
      3,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5
    );
    const vocalSacMat = new THREE.MeshPhongMaterial({
      color: Colors.lightGreen,
      flatShading: false,
      transparent: true,
      opacity: 0.7,
    });
    const vocalSac = new THREE.Mesh(vocalSacGeom, vocalSacMat);
    vocalSac.position.set(0, -5, 6);
    vocalSac.rotation.x = Math.PI;
    this.mesh.add(vocalSac);

    // Casino-themed oversized top hat
    const hatGroup = new THREE.Group();

    const topHatGeometry = new THREE.CylinderGeometry(6, 7, 12, 32);
    const topHatMaterial = new THREE.MeshPhongMaterial({
      color: Colors.black,
      flatShading: true,
    });
    const topHat = new THREE.Mesh(topHatGeometry, topHatMaterial);
    topHat.position.set(0, 6, 0);
    hatGroup.add(topHat);

    // Hat band
    const hatBandGeometry = new THREE.TorusGeometry(6.5, 1, 16, 100);
    const hatBandMaterial = new THREE.MeshPhongMaterial({
      color: Colors.gold,
      flatShading: true,
    });
    const hatBand = new THREE.Mesh(hatBandGeometry, hatBandMaterial);
    hatBand.position.set(0, 1, 0);
    hatBand.rotation.x = Math.PI * 0.5;
    hatGroup.add(hatBand);

    // Playing card
    const cardGeometry = new THREE.BoxGeometry(4, 6, 0.1);
    const cardMaterial = new THREE.MeshPhongMaterial({
      color: Colors.white,
      flatShading: true,
    });
    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    card.position.set(4, 4, 0);
    card.rotation.z = Math.PI / 12;
    hatGroup.add(card);

    // Card symbol (heart)
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, -1, -1, -1, -1, 0);
    heartShape.bezierCurveTo(-1, 1, 0, 1, 0, 2);
    heartShape.bezierCurveTo(0, 1, 1, 1, 1, 0);
    heartShape.bezierCurveTo(1, -1, 0, -1, 0, 0);

    const heartGeometry = new THREE.ShapeGeometry(heartShape);
    const heartMaterial = new THREE.MeshPhongMaterial({
      color: Colors.red,
      flatShading: true,
    });
    const heartSymbol = new THREE.Mesh(heartGeometry, heartMaterial);
    heartSymbol.scale.set(1, 1, 1);
    heartSymbol.position.set(4, 4, 0.1);
    hatGroup.add(heartSymbol);

    hatGroup.position.set(0, 10, 0);
    hatGroup.scale.set(1.5, 1.5, 1.5);
    this.mesh.add(hatGroup);

    // Bow tie
    const bowTieGroup = new THREE.Group();
    const bowGeometry = new THREE.BoxGeometry(3, 1, 0.5);
    const bowMaterial = new THREE.MeshPhongMaterial({
      color: Colors.red,
      flatShading: true,
    });
    const bowLeft = new THREE.Mesh(bowGeometry, bowMaterial);
    bowLeft.position.set(-1, 0, 0);
    bowLeft.rotation.z = Math.PI / 6;
    const bowRight = bowLeft.clone();
    bowRight.position.set(1, 0, 0);
    bowRight.rotation.z = -Math.PI / 6;
    const bowCenter = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      bowMaterial
    );
    bowTieGroup.add(bowLeft, bowRight, bowCenter);
    bowTieGroup.position.set(3, -3, 6);
    this.mesh.add(bowTieGroup);

    // Spots
    const spotGeometry = new THREE.CircleGeometry(0.3, 32);
    const spotMaterial = new THREE.MeshPhongMaterial({
      color: Colors.darkGreen,
      flatShading: true,
    });
    for (let i = 0; i < 20; i++) {
      const spot = new THREE.Mesh(spotGeometry, spotMaterial);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const x = 7.5 * Math.sin(phi) * Math.cos(theta);
      const y = 7.5 * Math.sin(phi) * Math.sin(theta);
      const z = 7.5 * Math.cos(phi);
      spot.position.set(x, y, z);
      spot.lookAt(0, 0, 0);
      this.mesh.add(spot);
    }

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
    const legMaterial = new THREE.MeshPhongMaterial({
      color: Colors.green,
      flatShading: true,
    });

    // Feet
    const footGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const footMaterial = new THREE.MeshPhongMaterial({
      color: Colors.darkGreen,
      flatShading: true,
    });
    positions.forEach((pos) => {
      const foot = new THREE.Mesh(footGeometry, footMaterial);
      foot.position.set(pos.x, pos.y - 1.5, pos.z);
      foot.scale.set(1, 0.5, 1.5);
      this.mesh.add(foot);
    });
  }

  createNounsPilot() {
    const bodyGeom = new THREE.BoxGeometry(15, 15, 15);
    const bodyMat = new THREE.MeshPhongMaterial({
      color: Colors.yellow,
      flatShading: true,
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    this.mesh.add(body);

    // Add sunglasses
    const glassGeom = new THREE.BoxGeometry(16, 6, 1);
    const glassMat = new THREE.MeshPhongMaterial({
      color: Colors.black,
      flatShading: true,
    });
    const glasses = new THREE.Mesh(glassGeom, glassMat);
    glasses.position.set(0, 2, 7.5);
    this.mesh.add(glasses);

    // Add smile
    const smileGeom = new THREE.TorusGeometry(3, 1, 16, 100, Math.PI);
    const smileMat = new THREE.MeshPhongMaterial({
      color: Colors.black,
      flatShading: true,
    });
    const smile = new THREE.Mesh(smileGeom, smileMat);
    smile.position.set(0, -2, 7.5);
    smile.rotation.x = Math.PI;
    this.mesh.add(smile);

    this.addHyperLargeGlasses();
  }

  addHyperLargeGlasses() {
    const glassesGroup = new THREE.Group();

    // Frame - large and bright yellow
    const frameGeometry = new THREE.BoxGeometry(60, 20, 2);
    const frameMaterial = new THREE.MeshPhongMaterial({ color: Colors.yellow });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 5, 12);
    glassesGroup.add(frame);

    // Left lens - larger and positioned closer to frame
    const lensGeometry = new THREE.BoxGeometry(24, 16, 1);
    const lensMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.7,
    });
    const leftLens = new THREE.Mesh(lensGeometry, lensMaterial);
    leftLens.position.set(-15, 5, 13);
    glassesGroup.add(leftLens);

    // Right lens - cloned and adjusted
    const rightLens = leftLens.clone();
    rightLens.position.set(15, 5, 13);
    glassesGroup.add(rightLens);

    // Left temple
    const templeGeometry = new THREE.BoxGeometry(20, 2, 1);
    const templeMaterial = new THREE.MeshPhongMaterial({
      color: Colors.yellow,
    });
    const leftTemple = new THREE.Mesh(templeGeometry, templeMaterial);
    leftTemple.position.set(-30, 5, 9);
    leftTemple.rotation.y = Math.PI / 6;
    glassesGroup.add(leftTemple);

    // Right temple - cloned and adjusted
    const rightTemple = leftTemple.clone();
    rightTemple.position.set(30, 5, 9);
    rightTemple.rotation.y = -Math.PI / 6;
    glassesGroup.add(rightTemple);

    // Scale and position the glasses on the pilot's face
    glassesGroup.scale.set(1.5, 1.5, 1.5);
    glassesGroup.position.set(0, 4, 5);

    this.mesh.add(glassesGroup);
  }

  updateHairs(deltaTime) {
    if (this.pilotType === "human") {
      // Only update hairs for human pilot
      var hairs = this.hairsTop.children;
      var l = hairs.length;
      for (var i = 0; i < l; i++) {
        var h = hairs[i];
        h.scale.y = 0.75 + Math.cos(this.angleHairs + i / 3) * 0.25;
      }
      this.angleHairs += game.speed * deltaTime * 40;
    }
  }
}
