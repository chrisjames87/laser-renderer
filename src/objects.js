import * as THREE from 'three'

export const addParticle = () => {
    // Define the line geometry and material
    let particleGeometry = new THREE.BufferGeometry();
    let vertices = new Float32Array([
        0, 0, 0,  // Start point
        0.1, 0, 0   // End point
    ]);
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    let material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 5 });

    // Create the line and add it to the scene
    let particle = new THREE.Line(particleGeometry, material);

    particle.position.y += 2.8

    // Generate a random number between -2.8 and 2.8
    const min = -2.8;
    const max = 2.8;

    const randomNumber = Math.random() * (max - min) + min;

    particle.position.x -= randomNumber
    return particle

}


export const addChristmasTree = (colour = 'green') => {
    // Create a Christmas tree (cone)
    const treeGeometry = new THREE.ConeGeometry(1, 2, 3);
    const treeMaterial = new THREE.MeshBasicMaterial({ 
        color: colour,
        wireframe: true,
        depthTest: false, 
    });
    return new THREE.Mesh(treeGeometry, treeMaterial);
}


export const addCube = (colour = 'red') => {

    // Create a wireframe cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
    color: 'red',
    wireframe: true,
    });
    return new THREE.Mesh(geometry, material);
}


export const addRing = (colour = 'red') => {
    const vertices = [];
    const divisions = 20;

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
        color: colour,
        linewidth: 1,
    } );

    return new THREE.Line( geometry, material );

}

export const addCalibrationPoint = () => {
    const vertices = [];
    const divisions = 2;

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
        linewidth: 2, // Important, this needs to be set to 2 or the calibration point won't be detected
    } );

    return new THREE.Line( geometry, material );

};
