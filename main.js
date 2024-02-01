import * as THREE from "three";
import * as BM from "./game_module/bump-mapping.js";
import * as MAZE from "./game_module/maze.js";
import * as CAMERA from "./game_module/initial-camera-movement.js";
import * as UI from "./game_module/game-ui.js";
import * as PATH from "./game_module/path-finding.js";
import * as CL from "./game_module/collectables.js";
import * as SCENERY from "./game_module/scenery.js";
import { createConfetti, updateConfetti } from "./game_module/confetti.js";

console.log("hello");
export const scene = new THREE.Scene();

// Allows modules to add objects to the scene
export function addObjToScene(object) {
  scene.add(object);
}

// Make objects available to modules via export
export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
export const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Module initialization
BM.loadModule();
MAZE.loadModule();
//TG.generateTexture();
CAMERA.setInitialPosition();

CL.init(0.1);
SCENERY.generate();
PATH.showPath();

export let initialCameraMovementComplete = false;

// Set up keyboard controls
const keys = {
  tiltUp: false,
  tiltDown: false,
  tiltLeft: false,
  tiltRight: false,
};

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "w":
      keys.tiltUp = true;
      break;
    case "s":
      keys.tiltDown = true;
      break;
    case "a":
      keys.tiltLeft = true;
      break;
    case "d":
      keys.tiltRight = true;
      break;
    case "p":   // Toggle path
        PATH.togglePath();
        break;
    case "c":   // move ball to hole
        MAZE.moveBallToHole();
        break;
  }
});

document.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "w":
      keys.tiltUp = false;
      break;
    case "s":
      keys.tiltDown = false;
      break;
    case "a":
      keys.tiltLeft = false;
      break;
    case "d":
      keys.tiltRight = false;
      break;
  }
});

function animate() {
  requestAnimationFrame(animate);

  // Module loop
  BM.animateModule();
  UI.draw();
  CL.move();


  // Call method as long as the camera animation is still in progress
  if (!initialCameraMovementComplete)
    initialCameraMovementComplete = CAMERA.move();

  // Update box tilt based on pressed keys
  if (keys.tiltUp) {
    MAZE.maze.rotation.x -= 0.02;
    MAZE.updateBallPosition(MAZE.maze.rotation.x, "x");
  }

  if (keys.tiltDown) {
    MAZE.maze.rotation.x += 0.02;
    MAZE.updateBallPosition(MAZE.maze.rotation.x, "x");
  }

  if (keys.tiltLeft) {
    MAZE.maze.rotation.z += 0.02;
    MAZE.updateBallPosition(MAZE.maze.rotation.z, "z");
  }
  if (keys.tiltRight) {
    MAZE.maze.rotation.z -= 0.02;
    MAZE.updateBallPosition(MAZE.maze.rotation.z, "z");
  }

  if(MAZE.reachedHole()) {
    createConfetti(MAZE.hole.position.x, MAZE.hole.position.y, MAZE.hole.position.z);
    updateConfetti();
  }


  renderer.render(scene, camera);
}
animate();
