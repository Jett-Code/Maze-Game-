import * as GAME from "../main.js";
import * as THREE from "three"



export function generate() {
    let groundGeometry = new THREE.PlaneGeometry(300, 300, 300, 300);
    let groundMaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00, wireframe: true });

    let canvas = document.createElement('canvas');
    canvas.id = 'scenery-terrain';
    canvas.width = 200;
    canvas.height = 200;
    document.body.appendChild(canvas);
    let ctx = canvas.getContext("2d");


    for (let x = 0; x < canvas.width; x++) {

        for (let y = 0; y < canvas.height; y++) {
            let perlinNoiseValue = (perlinNoise(x * 0.025, y * 0.025) + 1) / 2;
            let perlinNoiseGrayscaleValue = perlinNoiseValue * 255;

            ctx.fillStyle = getGrayscaleRGBString(perlinNoiseGrayscaleValue);
            ctx.fillRect(x, y, 1, 1);
        }
    }

    let canvasTexture = new THREE.CanvasTexture(canvas);

    groundMaterial.displacementMap = canvasTexture;
    groundMaterial.displacementScale = 75;
    let groundObj = new THREE.Mesh(groundGeometry, groundMaterial);
    groundObj.position.set(0, -125, 0);
    //groundObj.rotation.x = Math.PI /2;
    groundObj.rotateX(Math.PI * 1.5);
    GAME.addObjToScene(groundObj);


}
function getRGBString(r, g, b) {
    return "rgb(" + r + ", " + g + ", " + b + ")";
}

function getGrayscaleRGBString(grayValue) {
    return getRGBString(grayValue, grayValue, grayValue);
}

/**
 * Tutorials and references including code for this Perlin noise implementation
 * https://adrianb.io/2014/08/09/perlinnoise.html
 * https://rtouti.github.io/graphics/perlin-noise-algorithm
 *
 */

/**
 * Fade function from Ken Perlin
 * f(t) = 6t^5 - 15t^4 + 10t^3
 */
function fade(t) {
    return 6 * Math.pow(t, 5) - 15 * Math.pow(t, 4) + 10 * Math.pow(t, 3);
}
// Permutation from Ken Perlin.
const permutation = [151, 160, 137, 91, 90, 15,
    131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
    102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
    135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
    5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
    223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
    251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
    49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
];


function GetConstantVector(v) {
    // v is the value from the permutation table
    const h = v & 3;
    if (h === 0)
        return new THREE.Vector2(1.0, 1.0);
    else if (h === 1)
        return new THREE.Vector2(-1.0, 1.0);
    else if (h === 2)
        return new THREE.Vector2(-1.0, -1.0);
    else
        return new THREE.Vector2(1.0, -1.0);
}

function Lerp(t, a1, a2) {
    return a1 + t * (a2 - a1);
}

function perlinNoise(x, y) {

    let p2 = [];
    permutation.forEach(i => p2.push(i));
    permutation.forEach(i => p2.push(i));

    let xMod = Math.floor(x) % 256;
    let yMod = Math.floor(y) % 256;
    let xFloor = x - Math.floor(x);
    let yFloor = y - Math.floor(y);

    // Vectors pointing to the coordiante within the square
    let topRight = new THREE.Vector2(xFloor - 1, yFloor - 1);
    let topLeft = new THREE.Vector2(xFloor, yFloor - 1);
    let bottomRight = new THREE.Vector2(xFloor - 1, yFloor);
    let bottomLeft = new THREE.Vector2(xFloor, yFloor);

    // Get the same value of a corner every time
    let valueTopRight = p2[p2[xMod + 1] + yMod + 1];
    let valueTopLeft = p2[p2[xMod] + yMod + 1];
    let valueBottomRight = p2[p2[xMod + 1] + yMod];
    let valueBottomLeft = p2[p2[xMod] + yMod];

    let dotTopRight = topRight.dot(GetConstantVector(valueTopRight));
    let dotTopLeft = topLeft.dot(GetConstantVector(valueTopLeft));
    let dotBottomRight = bottomRight.dot(GetConstantVector(valueBottomRight));
    let dotBottomLeft = bottomLeft.dot(GetConstantVector(valueBottomLeft));

    let u = fade(xFloor);
    let v = fade(yFloor);

    let lerp1 = Lerp(v, dotBottomLeft, dotTopLeft);
    let lerp2 = Lerp(v, dotBottomRight, dotTopRight);
    return Lerp(u, lerp1, lerp2);

}