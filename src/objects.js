import * as THREE from 'three'


export const addRing = () => {
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
        color: 'blue',
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
