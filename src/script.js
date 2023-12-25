import './style.css'
import * as THREE from 'three'
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer';
import CANNON from 'cannon'

import * as dat from 'lil-gui'

import ReconnectingWebSocket from 'reconnecting-websocket';



const parse = require('parse-svg-path');


const helpers = require("./helpers");
const objects = require("./objects");


THREE.ColorManagement.enabled = false;

let camera, scene, renderer, rws, calibration;

// Objects in scene
let ring1, ring2, cube1, tree1, tree2, tree3;
let treeGroup = new THREE.Group();


let particleGroup = [];
let particleTimer;



// Control 
let ROTATE = false;
let SPIN = true;
let SNOW = false;
let DOUBLE = false;

const ENABLED_WEBSOCKETS = true;
const LASER_WC_URL = 'ws://localhost:8321';

/**
 * Utils
 */

const objectsToUpdate = []


/**
 * GUI
 */
const gui = new dat.GUI()
const buttons = {}

// save SVG
buttons.createSVG = () => {

    console.log("Make an SVG")
    // console.log(renderer.domElement);
    sendSvgToLaser()
};


gui.add(buttons, 'createSVG');

const sizes = {
    width: 1180,
    height: 1180
}


/**
 * Physics
 */
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, - 9.82, 0)

// Material
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// Create box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
})
const createBox = (width, height, depth, position) =>
{
    // Three.js mesh
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial,
        // collisionFilterGroup: 0,
        // collisionFilterMask: 0
    })
    body.position.copy(position)
    // body.addEventListener('collide', playHitSound)
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ mesh, body })
}

buttons.createBox = () =>
{
    createBox(
        0.5,
        0.5,
        0.5,
        {
            x: 0, // left to right
            y: 3,
            z: 0, // depth (not really needed)
        }
    )
}
gui.add(buttons, 'createBox')


// Add Star
const addStar = () => {

    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 'red', side: THREE.DoubleSide} );
    return new THREE.Mesh( geometry, material );
}


buttons.createStar = () =>
{
    addStar()
}
gui.add(buttons, 'createStar')


init();
// animate();

function dropParticle() {
    let particle = objects.addParticle()
    particleGroup.push(particle);
    scene.add(particle);
  }

function onDocumentKeyDown(event) {
    console.log('Key Down:', event.key);
    if (event.key === 's' ) {
        SPIN = !SPIN;
    } else if (event.key === 'r') {
        ROTATE = !ROTATE;
    } else if (event.key === '1') { 
        tree1.scale.setScalar( 1.1 );
    } else if (event.key === '2') { 
        tree2.scale.setScalar( 1.3 );
    } else if (event.key === '3') { 
        tree3.scale.setScalar( 1.5 );
    } else if (event.key === 'o') { 
        DOUBLE = !DOUBLE;
    } else if (event.key === 'p') {
        SNOW = !SNOW;
        if (SNOW) {
            dropParticle()
            const interval = DOUBLE ? 217.39 : 434.78;
            particleTimer = setInterval(dropParticle, interval);
        } else {
            clearInterval(particleTimer);
        }
    }

};
document.addEventListener("keydown", onDocumentKeyDown, false);

// Define the function to be executed when a key is released
function onDocumentKeyUp(event) {
// Access the released key using event.key
    console.log('Key released:', event.key);
    tree1.scale.setScalar( 0.8 );
    tree2.scale.setScalar( 1 );
    tree3.scale.setScalar( 1.2 );
}

document.addEventListener('keyup', onDocumentKeyUp);

function init() {
    // define a reconnecting WebSocket
    if (ENABLED_WEBSOCKETS) {
        const rws_options = {
            maxEnqueuedMessages: 0
        };
        rws = new ReconnectingWebSocket(LASER_WC_URL, [], rws_options);
    }

    camera = new THREE.PerspectiveCamera( 33, sizes.width / sizes.height, 0.1, 100 );
    camera.position.z = 10;
    // camera.position.x = -2; // left to right
    // camera.position.y = 2; // up to down

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0, 0, 0 );

    renderer = new SVGRenderer();

    renderer.setSize( sizes.width, sizes.height );
    document.body.appendChild( renderer.domElement );

    // RING 1
    ring1 = objects.addRing('red');
    ring1.scale.setScalar( 0.5 );
    // scene.add( ring1 );

    // RING 2
    ring2 = objects.addRing('red');
    ring2.scale.setScalar( 3.8 );
    // scene.add( ring2 );


    // CUBE 1 

    cube1 = objects.addCube('red');
    cube1.rotation.z = Math.PI / 4; 
    cube1.scale.setScalar( 4 );
    // scene.add( cube1 );


    // Christmas Tree

    tree1 = objects.addChristmasTree();
    tree1.scale.setScalar( 0.8 );
    tree1.position.y += 1
    scene.add( tree1 );


    tree2 = objects.addChristmasTree();
    tree2.scale.setScalar( 1 );
    tree2.position.y -= 0
    scene.add( tree2 );

    tree3 = objects.addChristmasTree();
    tree3.scale.setScalar( 1.2 );
    tree3.position.y -= 0.8


    scene.add( treeGroup );

    treeGroup.add(tree1);
    treeGroup.add(tree2);
    treeGroup.add(tree3);

    treeGroup.rotation.x += 0.3
    
    // CALIBRATION
    calibration = objects.addCalibrationPoint();
    calibration.scale.setScalar( 0.05 );
    calibration.position.x = -2.9;
    calibration.position.y = 2.9;

    scene.add( calibration );

    // window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

let speed = 0.03;

const tick = () =>
{

    // update physics world

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update physics
    world.step(1 / 60, deltaTime, 3)


    for(const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }

    // Rotate the rings
    ring1.rotation.x += 0.01;
    ring1.rotation.z += 0.01;

    ring2.rotation.x += 0.01;
    ring2.rotation.y -= 0.01;

    cube1.rotation.x += 0.02;
    cube1.rotation.y -= 0.02;


    if (ROTATE) {
        treeGroup.rotation.x += 0.02
        treeGroup.rotation.y += 0.02
    } else {
        treeGroup.rotation.x += 0
        treeGroup.rotation.y += 0
    }


    if (SPIN) {
        treeGroup.rotation.y += 0.025
    } else {
        treeGroup.rotation.y += 0
    }



    // Loop through the array and edit the specified property
    particleGroup.forEach(particle => {
        particle.position.y -= speed;
        // Check if the particle is out of view
        if (particle.position.x < -2.8) {
            // Remove particle from the scene
            scene.remove(particle);
        }
    });



    // Update controls  
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


// Function to send a message to the WebSocket server
const sendSvgToLaser = () => {
    if (renderer.domElement.getElementsByTagName('path').length > 0) {

        const svg = Array.from(document.body.getElementsByTagName('svg'))[0];
        const svgCopy = svg.cloneNode(true);

        // Update viewBox, height, and width attributes
        svgCopy.setAttribute('viewBox', '0 0 1080 1080'); // Example viewBox value
        svgCopy.setAttribute('height', '1080'); // Example height value
        svgCopy.setAttribute('width', '1080'); // Example width value
      
        const unfilterPaths = [...svgCopy.getElementsByTagName('path')]

 
        // remove the calibration point from the paths array
        let calPoint = null;
        let otherPaths = [];

        for (const path of unfilterPaths) { 
            if (path.style.strokeWidth === '2') {
                calPoint = path;
            } else {
                otherPaths.push(path);
            }

        }

        // calculate the calibartion points min x y so the other paths can be ajusted
        let [minX, minY] = helpers.findMinParsedPath(parse(calPoint.getAttribute('d')));

        const pathsParsed = [...otherPaths].map(path => 
            parse(path.getAttribute('d'))
        )

        const allPaths = helpers.recalibrateAllPaths(pathsParsed, minX, minY);

        const new_paths = [...allPaths].map(y => helpers.pointsToSvgPath(helpers.addOffsetToPoints(y, 450, 450)));

        while (svgCopy.firstChild) {
            svgCopy.removeChild(svgCopy.lastChild);
        }

        [...new_paths].map(item => {
            let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path') //Create a path in SVG's namespace
            newElement.setAttribute("d",item); //Set path's data
            newElement.style.stroke = "red"; //Set stroke colour
            newElement.style.strokeWidth = "1"; //Set stroke width
            svgCopy.appendChild(newElement);
            }
        );

        
        const messageObject = { position: 'SVG', file: svgCopy.outerHTML };
        const messageString = JSON.stringify(messageObject);

        if (ENABLED_WEBSOCKETS) {
            rws.send(messageString);
        }
    } else {
        // String is empty
        console.log("SVG is empty");
    }
};


if (ENABLED_WEBSOCKETS) {
    setInterval(sendSvgToLaser, 50);
}