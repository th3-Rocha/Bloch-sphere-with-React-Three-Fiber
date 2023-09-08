import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls,Environment,Text  } from '@react-three/drei'



const size = 10;
function Box(props) {
  const ref = useRef()
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.x += delta))
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => (event.stopPropagation(), hover(true))}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}


function AxisArrow({ rotZ,rotX,rotY,position, color,axis }) {
  const size = 6;
  let arrowPos = position;
  //arrowPos += [0,0,0];
  const [hovered, hover] = useState(false)
  return (
    <group>
      <mesh rotation={[rotZ*(Math.PI) / 2, rotX*(Math.PI)/ 2, rotY*(Math.PI)/ 2]} 
        onPointerOver={(event) => (event.stopPropagation(), hover(true))}
        onPointerOut={(event) => hover(false)}
        position={position}>
        <cylinderGeometry args={[0.06, 0.06, size]} />
        <meshBasicMaterial color={hovered ? 'white' : color} />
        <mesh
          position={[0,-3,0]}
        >
          <cylinderGeometry args={[0.2,0,1]} />
          <meshBasicMaterial color={hovered ? 'white' : color} />
        </mesh>
          <Text font="/font.json"
            anchorX="center"
            anchorY="middle"
            fontSize = "0.4"
            position={[0,-3,0.3]}
            rotation={[1*rotZ*(Math.PI) / 2, 2*(Math.PI)/ 2, 2*(Math.PI)/ 2]}
            >
              <meshBasicMaterial color={hovered ? 'white' : color} />
            {axis}
          </Text>
      </mesh>
     
     </group>
   
  )
}

function AxisArrowControlled(props) {
  const ref = useRef();
  return (
    
    <mesh
    {...props}
    ref={ref}>
    <line>
      <bufferGeometry>
        <line vertices={[
          [100, 100, 100], 
          [1000, 1000, 1000]
        ]} />
      </bufferGeometry>
      <lineBasicMaterial color="red" />
    </line>
  </mesh>
  )
}

function BlochSphere(props) {
  const ref = useRef();
  return (
    <group>
     <mesh
        {...props}
        ref={ref}>
        <sphereGeometry attach="geometry" args={[5, 32, 16]} />
          <meshBasicMaterial 
            attach="material"
            color="grey"
            wireframe
          />
      </mesh>
      <AxisArrow axis="Z" color = "blue" rotZ={2} rotX={1} rotY={0} position={[0, 3, 0]} />
      <AxisArrow axis="X" color = "red" rotZ={3} rotX={0} rotY={0} position={[0, 0, 3]} />
      <AxisArrow axis="Y" color = "green" rotZ={3} rotX={0} rotY={1} position={[3, 0, 0]} />
      <AxisArrowControlled  position={[0, 0, 0]} />
    </group>
   
  )
}



export default function App() {
  return (
    <Canvas>
      <Environment preset="night" background blur={0.6} />
      <ambientLight intensity={3  } />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <BlochSphere position={[0, 0, 0]} />

      <OrbitControls />
    </Canvas>
  )
}
