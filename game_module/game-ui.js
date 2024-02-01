import * as GAME from "../main.js"
import * as THREE from "three"


let timerStarted = false;
let startTime;
let clock = new THREE.Clock();
export function draw() {


    // Start timer when initial camera animation is complete
    if (GAME.initialCameraMovementComplete && !timerStarted) {
        startTime = clock.getElapsedTime();
        timerStarted = true;
    }

    if (timerStarted) {
        let gameTime = clock.getElapsedTime() - startTime;
        document.getElementById("game-ui-time-value").textContent = gameTime.toFixed(1);
    }


}