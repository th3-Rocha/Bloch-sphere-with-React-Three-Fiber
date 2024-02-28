import { useState, useEffect } from 'react'
import { Canvas} from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three';
import React from 'react';
import * as math from 'mathjs';
import Stats from 'stats.js'
import './App.css';

//components
import CheckBox from './components/CheckBox/CheckBox';

//components_3D
import BillboardText from './components/3d/BillboardText';
import PartialCircle from './components/3d/PartialCircle';
import LineCircle from './components/3d/LineCircle';
import LineBetweenPoints from './components/3d/LineBetweenPoints';
import CameraSettings from './components/3d/CameraSettings';
import BlochSphere from './components/3d/BlochSphere';

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




const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
export default function App() {
  stats.begin()
  const [areOrbitControlsEnabled, setOrbitControlsEnabled] = useState(false);
  const [isGateMode, setGateMode] = useState(false);
  const [linePositionTarget, setLinePositionTarget] = useState();

  //Overlays varibales
  const [anglesCircles, setAnglesCircles] = useState(false);
  const [symbols, setSymbols] = useState(true);
  const [darkMode, setDarkmode] = useState(true);
  const [dashedLines, setDashedLines] = useState(true);
  //
  let colorAmbient;
  if (darkMode) {
    colorAmbient = "black";
  } else {
    colorAmbient = "white";

  }

  useEffect(() => {
    setTimeout(() => {
    }, 1);
    setTimeout(() => {
      setOrbitControlsEnabled(true);
    }, 4000);
  }, []);

  const handleKeyPress = (event) => {
    if (event.key === 'r') {
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
  }

  const [thetaSlerp, setThetaSlerp] = useState(0);
  const [phiSlerp, setPhiSlerp] = useState(0);

  useEffect(() => {
    const radius = 5;
    let x = radius * Math.sin(thetaSlerp) * Math.cos(phiSlerp);
    let y = radius * Math.sin(thetaSlerp) * Math.sin(phiSlerp);
    let z = radius * Math.cos(thetaSlerp);
    let tt = new THREE.Vector3();
    tt.set(y, z + 0.5, x);
    setLinePositionTarget(tt);
  }, [thetaSlerp, phiSlerp]);

  useEffect(() => {
    let requestId;

    const updateFrame = () => {
      setThetaSlerp(prev => prev + (radiansTheta - prev) * 0.02);
      setPhiSlerp(prev => prev + (radiansPhi - prev) * 0.02);

      // Request the next frame
      requestId = requestAnimationFrame(updateFrame);
    };

    // Start the animation loop
    requestId = requestAnimationFrame(updateFrame);

    // Cleanup: Stop the animation loop when the component unmounts
    return () => cancelAnimationFrame(requestId);
  },);







  let waveFunction = `$$|\\psi\\rangle = \\cos\\left(\\frac{${realT.toFixed(3) === 0 ? "θ" : (realT * (180 / Math.PI)).toFixed(0) + "°"}}{2}\\right)|0\\rangle + e^{i${realP.toFixed(3) === 0 ? "φ" : (realP * (180 / Math.PI)).toFixed(0) + "°"}}\\sin\\left(\\frac{${realT.toFixed(3) === 0 ? "θ" : (realT * (180 / Math.PI)).toFixed(0) + "°"}}{2}\\right)|1\\rangle \\Rightarrow $$`;
  let waveFunction2 = `$$|\\psi\\rangle ${Math.cos((realT) / 2).toFixed(6) === 0 ? "=" : Math.cos((realT) / 2).toFixed(6) === 1 ? "=" : "\\cong"}  ${Math.cos((realT) / 2).toFixed(6) === 0 ? "" : Math.cos((realT) / 2).toFixed(6) === 1 ? "" : (Math.cos((realT) / 2)).toFixed(3)} 
  ${Math.cos((realT) / 2).toFixed(6) === 0 ? "" : "|0 \\rangle"} ${Math.cos((realT) / 2).toFixed(6) === 1 ? "" : Math.cos((realT) / 2).toFixed(6) === 0 ? "" : "+"} ${(Math.sin((realT) / 2)).toFixed(3) === 0 ? "" : (Math.sin((realT) / 2)).toFixed(3) === 1 ? "" : (Math.sin((realT) / 2)).toFixed(3)} 
  ${(Math.sin(((realT)) / 2)).toFixed(3) === 0 ? "" : "|1\\rangle"}  $$`;

  const gatesData = [
    { gate: 'X', setter: setIsGateX },
    { gate: 'Y', setter: setIsGateY },
    { gate: 'Z', setter: setIsGateZ },
    { gate: 'H', setter: setIsGateH },
    { gate: 'S', setter: setIsGateS },
    { gate: 'T', setter: setIsGateT },
  ];
  stats.end()
  return (
    <div className='Screen'>
      <Canvas  >
        <color attach="background" args={[colorAmbient]} />
        <ambientLight intensity={3} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        <BlochSphere position={[0, 0, 0]} />
        <LineBetweenPoints isEnabled={true} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"inside"} />

        <LineBetweenPoints isEnabled={dashedLines} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"zDashed"} onlyZ={true} />
        <LineBetweenPoints isEnabled={dashedLines} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"xyDashed"} onlyXY={true} />

        <BillboardText isEnabled={symbols} position={linePositionTarget} text="|ψ⟩" camera />

        <BillboardText isEnabled={true} text="|0⟩" position={[0, 6, 0]} camera />
        <BillboardText isEnabled={true} text="|1⟩" position={[0, -5.3, 0]} camera />
        <BillboardText isEnabled={true} text="|+⟩" position={[0, 0, 6]} camera />
        <BillboardText isEnabled={true} text="|-⟩" position={[0, 0, -5.3]} camera />

        <BillboardText color={"blue"} isEnabled={true} text="z" position={[0.3, 5.3, 0]} camera />
        <BillboardText color={"red"} isEnabled={true} text="x" position={[0, 0.3, 5.3]} camera />
        <BillboardText color={"green"} isEnabled={true} text="y" position={[5.3, 0.3, 0]} camera />

        <PartialCircle text="θ" isEnabled={dashedLines} isSymbols={symbols} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"thetaAngle"} isZ={true} />
        <PartialCircle text="φ" isEnabled={dashedLines} isSymbols={symbols} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"phiAngle"} />

        <LineCircle isEnabled={anglesCircles} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"circleZ"} />
        <LineCircle isEnabled={anglesCircles} radiansTheta={thetaSlerp} radiansPhi={phiSlerp} uniqueId={"circleX"} isZ={true} />

        {!areOrbitControlsEnabled && <CameraSettings x={6} y={6} z={6} />}
        {areOrbitControlsEnabled && <OrbitControls />}
      </Canvas>
      <div className='Container'>
        <div className="SettingsDiv">
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

            <span className='GatesSpan'>
              {gatesData.map(({ gate, setter }) => (
                <button className='StyledButtonGate'
                  key={gate}
                  onClick={() => {
                    allGatesFalse();
                    setter(true);
                    setGateMode(true);
                  }}
                >
                  {gate}
                </button>
              ))}
            </span>
            <h1>Overlays</h1>
            <span className='CheckSpan'>
              <CheckBox checked={anglesCircles} onChange={() => (setAnglesCircles(!anglesCircles))} label="Angles Circles" />
              <CheckBox checked={symbols} onChange={() => (setSymbols(!symbols))} label="Symbols" />
              <CheckBox checked={dashedLines} onChange={() => (setDashedLines(!dashedLines))} label="Dashed Lines" />
              <CheckBox checked={darkMode} onChange={() => (setDarkmode(!darkMode))} label="Dark Mode" />
            </span>
          </div>
        </div>
      </div >
      <div className='OutBox'>
        <h1>Quantum State</h1>
        <div>
          <Latex displayMode={true}>{waveFunction}</Latex>
          <Latex displayMode={true}>{waveFunction2}</Latex>

        </div>
      </div>

    </div>

  )
}

