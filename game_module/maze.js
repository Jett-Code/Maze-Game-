import * as THREE from "three";
import * as GAME from "../main";
import * as TG from "./texture-generation.js";
import Ball from "./objects/ball.js";
import Plane from "./objects/plane.js";


// create the game board as a group of objects
export const maze = new THREE.Group();
export const mazeWidth = 15;
export const mazeLength = 15;
const axisHelper = new THREE.AxesHelper(50);
maze.add(axisHelper);


// Store the last open space in the maze
let lastOpenSpace = null;

// Create a hole object
const holeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
export const hole = new THREE.Mesh(holeGeometry, holeMaterial);

const light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 10, 10, 10);
light.castShadow = true; // default false
light.shadowCameraVisible = true;
maze.add( light );

let ablight = new THREE.AmbientLight(0xFFFFFF, 0.1);
maze.add(ablight);
// Create a plane object
const ground = new Plane(mazeWidth, mazeLength);
ground.receiveShadow = true;
maze.add(ground.mesh);
ground.setRotation(Math.PI / 2, 0, 0);
// ground.showAxis();

// Create a ball object
export const ball = new Ball();
ball.castShadow = true;
maze.add(ball.mesh);
ball.setPosition(-6, 0.5, -6);
ball.showAxis();

export let mazeLayout;



// structure to store walls for collision detection
export let walls = [];

export function loadModule() {

  GAME.renderer.shadowMap.enabled = true;
  GAME.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const helper = new THREE.CameraHelper( light.shadow.camera );
  maze.add( helper );
  // Initialize maze grid with walls (1: wall, 0: path)
  mazeLayout = Array.from({ length: mazeLength }, () =>
    Array(mazeWidth).fill(1)
  );

  // Start carving path from (1, 1)
  carvePath(1, 1);

  let textures = TG.generateTexture();
  const wallMaterial = new THREE.MeshStandardMaterial({
    map: textures.woodTexture,
  });
  const wallGeometry = new THREE.BoxGeometry(1, 1, 1); // Wall size

  wallMaterial.bumpMap = textures.bumpMapTexture;
  wallMaterial.bumpScale = 20;
  //wallMaterial.metalness = 0.5;
  //wallMaterial.roughness = 0.05;

  // Find the last open space in the maze

  for (let y = mazeLength - 1; y >= 0; y--) {
    for (let x = mazeWidth - 1; x >= 0; x--) {
      if (mazeLayout[y][x] === 0) {
        lastOpenSpace = [x, y];
        break;
      }
    }
    if (lastOpenSpace) break;
  }

  hole.position.set(
    lastOpenSpace[0] - mazeWidth / 2 + ground.position.x + 0.5,
    0.0,
    lastOpenSpace[1] - mazeLength / 2 + ground.position.z + 0.5
  );
  maze.add(hole);

  createMaze();

  // Function to create the maze based on the layout
  function createMaze() {
    //walls.push(ground); // Store the ground for collision detection
    mazeLayout.forEach((row, z) => {
      row.forEach((cell, x) => {
        // 1 indicates a wall
        if (cell === 1) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(
            x - mazeWidth / 2 + ground.position.x + 0.5,
            10, // Initial y-position
            z - mazeLength / 2 + ground.position.z + 0.5
          );
          walls.push(wall); // Store the wall for collision detection

          // Create a temporary group for the wall
          const wallGroup = new THREE.Group();
          wallGroup.add(wall);

          // Add the group to the maze with a delay
          setTimeout(() => {
            maze.add(wallGroup);

            // Animate the wall falling down
            let start = null;
            function animate(timestamp) {
              if (!start) start = timestamp;
              const progress = timestamp - start;
              const targetY = 0.5 + ground.position.y;

              // If the block has hit the ground
              if (wall.position.y <= targetY) {
                // Make the block bounce
                wall.position.y = targetY + Math.sin(progress / 100) * 10;
                // Stop the animation after a short period of time
                if (progress > 200) {
                  wall.position.y = targetY;
                } else {
                  requestAnimationFrame(animate);
                }
              } else {
                // If the block is still falling
                wall.position.y = 10 - progress / 100;
                requestAnimationFrame(animate);
              }
            }
            requestAnimationFrame(animate);
          }, 50 * (x + z * mazeWidth)); // Delay based on the position of the block
        }
      });
    });

    // Add the maze group to the GAME object
    GAME.addObjToScene(maze);
  }
}

// Recursive Backtracking to generate maze
function carvePath(x, y) {
  // Directions to move: up, right, down, left, always 2 spaces
  const directions = [
    [0, -2],
    [2, 0],
    [0, 2],
    [-2, 0],
  ];
  directions.sort(() => Math.random() - 0.5); // Randomize directions

  // Start carving from the current cell
  mazeLayout[y][x] = 0;

  // Iterate over all directions
  directions.forEach((dir) => {
    const [dx, dy] = dir;
    const newX = x + dx;
    const newY = y + dy;

    // Check if new position is within bounds and not visited
    if (
      newY > 0 &&
      newY < mazeLength &&
      newX > 0 &&
      newX < mazeWidth &&
      mazeLayout[newY][newX] === 1
    ) {
      // Carve path between current cell and new cell
      mazeLayout[y + dy / 2][x + dx / 2] = 0;
      // Recursively carve path from new cell
      carvePath(newX, newY);
    }
  });
}

//function that returns the maze group
export function getMaze() {
  return this.maze;
}

//function that sets the rotation of the maze group
export function setRotation(x, y, z) {
  maze.rotation.x += x;
  maze.rotation.y += y;
  maze.rotation.z += z;
}

export function reachedHole() {
  if (ball.mesh.position.distanceTo(hole.position) < 1) {
    console.log("reached hole");
    return true;
  }
  return false;
}

//move ball to the hole
export function moveBallToHole() {
  ball.mesh.position.copy(hole.position);
}

function checkCollision(ballPos, walls) {
  for (let i = 0; i < walls.length; i++) {
    let wallPos = walls[i].position;
    let distance = Math.sqrt(
      (ballPos.x - wallPos.x) ** 2 +
        (ballPos.y - wallPos.y) ** 2 +
        (ballPos.z - wallPos.z) ** 2
    );

    if (distance < 0.99) {
      console.log("collision detected");
      return true; // Collision detected
    }
  }

  return false; // No collision detected
}

let direction = new THREE.Vector3(0, 0, 0);
let isAnimating = false;

export function updateBallPosition(rotation, axis) {
  // Delay the update of the direction vector
  setTimeout(() => {
    if (axis === "x") {
      if (rotation > 0) {
        direction.z = 0.05;
      } else if (rotation < 0) {
        direction.z = -0.05;
      }
    }

    if (axis === "z") {
      if (rotation > 0) {
        direction.x = -0.05;
      } else if (rotation < 0) {
        direction.x = 0.05;
      }
    }
    console.log("direction: ", direction);
  }, 100); // Delay of 100ms

  // Start the animation if it's not already running
  if (!isAnimating) {
    isAnimating = true;
    moveBall();
  }
}

const moveBall = () => {
  let clonedBallPos = ball.mesh.position.clone(); // Update clonedBallPos
  clonedBallPos.add(direction);
  if (!checkCollision(clonedBallPos, walls)) {
    ball.mesh.position.copy(clonedBallPos);
    console.log("ball position: ", ball.mesh.position);
  } else {
    setTimeout(() => {
      direction.set(0, 0, 0);
    }, 100); // Add a small delay before setting the direction to (0, 0, 0)
  }

  // If the direction is (0, 0, 0), stop the animation
  if (direction.x === 0 && direction.y === 0 && direction.z === 0) {
    isAnimating = false;
  } else {
    requestAnimationFrame(moveBall); // Call moveBall before the next repaint
  }
};

// export function updateBallPosition(rotation, axis) {
//   const direction = new THREE.Vector3(0, 0, 0);

//   if (axis === "x") {
//     if (rotation > 0) {
//       direction.z += 0.1;
//     }
//     else if (rotation < 0) {
//       direction.z -= 0.1;
//     }
//   }

//   if (axis === "z") {
//     if (rotation > 0) {
//       direction.x -= 0.1;
//     }
//     else if (rotation < 0) {
//       direction.x += 0.1;
//     }
//   }

//   const clonedBallPos = ball.mesh.position.clone();
//   ball.mesh.position.add(direction);

//   if (checkCollision(ball.mesh.position, walls)) {
//     ball.mesh.position.copy(clonedBallPos); // Revert to old position if collision detected
//   }

//   direction.set(0, 0, 0);
// }
