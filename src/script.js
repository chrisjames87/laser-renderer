import './style.css'
import * as THREE from 'three'
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer';

import * as dat from 'lil-gui'

import ReconnectingWebSocket from 'reconnecting-websocket';

const parse = require('parse-svg-path');


const helpers = require("./helpers");


THREE.ColorManagement.enabled = false;

let camera, scene, renderer, rws, line, calibration;

const ENABLED_WEBSOCKETS = true;
const LASER_WC_URL = 'ws://localhost:8321';


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
    width: 1080,
    height: 1080
}

init();
animate();

function addRing() {
    const vertices = [];
    const divisions = 10;

    for ( let i = 0; i <= divisions; i ++ ) {

        const v = ( i / divisions ) * ( Math.PI * 2 );

        const x = Math.sin( v );
        const z = Math.cos( v );

        vertices.push( x, 0, z );

    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    //

    const material = new THREE.LineBasicMaterial( {
        color: 'red',
        linewidth: 1,
    } );

    return new THREE.Line( geometry, material );

}

function addCalibrationPoint() {
    const vertices = [];
    const divisions = 1;

    for ( let i = 0; i <= divisions; i ++ ) {

        const v = ( i / divisions ) * ( Math.PI * 2 );

        const x = Math.sin( v );
        const z = Math.cos( v );

        vertices.push( x, 0, z );

    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    //

    const material = new THREE.LineBasicMaterial( {
        color: 'white',
        linewidth: 1,
    } );

    return new THREE.Line( geometry, material );

}

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {        // 'W'
        line.position.y -= 0.5
    } else if (keyCode == 83) { // 'S'
        line.position.y += 0.5;
    } else if (keyCode == 65) { // 'A'
        line.position.x -= 0.5; 
    } else if (keyCode == 68) { // 'D'  
        line.position.x += 0.5;  
    }
};
document.addEventListener("keydown", onDocumentKeyDown, false);

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

    // RING
    line = addRing();
    line.scale.setScalar( 0.5 );
    scene.add( line );
    
    // CALIBRATION
    calibration = addCalibrationPoint();
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

function animate() {

    let count = 0;
    const time = performance.now() / 1000;

    scene.traverse( function ( child ) {

        // child.rotation.x = count + ( time / 3 );
        // child.rotation.z = count + ( time / 4 );

        count ++;

    } );

    renderer.render( scene, camera );
    requestAnimationFrame( animate );

}


// Function to send a message to the WebSocket server
const sendSvgToLaser = () => {
    if (renderer.domElement.getElementsByTagName('path').length > 0) {

        const svg = Array.from(document.body.getElementsByTagName('svg'))[0];
        const svgCopy = svg.cloneNode(true);

        // Update viewBox, height, and width attributes
        svgCopy.setAttribute('viewBox', '0 0 1080 1080'); // Example viewBox value
        svgCopy.setAttribute('height', '1080'); // Example height value
        svgCopy.setAttribute('width', '1080'); // Example width value
      

        // Use filter to remove unwanted paths


        const calibrationPaths = [...svgCopy.getElementsByTagName('path')].filter(path => {return path.getAttribute('style').includes('stroke-width:0') });

        const filteredPaths = [...svgCopy.getElementsByTagName('path')].filter(path => {return path.getAttribute('style').includes('stroke-width:1') });

  

        const paths = [...filteredPaths].map(path => 
            helpers.recalibrate(parse(path.getAttribute('d')))
        )


        const recalibrated_points = [...paths].map(x => helpers.recalibrate(x));
        const new_paths = [...recalibrated_points].map(y => helpers.pointsToSvgPath(helpers.addOffsetToPoints(y, 2, 2)));

        while (svgCopy.firstChild) {
            svgCopy.removeChild(svgCopy.lastChild);
        }


        console.log(new_paths);

        [...new_paths].map(item => {
            let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path') //Create a path in SVG's namespace
            newElement.setAttribute("d",item); //Set path's data
            newElement.style.stroke = "red"; //Set stroke colour
            newElement.style.strokeWidth = "1"; //Set stroke width
            svgCopy.appendChild(newElement);
            }
        );

        console.log(svgCopy);
      
        const messageObject = { position: 'SVG', file: svgCopy.outerHTML };
        const messageString = JSON.stringify(messageObject);
        // console.log(messageString);
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