import * as GAME from "../main.js"
import * as THREE from "three"
import * as MAZE from "./maze.js"


let collectables = [];
let clock = new THREE.Clock();

class Collectable {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.floatY = 0;

        this.geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 30);
        this.material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        this.materialBumpMap = new THREE.MeshPhongMaterial({ color: 0xffff00 });

        let bumpTexture = new THREE.TextureLoader().load('/texture/coin_bump_map.jpg');
        this.materialBumpMap.bumpMap = bumpTexture;
        this.materialBumpMap.bumpScale = 10;

        this.cylinder = new THREE.Mesh(this.geometry, [this.material, this.materialBumpMap, this.materialBumpMap]);
        this.cylinder.position.set(x, y, z);
        this.cylinder.rotation.x = Math.PI / 2;
        this.cylinder.castShadow = true;
        this.cylinder.receiveShadow = true;
    }

    getFloatingY() {
        return this.y + this.floatY;
    }

    setFloatingY(value) {
        this.floatY = value;
        this.cylinder.position.y = this.y + this.floatY;
    }

    setRotation(value) {
        //this.cylinder.rotation.x = value;
        this.cylinder.rotateZ(value);
    }
}

export function spawn(x, y, z) {

    let item = new Collectable(x, y, z);
    collectables.push(item);
    //GAME.addObjToScene(item.cylinder);
    MAZE.maze.add(item.cylinder);

}

/**
 * 
 * @param {*} spawnPercentage float from 0.0 - 1.0 
 */
export function init(spawnPercentage) {

    // Spawn collectibles with a chance of 10%
    for (let y = 0; y < MAZE.mazeLayout.length; y++) {
        for (let x = 0; x < MAZE.mazeLayout[y].length; x++) {
            if (MAZE.mazeLayout[y][x] === 0)
                if (Math.random() >= 1.0 - spawnPercentage) {
                    spawn(x - Math.floor(MAZE.mazeWidth / 2), 0.25, y - Math.floor(MAZE.mazeLength / 2));
                }
        }

    }

}

let lastTime = 0;
export function move() {

    let currentTime = clock.getElapsedTime();
    collectables.forEach(cl => {
        cl.setFloatingY((Math.sin(currentTime * 2) + 1) * 0.25)
        cl.setRotation((currentTime - lastTime) * 0.75);
    }
    );


    lastTime = currentTime;
}