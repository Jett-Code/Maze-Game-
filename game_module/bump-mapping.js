import * as THREE from "three"
import * as GAME from "../main";

import { scene, renderer } from "../main";

let cube;
let directionalLight;
let cubeCamera;
let cubeRenderTarget;
let clock;

export function loadModule() {
  clock = new THREE.Clock();
  GAME.renderer.shadowMap.enabled = true;
  GAME.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Create cube and material with reflections

  const geometry = new THREE.BoxGeometry(5, 3, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
  const bumpTexture = new THREE.TextureLoader().load('/texture/circle_bump_map.jpg');
  material.bumpMap = bumpTexture;
  material.bumpScale = 20;
  material.envMap = generateCubemap(); // Add environment map for reflections
  material.metalness = 0.5; // Adjust metalness for desired reflectiveness
  material.roughness = 0.05
  cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  //GAME.addObjToScene(cube);

  // Directional light in order to see the bump mapping
  directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
  directionalLight.position.set(0, 0, 20);
  directionalLight.lookAt(new THREE.Vector3(0, 0, 0));
  directionalLight.castShadow = true;
  GAME.addObjToScene(directionalLight);
  // Note: target position only needs to be added to the scene if the target position is customized
  //directionalLight.target.position.set(0, 0, 0);
  //GAME.addObjToScene(directionalLight.target);

  let helper = new THREE.DirectionalLightHelper(directionalLight);
  GAME.addObjToScene(helper);

  let light = new THREE.AmbientLight(0xFFFFFF, 0.1);
  GAME.addObjToScene(light);
}

function generateCubemap() {
  // Create a cube render target to capture reflections
  cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512);
  cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
  GAME.addObjToScene(cubeCamera);

  // Update cube camera position and render target in animateModule

  return cubeRenderTarget.texture;
}

export function animateModule() {
  //cube.rotation.y += 0.02;

  let time = clock.getElapsedTime();

  // Update cube camera position
  //console.log(cube.position)

  //cubeCamera.position.copy(cube.position);
  //cubeCamera.update(renderer, scene);

  // Move light position
  directionalLight.position.set(Math.sin(time) * 5, 2, -10);
}
