import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls,Environment,Text,Line  } from '@react-three/drei'
import styled from 'styled-components';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import React from 'react'; 
import robotoJson from './Roboto_Regular.json';

const OutBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  background-color: #000;
  color: #e5e5e5;
  overflow: hidden;
  height: 16vh;
  
  h1{
    margin: 0;
  }
  div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100vw;
    gap: 1rem;
    font-size: smaller;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  max-height: 84vh;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0; /* Set your desired background color */
  overflow: hidden;

  Canvas {
    min-height: 99vh;
  }

  div {
    width: 20vw;
    background-color: #fff; /* Set the background color for the div */
    border-radius: 8px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2); /* Add a subtle box shadow */
    text-align: center;

    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #333; /* Set the title color */
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      input[type="range"] {
        width: 100%;
      }

      span {
        font-size: 0.8rem;
        color: #777; /* Set the span text color */
      }
    }
  }
`;


function BillboardText({ text, position }){
  const textRef = useRef();

  useFrame(({ camera }) => {
    // Calculate the direction vector from the camera to the text
    const lookAtVector = camera.position.clone().sub(textRef.current.position);

    // Set the text's rotation to face the camera
    textRef.current.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().lookAt(lookAtVector, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0))
    );
  });

  return (
    <Text  font={robotoJson} ref={textRef} position={position} fontSize={0.4} color="white">
      {text}
    </Text>
  );
};




function AxisArrow({ rotZ,rotX,rotY,position, color,axis }) {
  const size = 5;
  const [hovered, hover] = useState(false)
  return (
    <group>
      <mesh rotation={[rotZ*(Math.PI) / 2, rotX*(Math.PI)/ 2, rotY*(Math.PI)/ 2]} 
        onPointerOver={(event) => (event.stopPropagation(), hover(true))}
        onPointerOut={(event) => hover(false)}
        position={position}>
        <cylinderGeometry args={[0.06, 0.06, size]} />
        
        <meshBasicMaterial color={hovered ? 'white' : color } transparent = {true} opacity={0.3} />
        <mesh
          position={[0,-2.8,0]}
        >
          <cylinderGeometry args={[0.15,0,0.6]} />
          <meshBasicMaterial color={hovered ? 'white' : color } transparent = {true} opacity={0.3}  />
        </mesh>
          <Text font={robotoJson}
            anchorX="center"
            anchorY="middle"
            fontSize = "0.4"
            position={[0,-3,0.3]}
            rotation={[1*rotZ*(Math.PI) / 2, 2*(Math.PI)/ 2, 2*(Math.PI)/ 2]}
            >
              <meshBasicMaterial color={hovered ? 'white' : color } side={THREE.DoubleSide} />
            {axis}
          </Text>
      </mesh>
     
     </group>
   
  )
}


function LineBetweenPoints({ Theta, Phi }) {
  const point1 = useRef();
  const point2 = useRef();
  let realTheta = (Theta * Math.PI) / 10;
  let realPhi = (Phi * Math.PI) / 12;
  const { scene } = useThree();

  // Declare linePosition here so it's accessible in the entire component
  const linePosition = new THREE.Vector3();

  // Create a ref for the sphere
  const sphereRef = useRef();

  useEffect(() => {
    // Cleanup previous line
    const existingLine = scene.getObjectByName('line');
    if (existingLine) {
      scene.remove(existingLine);
    }

    // Calculate the new position for the line based on Theta and Phi angles
    const radius = 5; // Adjust the radius as needed
    const x = radius * Math.sin(realTheta) * Math.cos(realPhi);
    const y = radius * Math.sin(realTheta) * Math.sin(realPhi);
    const z = radius * Math.cos(realTheta);

    linePosition.set(y, z, x);

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      point1.current?.position || new THREE.Vector3(),
      linePosition,
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFF00 });
    const line = new THREE.Line(lineGeometry, lineMaterial);

    // Set a name for the line object for easy removal later
    line.name = 'line';
  // Update the position of the sphere
  if (point2.current) {
    point2.current.position.copy(linePosition);
  }
    scene.add(line);
  }, [Theta, Phi, scene, point1, linePosition]);

  // Use useFrame to continuously update the sphere's position
  useFrame(() => {
    if (sphereRef.current) {
      // Update the sphere's position to match the line's end position
      sphereRef.current.position.copy(linePosition);
    }
  });

  return (
    <group>
      <mesh position={linePosition} ref={point2}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <BillboardText text="|Ѱ>" position={linePosition} camera />
        <meshBasicMaterial color="yellow" />
      </mesh>
    </group>
  );
}




function BlochSphere(props) {
  const ref = useRef();
  return (
    <group>
     <mesh
        {...props}
        ref={ref}>
        <sphereGeometry attach="geometry" args={[5, 28, 20]} />
          <meshBasicMaterial 
            attach="material"
            color="grey"
            wireframe
            transparent = {true}
            opacity={0.2} 
          />
      </mesh>
      <AxisArrow axis="z" color = "blue" rotZ={2} rotX={1} rotY={0} position={[0, 2.5, 0]} />
      <AxisArrow axis="x" color = "red" rotZ={3} rotX={0} rotY={0} position={[0, 0, 2.5]} />
      <AxisArrow axis="y" color = "green" rotZ={3} rotX={0} rotY={1} position={[2.5, 0, 0]} />
      
      
    </group>
   
  )
}



export default function App() {

  const [polarAngles, setPolarAngles] = useState({ theta: 0, phi: 0 });

  var Latex = require('react-latex');


  const handleThetaChange = (event) => {
    setPolarAngles({ ...polarAngles, theta: parseFloat(event.target.value) });
  };

  const handlePhiChange = (event) => {
    setPolarAngles({ ...polarAngles, phi: parseFloat(event.target.value) });
  };

  let realT = ((polarAngles.theta * Math.PI) / 10)
  let realP = ((polarAngles.phi * Math.PI) / 12)



  let waveFunction = `$$|\\psi\\rangle = \\cos\\left(\\frac{${ realT.toFixed(3) == 0 ? "θ" : realT.toFixed(3) }}{2}\\right)|0\\rangle + e^{i${ realP.toFixed(3) == 0 ? "φ" : realP.toFixed(3) }}\\sin\\left(\\frac{${realT.toFixed(3) == 0 ? "θ" : realT.toFixed(3) }}{2}\\right)|1\\rangle \\Rightarrow $$`;
  let waveFunction2 = `$$|\\psi\\rangle ${ Math.cos((realT)/2).toFixed(6) == 0 ? "=" : Math.cos((realT)/2).toFixed(6) == 1 ? "=" : "\\cong"}  ${ Math.cos((realT)/2).toFixed(6) == 0 ? "" : Math.cos((realT)/2).toFixed(6) == 1 ? "" : (Math.cos((realT)/2)).toFixed(3)   } 
  ${Math.cos((realT)/2).toFixed(6) == 0 ? "" : "|0 \\rangle"} ${Math.cos((realT)/2).toFixed(6) == 1 ? "" : Math.cos((realT)/2).toFixed(6) == 0 ? "" : "+"} ${(Math.sin((realT)/2)).toFixed(3) == 0 ? "" :(Math.sin((realT)/2)).toFixed(3) == 1 ? "" : (Math.sin((realT)/2)).toFixed(3)} 
  ${(Math.sin(((realT))/2)).toFixed(3) == 0 ? "" : "|1\\rangle"}  $$`;

  return (
    <div>
      <Container>
    <Canvas>
      <Environment preset="night" background blur={0.6} />
      <ambientLight intensity={3  } />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      
      <BlochSphere position={[0, 0, 0]} />
      <LineBetweenPoints Theta = {polarAngles.theta} Phi = {polarAngles.phi} />
      
      {/*billbords overlays*/}
      <BillboardText text="|0>" position={[0, 6, 0]} camera />
      <BillboardText text="|1>" position={[0, -5.3, 0]} camera />

      <OrbitControls />
    </Canvas>
      
    <div>
    <h1>Angles</h1>
      <label>
        Polar (Theta - θ):
        <input
          type="range"
          min="0"
          max="10"
          step="1" // Adjust the step value as needed
          value={polarAngles.theta}
          onChange={handleThetaChange}
        />
        <span>
        {polarAngles.theta}π/10 = {realT}
        </span>
        
      </label>
      <label>
        Azimutal (Phi - φ):
        <input
          type="range"
          min="0"
          max="24"
          step="1" // Adjust the step value as needed
          value={polarAngles.phi}
          onChange={handlePhiChange}
        />
        <span>
        {polarAngles.phi}π/12 = {realP}
        </span>
         
      </label>
    </div>
   </Container>
      <OutBox>
      <h1>Quantum State</h1>
        <div>
          <Latex displayMode={true}>{waveFunction }</Latex>
          <Latex displayMode={true}>{waveFunction2}</Latex>
          
        </div>
      </OutBox>
    </div>
  
  )
}

