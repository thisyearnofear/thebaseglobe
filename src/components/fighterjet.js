import { Colors } from "../utils/Colors";
import Pilot from "./Pilot";

export function createFighterJetMesh(pilotType) {
  console.log("Creating fighter jet mesh with pilot type:", pilotType);

  const mesh = new THREE.Object3D();

  // Main body
  const bodyGeometry = new THREE.ConeGeometry(15, 150, 32);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x2f4f4f });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.rotation.z = Math.PI / 2;
  mesh.add(body);

  // Cockpit
  const cockpitGeometry = new THREE.SphereGeometry(12, 32, 32);
  const cockpitMaterial = new THREE.MeshPhongMaterial({
    color: 0x1e90ff,
    opacity: 0.7,
    transparent: true,
  });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.set(-60, 15, 0);
  mesh.add(cockpit);

  // Wings
  const wingGeometry = new THREE.BoxGeometry(50, 5, 100);
  const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x2f4f4f });
  const wings = new THREE.Mesh(wingGeometry, wingMaterial);
  mesh.add(wings);

  // Tail fins and engines
  const tailFinGeometry = new THREE.BoxGeometry(20, 30, 5);
  const engineGeometry = new THREE.CylinderGeometry(8, 10, 20, 32);
  const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x696969 });

  const leftFin = new THREE.Mesh(tailFinGeometry, wingMaterial);
  leftFin.position.set(60, 15, -5);
  mesh.add(leftFin);

  const rightFin = leftFin.clone();
  rightFin.position.set(60, 15, 5);
  mesh.add(rightFin);

  const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial);
  leftEngine.position.set(30, -10, -15);
  mesh.add(leftEngine);

  const rightEngine = leftEngine.clone();
  rightEngine.position.set(30, -10, 15);
  mesh.add(rightEngine);

  // Propeller (represented by nose cone for consistency)
  const propellerGeometry = new THREE.ConeGeometry(5, 20, 32);
  const propellerMaterial = new THREE.MeshPhongMaterial({ color: 0xd3d3d3 });
  const propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
  propeller.position.set(-85, 0, 0);
  mesh.add(propeller);

  // Pilot (positioned inside the cockpit)
  const pilot = new Pilot(pilotType);
  pilot.mesh.position.set(-60, 25, 0); // Positioned near cockpit
  mesh.add(pilot.mesh);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return [mesh, propeller, pilot];
}

export default createFighterJetMesh;
