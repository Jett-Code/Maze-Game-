import * as GAME from "../main.js"
import * as MAZE from "./maze.js"
import * as THREE from "three"


const startPosition = new THREE.Vector3(100, 100, 60);
const endPosition = new THREE.Vector3(0, 15, 0);
const clock = new THREE.Clock();
let startTime;

// animationTime is in seconds
const animationTime = 2.0
/**
 * Sets the camera to a starting point
 */
export function setInitialPosition() {

    GAME.camera.position.set(startPosition.x, startPosition.y, startPosition.z);
    GAME.camera.lookAt(GAME.scene.position);
    startTime = clock.getElapsedTime();
}

function linearInterpolation(start, end, t) {
    if (t > 1)
        t = 1;
    if (t < 0)
        t = 0;
    let tmpStart = start.clone();
    let tmpEnd = end.clone();
    return tmpEnd.sub(tmpStart).multiplyScalar(t).add(start);
}

/**
 * Return true when initial camera movement is done
 */
export function move() {
    let timeDiff = clock.getElapsedTime() - startTime;
    //console.log(timeDiff);
    let animationPercentage = timeDiff / animationTime;
    let nextCameraPos = linearInterpolation(startPosition, endPosition, animationPercentage);

    GAME.camera.position.set(nextCameraPos.x, nextCameraPos.y, nextCameraPos.z);

    //console.log("camera: ", GAME.camera.position);

    GAME.camera.lookAt(GAME.scene.position);

    // Animation is done when animationPercentage greater than or equal to 1
    return animationPercentage >= 1.0;
}