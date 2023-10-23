import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Line } from '@react-three/drei'
import styled from 'styled-components';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import React from 'react';
import * as math from 'mathjs';
import customFont from './mt.ttf';

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  Canvas{
    min-height: 85vh;
    
  }
  @media (max-width: 600px) {
    Canvas{
    min-height: 55vh;
    
  }
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
  max-width: 250px;
  width: 250px;
  user-select: none;
  display: flex;
  flex-direction: row;
  max-height: 84vh;
  justify-content: center;
  align-items: start;
  background-color: transparent;
  overflow: hidden;
  position: absolute;
  top: 30%;
  left: 85vw;
  transform: translate(-50%, -50%);
  z-index: 5;
  box-shadow: 0px 0px 10px rgba(255, 255, 255, 1); /* Add a subtle box shadow */
  border-radius: 10px;
  display: flex;
  background-color: rgba(255, 255, 255, 0.8); /* Set the background color for the div */  
  text-align: center;
  @media (max-width: 600px) {
    position: static;
    top: auto;
    left: auto;
    transform: none;
    width: 100vw;
    max-width: 100vw;
    border-radius: 0px;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333; 
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
      color: #777; 
    }
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

function Checkbox({ id, label, onChange, checked }) {
  return (
    <CheckboxContainer htmlFor={id}>
      <CheckboxInput onChange={onChange} type="checkbox" checked={checked}
        id={id} />
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


  @media (max-width: 600px) {
    font-size: smaller;
    div{
    width: 98vw;
   }
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



function BillboardText({ text, position, isEnabled, rotation, color }) {
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


//console.warn = function() {};

function AxisArrow({ rotZ, rotX, rotY, position, color, axis }) {
  const size = 5;
  const [hovered, hover] = useState(false)
  return (
    <group>
      <mesh rotation={[rotZ * (Math.PI) / 2, rotX * (Math.PI) / 2, rotY * (Math.PI) / 2]}
        onPointerOver={(event) => (event.stopPropagation(), hover(true))}
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
        if (i == segHalf) {


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
        if (i == segHalf) {


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

  }, [radiansTheta, radiansPhi, scene, isEnabled]);


  //text




  if (!isEnabled) {
    text = ""

  } else {


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


function LineCircle({ radiansTheta, radiansPhi, uniqueId, isZ, isEnabled }) {
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
  }, [radiansTheta, radiansPhi, scene, isEnabled]);

  return null;
}



function LineBetweenPoints({ radiansTheta, radiansPhi, uniqueId, onlyXY, onlyZ, isEnabled }) {

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
      linewidth: 10, // Adjust the linewidth as needed
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


function CameraSettings() {
  const { camera } = useThree();
  camera.position.set(6, 6, 6);
  camera.lookAt(0, 0, 0);
  return null;
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





// Função para criar a representação de um estado de qubit em termos de theta e phi
function qubitState(thetaFun, phiFun) {
  const cosThetaOver2 = math.cos(thetaFun / 2);
  const sinThetaOver2 = math.sin(thetaFun / 2);

  const realPart = cosThetaOver2;

  const imaginaryPart = math.multiply(
    math.exp(math.complex(0, phiFun)),
    sinThetaOver2
  );

  return math.matrix([realPart, imaginaryPart]);
}

function applyHadamard(qubit) {
  const hadamardMatrix = math.multiply(1 / math.sqrt(2), math.matrix([[1, 1], [1, -1]]));

  const result = math.multiply(hadamardMatrix, qubit);

  return result;
}

function applyPauliX(qubit) {
  // Matriz Pauli-X
  const pauliXMatrix = math.matrix([[0, 1], [1, 0]]);

  // Multiplicação da matriz Pauli-X pelo vetor de estado do qubit
  const result = math.multiply(pauliXMatrix, qubit);

  return result;
}


// Função para aplicar a porta Z a um estado de qubit
function applyPauliZ(qubit) {
  const pauliZMatrix = math.matrix([[1, 0], [0, -1]]);

  const result = math.multiply(pauliZMatrix, qubit);

  return result;
}

//Pauli Y é apenas uma combinação de X e Z

// Função para aplicar a porta S a um estado de qubit
function applySgate(qubit) {
  // Matriz S
  const sMatrix = math.matrix([[1, 0], [0, math.complex(0, 1)]]);

  // Multiplicação da matriz S pelo vetor de estado do qubit
  const result = math.multiply(sMatrix, qubit);

  return result;
}

function applyTgate(qubit) {
  // Matriz T
  const tMatrix = math.matrix([[1, 0], [0, math.exp(math.complex(0, Math.PI / 4))]]);

  // Multiplicação da matriz T pelo vetor de estado do qubit
  const result = math.multiply(tMatrix, qubit);

  return result;
}

function stateToAngles(qubit) {
  const theta = 2 * Math.acos(math.abs(qubit.get([0])));
  let phi = math.arg(qubit.get([1])); // Usa o argumento da parte imaginária
  // Ajusta phi para o intervalo [0, 2*pi)
  phi = phi < 0 ? 2 * Math.PI + phi : phi;
  return { theta, phi };
}




export default function App() {

  const [isButtonPressed, setIsButtonPressed] = useState(true);
  const [areOrbitControlsEnabled, setOrbitControlsEnabled] = useState(false);
  const [isGateMode, setGateMode] = useState(false);
  const [linePositionTarget, setLinePositionTarget] = useState();

  //Overlays varibalesrr
  const [anglesCircles, setAnglesCircles] = useState(false);
  const [symbols, setSymbols] = useState(true);
  //

  useEffect(() => {
    setTimeout(() => {
      setIsButtonPressed(false);
    }, 1);
    setTimeout(() => {
      setOrbitControlsEnabled(true);
    }, 4000);
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

  const randomTheta = Math.random() * 5;
  const randomPhi = Math.random() * 6;

  const [mathPINum, setMathPINum] = useState({ theta: Math.round(randomTheta), phi: Math.round(randomPhi) });
  const [displayedAngle, setDisplayedAngle] = useState({ theta: Math.round(randomTheta), phi: Math.round(randomPhi) });
  var Latex = require('react-latex');


  const handleThetaChange = (event) => {
    setMathPINum({ ...mathPINum, theta: parseFloat(event.target.value) });
    setDisplayedAngle({ ...displayedAngle, theta: parseFloat(event.target.value) })
    setGateMode(false);
    allGatesFalse();
  };

  const handlePhiChange = (event) => {
    setMathPINum({ ...mathPINum, phi: parseFloat(event.target.value) });
    setDisplayedAngle({ ...displayedAngle, phi: parseFloat(event.target.value) })
    setGateMode(false);
    allGatesFalse();
  };


  //Gates//
  const [isGateH, setIsGateH] = useState(false);
  const [isGateX, setIsGateX] = useState(false);
  const [isGateZ, setIsGateZ] = useState(false);
  const [isGateY, setIsGateY] = useState(false);
  const [isGateT, setIsGateT] = useState(false);
  const [isGateS, setIsGateS] = useState(false);
  //Gates//

  let radiansTheta = 0;
  let radiansPhi = 0;

  let realT = (mathPINum.theta * Math.PI) / 10; // theta in radians
  let realP = (mathPINum.phi * Math.PI) / 12; // phi in radians

  const theta = realT;
  const phi = realP;

  function allGatesFalse() {
    setIsGateX(false);
    setIsGateY(false);
    setIsGateZ(false);
    setIsGateH(false);
    setIsGateS(false);
    setIsGateT(false);
    return;
  }


  if (isGateMode) {

    const qubitRepresentation = qubitState(theta, phi);

    const anglesAfterHadamard = stateToAngles(applyHadamard(qubitRepresentation));
    const anglesAfterPauliX = stateToAngles(applyPauliX(qubitRepresentation));
    const anglesAfterSgate = stateToAngles(applySgate(qubitRepresentation));
    const anglesAfterPauliZ = stateToAngles(applyPauliZ(qubitRepresentation));
    const anglesAfterTgate = stateToAngles(applyTgate(qubitRepresentation));




    if (isGateH) {
      displayedAngle.theta = ((anglesAfterHadamard.theta * 10) / Math.PI).toFixed(0);
      displayedAngle.phi = ((anglesAfterHadamard.phi * 12) / Math.PI).toFixed(0);


      radiansTheta = anglesAfterHadamard.theta;
      radiansPhi = anglesAfterHadamard.phi;
    }
    else if (isGateX) {
      displayedAngle.theta = ((anglesAfterPauliX.theta * 10) / Math.PI).toFixed(0);
      displayedAngle.phi = ((realP * 12) / Math.PI).toFixed(1);

      radiansTheta = anglesAfterPauliX.theta;
      radiansPhi = realP;
    }
    else if (isGateY) {
      displayedAngle.theta = ((anglesAfterPauliX.theta * 10) / Math.PI).toFixed(0);
      displayedAngle.phi = ((anglesAfterPauliZ.phi * 12) / Math.PI).toFixed(0);

      radiansTheta = anglesAfterPauliX.theta;
      radiansPhi = anglesAfterPauliZ.phi;
    }
    else if (isGateZ) {
      displayedAngle.theta = ((anglesAfterPauliZ.theta * 10) / Math.PI).toFixed(0);
      displayedAngle.phi = ((anglesAfterPauliZ.phi * 12) / Math.PI).toFixed(0);

      radiansTheta = anglesAfterPauliZ.theta;
      radiansPhi = anglesAfterPauliZ.phi;
    }
    else if (isGateS) {
      displayedAngle.theta = ((anglesAfterSgate.theta * 10) / Math.PI).toFixed(0);
      displayedAngle.phi = ((anglesAfterSgate.phi * 12) / Math.PI).toFixed(0);

      radiansTheta = anglesAfterSgate.theta;
      radiansPhi = anglesAfterSgate.phi;
    }
    else if (isGateT) {
      displayedAngle.theta = ((anglesAfterTgate.theta * 10) / Math.PI).toFixed(0);
      displayedAngle.phi = ((anglesAfterTgate.phi * 12) / Math.PI).toFixed(0);

      radiansTheta = anglesAfterTgate.theta;
      radiansPhi = anglesAfterTgate.phi;
    }

  } else {
    displayedAngle.theta = mathPINum.theta;
    displayedAngle.phi = mathPINum.phi;
    radiansTheta = realT;
    radiansPhi = realP;
    console.log(realP)
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
    tt.set(y, z + 0.5, x);
    setLinePositionTarget(tt);
  }, [thetaSlerp, phiSlerp]);





  let waveFunction = `$$|\\psi\\rangle = \\cos\\left(\\frac{${realT.toFixed(3) == 0 ? "θ" : (realT * (180 / Math.PI)).toFixed(0) + "°"}}{2}\\right)|0\\rangle + e^{i${realP.toFixed(3) == 0 ? "φ" : (realP * (180 / Math.PI)).toFixed(0) + "°"}}\\sin\\left(\\frac{${realT.toFixed(3) == 0 ? "θ" : (realT * (180 / Math.PI)).toFixed(0) + "°"}}{2}\\right)|1\\rangle \\Rightarrow $$`;
  let waveFunction2 = `$$|\\psi\\rangle ${Math.cos((realT) / 2).toFixed(6) == 0 ? "=" : Math.cos((realT) / 2).toFixed(6) == 1 ? "=" : "\\cong"}  ${Math.cos((realT) / 2).toFixed(6) == 0 ? "" : Math.cos((realT) / 2).toFixed(6) == 1 ? "" : (Math.cos((realT) / 2)).toFixed(3)} 
  ${Math.cos((realT) / 2).toFixed(6) == 0 ? "" : "|0 \\rangle"} ${Math.cos((realT) / 2).toFixed(6) == 1 ? "" : Math.cos((realT) / 2).toFixed(6) == 0 ? "" : "+"} ${(Math.sin((realT) / 2)).toFixed(3) == 0 ? "" : (Math.sin((realT) / 2)).toFixed(3) == 1 ? "" : (Math.sin((realT) / 2)).toFixed(3)} 
  ${(Math.sin(((realT)) / 2)).toFixed(3) == 0 ? "" : "|1\\rangle"}  $$`;



  return (
    <Screen>
      <Canvas  >
        <color attach="background" args={['black']} />
        <ambientLight intensity={3} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        <BlochSphere position={[0, 0, 0]} />
        <LineBetweenPoints isEnabled={true} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"inside"} />
        <LineBetweenPoints isEnabled={symbols} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"zDashed"} onlyZ={true} />
        <LineBetweenPoints isEnabled={symbols} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"xyDashed"} onlyXY={true} />

        <BillboardText isEnabled={symbols} position={linePositionTarget} text="|ψ⟩" camera />
        <BillboardText isEnabled={true} text="|0⟩" position={[0, 6, 0]} camera />
        <BillboardText isEnabled={true} text="|1⟩" position={[0, -5.3, 0]} camera />
        <BillboardText isEnabled={true} text="|+⟩" position={[0, 0, 6]} camera />
        <BillboardText isEnabled={true} text="|-⟩" position={[0, 0, -5.3]} camera />

        <BillboardText color={"blue"} isEnabled={true} text="z" position={[0.3, 5.3, 0]} camera />
        <BillboardText color={"red"} isEnabled={true} text="x" position={[0, 0.3, 5.3]} camera />
        <BillboardText color={"green"} isEnabled={true} text="y" position={[5.3, 0.3, 0]} camera />

        <PartialCircle text="θ" isEnabled={symbols} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"thetaAngle"} isZ={true} />
        <PartialCircle text="φ" isEnabled={symbols} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"phiAngle"} />
        <LineCircle isEnabled={anglesCircles} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"circleZ"} />
        <LineCircle isEnabled={anglesCircles} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"circleX"} isZ={true} />

        {!areOrbitControlsEnabled && <CameraSettings />}
        {areOrbitControlsEnabled && <OrbitControls />}
      </Canvas>
      <Container>
        <SettingsDiv>
          <div>
            <h1>Angles</h1>
            <label>
              Polar (Theta - θ):
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={displayedAngle.theta}
                onChange={handleThetaChange}
              />
              <span>
                {displayedAngle.theta}π/10 = {(radiansTheta * (180 / Math.PI)).toFixed(0)}°
              </span>

            </label>
            <label>
              Azimutal (Phi - φ):
              <input
                type="range"
                min="0"
                max="24"
                step="0.3"
                value={displayedAngle.phi}
                onChange={handlePhiChange}
              />
              <span>
                {displayedAngle.phi}π/12 = {(radiansPhi * (180 / Math.PI)).toFixed(0)}°
              </span>
            </label>

            <h1>Gates</h1>
            <GatesDiv>
              <StyledButtonGate onClick={() => (setIsGateX(true), setGateMode(true))}>X</StyledButtonGate>
              <StyledButtonGate onClick={() => (setIsGateY(true), setGateMode(true))}>Y</StyledButtonGate>
              <StyledButtonGate onClick={() => (setIsGateZ(true), setGateMode(true))}>Z</StyledButtonGate>
              <StyledButtonGate onClick={() => (setIsGateH(true), setGateMode(true))}>H</StyledButtonGate>
              <StyledButtonGate onClick={() => (setIsGateS(true), setGateMode(true))}>S</StyledButtonGate>
              <StyledButtonGate onClick={() => (setIsGateT(true), setGateMode(true))}>T</StyledButtonGate>
            </GatesDiv>



  
            <h1>Overlays</h1>
            <span>keyboard "R" reset the camera view</span>
            <CheckDiv>
              <Checkbox checked={anglesCircles} onChange={() => (setAnglesCircles(!anglesCircles))} label="Angles Circles" />
              <Checkbox checked={symbols} onChange={() => (setSymbols(!symbols))} label="Symbols" />
            </CheckDiv>

          </div>






        </SettingsDiv>
      </Container >
      <OutBox>
        <h1>Quantum State</h1>
        <div>
          <Latex displayMode={true}>{waveFunction}</Latex>
          <Latex displayMode={true}>{waveFunction2}</Latex>

        </div>
      </OutBox>

    </Screen>

  )
}

