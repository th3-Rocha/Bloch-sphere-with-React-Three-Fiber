import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls,Environment,Text,Line  } from '@react-three/drei'
import styled from 'styled-components';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import React from 'react'; 
import * as math from 'mathjs';
import customFont from './mt.ttf'; 

const Screen = styled.div`
  Canvas{
    min-height: 85vh;
    
  }
`;

const GatesDiv = styled.span`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
`;
const CheckDiv = styled.span`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`;

const CheckboxInput = styled.input`
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #0075ff;
  border-radius: 3px;
  cursor: pointer;

  &:checked {
    background-color: #0075ff;
  }
`;

const CheckboxLabel = styled.span`
  font-size: 16px;
  color: #333;
`;

function Checkbox({ id, label,onChange }) {
  return (
    <CheckboxContainer htmlFor={id}>
      <CheckboxInput onChange={onChange}  type="checkbox" id={id} />
      <CheckboxLabel>{label}</CheckboxLabel>
    </CheckboxContainer>
  );
}
const SettingsDiv = styled.div`
 display: flex;
 flex-direction: column;
 gap: 1rem;
 div{
  display: flex;
  flex-direction: column;

 }
`;

const StyledButtonGate = styled.button`
  background: linear-gradient(to bottom, #0075ff, #0075ff);  
  border: none;
  border-radius: 6px;
  padding: 10px 10px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0px 2px 2px rgba(0,0,0,0.2);

  &:hover {
    background: #4282d3;
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0px 1px 1px rgba(0,0,0,0.1);
  }
`;

const OutBox = styled.div`
  
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  background-color: #000;
  color: #e5e5e5;
  overflow: hidden;
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

  user-select: none;
  display: flex;
  flex-direction: row;
  max-height: 84vh;
  justify-content: start;
  align-items: start;
  background-color: transparent;
  overflow: hidden;
  position: absolute;
  top: 30%;
  left: 88%;
  transform: translate(-50%, -50%);
  z-index: 5;
  box-shadow: 0px 0px 10px rgba(255, 255, 255, 1); /* Add a subtle box shadow */
  border-radius: 10px;

  div {
    width: 20vw;
    display: flex;
    background-color: rgba(255, 255, 255, 0.6); /* Set the background color for the div */
   
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
        cursor: pointer;
      }

      span {
        font-size: 0.8rem;
        color: #777; /* Set the span text color */
      }
    }
  }
`;


function BillboardText({ text, position, isEnabled }){
  const textRef = useRef();
  
  if(!isEnabled){
    text=""

  }else{


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
    <Text  font= {customFont}  ref={textRef} position={position} fontSize={0.4} color="white">
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
          <Text 
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

function PartialCircle({ radiansTheta, radiansPhi, uniqueId, isEnabled, isZ, text }) {
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
    const segHalf = Math.floor(segments/2);
    const points = [];
    const startTheta = 0; // Starting angle for the partial circle
    const endTheta = radiansTheta; // Ending angle for the partial circle

    const startPhi = 0; // Starting angle for the partial circle
    const endPhi = radiansPhi; // Ending angle for the partial circle

    function approximatelyEqual(a, b, tolerance = 0.01) {
      return Math.abs(a - b) < tolerance;
    }
    if(isZ){
      for (let i = 0; i <= segments; i++) {
        let radius = 5 + -4 * Math.sin(radiansTheta);
        radius = radiansTheta <= Math.PI / 2 ? 5 - 4 * Math.sin(radiansTheta) : 1;
        
        const theta = startTheta + (i / segments) * (endTheta - startTheta);
        const x = radius * Math.sin(theta) * Math.cos(radiansPhi);
        const y = radius * Math.sin(theta) * Math.sin(radiansPhi);
        const z = radius * Math.cos(theta);
        points.push(new THREE.Vector3(y, z, x));
        if(i == segHalf){
          
          
          if(approximatelyEqual(radiansTheta,0)){
            billBoardPostion.set(8880,z + 8888.2 ,x + 8880.2);
          }else{
            billBoardPostion.set(y,z + 0.2 ,x + 0.2);
          }

          textRef.current.position.copy(billBoardPostion);
        }
      }

    }else{
      //phioiiii
      for (let i = 0; i <= segments; i++) {
        let radius = 5 + -4 * Math.sin(radiansTheta);
        radius =  4 * Math.sin(radiansTheta);
        
        const phi = startPhi + (i / segments) * (endPhi - startPhi);
        const x = radius * Math.sin(phi) ;
        const y = radius * Math.sin(phi) ;
        const z = radius * Math.cos(phi);
        points.push(new THREE.Vector3(y, 0, z));
        if(i == segHalf){
          
          
          if(approximatelyEqual(radiansPhi,0)){
            billBoardPostion.set(8880,z + 8888.2 ,x + 8880.2);
          }else{
            billBoardPostion.set(y + 0.1,0,z + 0.1);
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

  }, [radiansTheta, radiansPhi, scene, isEnabled]);


  //text


  
  
  if(!isEnabled){
    text=""

  }else{


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
    
  console.log(billBoardPostion)
  return (
    <Text  font= {customFont}  ref={textRef} position={[1,1,1]}  fontSize={0.4} color="white">
      {text}
    </Text>
  ); 
}

//circle show off
function LineCircle({ radiansTheta, radiansPhi, uniqueId, isZ, isEnabled}) {
  const { scene } = useThree();

  useEffect(() => {
    // Cleanup previous line
    const existingLine = scene.getObjectByName(`Circle_${uniqueId}`);
    if (existingLine) {
      scene.remove(existingLine);
    }

    // Create a CatmullRom curve between two points
    const radius = 5; // Adjust the radius as needed
    const points = [];
    const segments = 80; // Adjust the number of segments for a smoother curve
    if (isZ) {
      for (let i = 0; i <= segments; i++) {
        const phi = (i / segments) * Math.PI * 2;
        const x = radius * Math.cos(radiansPhi + phi);
        const y = radius * Math.sin(radiansPhi + phi);
        points.push(new THREE.Vector3(0, x, y));
      }
    }else{
      for (let i = 0; i <= segments; i++) {
        const phi = (i / segments) * Math.PI * 2;
        const x = radius * Math.sin(radiansTheta) * Math.cos(radiansPhi + phi);
        const y = radius * Math.sin(radiansTheta) * Math.sin(radiansPhi + phi);
        const z = radius * Math.cos(radiansTheta);
        points.push(new THREE.Vector3(x, z, y));
      }
    }
      
    
   

    const curve = new THREE.CatmullRomCurve3(points);

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x808080
    });

    const circle = new THREE.Line(lineGeometry, lineMaterial);
    circle.name = `Circle_${uniqueId}`;
    if (isZ) {
      // Rotate the line around its own Z-axis
      circle.rotation.y = radiansPhi;
    }
    
    
    //circle.computeLineDistances();
    if(isEnabled){
      scene.add(circle);
    }else{
      
    }
    
    
  }, [radiansTheta, radiansPhi,scene]);

  return (
    <group>
      
    </group>
  );
}



function LineBetweenPoints({ radiansTheta, radiansPhi, uniqueId, onlyXY, onlyZ,isEnabled }) {
  const pointZero = useRef();
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
      scene.remove(existingLine);
    }

    // Calculate the new position for the line based on Theta and Phi angles
    const radius = 5; // Adjust the radius as needed
    const x = radius * Math.sin(radiansTheta) * Math.cos(radiansPhi);
    const y = radius * Math.sin(radiansTheta) * Math.sin(radiansPhi);
    const z = radius * Math.cos(radiansTheta);


    
    linePositionTarget.set( y, onlyXY ? 0 : z, x);
    if(onlyZ){
      linePositionZero.set(y, 0,  x);

    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      linePositionZero || new THREE.Vector3(),
      linePositionTarget,
    ]);

    let lineMaterial = new THREE.LineDashedMaterial({
      color: 0xFFFF00,
      linewidth: 10, // Adjust the linewidth as needed
      dashSize: 1,
      gapSize: 0,
    });

    if(onlyXY || onlyZ){
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
  if(isEnabled){
    scene.add(line);
  }else{

  }

  }, [scene,linePositionTarget]);

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
      
        {(onlyXY || onlyZ) ? undefined : (<mesh><meshStandardMaterial color={0xffff00} /><sphereGeometry  args={[0.05, 16, 16]} /></mesh>) }
        
      </mesh>
      
    </group>
  );
}


function CameraSettings() {
  const { camera } = useThree();
  camera.position.set(8, 8, 8); 
  camera.lookAt(0,0,0);
  return (
      <group>

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
  
  const [isButtonPressed, setIsButtonPressed] = useState(true);
  const [areOrbitControlsEnabled, setOrbitControlsEnabled] = useState(false);
  const [isGateMode, setGateMode] = useState(false);
  const [linePositionTarget, setLinePositionTarget] = useState();
 
  //Overlays varibales
  const [anglesCircles, setAnglesCircles] = useState(false);
  const [symbols, setSymbols] = useState(false);
  //

  useEffect(() => {
    setTimeout(() => {
      setIsButtonPressed(false);
    }, 1);
    setTimeout(() => {
      setOrbitControlsEnabled(true);
    }, 1000);
  }, []);

  const handleKeyPress = (event) => {
    if (event.key === 'r') {
      setIsButtonPressed((prevState) => !prevState);
      setOrbitControlsEnabled(false);
      setTimeout(() => {
        setOrbitControlsEnabled(true);
      }, 10);
    }
  };

 

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
  
  const [mathPINum, setMathPINum] = useState({ theta: 0, phi: 0 });

  var Latex = require('react-latex');


  const handleThetaChange = (event) => {
    setMathPINum({ ...mathPINum, theta: parseFloat(event.target.value) });
    setGateMode(false);
  };

  const handlePhiChange = (event) => {
    setMathPINum({ ...mathPINum, phi: parseFloat(event.target.value) });
    setGateMode(false);
  };

  
  //Gates//
  const [isGateH, setIsGateH] = useState(false);
  //Gates//

let radiansTheta = 0;
let radiansPhi = 0;

let realT = (mathPINum.theta * Math.PI) / 10; // theta in radians
let realP = (mathPINum.phi * Math.PI) / 12; // phi in radians

const theta = realT; 
const phi = realP;

const stateVector = [
  Math.cos(theta/2),
  math.complex(0, Math.sin(theta/2) * phi)
];

if (isGateMode) {
  if (isGateH) {
    radiansTheta = 0;
    radiansPhi = 0;
  }
} else {
  radiansTheta = realT;
  radiansPhi = realP;
}
 
 
 

  const [thetaSlerp, setThetaSlerp] = useState(0);
  const [phiSlerp, setPhiSlerp] = useState(0);

  useEffect(() => {
   
    
    const interval = setInterval(() => {
      setThetaSlerp(prev => prev + (radiansTheta - prev) * 0.02);  
      setPhiSlerp(prev => prev + (radiansPhi - prev) * 0.02);
   
    }, 5);

    return () => clearInterval(interval);
  }, [radiansTheta, radiansPhi]);

  useEffect(() => {
    const radius = 5; 
    let x = radius * Math.sin(thetaSlerp) * Math.cos(phiSlerp);
    let y = radius * Math.sin(thetaSlerp) * Math.sin(phiSlerp);
    let z = radius * Math.cos(thetaSlerp);
    let tt = new THREE.Vector3();
    tt.set(y,z + 0.5,x);
    setLinePositionTarget(tt);
  }, [thetaSlerp, phiSlerp]);
  




  let waveFunction = `$$|\\psi\\rangle = \\cos\\left(\\frac{${ realT.toFixed(3) == 0 ? "θ" : (realT*(180/Math.PI)).toFixed(0) +"°"}}{2}\\right)|0\\rangle + e^{i${ realP.toFixed(3) == 0 ? "φ" : (realP*(180/Math.PI)).toFixed(0) +"°" }}\\sin\\left(\\frac{${realT.toFixed(3) == 0 ? "θ" : (realT*(180/Math.PI)).toFixed(0) + "°" }}{2}\\right)|1\\rangle \\Rightarrow $$`;
  let waveFunction2 = `$$|\\psi\\rangle ${ Math.cos((realT)/2).toFixed(6) == 0 ? "=" : Math.cos((realT)/2).toFixed(6) == 1 ? "=" : "\\cong"}  ${ Math.cos((realT)/2).toFixed(6) == 0 ? "" : Math.cos((realT)/2).toFixed(6) == 1 ? "" : (Math.cos((realT)/2)).toFixed(3)   } 
  ${Math.cos((realT)/2).toFixed(6) == 0 ? "" : "|0 \\rangle"} ${Math.cos((realT)/2).toFixed(6) == 1 ? "" : Math.cos((realT)/2).toFixed(6) == 0 ? "" : "+"} ${(Math.sin((realT)/2)).toFixed(3) == 0 ? "" :(Math.sin((realT)/2)).toFixed(3) == 1 ? "" : (Math.sin((realT)/2)).toFixed(3)} 
  ${(Math.sin(((realT))/2)).toFixed(3) == 0 ? "" : "|1\\rangle"}  $$`;



  return (
    <Screen>
        <Canvas  >
          <Environment preset="night" background blur={0.6} />
          <ambientLight intensity={3  } />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          
          <BlochSphere position={[0, 0, 0]} />
          <LineBetweenPoints isEnabled = {true}  radiansTheta = {thetaSlerp} radiansPhi = {phiSlerp} uniqueId={"inside"} />
          <LineBetweenPoints isEnabled = {symbols} radiansTheta = {thetaSlerp} radiansPhi = {phiSlerp} uniqueId={"zDashed"} onlyZ={true} />
          <LineBetweenPoints isEnabled = {symbols} radiansTheta = {thetaSlerp} radiansPhi = {phiSlerp} uniqueId={"xyDashed"} onlyXY={true} />
          
          <BillboardText isEnabled={symbols} position={linePositionTarget} text="|ψ⟩" camera /> 
          {/*billbords overlays*/}
          <BillboardText isEnabled={true} text="|0⟩" position={[0, 6, 0]} camera />
          <BillboardText isEnabled={true} text="|1⟩" position={[0, -5.3, 0]} camera />
          <LineCircle isEnabled={anglesCircles} radiansTheta = {thetaSlerp} radiansPhi = {phiSlerp}  uniqueId={"circleZ"}/>
          <LineCircle isEnabled={anglesCircles} radiansTheta = {thetaSlerp} radiansPhi = {phiSlerp}  uniqueId={"circleX"} isZ = {true}/>)
          <PartialCircle text="θ" isEnabled={symbols} radiansTheta = {thetaSlerp} radiansPhi = {phiSlerp}  uniqueId={"thetaAngle"} isZ = {true}/>)
          <PartialCircle text="φ" isEnabled={symbols} radiansTheta = {thetaSlerp} radiansPhi = {phiSlerp}  uniqueId={"phiAngle"} />)
          {!areOrbitControlsEnabled && <CameraSettings/>}
          {areOrbitControlsEnabled && <OrbitControls />}
        </Canvas>
        <Container>
        <SettingsDiv>
        <div>
          <h1>Overlays</h1>
          <CheckDiv>
            <Checkbox onChange = {() => (setAnglesCircles(!anglesCircles))}  label="Angles Circles" />
            <Checkbox onChange = {() => (setSymbols(!symbols))} label="Symbols" />
          </CheckDiv>
          

          <h1>Angles</h1>
            <label>
              Polar (Theta - θ):
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={mathPINum.theta}
                onChange={handleThetaChange}
              />
              <span>
              {mathPINum.theta}π/10 = {(realT*(180/Math.PI)).toFixed(0) }°
              </span>
              
            </label>
            <label>
              Azimutal (Phi - φ):
              <input
                type="range"
                min="0"
                max="24"
                step="0.3" 
                value={mathPINum.phi}
                onChange={handlePhiChange}
              />
              <span>
              {mathPINum.phi}π/12 = {(realP*(180/Math.PI)).toFixed(0) }°
              </span>
            </label>

            <h1>Gates</h1>
            <GatesDiv>
              <StyledButtonGate
            
              >X</StyledButtonGate>
              <StyledButtonGate>Y</StyledButtonGate>
              <StyledButtonGate>Z</StyledButtonGate>
              <StyledButtonGate
              onClick={() => (setIsGateH(true),setGateMode(true))}>H</StyledButtonGate>
              <StyledButtonGate>S</StyledButtonGate>
              <StyledButtonGate>T</StyledButtonGate>
            </GatesDiv>

          </div>






        </SettingsDiv>
   </Container >
      <OutBox>
      <h1>Quantum State</h1>
        <div>
          <Latex displayMode={true}>{waveFunction }</Latex>
          <Latex displayMode={true}>{waveFunction2}</Latex>
          
        </div>
      </OutBox>
      
    </Screen>
  
  )
}

