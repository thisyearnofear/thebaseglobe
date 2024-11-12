import { utils } from "./src/utils/Utils";
import createAirplaneMesh from "./src/CreateAirplaneMesh.js";
import RainbowCloud from "./src/components/Cloud.js";
import { audioManagerInstance as audioManager } from "./src/managers/AudioManager.js";
import { loadingProgressManager } from "./src/managers/LoadingProgressManager.js";
import { modelManager } from "./src/managers/ModelManager.js";
import { selectionManager } from "./src/managers/SelectionManager.js";
import GameplaySnapshotManager from "./src/managers/GameplaySnapshotManager.js";
import SocialShare from "./src/components/SocialShare.js";

import {
  Colors,
  COLOR_COINS,
  COLOR_COLLECTIBLE_BUBBLE,
} from "./src/utils/Colors";

import {
  checkBaseTokenOwnership,
  checkZoraTokenOwnership,
} from "./src/utils/web3utils";

let projectileTexture = null;
let hasSpecialEffects = false;

async function initSpecialEffects() {
  try {
    hasSpecialEffects = await checkBaseTokenOwnership();
    console.log("Special effects access:", hasSpecialEffects);
  } catch (error) {
    console.error("Error checking base token ownership:", error);
    hasSpecialEffects = false;
  }
}

loadingProgressManager
  .loadTexture("./public/gens.png")
  .then((texture) => {
    console.log("Texture loaded:", texture);
    projectileTexture = texture;
    texture.premultiplyAlpha = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    initSpecialEffects();
  })
  .catch((error) => console.error("Failed to load texture:", error));
let sky;
let gameplaySnapshotManager;

class SceneManager {
  constructor() {
    this.list = new Set();
  }

  add(obj) {
    scene.add(obj.mesh);
    this.list.add(obj);
  }

  remove(obj) {
    scene.remove(obj.mesh);
    this.list.delete(obj);
  }

  clear() {
    for (const entry of this.list) {
      this.remove(entry);
    }
  }

  tick(deltaTime) {
    for (const entry of this.list) {
      if (entry.tick) {
        entry.tick(deltaTime);
      }
    }
  }
}

const sceneManager = new SceneManager();

///////////////
// GAME VARIABLES
var canDie = true;
var world, game;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();

let scene, camera, renderer;

//SCREEN & MOUSE VARIABLES
var MAX_WORLD_X = 1000;

//INIT THREE JS, SCREEN AND MOUSE EVENTS
function createScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, ui.width / ui.height, 0.1, 10000);
  audioManager.setCamera(camera);
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

  renderer = new THREE.WebGLRenderer({
    canvas: ui.canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(ui.width, ui.height);
  // sourcery skip: simplify-ternary
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);

  renderer.shadowMap.enabled = true;

  function setupCamera() {
    renderer.setSize(ui.width, ui.height);
    camera.aspect = ui.width / ui.height;
    camera.updateProjectionMatrix();

    // setTimeout(() => {
    // 	const rayCaster = new THREE.Raycaster()
    // 	rayCaster.setFromCamera(new THREE.Vector2(1, 1), camera)
    // 	const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    // 	const intersectPoint = new THREE.Vector3()
    // 	rayCaster.ray.intersectPlane(plane, intersectPoint)
    // 	console.log('max world x:', intersectPoint.x)
    // 	// MAX_WORLD_X = intersectPoint.x  doesn't work with first person view
    // }, 500)
  }

  setupCamera();
  ui.onResize(setupCamera);

  // const controls = new THREE.OrbitControls(camera, renderer.domElement)
  // controls.minPolarAngle = -Math.PI / 2
  // controls.maxPolarAngle = Math.PI
  // controls.addEventListener('change', () => {
  // 	console.log('camera changed', 'camera=', camera.position, ', airplane=', airplane.position, 'camera.rotation=', camera.rotation)
  // })
  // setTimeout(() => {
  // 	camera.lookAt(airplane.mesh.position)
  // 	controls.target.copy(airplane.mesh.position)
  // }, 100)

  // controls.noZoom = true
  //controls.noPan = true

  // handleWindowResize()

  gameplaySnapshotManager = new GameplaySnapshotManager(
    renderer,
    scene,
    camera
  );
}

// LIGHTS
var ambientLight;

function createLights() {
  const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
  ambientLight = new THREE.AmbientLight(0xdc8874, 0.5);
  const shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 4096;
  shadowLight.shadow.mapSize.height = 4096;

  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);
}

// GUNS
class SimpleGun {
  constructor() {
    this.mesh = SimpleGun.createMesh();
    this.mesh.position.z = 28;
    this.mesh.position.x = 25;
    this.mesh.position.y = -8;
  }

  static createMesh() {
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      flatShading: true,
      roughness: 0.5,
      metalness: 1.0,
    });
    const BODY_RADIUS = 3;
    const BODY_LENGTH = 20;
    const full = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(BODY_RADIUS, BODY_RADIUS, BODY_LENGTH),
      metalMaterial
    );
    body.rotation.z = Math.PI / 2;
    full.add(body);

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(BODY_RADIUS / 2, BODY_RADIUS / 2, BODY_LENGTH),
      metalMaterial
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position.x = BODY_LENGTH;
    full.add(barrel);
    return full;
  }

  downtime() {
    return 0.1;
  }

  damage() {
    return 1;
  }

  shoot(direction) {
    const BULLET_SPEED = 0.5;
    const RECOIL_DISTANCE = 4;
    const RECOIL_DURATION = this.downtime() / 1.5;

    const position = new THREE.Vector3();
    this.mesh.getWorldPosition(position);
    position.add(new THREE.Vector3(5, 0, 0));
    spawnProjectile(this.damage(), position, direction, BULLET_SPEED, 0.3, 3);

    // Little explosion at exhaust
    spawnParticles(
      position.clone().add(new THREE.Vector3(2, 0, 0)),
      1,
      Colors.orange,
      0.2
    );

    // audio
    audioManager.play("shot-soft");

    // Recoil of gun
    const initialX = this.mesh.position.x;
    TweenMax.to(this.mesh.position, {
      duration: RECOIL_DURATION / 2,
      x: initialX - RECOIL_DISTANCE,
      onComplete: () => {
        TweenMax.to(this.mesh.position, {
          duration: RECOIL_DURATION / 2,
          x: initialX,
        });
      },
    });
  }
}

class DoubleGun {
  constructor() {
    this.gun1 = new SimpleGun();
    this.gun2 = new SimpleGun();
    this.gun2.mesh.position.add(new THREE.Vector3(0, 14, 0));
    this.mesh = new THREE.Group();
    this.mesh.add(this.gun1.mesh);
    this.mesh.add(this.gun2.mesh);
  }

  downtime() {
    return 0.15;
  }

  damage() {
    return this.gun1.damage() + this.gun2.damage();
  }

  shoot(direction) {
    this.gun1.shoot(direction);
    this.gun2.shoot(direction);
  }
}

class BetterGun {
  constructor() {
    this.mesh = BetterGun.createMesh();
    this.mesh.position.z = 28;
    this.mesh.position.x = -3;
    this.mesh.position.y = -5;
  }

  static createMesh() {
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      flatShading: true,
      roughness: 0.5,
      metalness: 1.0,
    });
    const BODY_RADIUS = 5;
    const BODY_LENGTH = 30;
    const full = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(BODY_RADIUS, BODY_RADIUS, BODY_LENGTH),
      metalMaterial
    );
    body.rotation.z = Math.PI / 2;
    body.position.x = BODY_LENGTH / 2;
    full.add(body);

    const BARREL_RADIUS = BODY_RADIUS / 2;
    const BARREL_LENGTH = BODY_LENGTH * 0.66;
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(BARREL_RADIUS, BARREL_RADIUS, BARREL_LENGTH),
      metalMaterial
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position.x = BODY_LENGTH + BARREL_LENGTH / 2;
    full.add(barrel);

    const TIP_RADIUS = BARREL_RADIUS * 1.3;
    const TIP_LENGTH = BODY_LENGTH / 4;
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(TIP_RADIUS, TIP_RADIUS, TIP_LENGTH),
      metalMaterial
    );
    tip.rotation.z = Math.PI / 2;
    tip.position.x = BODY_LENGTH + BARREL_LENGTH + TIP_LENGTH / 2;
    full.add(tip);
    return full;
  }

  downtime() {
    return 0.1;
  }

  damage() {
    return 5;
  }

  shoot(direction) {
    const BULLET_SPEED = 0.5;
    const RECOIL_DISTANCE = 4;
    const RECOIL_DURATION = this.downtime() / 3;

    // position = position.clone().add(new THREE.Vector3(11.5, -1.3, 7.5))
    const position = new THREE.Vector3();
    this.mesh.getWorldPosition(position);
    position.add(new THREE.Vector3(12, 0, 0));
    spawnProjectile(this.damage(), position, direction, BULLET_SPEED, 0.8, 6);

    // Little explosion at exhaust
    spawnParticles(
      position.clone().add(new THREE.Vector3(2, 0, 0)),
      3,
      Colors.orange,
      0.5
    );

    // audio
    audioManager.play("shot-hard");

    // Recoil of gun
    const initialX = this.mesh.position.x;
    TweenMax.to(this.mesh.position, {
      duration: RECOIL_DURATION,
      x: initialX - RECOIL_DISTANCE,
      onComplete: () => {
        TweenMax.to(this.mesh.position, {
          duration: RECOIL_DURATION,
          x: initialX,
        });
      },
    });
  }
}

class Airplane {
  constructor(mesh, propeller, pilot) {
    this.mesh = mesh;
    this.propeller = propeller;
    this.pilot = pilot;
    this.weapon = null;
    this.lastShot = 0;
  }

  equipWeapon(weapon) {
    if (this.weapon) {
      this.mesh.remove(this.weapon.mesh);
    }
    this.weapon = weapon;
    if (this.weapon) {
      this.mesh.add(this.weapon.mesh);
    }
  }

  shoot() {
    if (!this.weapon) {
      return;
    }

    // rate-limit the shooting
    const nowTime = new Date().getTime() / 1000;
    const ready = nowTime - this.lastShot > this.weapon.downtime();
    if (!ready) {
      return;
    }
    this.lastShot = nowTime;

    // fire the shot
    let direction = new THREE.Vector3(10, 0, 0);
    direction.applyEuler(airplane.mesh.rotation);
    this.weapon.shoot(direction);

    // recoil airplane
    const recoilForce = this.weapon.damage();
    TweenMax.to(this.mesh.position, {
      duration: 0.05,
      x: this.mesh.position.x - recoilForce,
    });
  }

  tick(deltaTime) {
    this.propeller.rotation.x += 0.2 + game.planeSpeed * deltaTime * 0.005;

    if (game.status === "playing") {
      game.planeSpeed = utils.normalize(
        ui.mousePos.x,
        -0.5,
        0.5,
        world.planeMinSpeed,
        world.planeMaxSpeed
      );
      let targetX = utils.normalize(
        ui.mousePos.x,
        -1,
        1,
        -world.planeAmpWidth * 0.7,
        -world.planeAmpWidth
      );
      let targetY = utils.normalize(
        ui.mousePos.y,
        -0.75,
        0.75,
        world.planeDefaultHeight - world.planeAmpHeight,
        world.planeDefaultHeight + world.planeAmpHeight
      );

      game.planeCollisionDisplacementX += game.planeCollisionSpeedX;
      targetX += game.planeCollisionDisplacementX;

      game.planeCollisionDisplacementY += game.planeCollisionSpeedY;
      targetY += game.planeCollisionDisplacementY;

      this.mesh.position.x +=
        (targetX - this.mesh.position.x) * deltaTime * world.planeMoveSensivity;
      this.mesh.position.y +=
        (targetY - this.mesh.position.y) * deltaTime * world.planeMoveSensivity;

      this.mesh.rotation.x =
        (this.mesh.position.y - targetY) * deltaTime * world.planeRotZSensivity;
      this.mesh.rotation.z =
        (targetY - this.mesh.position.y) * deltaTime * world.planeRotXSensivity;

      if (game.fpv) {
        camera.position.y = this.mesh.position.y + 20;
        // camera.setRotationFromEuler(new THREE.Euler(-1.490248, -1.4124514, -1.48923231))
        // camera.updateProjectionMatrix ()
      } else {
        camera.fov = utils.normalize(ui.mousePos.x, -30, 1, 40, 80);
        camera.updateProjectionMatrix();
        camera.position.y +=
          (this.mesh.position.y - camera.position.y) *
          deltaTime *
          world.cameraSensivity;
      }
    }

    game.planeCollisionSpeedX +=
      (0 - game.planeCollisionSpeedX) * deltaTime * 0.03;
    game.planeCollisionDisplacementX +=
      (0 - game.planeCollisionDisplacementX) * deltaTime * 0.01;
    game.planeCollisionSpeedY +=
      (0 - game.planeCollisionSpeedY) * deltaTime * 0.03;
    game.planeCollisionDisplacementY +=
      (0 - game.planeCollisionDisplacementY) * deltaTime * 0.01;

    this.pilot.updateHairs(deltaTime);
  }

  gethit(position) {
    const diffPos = this.mesh.position.clone().sub(position);
    const d = diffPos.length();
    game.planeCollisionSpeedX = (100 * diffPos.x) / d;
    game.planeCollisionSpeedY = (100 * diffPos.y) / d;
    ambientLight.intensity = 2;
    audioManager.play("airplane-crash");
    gameplaySnapshotManager.checkGameEnd(game.status);
  }
}

function rotateAroundSea(object, deltaTime, speed) {
  object.angle += deltaTime * game.speed * world.collectiblesSpeed;
  if (object.angle > Math.PI * 2) {
    object.angle -= Math.PI * 2;
  }
  object.mesh.position.x = Math.cos(object.angle) * object.distance;
  object.mesh.position.y =
    -world.seaRadius + Math.sin(object.angle) * object.distance;
}

class Collectible {
  constructor(mesh, onApply) {
    this.angle = 0;
    this.distance = 0;
    this.onApply = onApply;

    this.mesh = new THREE.Object3D();
    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(10, 100, 100),
      new THREE.MeshPhongMaterial({
        color: COLOR_COLLECTIBLE_BUBBLE,
        transparent: true,
        opacity: 0.5,
        flatShading: true,
      })
    );
    this.mesh.add(bubble);
    this.mesh.add(mesh);
    this.mesh.castShadow = true;

    // for the angle:
    //   Math.PI*2 * 0.0  => on the right side of the sea cylinder
    //   Math.PI*2 * 0.1  => on the top right
    //   Math.PI*2 * 0.2  => directly in front of the plane
    //   Math.PI*2 * 0.3  => directly behind the plane
    //   Math.PI*2 * 0.4  => on the top left
    //   Math.PI*2 * 0.5  => on the left side
    this.angle = Math.PI * 2 * 0.1;
    this.distance =
      world.seaRadius +
      world.planeDefaultHeight +
      (-1 + 2 * Math.random()) * (world.planeAmpHeight - 20);
    this.mesh.position.y =
      -world.seaRadius + Math.sin(this.angle) * this.distance;
    this.mesh.position.x = Math.cos(this.angle) * this.distance;

    sceneManager.add(this);
  }

  tick(deltaTime) {
    rotateAroundSea(this, deltaTime, world.collectiblesSpeed);

    // rotate collectible for visual effect
    this.mesh.rotation.y += deltaTime * 0.002 * Math.random();
    this.mesh.rotation.z += deltaTime * 0.002 * Math.random();

    // collision?
    if (
      utils.collide(
        airplane.mesh,
        this.mesh,
        world.collectibleDistanceTolerance
      )
    ) {
      this.onApply();
      this.explode();
    }
    // passed-by?
    else if (this.angle > Math.PI) {
      sceneManager.remove(this);
    }
  }

  explode() {
    spawnParticles(this.mesh.position.clone(), 15, COLOR_COLLECTIBLE_BUBBLE, 3);
    sceneManager.remove(this);
    audioManager.play("bubble");

    const DURATION = 1;

    setTimeout(() => {
      const itemMesh = new THREE.Group();
      for (let i = 1; i < this.mesh.children.length; i += 1) {
        itemMesh.add(this.mesh.children[i]);
      }
      scene.add(itemMesh);
      itemMesh.position.y = 120;
      itemMesh.position.z = 50;

      const initialScale = itemMesh.scale.clone();
      TweenMax.to(itemMesh.scale, {
        duration: DURATION / 2,
        x: initialScale.x * 4,
        y: initialScale.y * 4,
        z: initialScale.z * 4,
        ease: "Power2.easeInOut",
        onComplete: () => {
          TweenMax.to(itemMesh.scale, {
            duration: DURATION / 2,
            x: 0,
            y: 0,
            z: 0,
            ease: "Power2.easeInOut",
            onComplete: () => {
              scene.remove(itemMesh);
            },
          });
        },
      });
    }, 200);
  }
}

function spawnSimpleGunCollectible() {
  const gun = SimpleGun.createMesh();
  gun.scale.set(0.25, 0.25, 0.25);
  gun.position.x = -2;

  new Collectible(gun, () => {
    airplane.equipWeapon(new SimpleGun());
  });
}

function spawnBetterGunCollectible() {
  const gun = BetterGun.createMesh();
  gun.scale.set(0.25, 0.25, 0.25);
  gun.position.x = -7;

  new Collectible(gun, () => {
    airplane.equipWeapon(new BetterGun());
  });
}

function spawnDoubleGunCollectible() {
  const guns = new THREE.Group();

  const gun1 = SimpleGun.createMesh();
  gun1.scale.set(0.25, 0.25, 0.25);
  gun1.position.x = -2;
  gun1.position.y = -2;
  guns.add(gun1);

  const gun2 = SimpleGun.createMesh();
  gun2.scale.set(0.25, 0.25, 0.25);
  gun2.position.x = -2;
  gun2.position.y = 2;
  guns.add(gun2);

  new Collectible(guns, () => {
    airplane.equipWeapon(new DoubleGun());
  });
}

function spawnLifeCollectible() {
  const heart = modelManager.get("heart");
  heart.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.material.color.setHex(0xff0000);
    }
  });
  heart.position.set(0, -1, -3);
  heart.scale.set(5, 5, 5);

  new Collectible(heart, () => {
    addLife();
  });
}

class Sky {
  constructor() {
    this.mesh = new THREE.Object3D();
    this.nClouds = 20;
    this.clouds = [];
    const stepAngle = (Math.PI * 2) / this.nClouds;
    for (let i = 0; i < this.nClouds; i++) {
      const c = new RainbowCloud();
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

function createSky() {
  sky = new Sky();
  sky.mesh.position.y = -world.seaRadius;
  scene.add(sky.mesh);
}

const COLOR_SEA_LEVEL = [
  0x68c3c0, // hsl(178deg 43% 59%)
  0x47b3af, // hsl(178deg 43% 49%)
  0x398e8b, // hsl(178deg 43% 39%)
  0x2a6a68, // hsl(178deg 43% 29%)
  0x1c4544, // hsl(178deg 43% 19%)
  0x0d2120, // hsl(178deg 43% 09%)
];

class Sea {
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
      color: COLOR_SEA_LEVEL[0],
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

  updateColor() {
    this.mesh.material = new THREE.MeshPhongMaterial({
      color: COLOR_SEA_LEVEL[(game.level - 1) % COLOR_SEA_LEVEL.length],
      transparent: true,
      opacity: 0.8,
      flatShading: true,
    });
  }
}

function spawnParticles(pos, count, color, scale) {
  for (let i = 0; i < count; i++) {
    const geom = hasSpecialEffects
      ? new THREE.PlaneGeometry(12, 12)
      : new THREE.TetrahedronGeometry(3, 0);

    const mat = hasSpecialEffects
      ? new THREE.MeshPhongMaterial({
          color: 0xffffff,
          map: projectileTexture,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      : new THREE.MeshPhongMaterial({
          color: 0x009999,
          shininess: 0,
          specular: 0xffffff,
          flatShading: true,
        });

    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

    mesh.visible = true;
    mesh.position.copy(pos);
    mesh.material.color = new THREE.Color(color);
    mesh.material.needsUpdate = true;
    mesh.scale.set(scale, scale, scale);

    // Make particle always face the camera
    mesh.lookAt(camera.position);

    const targetX = pos.x + (-1 + Math.random() * 2) * 50;
    const targetY = pos.y + (-1 + Math.random() * 2) * 50;
    const targetZ = pos.z + (-1 + Math.random() * 2) * 50;
    const speed = 0.6 + Math.random() * 0.2;

    TweenMax.to(mesh.rotation, speed, {
      x: Math.random() * 12,
      y: Math.random() * 12,
    });
    TweenMax.to(mesh.scale, speed, { x: 0.1, y: 0.1, z: 0.1 });
    TweenMax.to(mesh.position, speed, {
      x: targetX,
      y: targetY,
      z: targetZ,
      delay: Math.random() * 0.1,
      ease: Power2.easeOut,
      onComplete: () => {
        scene.remove(mesh);
      },
    });
  }
}

// ENEMIES
class Enemy {
  constructor() {
    const geom = hasSpecialEffects
      ? new THREE.PlaneGeometry(24, 24)
      : new THREE.TetrahedronGeometry(8);

    const mat = hasSpecialEffects
      ? new THREE.MeshPhongMaterial({
          color: 0xffffff,
          map: projectileTexture,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      : new THREE.MeshPhongMaterial({
          color: 0xf7932f, // Original orange/brown color
          flatShading: true,
        });

    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.castShadow = true;
    this.angle = 0;
    this.distance = 0;
    this.hitpoints = 3;
    sceneManager.add(this);
  }

  tick(deltaTime) {
    rotateAroundSea(this, deltaTime, world.enemiesSpeed);

    // Make enemy always face the camera
    this.mesh.lookAt(camera.position);

    // collision?
    if (
      utils.collide(airplane.mesh, this.mesh, world.enemyDistanceTolerance) &&
      game.status !== "finished"
    ) {
      this.explode();
      airplane.gethit(this.mesh.position);
      removeLife();
    }
    // passed-by?
    else if (this.angle > Math.PI) {
      sceneManager.remove(this);
    }

    const thisAabb = new THREE.Box3().setFromObject(this.mesh);
    for (const projectile of allProjectiles) {
      const projectileAabb = new THREE.Box3().setFromObject(projectile.mesh);
      if (thisAabb.intersectsBox(projectileAabb)) {
        spawnParticles(
          projectile.mesh.position.clone(),
          5,
          Colors.brownDark,
          1
        );
        projectile.remove();
        this.hitpoints -= projectile.damage;
        audioManager.play("bullet-impact", { volume: 0.3 });
      }
    }
    if (this.hitpoints <= 0) {
      this.explode();
    }
  }

  explode() {
    audioManager.play("rock-shatter", { volume: 3 });
    spawnParticles(this.mesh.position.clone(), 15, Colors.red, 3);
    sceneManager.remove(this);
    game.statistics.enemiesKilled += 1;
  }
}

function spawnEnemies(count) {
  for (let i = 0; i < count; i++) {
    const enemy = new Enemy();
    enemy.angle = -(i * 0.1);
    enemy.distance =
      world.seaRadius +
      world.planeDefaultHeight +
      (-1 + Math.random() * 2) * (world.planeAmpHeight - 20);
    enemy.mesh.position.x = Math.cos(enemy.angle) * enemy.distance;
    enemy.mesh.position.y =
      -world.seaRadius + Math.sin(enemy.angle) * enemy.distance;
  }
  game.statistics.enemiesSpawned += count;
}

// COINS
class Coin {
  constructor() {
    var geom = new THREE.CylinderGeometry(4, 4, 1, 10);
    var mat = new THREE.MeshPhongMaterial({
      color: COLOR_COINS,
      shininess: 1,
      specular: 0xffffff,
      flatShading: true,
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.castShadow = true;
    this.angle = 0;
    this.dist = 0;
    sceneManager.add(this);
  }

  tick(deltaTime) {
    rotateAroundSea(this, deltaTime, world.coinsSpeed);

    this.mesh.rotation.z += Math.random() * 0.1;
    this.mesh.rotation.y += Math.random() * 0.1;

    // collision?
    if (utils.collide(airplane.mesh, this.mesh, world.coinDistanceTolerance)) {
      spawnParticles(this.mesh.position.clone(), 5, COLOR_COINS, 0.8);
      addCoin();
      audioManager.play("coin", { volume: 0.5 });
      sceneManager.remove(this);
    }
    // passed-by?
    else if (this.angle > Math.PI) {
      sceneManager.remove(this);
    }
  }
}

function spawnCoins() {
  const nCoins = 1 + Math.floor(Math.random() * 10);
  const d =
    world.seaRadius +
    world.planeDefaultHeight +
    utils.randomFromRange(-1, 1) * (world.planeAmpHeight - 20);
  const amplitude = 10 + Math.round(Math.random() * 10);
  for (let i = 0; i < nCoins; i++) {
    const coin = new Coin();
    coin.angle = -(i * 0.02);
    coin.distance = d + Math.cos(i * 0.5) * amplitude;
    coin.mesh.position.y =
      -world.seaRadius + Math.sin(coin.angle) * coin.distance;
    coin.mesh.position.x = Math.cos(coin.angle) * coin.distance;
  }
  game.statistics.coinsSpawned += nCoins;
}

// SHOOTING
let allProjectiles = [];

class Projectile {
  constructor(damage, initialPosition, direction, speed, radius, length) {
    this.damage = damage;

    // Create material with bright purple color
    const material = new THREE.MeshPhongMaterial({
      color: 0x800080, // Bright purple
      shininess: 0,
      specular: 0xffffff,
      flatShading: true,
    });

    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, length),
      material
    );
    this.mesh.rotation.z = Math.PI / 2;

    this.mesh.position.copy(initialPosition);
    this.direction = direction.clone();
    this.direction.setLength(1);
    this.speed = speed;
    sceneManager.add(this);

    game.statistics.shotsFired += 1;
  }

  tick(deltaTime) {
    this.mesh.position.add(
      this.direction.clone().multiplyScalar(this.speed * deltaTime)
    );
    this.mesh.position.z *= 0.9;
    if (this.mesh.position.x > MAX_WORLD_X) {
      this.remove();
    }
  }

  remove() {
    sceneManager.remove(this);
    allProjectiles.splice(allProjectiles.indexOf(this), 1);
  }
}

function spawnProjectile(
  damage,
  initialPosition,
  direction,
  speed,
  radius,
  length
) {
  const geometry = new THREE.PlaneGeometry(radius * 2, length);
  const material = new THREE.MeshBasicMaterial({
    color: 0x800080, // Bright purple
  });

  allProjectiles.push(
    new Projectile(damage, initialPosition, direction, speed, radius, length)
  );
}

// 3D Models
let sea, sea2;
let airplane;

// Add this after the texture loading
const createProjectile = (
  damage,
  initialPosition,
  direction,
  speed,
  radius,
  length
) => {
  console.log("Creating projectile");
  const material = new THREE.MeshPhongMaterial({
    color: 0x800080, // Bright purple
    shininess: 0,
    specular: 0xffffff,
    flatShading: true,
    map: projectileTexture, // The texture might be overriding our color
  });
  console.log("Projectile material color:", material.color);

  // sourcery skip: inline-immediately-returned-variable
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length),
    material
  );
  return mesh;
};

function createPlane() {
  const { pilot, aircraft } = selectionManager.getSelection();
  const [mesh, propeller, pilotMesh] = createAirplaneMesh(pilot, aircraft);
  airplane = new Airplane(mesh, propeller, pilotMesh);
  airplane.mesh.scale.set(0.25, 0.25, 0.25);
  airplane.mesh.position.y = world.planeDefaultHeight;
  scene.add(airplane.mesh);
}

function createSea() {
  // We create a second sea that is not animated because the animation of our our normal sea leaves holes at certain points and I don't know how to get rid of them. These holes did not occur in the original script that used three js version 75 and mergeVertices. However, I tried to reproduce that behaviour in the animation function but without succes - thus this workaround here.
  sea = new Sea();
  sea.mesh.position.y = -world.seaRadius;
  scene.add(sea.mesh);

  sea2 = new Sea();
  sea2.mesh.position.y = -world.seaRadius;
  scene.add(sea2.mesh);
}

function loop() {
  newTime = new Date().getTime();
  const deltaTime = newTime - oldTime;
  oldTime = newTime;

  if (game.status == "playing") {
    if (!game.paused) {
      // Add coins
      if (
        Math.floor(game.distance) % world.distanceForCoinsSpawn == 0 &&
        Math.floor(game.distance) > game.coinLastSpawn
      ) {
        game.coinLastSpawn = Math.floor(game.distance);
        spawnCoins();
      }
      if (
        Math.floor(game.distance) % world.distanceForSpeedUpdate == 0 &&
        Math.floor(game.distance) > game.speedLastUpdate
      ) {
        game.speedLastUpdate = Math.floor(game.distance);
        game.targetBaseSpeed += world.incrementSpeedByTime * deltaTime;
      }
      if (
        Math.floor(game.distance) % world.distanceForEnemiesSpawn == 0 &&
        Math.floor(game.distance) > game.enemyLastSpawn
      ) {
        game.enemyLastSpawn = Math.floor(game.distance);
        spawnEnemies(game.level);
      }
      if (
        Math.floor(game.distance) % world.distanceForLevelUpdate == 0 &&
        Math.floor(game.distance) > game.levelLastUpdate
      ) {
        game.levelLastUpdate = Math.floor(game.distance);
        game.level += 1;
        if (game.level === world.levelCount) {
          game.status = "finished";
          setFollowView();
          ui.showScoreScreen();
        } else {
          ui.informNextLevel(game.level);
          sea.updateColor();
          sea2.updateColor();
          ui.updateLevelCount();
          game.targetBaseSpeed =
            world.initSpeed + world.incrementSpeedByLevel * game.level;
        }
      }

      // span collectibles
      if (
        game.lifes < world.maxLifes &&
        game.distance - game.lastLifeSpawn > world.pauseLifeSpawn &&
        Math.random() < 0.01
      ) {
        game.lastLifeSpawn = game.distance;
        spawnLifeCollectible();
      }
      if (
        !game.spawnedSimpleGun &&
        game.distance > world.simpleGunLevelDrop * world.distanceForLevelUpdate
      ) {
        spawnSimpleGunCollectible();
        game.spawnedSimpleGun = true;
      }
      if (
        !game.spawnedDoubleGun &&
        game.distance > world.doubleGunLevelDrop * world.distanceForLevelUpdate
      ) {
        spawnDoubleGunCollectible();
        game.spawnedDoubleGun = true;
      }
      if (
        !game.spawnedBetterGun &&
        game.distance > world.betterGunLevelDrop * world.distanceForLevelUpdate
      ) {
        spawnBetterGunCollectible();
        game.spawnedBetterGun = true;
      }

      if (ui.mouseButtons[0] || ui.keysDown["Space"]) {
        airplane.shoot();
      }

      airplane.tick(deltaTime);
      game.distance += game.speed * deltaTime * world.ratioSpeedDistance;
      game.baseSpeed +=
        (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02;
      game.speed = game.baseSpeed * game.planeSpeed;
      ui.updateDistanceDisplay();

      if (game.lifes <= 0 && canDie) {
        game.status = "gameover";
      }
    }
    if (gameplaySnapshotManager) {
      gameplaySnapshotManager.checkAndCapture();
    }
  } else if (game.status == "gameover") {
    game.speed *= 0.99;
    airplane.mesh.rotation.z +=
      (-Math.PI / 2 - airplane.mesh.rotation.z) * 0.0002 * deltaTime;
    airplane.mesh.rotation.x += 0.0003 * deltaTime;
    game.planeFallSpeed *= 1.05;
    airplane.mesh.position.y -= game.planeFallSpeed * deltaTime;

    if (airplane.mesh.position.y < -200) {
      ui.showReplay();
      game.status = "waitingReplay";
      audioManager.play("water-splash");
    }
  } else if (game.status == "waitingReplay") {
    // nothing to do
  }

  gameplaySnapshotManager.checkGameEnd(game.status);

  if (!game.paused) {
    airplane.tick(deltaTime);

    sea.mesh.rotation.z += game.speed * deltaTime;
    if (sea.mesh.rotation.z > 2 * Math.PI) {
      sea.mesh.rotation.z -= 2 * Math.PI;
    }
    ambientLight.intensity +=
      (0.5 - ambientLight.intensity) * deltaTime * 0.005;

    sceneManager.tick(deltaTime);

    sky.tick(deltaTime);
    sea.tick(deltaTime);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

// COINS
function addCoin() {
  game.coins += 1;
  ui.updateCoinsCount(game.coins);

  game.statistics.coinsCollected += 1;
}

function addLife() {
  game.lifes = Math.min(world.maxLifes, game.lifes + 1);
  ui.updateLifesDisplay();
}

function removeLife() {
  game.lifes = Math.max(0, game.lifes - 1);
  ui.updateLifesDisplay();

  game.statistics.lifesLost += 1;
}

function setSideView() {
  game.fpv = false;
  camera.position.set(0, world.planeDefaultHeight, 200);
  camera.setRotationFromEuler(new THREE.Euler(0, 0, 0));
}

function setFollowView() {
  game.fpv = true;
  camera.position.set(-89, airplane.mesh.position.y + 20, 0);
  camera.setRotationFromEuler(
    new THREE.Euler(-1.490248, -1.4124514, -1.48923231)
  );
  camera.updateProjectionMatrix();
}

class UI {
  constructor(onStart, gameplaySnapshotManager) {
    this.gameplaySnapshotManager = gameplaySnapshotManager;
    this._elemDistanceCounter = document.getElementById("distValue");
    this._elemReplayMessage = document.getElementById("replayMessage");
    this._elemLevelCounter = document.getElementById("levelValue");
    this._elemLevelCircle = document.getElementById("levelCircleStroke");
    this._elemsLifes = document.querySelectorAll("#lifes img");
    this._elemCoinsCount = document.getElementById("coinsValue");

    document.querySelector("#intro-screen button").onclick = () => {
      document.getElementById("intro-screen").classList.remove("visible");
      onStart();
    };

    document.addEventListener("keydown", this.handleKeyDown.bind(this), false);
    document.addEventListener("keyup", this.handleKeyUp.bind(this), false);
    document.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this),
      false
    );
    document.addEventListener("mouseup", this.handleMouseUp.bind(this), false);
    document.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this),
      false
    );
    document.addEventListener("blur", this.handleBlur.bind(this), false);

    document.oncontextmenu = document.body.oncontextmenu = function () {
      return false;
    };

    window.addEventListener(
      "resize",
      this.handleWindowResize.bind(this),
      false
    );

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mousePos = { x: 0, y: 0 };
    this.canvas = document.getElementById("threejs-canvas");

    this.mouseButtons = [false, false, false];
    this.keysDown = {};

    this._resizeListeners = [];
  }

  onResize(callback) {
    this._resizeListeners.push(callback);
  }

  handleWindowResize(event) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    for (const listener of this._resizeListeners) {
      listener();
    }
  }

  handleMouseMove(event) {
    var tx = -1 + (event.clientX / this.width) * 2;
    var ty = 1 - (event.clientY / this.height) * 2;
    this.mousePos = { x: tx, y: ty };
  }

  handleTouchMove(event) {
    event.preventDefault();
    var tx = -1 + (event.touches[0].pageX / this.width) * 2;
    var ty = 1 - (event.touches[0].pageY / this.height) * 2;
    this.mousePos = { x: tx, y: ty };
  }

  handleMouseDown(event) {
    this.mouseButtons[event.button] = true;

    if (event.button === 1 && game.status === "playing") {
      airplane.shoot();
    }
  }

  handleKeyDown(event) {
    this.keysDown[event.code] = true;
    if (event.code === "KeyP") {
      game.paused = !game.paused;
    }
    if (event.code === "Space") {
      airplane.shoot();
    }
    if (event.code === "Enter") {
      if (game.fpv) {
        setSideView();
      } else {
        setFollowView();
      }
    }
  }

  handleKeyUp(event) {
    this.keysDown[event.code] = false;
  }

  handleMouseUp(event) {
    this.mouseButtons[event.button] = false;
    event.preventDefault();

    if (game && game.status == "waitingReplay") {
      resetMap();
      this.informNextLevel(1);
      game.paused = false;
      sea.updateColor();
      sea2.updateColor();

      this.updateDistanceDisplay();
      this.updateLevelCount();
      this.updateLifesDisplay();
      this.updateCoinsCount();

      this.hideReplay();
    }
  }

  handleBlur(event) {
    this.mouseButtons = [false, false, false];
  }

  showReplay() {
    this._elemReplayMessage.style.display = "block";
  }

  hideReplay() {
    this._elemReplayMessage.style.display = "none";
  }

  updateLevelCount() {
    this._elemLevelCounter.innerText = game.level;
  }

  updateCoinsCount() {
    this._elemCoinsCount.innerText = game.coins;
  }

  updateDistanceDisplay() {
    this._elemDistanceCounter.innerText = Math.floor(game.distance);
    const d =
      502 *
      (1 -
        (game.distance % world.distanceForLevelUpdate) /
          world.distanceForLevelUpdate);
    this._elemLevelCircle.setAttribute("stroke-dashoffset", d);
  }

  updateLifesDisplay() {
    for (let i = 0, len = this._elemsLifes.length; i < len; i += 1) {
      const hasThisLife = i < game.lifes;
      const elem = this._elemsLifes[i];
      if (hasThisLife && !elem.classList.contains("visible")) {
        elem.classList.remove("invisible");
        elem.classList.add("visible");
      } else if (!hasThisLife && !elem.classList.contains("invisible")) {
        elem.classList.remove("visible");
        elem.classList.add("invisible");
      }
    }
  }

  informNextLevel(level) {
    const ANIMATION_DURATION = 1.0;

    const elem = document.getElementById("new-level");
    elem.style.visibility = "visible";
    elem.style.animationDuration = Math.round(ANIMATION_DURATION * 1000) + "ms";
    elem.children[1].innerText = level;
    elem.classList.add("animating");
    setTimeout(() => {
      document.getElementById("new-level").style.visibility = "hidden";
      elem.classList.remove("animating");
    }, 1000);
  }

  showScoreScreen() {
    const elemScreen = document.getElementById("score-screen");
    elemScreen.classList.add("visible");

    // Display the snapshot
    const snapshot = gameplaySnapshotManager.getSnapshot();
    const snapshotContainer = document.getElementById(
      "gameplay-snapshot-container"
    );
    const snapshotImage = document.getElementById("gameplay-snapshot");

    if (snapshot) {
      snapshotImage.src = snapshot;
      snapshotContainer.style.display = "block";
    } else {
      snapshotContainer.style.display = "none";
    }

    // Fill in statistics
    document.getElementById("score-coins-collected").innerText =
      game.statistics.coinsCollected;
    document.getElementById("score-coins-total").innerText =
      game.statistics.coinsSpawned;
    document.getElementById("score-enemies-killed").innerText =
      game.statistics.enemiesKilled;
    document.getElementById("score-enemies-total").innerText =
      game.statistics.enemiesSpawned;
    document.getElementById("score-shots-fired").innerText =
      game.statistics.shotsFired;
    document.getElementById("score-lifes-lost").innerText =
      game.statistics.lifesLost;

    // Initialize and render the SocialShare component
    const gameData = {
      coinsCollected: game.statistics.coinsCollected,
      enemiesKilled: game.statistics.enemiesKilled,
      shotsFired: game.statistics.shotsFired,
      lifesLost: game.statistics.lifesLost,
    };

    const socialShare = new SocialShare("social-share-container", gameData);
    socialShare.render();
  }

  showError(message) {
    document.getElementById("error").style.visibility = "visible";
    document.getElementById("error-message").innerText = message;
  }
}

let ui;

function createWorld(pilot, aircraft) {
  world = {
    initSpeed: 0.00035,
    incrementSpeedByTime: 0.0000025,
    incrementSpeedByLevel: 0.000005,
    distanceForSpeedUpdate: 100,
    ratioSpeedDistance: 50,

    simpleGunLevelDrop: 1.1,
    doubleGunLevelDrop: 2.3,
    betterGunLevelDrop: 3.5,

    maxLifes: 3,
    pauseLifeSpawn: 400,

    levelCount: 6,
    distanceForLevelUpdate: 500,

    planeDefaultHeight: 100,
    planeAmpHeight: 80,
    planeAmpWidth: 75,
    planeMoveSensivity: 0.005,
    planeRotXSensivity: 0.0008,
    planeRotZSensivity: 0.0004,
    planeMinSpeed: 1.2,
    planeMaxSpeed: 1.6,

    seaRadius: 600,
    seaLength: 800,
    wavesMinAmp: 5,
    wavesMaxAmp: 20,
    wavesMinSpeed: 0.001,
    wavesMaxSpeed: 0.003,

    cameraSensivity: 0.002,

    coinDistanceTolerance: 15,
    coinsSpeed: 0.5,
    distanceForCoinsSpawn: 50,

    collectibleDistanceTolerance: 15,
    collectiblesSpeed: 0.6,

    enemyDistanceTolerance: 10,
    enemiesSpeed: 0.6,
    distanceForEnemiesSpawn: 50,
  };

  // create the world
  createScene();
  createSea();
  createSky();
  createLights();
  createPlane(pilot, aircraft);

  resetMap();
}

function resetMap() {
  game = {
    status: "playing",

    speed: 0,
    paused: false,
    baseSpeed: 0.00035,
    targetBaseSpeed: 0.00035,
    speedLastUpdate: 0,

    distance: 0,

    coins: 0,
    fpv: false,

    // gun spawning
    spawnedSimpleGun: false,
    spawnedDoubleGun: false,
    spawnedBetterGun: false,

    lastLifeSpawn: 0,
    lifes: world.maxLifes,

    level: 1,
    levelLastUpdate: 0,

    planeFallSpeed: 0.001,
    planeSpeed: 0,
    planeCollisionDisplacementX: 0,
    planeCollisionSpeedX: 0,
    planeCollisionDisplacementY: 0,
    planeCollisionSpeedY: 0,

    coinLastSpawn: 0,
    enemyLastSpawn: 0,

    statistics: {
      coinsCollected: 0,
      coinsSpawned: 0,
      enemiesKilled: 0,
      enemiesSpawned: 0,
      shotsFired: 0,
      lifesLost: 0,
    },
  };

  // update ui
  ui.updateDistanceDisplay();
  ui.updateLevelCount();
  ui.updateLifesDisplay();
  ui.updateCoinsCount();

  sceneManager.clear();

  sea.updateColor();
  sea2.updateColor();

  setSideView();

  airplane.equipWeapon(null);

  // airplane.equipWeapon(new SimpleGun())
  // airplane.equipWeapon(new DoubleGun())
  // airplane.equipWeapon(new BetterGun())
}

let soundPlaying = false;

function startMap(pilot, aircraft) {
  if (!soundPlaying) {
    audioManager.play("propeller", { loop: true, volume: 1 });
    audioManager.play("ocean", { loop: true, volume: 1 });
    soundPlaying = true;
  }

  createScene();
  createWorld(pilot, aircraft);

  if (gameplaySnapshotManager) {
    gameplaySnapshotManager.startCapture();
  }

  loop();

  ui.informNextLevel(1);
  game.paused = false;
}

function onWebsiteLoaded(event) {
  // load audio
  audioManager.load("ocean", null, "/audio/ocean.mp3");
  audioManager.load("propeller", null, "/audio/propeller.mp3");

  audioManager.load("coin-1", "coin", "/audio/coin-1.mp3");
  audioManager.load("coin-2", "coin", "/audio/coin-2.mp3");
  audioManager.load("coin-3", "coin", "/audio/coin-3.mp3");
  audioManager.load("jar-1", "coin", "/audio/jar-1.mp3");
  audioManager.load("jar-2", "coin", "/audio/jar-2.mp3");
  audioManager.load("jar-3", "coin", "/audio/jar-3.mp3");
  audioManager.load("jar-4", "coin", "/audio/jar-4.mp3");
  audioManager.load("jar-5", "coin", "/audio/jar-5.mp3");
  audioManager.load("jar-6", "coin", "/audio/jar-6.mp3");
  audioManager.load("jar-7", "coin", "/audio/jar-7.mp3");

  audioManager.load(
    "airplane-crash-1",
    "airplane-crash",
    "/audio/airplane-crash-1.mp3"
  );
  audioManager.load(
    "airplane-crash-2",
    "airplane-crash",
    "/audio/airplane-crash-2.mp3"
  );
  audioManager.load(
    "airplane-crash-3",
    "airplane-crash",
    "/audio/airplane-crash-3.mp3"
  );

  audioManager.load("bubble", "bubble", "/audio/bubble.mp3");

  audioManager.load("shot-soft", "shot-soft", "/audio/shot-soft.mp3");

  audioManager.load("shot-hard", "shot-hard", "/audio/shot-hard.mp3");

  audioManager.load(
    "bullet-impact",
    "bullet-impact",
    "/audio/bullet-impact-rock.mp3"
  );

  audioManager.load("water-splash", "water-splash", "/audio/water-splash.mp3");
  audioManager.load(
    "rock-shatter-1",
    "rock-shatter",
    "/audio/rock-shatter-1.mp3"
  );
  audioManager.load(
    "rock-shatter-2",
    "rock-shatter",
    "/audio/rock-shatter-2.mp3"
  );

  // load models
  modelManager.load("heart");

  ui = new UI(() => {
    selectionManager.initSelectionScreen();
  }, gameplaySnapshotManager);

  document.addEventListener("selectionComplete", (event) => {
    const { pilot, aircraft } = event.detail;
    startMap(pilot, aircraft);
  });

  loadingProgressManager.catch((err) => {
    ui.showError(err.message);
  });

  initializeTokenChecks();
  initializeAudio();
}

window.addEventListener("load", onWebsiteLoaded, false);

export default game = {
  speed: 0.01,
  canDie: true,
};

// Add this where you initialize your audio
function initializeAudio() {
  // Only initialize audio after user interaction
  const initAudioButton = document.createElement("button");
  initAudioButton.textContent = "Click to Enable Audio";
  initAudioButton.style.position = "fixed";
  initAudioButton.style.top = "10px";
  initAudioButton.style.right = "10px";
  initAudioButton.style.zIndex = "1000";

  initAudioButton.addEventListener("click", () => {
    // Your audio initialization code here
    initAudioButton.remove();
  });

  document.body.appendChild(initAudioButton);
}

function initializeTokenChecks() {
  const baseCheckButton = document.getElementById("check-base-token");
  const zoraCheckButton = document.getElementById("check-zora-token");

  baseCheckButton?.addEventListener("click", async () => {
    const statusElement = document.getElementById("base-check-status");
    statusElement.textContent = "Checking...";

    try {
      const result = await checkBaseTokenOwnership();
      statusElement.textContent = result
        ? "✅ Access Granted"
        : "❌ Token Not Found";
      statusElement.className = `check-status ${result ? "success" : "error"}`;

      // Dispatch event for game to handle special effects
      document.dispatchEvent(
        new CustomEvent("baseAccessUpdated", {
          detail: { hasAccess: result },
        })
      );
    } catch (error) {
      statusElement.textContent = "❌ Error checking token";
      statusElement.className = "check-status error";
    }
  });

  zoraCheckButton?.addEventListener("click", async () => {
    const statusElement = document.getElementById("zora-check-status");
    statusElement.textContent = "Checking...";

    try {
      const result = await checkZoraTokenOwnership();
      statusElement.textContent = result
        ? "✅ Access Granted"
        : "❌ Token Not Found";
      statusElement.className = `check-status ${result ? "success" : "error"}`;

      // Dispatch event for SelectionManager to handle
      document.dispatchEvent(
        new CustomEvent("zoraAccessUpdated", {
          detail: { hasAccess: result },
        })
      );
    } catch (error) {
      statusElement.textContent = "❌ Error checking token";
      statusElement.className = "check-status error";
    }
  });
}
