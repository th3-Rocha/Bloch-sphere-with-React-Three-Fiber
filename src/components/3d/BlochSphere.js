import { useRef } from 'react'
import AxisArrow from './AxisArrow';

const BlochSphere = (props) => {
    const ref = useRef();
    return (
        <group>
            <mesh
                {...props}
                ref={ref}>
                <sphereGeometry attach="geometry" args={[5, 18, 18]} />
                <meshBasicMaterial
                    attach="material"
                    color="grey"
                    wireframe
                    transparent={true}
                    opacity={0.2}
                />
            </mesh>
            <AxisArrow axis="z" color="blue" rotZ={2} rotX={1} rotY={0} position={[0, 2.5, 0]} />
            <AxisArrow axis="x" color="red" rotZ={3} rotX={0} rotY={0} position={[0, 0, 2.5]} />
            <AxisArrow axis="y" color="green" rotZ={3} rotX={0} rotY={1} position={[2.5, 0, 0]} />
        </group>
    )
}

export default BlochSphere;