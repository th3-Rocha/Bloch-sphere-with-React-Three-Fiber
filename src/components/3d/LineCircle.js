import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react'

const LineCircle = ({ radiansTheta, radiansPhi, uniqueId, isZ, isEnabled }) => {
    const { scene } = useThree();
    useEffect(() => {
        // Cleanup previous line
        const existingLine = scene.getObjectByName(`Circle_${uniqueId}`);
        if (existingLine) {
            scene.remove(existingLine);
        }
        // Parameters
        const radius = 5;
        const segments = 50;
        const points = [];
        // Generate points for the circle
        for (let i = 0; i <= segments; i++) {
            const phi = (i / segments) * Math.PI * 2;
            const cosPhi = Math.cos(radiansPhi + phi);
            const sinPhi = Math.sin(radiansPhi + phi);

            let x, y, z;
            if (isZ) {
                x = 0;
                y = radius * cosPhi;
                z = radius * sinPhi;
            } else {
                x = radius * Math.sin(radiansTheta) * cosPhi;
                y = radius * Math.sin(radiansTheta) * sinPhi;
                z = radius * Math.cos(radiansTheta);
            }

            points.push(new THREE.Vector3(x, z, y));
        }
        // Create curve and line
        const curve = new THREE.CatmullRomCurve3(points);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments));
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x808080 });
        const circle = new THREE.Line(lineGeometry, lineMaterial);
        circle.name = `Circle_${uniqueId}`;

        // Apply rotation
        if (isZ) {
            circle.rotation.y = radiansPhi;
        }

        // Add to scene if enabled
        if (isEnabled) {
            scene.add(circle);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [radiansTheta, radiansPhi, scene, isEnabled]);
    return null;
}
export default LineCircle;