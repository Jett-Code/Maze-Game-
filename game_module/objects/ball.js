import * as THREE from 'three';

class Ball extends THREE.Object3D{
    constructor() {
        super();    

        // create a metal ball with sphere geometry
        this.geometry = new THREE.SphereGeometry(0.4, 32, 32);
        this.material = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 1,
            roughness: 0.1,
        });
        
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.movementVector = new THREE.Vector3(0, 0, 1); // Default movement vector
    }

    // set position of ball
    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    // set rotation of ball
    setRotation(x, y, z) {
        this.mesh.rotation.set(x, y, z);
    }

    // show axis of the object
    showAxis() {
        const axesHelper = new THREE.AxesHelper(10);
        this.mesh.add(axesHelper);
    }
}

export default Ball;