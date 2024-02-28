import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import React from 'react';
import customFont from '../../assets/mt.ttf';

const PartialCircle = ({ isSymbols, radiansTheta, radiansPhi, uniqueId, isEnabled, isZ, text }) => {
    const { scene } = useThree();
    let textRef = useRef();
    let billBoardPostion = new THREE.Vector3();
    useEffect(() => {
        // Cleanup previous line
        const existingLine = scene.getObjectByName(`PartialCircle_${uniqueId}`);
        if (existingLine) {
            scene.remove(existingLine);
        }
        const segments = 80; // Adjust the number of segments for a smoother curve
        const segHalf = Math.floor(segments / 2);
        const points = [];
        const startTheta = 0; // Starting angle for the partial circle
        const endTheta = radiansTheta; // Ending angle for the partial circle
        const startPhi = 0; // Starting angle for the partial circle
        const endPhi = radiansPhi; // Ending angle for the partial circle
        function approximatelyEqual(a, b, tolerance = 0.01) {
            return Math.abs(a - b) < tolerance;
        }
        if (isZ) {
            for (let i = 0; i <= segments; i++) {
                let radius = 5 + -4 * Math.sin(radiansTheta);
                radius = radiansTheta <= Math.PI / 2 ? 5 - 4 * Math.sin(radiansTheta) : 1;
                const theta = startTheta + (i / segments) * (endTheta - startTheta);
                const x = radius * Math.sin(theta) * Math.cos(radiansPhi);
                const y = radius * Math.sin(theta) * Math.sin(radiansPhi);
                const z = radius * Math.cos(theta);
                points.push(new THREE.Vector3(y, z, x));
                if (i === segHalf) {
                    if (approximatelyEqual(radiansTheta, 0)) {
                        billBoardPostion.set(8880, z + 8888.2, x + 8880.2);
                    } else {
                        billBoardPostion.set(y, z + 0.2, x + 0.2);
                    }
                    textRef.current.position.copy(billBoardPostion);
                }
            }
        } else {
            //phioiiii
            for (let i = 0; i <= segments; i++) {
                let radius = 5 + -4 * Math.sin(radiansTheta);
                radius = 4 * Math.sin(radiansTheta);
                const phi = startPhi + (i / segments) * (endPhi - startPhi);
                const x = radius * Math.sin(phi);
                const y = radius * Math.sin(phi);
                const z = radius * Math.cos(phi);
                points.push(new THREE.Vector3(y, 0, z));
                if (i === segHalf) {
                    if (approximatelyEqual(radiansPhi, 0)) {
                        billBoardPostion.set(8880, z + 8888.2, x + 8880.2);
                    } else {
                        billBoardPostion.set(y + 0.1, 0, z + 0.1);
                    }
                    textRef.current.position.copy(billBoardPostion);
                }
            }
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments));
        const dashSize = 0.15; // Adjust the dash size as needed
        const gapSize = 0.25; // Adjust the gap size as needed
        const lineMaterial = new THREE.LineDashedMaterial({
            color: 0x808080,
            dashSize: dashSize,
            gapSize: gapSize,
        });
        const circle = new THREE.Line(lineGeometry, lineMaterial);
        circle.name = `PartialCircle_${uniqueId}`;
        circle.computeLineDistances();
        if (isEnabled) {
            scene.add(circle);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [radiansTheta, radiansPhi, scene, isEnabled]);
    //text
    if (!isSymbols || !isEnabled) {
        text = ""
    }
    //textRef.current.position.copy(billBoardPostion);
    useFrame(({ camera }) => {
        // Calculate the direction vector from the camera to the text
        const lookAtVector = camera.position.clone().sub(textRef.current.position);
        // Set the text's rotation to face the camera
        textRef.current.quaternion.setFromRotationMatrix(
            new THREE.Matrix4().lookAt(lookAtVector, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0))
        );
    });
    return (
        <Text font={customFont} ref={textRef} position={[1, 1, 1]} fontSize={0.4} color="white">
            {text}
        </Text>
    );
}

export default PartialCircle;