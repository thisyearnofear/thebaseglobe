import { Colors } from "../utils/Colors";
import Pilot from "./Pilot";

export function createBlimpMesh(pilotType) {
  console.log("Creating blimp mesh with pilot type:", pilotType);

  const mesh = new THREE.Object3D();

  // Blimp body (vivid green with casino designs)
  const bodyGeometry = new THREE.SphereGeometry(40, 32, 32);
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00, // Bright green
    flatShading: true,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.scale.set(2, 1, 1);
  mesh.add(body);

  // Adding casino designs (3D boxes representing card suits)
  const suitGeometry = new THREE.BoxGeometry(5, 5, 5);
  const suits = [
    { color: 0x000000, position: [30, 0, 10] }, // Spade
    { color: 0xff0000, position: [30, 0, -10] }, // Heart
    { color: 0x0000ff, position: [-30, 0, 10] }, // Diamond
    { color: 0x008000, position: [-30, 0, -10] }, // Club
  ];

  suits.forEach(({ color, position }) => {
    const suitMaterial = new THREE.MeshPhongMaterial({ color });
    const suitMesh = new THREE.Mesh(suitGeometry, suitMaterial);
    suitMesh.position.set(...position);
    body.add(suitMesh);
  });

  // Gondola
  const gondolaGeometry = new THREE.BoxGeometry(20, 10, 15);
  const gondolaMaterial = new THREE.MeshPhongMaterial({
    color: 0x8b4513,
    flatShading: true,
  });
  const gondola = new THREE.Mesh(gondolaGeometry, gondolaMaterial);
  gondola.position.set(0, -25, 0);
  mesh.add(gondola);

  // Propeller (casino-themed slot machine)
  const slotGeometry = new THREE.CylinderGeometry(10, 10, 20, 32);
  const slotMaterial = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    flatShading: true,
  });
  const propeller = new THREE.Mesh(slotGeometry, slotMaterial);
  propeller.position.set(-60, -25, 0);

  const bladeGeom = new THREE.BoxGeometry(1, 80, 10);
  const bladeMat = new THREE.MeshPhongMaterial({
    color: 0x000000,
    flatShading: true,
  });
  const blade1 = new THREE.Mesh(bladeGeom, bladeMat);
  const blade2 = blade1.clone();
  blade2.rotation.x = Math.PI / 2;
  propeller.add(blade1);
  propeller.add(blade2);
  mesh.add(propeller);

  // Pilot (added at the bottom of the gondola for the blimp)
  const pilot = new Pilot(pilotType);
  pilot.mesh.position.set(0, -35, 0);
  mesh.add(pilot.mesh);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return [mesh, propeller, pilot];
}

export default createBlimpMesh;
