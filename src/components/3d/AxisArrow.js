import { useState } from 'react'

const AxisArrow = ({ rotZ, rotX, rotY, position, color, axis }) => {
    const size = 5;
    const [hovered, hover] = useState(false)
    return (
        <group>
            <mesh rotation={[rotZ * (Math.PI) / 2, rotX * (Math.PI) / 2, rotY * (Math.PI) / 2]}
                onPointerOver={(event) => { 
                    hover(true); 
                    return false; 
                }}
                onPointerOut={(event) => hover(false)}
                position={position}>
                <cylinderGeometry args={[0.06, 0.06, size]} />
                <meshBasicMaterial color={hovered ? 'white' : color} transparent={true} opacity={0.3} />
                <mesh
                    position={[0, -2.8, 0]}
                >
                    <cylinderGeometry args={[0.15, 0, 0.6]} />
                    <meshBasicMaterial color={hovered ? 'white' : color} transparent={true} opacity={0.3} />
                </mesh>
            </mesh>
        </group>
    );
};


export default AxisArrow; 