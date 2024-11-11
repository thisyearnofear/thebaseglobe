// src/createAirplaneMesh.js
import { createOriginalAirplaneMesh } from "./components/Airplane";
import { createBlimpMesh } from "./components/Blimp";
import { createFighterJetMesh } from "./components/FighterJet";
import { aircraftManager } from "./managers/AircraftManager";

export default function createAirplaneMesh(pilotType, aircraftType) {
  console.log(
    "Creating airplane mesh with pilot type:",
    pilotType,
    "and aircraft type:",
    aircraftType
  );

  switch (aircraftType) {
    case "blimp":
      return createBlimpMesh(pilotType);
    case "fighterJet":
      return createFighterJetMesh(pilotType);
    case "airplane":
    default:
      return createOriginalAirplaneMesh(pilotType);
  }
}
