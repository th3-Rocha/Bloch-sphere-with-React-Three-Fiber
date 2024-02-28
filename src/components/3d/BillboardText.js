import React, { useRef} from 'react';
import * as THREE from 'three';
import customFont from '../../assets/mt.ttf';
import { useFrame } from '@react-three/fiber'
import {Text} from '@react-three/drei'

const BillboardText = ({ text, position, isEnabled, rotation, color }) => {
    const textRef = useRef();
    if (!isEnabled) {
        text = ""
    } else {
    }
    useFrame(({ camera }) => {
        // Calculate the direction vector from the camera to the text
        const lookAtVector = camera.position.clone().sub(textRef.current.position);
        // Set the text's rotation to face the camera
        textRef.current.quaternion.setFromRotationMatrix(
            new THREE.Matrix4().lookAt(lookAtVector, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0))
        );
    });
    return (
        <Text font={customFont} ref={textRef} rotation={rotation} position={position} fontSize={0.4} color={color}>
            {text}
        </Text>
    );
};

export default BillboardText;