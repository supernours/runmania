import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module'
import * as CANNON from "cannon-es";
let world = new CANNON.World()

// Tweak contact properties.
// Contact stiffness - use to make softer/harder contacts
world.defaultContactMaterial.contactEquationStiffness = 1e9

// Stabilization time in number of timesteps
world.defaultContactMaterial.contactEquationRelaxation = 4

const solver = new CANNON.GSSolver()
solver.iterations = 7
solver.tolerance = 0.1
world.solver = new CANNON.SplitSolver(solver)
// use this to test non-split solver
// world.solver = solver

world.gravity.set(0, -20, 0)

// Create a slippery material (friction coefficient = 0.0)
let physicsMaterial = new CANNON.Material('physics')
const physics_physics = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
  friction: 0.0,
  restitution: 0.3,
})

// We must add the contact materials to the world
world.addContactMaterial(physics_physics)

const wheelMaterial = new CANNON.Material('wheel')
const chassisShape = new CANNON.Box(new CANNON.Vec3(7.5, 1, 4))
const chassisBody = new CANNON.Body({ mass: 5 })
const centerOfMassAdjust = new CANNON.Vec3(0, 0, 0)
chassisBody.addShape(chassisShape, centerOfMassAdjust)

// Create the vehicle
const vehicle = new CANNON.RigidVehicle({
  chassisBody,
})

const mass = 1
const axisWidth = 5
const wheelShape = new CANNON.Cylinder(0.5, 0.5, 0.5)
const down = new CANNON.Vec3(0, -0.5, 0)

const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial })
wheelBody1.addShape(wheelShape)
vehicle.addWheel({
  body: wheelBody1,
  position: new CANNON.Vec3(-3, 0, axisWidth / 2).vadd(centerOfMassAdjust),
  axis: new CANNON.Vec3(0, 0, 1),
  direction: down,
})

const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial })
wheelBody2.addShape(wheelShape)
vehicle.addWheel({
  body: wheelBody2,
  position: new CANNON.Vec3(-3, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
  axis: new CANNON.Vec3(0, 0, -1),
  direction: down,
})

const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial })
wheelBody3.addShape(wheelShape)
vehicle.addWheel({
  body: wheelBody3,
  position: new CANNON.Vec3(3, 0, axisWidth / 2).vadd(centerOfMassAdjust),
  axis: new CANNON.Vec3(0, 0, 1),
  direction: down,
})

const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial })
wheelBody4.addShape(wheelShape)
vehicle.addWheel({
  body: wheelBody4,
  position: new CANNON.Vec3(3, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
  axis: new CANNON.Vec3(0, 0, -1),
  direction: down,
})

vehicle.wheelBodies.forEach((wheelBody) => {
  // Some damping to not spin wheels too fast
  wheelBody.angularDamping = 0.4

  // Add visuals
})
//vehicle.chassisBody.quaternion.setFromEuler(Math.PI / 2, 0, 0)
vehicle.chassisBody.position.set(0, 5, 0)
vehicle.addToWorld(world);




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


const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.lookAt(scene.position);

var temp = new THREE.Vector3;

var goal = new THREE.Object3D;



var car: THREE.Mesh;
var collidableMeshList: THREE.Mesh[] = [];
const carbox = vehicle;
const groundMaterial = new CANNON.Material('ground')

const wheel_ground = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
  friction: 0.3,
  restitution: 0,
  contactEquationStiffness: 1000,
})
world.addContactMaterial(wheel_ground)


loadFbxObject('Models/car_1.fbx', (obj) => { console.log(obj); car = obj; car.position.y = 2; car.rotation.x = Math.PI / 2;; car.add(goal); scene.add(car); goal.position.set(3.5, 0, -2.5); }, false, "Textures/Car Texture 1.png", 0x000000);
//loadFbxObject('Models/road.fbx', (obj) => {console.log(obj); const mesh = obj.children[0]; mesh.matrix.compose(new THREE.Vector3(0, -1, 0), new THREE.Quaternion(0.7071068, 0, 0, 0.7071068), new THREE.Vector3(10, 4, 1));  mesh.matrixAutoUpdate = false; console.log(mesh); scene.add(mesh)}, false);
const tex = new THREE.TextureLoader().load(process.env.PUBLIC_URL + "/" + "Textures/board.png");
var floorMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide, reflectivity: 0.5, map: tex });
var floorGeometry = new THREE.BoxBufferGeometry(10, 10, 1, 10, 10);
var floorShape = new CANNON.Box(new CANNON.Vec3(10, 10, 1))
for (var i = 0; i < 100; i++) {
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.x = -i * 10;
  floor.position.y = -1
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  const floorBody = new CANNON.Body({ mass: 0, material: groundMaterial })
  floorBody.addShape(floorShape)
  floorBody.position.set(-i * 10, -1, 0);
  floorBody.quaternion.setFromEuler(Math.PI / 2, 0, 0)
  world.addBody(floorBody)
}


const renderer = new THREE.WebGLRenderer()
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// const controls = new OrbitControls(camera, renderer.domElement)

// controls.target.set(0, 1, 0)

// controls.enableDamping = true
// controls.enablePan = false;
// controls.enableZoom = false;


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

document.addEventListener('keydown', (event) => {
  const maxSteerVal = Math.PI / 8
  const maxSpeed = 10
  const maxForce = 100

  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      carbox.setWheelForce(maxForce, 2)
      carbox.setWheelForce(-maxForce, 3)
      break

    case 's':
    case 'ArrowDown':
      carbox.setWheelForce(-maxForce / 2, 2)
      carbox.setWheelForce(maxForce / 2, 3)
      break

    case 'a':
    case 'ArrowLeft':
      carbox.setSteeringValue(maxSteerVal, 0)
      carbox.setSteeringValue(maxSteerVal, 1)
      break

    case 'd':
    case 'ArrowRight':
      carbox.setSteeringValue(-maxSteerVal, 0)
      carbox.setSteeringValue(-maxSteerVal, 1)
      break
  }
})

// Reset force on keyup
document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      carbox.setWheelForce(0, 2)
      carbox.setWheelForce(0, 3)
      break

    case 's':
    case 'ArrowDown':
      carbox.setWheelForce(0, 2)
      carbox.setWheelForce(0, 3)
      break

    case 'a':
    case 'ArrowLeft':
      carbox.setSteeringValue(0, 0)
      carbox.setSteeringValue(0, 1)
      break

    case 'd':
    case 'ArrowRight':
      carbox.setSteeringValue(0, 0)
      carbox.setSteeringValue(0, 1)
      break
  }
})

const stats = Stats()
document.body.appendChild(stats.dom)

var time = performance.now() / 1000;

function update() {
  if (car) {

    var newtime = performance.now() / 1000;
    var delta = newtime - time;
    time = newtime;
    world.step(1 / 60, delta);

    // car.traverse(function (child) {
    //   if ((child as THREE.Mesh).isMesh) {
    //     let body = carbox.chassisBody;
    //     if (child.name == 'whell')
    //       body = carbox.wheelBodies[0];
    //     child.position.set(body.position.x, body.position.y, body.position.z)
    //     child.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
    //   }
    // });
    let body = carbox.chassisBody;
    car.position.set(body.position.x, body.position.y, body.position.z)
    car.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
    car.updateMatrix();
    // var accelFactor = delta; // 200 pixels per second
    // accel = 0;
    // if (up)
    //   accel = accelFactor;
    // if (down)
    //   accel = -accelFactor;

    // speed += accel;
    // if (Math.abs(speed) > maxspeed)
    //   speed = (Math.abs(speed) / speed) * maxspeed;
    // if (Math.abs(speed) >= 0.005) {
    //   speed *= inertie + (Math.abs(speed) / (maxspeed * (1 / (1 - inertie))));
    // } else {
    //   speed = 0;
    // }

    // speeddown = gravity * delta;
    // //console.log(speeddown);

    // // collision detection:
    // //   determines if any of the rays from the cube's origin to each vertex
    // //		intersects any face of a mesh in the array of target meshes
    // //   for increased collision accuracy, add more vertices to the cube;
    // //		for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
    // //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
    // car.traverse(function (child) {
    //   if ((child as THREE.Mesh).isMesh) {

    //     var originPoint = (child as THREE.Mesh).geometry.getAttribute('position');

    //     const localVertex = new THREE.Vector3();
    //     const globalVertex = new THREE.Vector3();
    //     for (let vertexIndex = 0; vertexIndex < originPoint.count; vertexIndex++) {
    //       localVertex.fromBufferAttribute(originPoint, vertexIndex);
    //       globalVertex.copy(localVertex).applyMatrix4(child.matrixWorld);
    //     }
    //     const directionVector = globalVertex.sub(child.position);
    //     var ray = new THREE.Raycaster(child.position, directionVector.normalize());
    //     var collisionResults = ray.intersectObjects(collidableMeshList);
    //     if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
    //       console.log(child.name)
    //       collisiontime = 100;
    //     }
    //   }
    // })
    // car.translateX(speed);
    // console.log(collisiontime);
    // if (collisiontime > 0) {
    //   speeddown = 0;
    //   collisiontime -= 1;
    // } else {
    //   car.translateZ(speeddown);
    // }
    temp.setFromMatrixPosition(goal.matrixWorld);
    camera.position.lerp(temp, 1.5);
    camera.lookAt(car.position);
  }
  // controls.update()

  stats.update()
}

function animate() {
  requestAnimationFrame(animate);

  update();



  render()


}

function render() {
  renderer.render(scene, camera)
}

animate()

function App() {
  return (
    <div
      onKeyDown={(event: React.KeyboardEvent) => {
        console.log(event)

      }}

    >
    </div>
  );
}

export default App;
