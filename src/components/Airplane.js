import { utils } from "../utils/Utils";
import { Colors } from "../utils/Colors";
import Pilot from "./Pilot";

export function createOriginalAirplaneMesh(pilotType) {
  console.log("Creating original airplane mesh with pilot type:", pilotType);
  const mesh = new THREE.Object3D();

  // Cabin
  var matCabin = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const frontUR = [40, 25, -25];
  const frontUL = [40, 25, 25];
  const frontLR = [40, -25, -25];
  const frontLL = [40, -25, 25];
  const backUR = [-40, 15, -5];
  const backUL = [-40, 15, 5];
  const backLR = [-40, 5, -5];
  const backLL = [-40, 5, 5];

  const vertices = new Float32Array(
    utils
      .makeTetrahedron(frontUL, frontUR, frontLL, frontLR)
      .concat(
        // front
        utils.makeTetrahedron(backUL, backUR, backLL, backLR)
      )
      .concat(
        // back
        utils.makeTetrahedron(backUR, backLR, frontUR, frontLR)
      )
      .concat(
        // side
        utils.makeTetrahedron(backUL, backLL, frontUL, frontLL)
      )
      .concat(
        // side
        utils.makeTetrahedron(frontUL, backUL, frontUR, backUR)
      )
      .concat(
        // top
        utils.makeTetrahedron(frontLL, backLL, frontLR, backLR)
      ) // bottom
  );
  const geomCabin = new THREE.BufferGeometry();
  geomCabin.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  var cabin = new THREE.Mesh(geomCabin, matCabin);
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  mesh.add(cabin);

  // Engine

  var geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
  var matEngine = new THREE.MeshPhongMaterial({
    color: Colors.white,
    flatShading: true,
  });
  var engine = new THREE.Mesh(geomEngine, matEngine);
  //Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
  engine.position.x = 50;
  engine.castShadow = true;
  engine.receiveShadow = true;
  mesh.add(engine);

  // Tail Plane
  var geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
  var matTailPlane = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading: true,
  });
  var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
  //Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
  tailPlane.position.set(-40, 20, 0);
  tailPlane.castShadow = true;
  tailPlane.receiveShadow = true;
  mesh.add(tailPlane);

  // Wings

  var geomSideWing = new THREE.BoxGeometry(30, 5, 120, 1, 1, 1);
  var matSideWing = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading: true,
  });
  var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
  //Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
  sideWing.position.set(0, 15, 0);
  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  mesh.add(sideWing);

  var geomWindshield = new THREE.BoxGeometry(3, 15, 20, 1, 1, 1);
  var matWindshield = new THREE.MeshPhongMaterial({
    color: Colors.white,
    transparent: true,
    opacity: 0.3,
    flatShading: true,
  });
  var windshield = new THREE.Mesh(geomWindshield, matWindshield);
  windshield.position.set(20, 27, 0);

  windshield.castShadow = true;
  windshield.receiveShadow = true;

  mesh.add(windshield);

  var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
  geomPropeller.attributes.position.array[4 * 3 + 1] -= 5;
  geomPropeller.attributes.position.array[4 * 3 + 2] += 5;
  geomPropeller.attributes.position.array[5 * 3 + 1] -= 5;
  geomPropeller.attributes.position.array[5 * 3 + 2] -= 5;
  geomPropeller.attributes.position.array[6 * 3 + 1] += 5;
  geomPropeller.attributes.position.array[6 * 3 + 2] += 5;
  geomPropeller.attributes.position.array[7 * 3 + 1] += 5;
  geomPropeller.attributes.position.array[7 * 3 + 2] -= 5;
  var matPropeller = new THREE.MeshPhongMaterial({
    color: Colors.brown,
    flatShading: true,
  });
  const propeller = new THREE.Mesh(geomPropeller, matPropeller);

  propeller.castShadow = true;
  propeller.receiveShadow = true;

  var geomBlade = new THREE.BoxGeometry(1, 80, 10, 1, 1, 1);
  var matBlade = new THREE.MeshPhongMaterial({
    color: Colors.brownDark,
    flatShading: true,
  });
  var blade1 = new THREE.Mesh(geomBlade, matBlade);
  //Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
  blade1.position.set(8, 0, 0);

  blade1.castShadow = true;
  blade1.receiveShadow = true;

  var blade2 = blade1.clone();
  blade2.rotation.x = Math.PI / 2;

  blade2.castShadow = true;
  blade2.receiveShadow = true;

  propeller.add(blade1);
  propeller.add(blade2);
  propeller.position.set(60, 0, 0);
  mesh.add(propeller);

  var wheelProtecGeom = new THREE.BoxGeometry(30, 15, 10, 1, 1, 1);
  var wheelProtecMat = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading: true,
  });
  var wheelProtecR = new THREE.Mesh(wheelProtecGeom, wheelProtecMat);
  //Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
  wheelProtecR.position.set(25, -20, 25);
  mesh.add(wheelProtecR);

  var wheelTireGeom = new THREE.BoxGeometry(24, 24, 4);
  var wheelTireMat = new THREE.MeshPhongMaterial({
    color: Colors.brownDark,
    flatShading: true,
  });
  var wheelTireR = new THREE.Mesh(wheelTireGeom, wheelTireMat);
  //Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
  wheelTireR.position.set(25, -28, 25);

  var wheelAxisGeom = new THREE.BoxGeometry(10, 10, 6);
  var wheelAxisMat = new THREE.MeshPhongMaterial({
    color: Colors.brown,
    flatShading: true,
  });
  var wheelAxis = new THREE.Mesh(wheelAxisGeom, wheelAxisMat);
  wheelTireR.add(wheelAxis);

  mesh.add(wheelTireR);

  var wheelProtecL = wheelProtecR.clone();
  wheelProtecL.position.z = -wheelProtecR.position.z;
  mesh.add(wheelProtecL);

  var wheelTireL = wheelTireR.clone();
  wheelTireL.position.z = -wheelTireR.position.z;
  mesh.add(wheelTireL);

  var wheelTireB = wheelTireR.clone();
  wheelTireB.scale.set(0.5, 0.5, 0.5);
  //Ð¿Ð¾Ð·Ð¸Ñ†Ð¸Ñ
  wheelTireB.position.set(-35, -5, 0);
  mesh.add(wheelTireB);

  var suspensionGeom = new THREE.BoxGeometry(4, 20, 4);
  suspensionGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 10, 0));
  var suspensionMat = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading: true,
  });
  var suspension = new THREE.Mesh(suspensionGeom, suspensionMat);
  suspension.position.set(-35, -5, 0);
  suspension.rotation.z = -0.3;
  mesh.add(suspension);

  // Modify the pilot creation part
  const pilot = new Pilot(pilotType);
  pilot.mesh.position.set(5, 27, 0);
  mesh.add(pilot.mesh);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return [mesh, propeller, pilot];
}

export default createOriginalAirplaneMesh;
