import './style.css'
import * as THREE from 'three'
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer';

import * as dat from 'lil-gui'

/**
 * Debug
 */
const gui = new dat.GUI()

const debugObject = {}

// save SVG
debugObject.createSVG = () => {

    console.log("Make an SVG")

    // const rendererSVG = new SVGRenderer();
  
    // rendererSVG.setSize(sizes.width, sizes.height)
    // rendererSVG.setViewport(0, -1080, sizes.width, sizes.height);
    // rendererSVG.render(scene, camera);
    // console.log("Made an SVG");
    // console.log(rendererSVG.domElement);

    // console.log(rendererSVG.domElement.getElementsByTagName('path'));
    // sendMessage()
};


gui.add(debugObject, 'createSVG');



THREE.ColorManagement.enabled = false;

let camera, scene, renderer;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 33, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.z = 10;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0, 0, 0 );

    renderer = new SVGRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    const vertices = [];
    const divisions = 50;

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
    const line = new THREE.Line( geometry, material );
    line.scale.setScalar( 2 );
    scene.add( line );

    //

    window.addEventListener( 'resize', onWindowResize );

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

        child.rotation.x = count + ( time / 3 );
        child.rotation.z = count + ( time / 4 );

        count ++;

    } );

    renderer.render( scene, camera );
    requestAnimationFrame( animate );

}
