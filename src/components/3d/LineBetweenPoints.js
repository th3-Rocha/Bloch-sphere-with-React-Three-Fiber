import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

const LineBetweenPoints = ({ radiansTheta, radiansPhi, uniqueId, onlyXY, onlyZ, isEnabled }) => {
    const pointTarget = useRef();
    const { scene } = useThree();
    let linePositionTarget = new THREE.Vector3();
    let linePositionZero = new THREE.Vector3();
    // Create a ref for the sphere
    const sphereRef = useRef();
    useEffect(() => {
        // Cleanup previous line
        const existingLine = scene.getObjectByName(`line_${uniqueId}`);
        if (existingLine) {
            existingLine.material.dispose();
            existingLine.geometry.dispose();
            scene.remove(existingLine);
        }
        // Calculate the new position for the line based on Theta and Phi angles
        const radius = 5; // Adjust the radius as needed
        const x = radius * Math.sin(radiansTheta) * Math.cos(radiansPhi);
        const y = radius * Math.sin(radiansTheta) * Math.sin(radiansPhi);
        const z = radius * Math.cos(radiansTheta);
        linePositionTarget.set(y, onlyXY ? 0 : z, x);
        if (onlyZ) {
            linePositionZero.set(y, 0, x);

        }
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            linePositionZero || new THREE.Vector3(),
            linePositionTarget,
        ]);
        let lineMaterial = new THREE.LineDashedMaterial({
            color: 0xFFFF00,
            linewidth: 1, // Adjust the linewidth as needed
            dashSize: 1,
            gapSize: 0,
        });
        if (onlyXY || onlyZ) {
            const dashSize = 0.15; // Adjust the dash size as needed
            const gapSize = 0.25; // Adjust the gap size as needed
            lineMaterial = new THREE.LineDashedMaterial({
                color: 0x808080,
                dashSize: dashSize,
                gapSize: gapSize,
                transparent: true, // Enable transparency
                opacity: 0.7, // Set opacity (0.0 to 1.0)
            });
        }
        const line = new THREE.Line(lineGeometry, lineMaterial);

        // Set a name for the line object for easy removal later
        line.name = `line_${uniqueId}`;
        line.computeLineDistances();
        // Update the position of the sphere
        if (pointTarget.current) {
            pointTarget.current.position.copy(linePositionTarget);
        }
        if (isEnabled) {
            scene.add(line);
        } else {

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scene, linePositionTarget]);

    // Use useFrame to continuously update the sphere's position
    useFrame(() => {
        if (sphereRef.current) {
            // Update the sphere's position to match the line's end position
            sphereRef.current.position.copy(linePositionTarget);
        }
    });
    return (
        <group>
            <mesh position={linePositionTarget} ref={pointTarget}>
                {(onlyXY || onlyZ) ? undefined : (<mesh><meshStandardMaterial color={0xffff00} /><sphereGeometry args={[0.05, 16, 16]} /></mesh>)}
            </mesh>
        </group>
    );
}

export default LineBetweenPoints;