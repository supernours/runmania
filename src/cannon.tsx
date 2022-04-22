import * as CANNON from 'cannon-es';

export function initCar(wheelMaterial: CANNON.Material) {
    const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
    const chassisBody = new CANNON.Body({ mass: 5 })
    const centerOfMassAdjust = new CANNON.Vec3(0, -1, 0)
    chassisBody.addShape(chassisShape, centerOfMassAdjust)

    // Create the vehicle
    const vehicle = new CANNON.RigidVehicle({
        chassisBody,
    })

    const mass = 1
    const axisWidth = 7
    const wheelShape = new CANNON.Sphere(1.5)
    const down = new CANNON.Vec3(0, -1, 0)

    const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial })
    wheelBody1.addShape(wheelShape)
    vehicle.addWheel({
        body: wheelBody1,
        position: new CANNON.Vec3(-5, 0, axisWidth / 2).vadd(centerOfMassAdjust),
        axis: new CANNON.Vec3(0, 0, 1),
        direction: down,
    })

    const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial })
    wheelBody2.addShape(wheelShape)
    vehicle.addWheel({
        body: wheelBody2,
        position: new CANNON.Vec3(-5, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
        axis: new CANNON.Vec3(0, 0, -1),
        direction: down,
    })

    const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial })
    wheelBody3.addShape(wheelShape)
    vehicle.addWheel({
        body: wheelBody3,
        position: new CANNON.Vec3(5, 0, axisWidth / 2).vadd(centerOfMassAdjust),
        axis: new CANNON.Vec3(0, 0, 1),
        direction: down,
    })

    const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial })
    wheelBody4.addShape(wheelShape)
    vehicle.addWheel({
        body: wheelBody4,
        position: new CANNON.Vec3(5, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
        axis: new CANNON.Vec3(0, 0, -1),
        direction: down,
    })

    vehicle.wheelBodies.forEach((wheelBody) => {
        // Some damping to not spin wheels too fast
        wheelBody.angularDamping = 0.4

        // Add visuals
    })
    vehicle.chassisBody.quaternion.setFromEuler(Math.PI / 2, 0, 0)
    return vehicle;
}

export function initCannon() {
    let world = new CANNON.World()
    world.gravity.set(0, -30, 0)

    // Sweep and prune broadphase
    world.broadphase = new CANNON.SAPBroadphase(world)

    // Adjust the global friction
    world.defaultContactMaterial.friction = 0.2

    return world
}