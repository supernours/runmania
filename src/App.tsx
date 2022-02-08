import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module'

const loadFbxObject = (url: string, callback: (obj: any) => void, opponent: boolean, texture_url: string | undefined = undefined, color: THREE.ColorRepresentation | undefined = undefined) => {
  let carmat: THREE.MeshBasicMaterial | undefined = undefined;
  if (texture_url) {
    const cartex = new THREE.TextureLoader().load(process.env.PUBLIC_URL + texture_url);
    carmat = new THREE.MeshBasicMaterial({ map: cartex, opacity: opponent ? 0.1 : 1 });
    if (color) {
      carmat.color.set(color);
    }
  }

  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    process.env.PUBLIC_URL + url,
    (object) => {
      if (texture_url)
      object.traverse(function (child) {
        if ((child as THREE.Mesh).isMesh && carmat) {
          (child as THREE.Mesh).material = carmat
          if ((child as THREE.Mesh).material) {
            ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = true
          }
        }
      })
      callback(object);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
      console.log(error)
    }
  )
}

const loadGltfObject = (url: string, callback: (obj: any) => void) => {
 
  const loader = new GLTFLoader();
  loader.load(
    process.env.PUBLIC_URL + url,
    (object) => {
      callback(object);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
      console.log(error)
    }
  )
}

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const light = new THREE.PointLight()
light.position.set(0.8, 1.4, 1.0)
scene.add(light)

const ambientLight = new THREE.AmbientLight()
scene.add(ambientLight)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0.8, 1.4, 1.0)

loadFbxObject('Models/car_1.fbx', (obj) => {console.log(obj); scene.add(obj)}, false, "Textures/Car Texture 1.png", 0x000000 );
loadFbxObject('Models/road.fbx', (obj) => {console.log(obj); const mesh = obj.children[0]; mesh.matrix.compose(new THREE.Vector3(0, 0, 1), new THREE.Quaternion(0, 0, 0, 1), new THREE.Vector3(10, 4, 1));  mesh.matrixAutoUpdate = false; console.log(mesh); scene.add(mesh)}, false);

const renderer = new THREE.WebGLRenderer()
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)



window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

function animate() {
  requestAnimationFrame(animate)

  controls.update()

  render()

  stats.update()
}

function render() {
  renderer.render(scene, camera)
}

animate()

function App() {
  return (
    <div>
    </div>
  );
}

export default App;
