import * as THREE from 'three';

class Plane extends THREE.Object3D{
    constructor(width, length){   
        super();

        // Create a ground plane
        this.geometry = new THREE.PlaneGeometry(width, length);
        this.material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
        
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.receiveShadow = true; 
    }

    setRotation(x, y, z) {
        this.mesh.rotation.set(x, y, z);
    }

    showAxis() {
        const axisHelper = new THREE.AxesHelper(50);
        axisHelper.setColors(0xff0000, 0x00ff00, 0x0000ff);
        this.mesh.add(axisHelper);
    }
}

export default Plane;