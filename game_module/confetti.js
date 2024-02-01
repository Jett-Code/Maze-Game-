import * as THREE from "three";
import { scene, renderer } from "../main";

class Confetti {
    constructor(x, y, z) {
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5); // Random velocity with magnitude 0.5 
        this.color = new THREE.Color(Math.random() * 0xffffff);
        this.size = Math.random();

        let geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        let material = new THREE.MeshBasicMaterial({color: this.color});
        this.mesh = new THREE.Mesh(geometry, material);
    }

    update() {
        this.position.add(this.velocity);
        this.mesh.position.copy(this.position);
        this.size -= 0.01;
        if (this.size < 0) this.size = 0;
        this.mesh.scale.set(this.size, this.size, this.size);
    }
}

let confettiArray = [];

export function createConfetti(x, y, z) {
    for (let i = 0; i < 100; i++) {
        let confetti = new Confetti(x, y, z);
        confettiArray.push(confetti);
        scene.add(confetti.mesh);
    }
}

export function updateConfetti() {
    for (let i = 0; i < confettiArray.length; i++) {
        confettiArray[i].update();
        if (confettiArray[i].size <= 0) {
            scene.remove(confettiArray[i].mesh);
            confettiArray.splice(i, 1);
            i--;
        }
    }
}
