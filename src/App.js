import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import * as math from 'mathjs';
import Stats from 'stats.js';
import Latex from 'react-latex';
import './App.css';


import CheckBox from './components/CheckBox/CheckBox';


import BillboardText from './components/3d/BillboardText';
import PartialCircle from './components/3d/PartialCircle';
import LineCircle from './components/3d/LineCircle';
import LineBetweenPoints from './components/3d/LineBetweenPoints';
import CameraSettings from './components/3d/CameraSettings';
import BlochSphere from './components/3d/BlochSphere';


const MATRICES = {
  H: math.multiply(1 / math.sqrt(2), math.matrix([[1, 1], [1, -1]])),
  X: math.matrix([[0, 1], [1, 0]]),
  Y: math.matrix([[0, math.complex(0, -1)], [math.complex(0, 1), 0]]),
  Z: math.matrix([[1, 0], [0, -1]]),
  S: math.matrix([[1, 0], [0, math.complex(0, 1)]]),
  T: math.matrix([[1, 0], [0, math.exp(math.complex(0, Math.PI / 4))]])
};

function qubitState(theta, phi) {
  const cosThetaOver2 = math.cos(theta / 2);
  const sinThetaOver2 = math.sin(theta / 2);
  const realPart = cosThetaOver2;
  const imaginaryPart = math.multiply(math.exp(math.complex(0, phi)), sinThetaOver2);
  return math.matrix([realPart, imaginaryPart]);
}

function stateToAngles(qubit) {
  const theta = 2 * Math.acos(math.abs(qubit.get([0])));
  let phi = math.arg(qubit.get([1]));
  phi = phi < 0 ? 2 * Math.PI + phi : phi;
  return { theta, phi };
}


const gcd = (a, b) => {
  return b === 0 ? a : gcd(b, a % b);
};


const formatFraction = (numerator, denominator) => {
  const num = parseFloat(numerator);
  if (Math.abs(num) < 0.01) return "0 rad";


  if (Math.abs(num % 1) > 0.01) {
    return `${num.toFixed(1)}π/${denominator}`;
  }


  const common = gcd(Math.round(num), denominator);
  const simpleNum = Math.round(num) / common;
  const simpleDen = denominator / common;

  let str = "";
  if (simpleNum === 1) str += "π";
  else str += `${simpleNum}π`;

  if (simpleDen !== 1) {
    str += `/${simpleDen}`;
  }
  return str;
};


export default function App() {
  const [orbitEnabled, setOrbitEnabled] = useState(false);
  const [activeGate, setActiveGate] = useState(null);

  const [inputAngles, setInputAngles] = useState({
    theta: Math.round(Math.random() * 5),
    phi: Math.round(Math.random() * 6)
  });

  const [overlays, setOverlays] = useState({
    circles: false,
    symbols: true,
    darkMode: true,
    dashedLines: true
  });


  const [animState, setAnimState] = useState({ theta: 0, phi: 0 });
  const [lineTarget, setLineTarget] = useState(new THREE.Vector3(0, 0, 0));


  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    const timer = setTimeout(() => setOrbitEnabled(true), 4000);

    const animateStats = () => {
      stats.begin();
      stats.end();
      requestAnimationFrame(animateStats);
    };
    const frameId = requestAnimationFrame(animateStats);

    return () => {
      document.body.removeChild(stats.dom);
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'r') {
        setOrbitEnabled(false);
        setTimeout(() => setOrbitEnabled(true), 10);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);


  const baseRadians = useMemo(() => ({
    theta: (inputAngles.theta * Math.PI) / 10,
    phi: (inputAngles.phi * Math.PI) / 12
  }), [inputAngles]);

  const targetState = useMemo(() => {
    let targetTheta = baseRadians.theta;
    let targetPhi = baseRadians.phi;


    let displayTheta = inputAngles.theta;
    let displayPhi = inputAngles.phi;

    if (activeGate && MATRICES[activeGate]) {
      const currentQubit = qubitState(baseRadians.theta, baseRadians.phi);
      const newQubit = math.multiply(MATRICES[activeGate], currentQubit);
      const newAngles = stateToAngles(newQubit);

      targetTheta = newAngles.theta;
      targetPhi = newAngles.phi;


      displayTheta = ((targetTheta * 10) / Math.PI).toFixed(1);
      displayPhi = ((targetPhi * 12) / Math.PI).toFixed(1);
    }

    return {
      radians: { theta: targetTheta, phi: targetPhi },
      display: { theta: displayTheta, phi: displayPhi }
    };
  }, [inputAngles, activeGate, baseRadians]);


  useEffect(() => {
    let requestId;
    const updateFrame = () => {
      setAnimState(prev => {
        const lerpFactor = 0.02;

        const newTheta = prev.theta + (targetState.radians.theta - prev.theta) * lerpFactor;
        const newPhi = prev.phi + (targetState.radians.phi - prev.phi) * lerpFactor;

        const radius = 5;
        const x = radius * Math.sin(newTheta) * Math.cos(newPhi);
        const y = radius * Math.sin(newTheta) * Math.sin(newPhi);
        const z = radius * Math.cos(newTheta);

        setLineTarget(new THREE.Vector3(y, z + 0.5, x));

        return { theta: newTheta, phi: newPhi };
      });
      requestId = requestAnimationFrame(updateFrame);
    };
    requestId = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(requestId);
  }, [targetState.radians]);


  const handleAngleChange = (e, type) => {
    const val = parseFloat(e.target.value);
    setInputAngles(prev => ({ ...prev, [type]: val }));
    setActiveGate(null);
  };

  const toggleOverlay = (key) => {
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }));
  };


  const rT = targetState.radians.theta;
  const rP = targetState.radians.phi;

  const fmtDeg = (rad) => (rad * (180 / Math.PI)).toFixed(0) + "°";

  const fmtPi = (rad) => {
    const piFraction = rad / Math.PI;
    if (Math.abs(piFraction) < 0.001) return "0";
    if (Math.abs(piFraction - 1) < 0.001) return "\\pi";
    return piFraction.toFixed(2) + "\\pi";
  };

  const fmtNum = (num) => {
    if (Math.abs(num) < 0.001) return "0";
    if (Math.abs(num - 1) < 0.001) return "1";
    return num.toFixed(3);
  };

  const waveFunction = `$$|\\psi\\rangle = \\cos\\left(\\frac{${fmtDeg(rT)}}{2}\\right)|0\\rangle + e^{i${fmtDeg(rP)}}\\sin\\left(\\frac{${fmtDeg(rT)}}{2}\\right)|1\\rangle$$`;

  const valCos = Math.cos(rT / 2);
  const valSin = Math.sin(rT / 2);
  const waveFunction2 = `$$|\\psi\\rangle \\cong ${fmtNum(valCos)} |0\\rangle + e^{i ${fmtPi(rP)}} ${fmtNum(valSin)} |1\\rangle $$`;

  return (
    <div className='Screen'>
      {/* CORREÇÃO DA CÂMERA AQUI: camera={{ position: [...] }} */}
      <Canvas camera={{ position: [6, 6, 6], fov: 75 }}>
        <color attach="background" args={[overlays.darkMode ? "black" : "white"]} />
        <ambientLight intensity={3} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        <BlochSphere position={[0, 0, 0]} />

        <LineBetweenPoints isEnabled={true} radiansTheta={animState.theta} radiansPhi={animState.phi} uniqueId={"inside"} />
        <LineBetweenPoints isEnabled={overlays.dashedLines} radiansTheta={animState.theta} radiansPhi={animState.phi} uniqueId={"zDashed"} onlyZ={true} />
        <LineBetweenPoints isEnabled={overlays.dashedLines} radiansTheta={animState.theta} radiansPhi={animState.phi} uniqueId={"xyDashed"} onlyXY={true} />

        <BillboardText isEnabled={overlays.symbols} position={lineTarget} text="|ψ⟩" camera />

        <BillboardText isEnabled={true} text="|0⟩" position={[0, 6, 0]} camera />
        <BillboardText isEnabled={true} text="|1⟩" position={[0, -5.3, 0]} camera />
        <BillboardText isEnabled={true} text="|+⟩" position={[0, 0, 6]} camera />
        <BillboardText isEnabled={true} text="|-⟩" position={[0, 0, -5.3]} camera />
        <BillboardText color="blue" isEnabled={true} text="z" position={[0.3, 5.3, 0]} camera />
        <BillboardText color="red" isEnabled={true} text="x" position={[0, 0.3, 5.3]} camera />
        <BillboardText color="green" isEnabled={true} text="y" position={[5.3, 0.3, 0]} camera />

        <PartialCircle text="θ" isEnabled={overlays.dashedLines} isSymbols={overlays.symbols} radiansTheta={animState.theta} radiansPhi={animState.phi} uniqueId={"thetaAngle"} isZ={true} />
        <PartialCircle text="φ" isEnabled={overlays.dashedLines} isSymbols={overlays.symbols} radiansTheta={animState.theta} radiansPhi={animState.phi} uniqueId={"phiAngle"} />

        <LineCircle isEnabled={overlays.circles} radiansTheta={animState.theta} radiansPhi={animState.phi} uniqueId={"circleZ"} />
        <LineCircle isEnabled={overlays.circles} radiansTheta={animState.theta} radiansPhi={animState.phi} uniqueId={"circleX"} isZ={true} />

        {!orbitEnabled ? <CameraSettings x={6} y={6} z={6} /> : <OrbitControls />}
      </Canvas>

      <div className='Container'>
        <div className="SettingsDiv">
          <div>
            <h1>Angles</h1>
            <label>
              Polar (Theta - θ):
              <input type="range" min="0" max="10" step="1"
                value={activeGate ? targetState.display.theta : inputAngles.theta}
                onChange={(e) => handleAngleChange(e, 'theta')}
              />
              {/* USO DO FORMATTER AQUI */}
              <span>
                {formatFraction(targetState.display.theta, 10)} = {(baseRadians.theta * (180 / Math.PI)).toFixed(0)}°
              </span>
            </label>

            <label>
              Azimutal (Phi - φ):
              <input type="range" min="0" max="24" step="1"
                value={activeGate ? targetState.display.phi : inputAngles.phi}
                onChange={(e) => handleAngleChange(e, 'phi')}
              />
              {/* USO DO FORMATTER AQUI */}
              <span>
                {formatFraction(targetState.display.phi, 12)} = {(baseRadians.phi * (180 / Math.PI)).toFixed(0)}°
              </span>
            </label>

            <h1>Gates</h1>
            <span className='GatesSpan'>
              {Object.keys(MATRICES).map((gate) => (
                <button
                  key={gate}
                  className={`StyledButtonGate ${activeGate === gate ? 'active' : ''}`}
                  onClick={() => setActiveGate(gate)}
                >
                  {gate}
                </button>
              ))}
            </span>

            <h1>Overlays</h1>
            <span className='CheckSpan'>
              <CheckBox checked={overlays.circles} onChange={() => toggleOverlay('circles')} label="Angles Circles" />
              <CheckBox checked={overlays.symbols} onChange={() => toggleOverlay('symbols')} label="Symbols" />
              <CheckBox checked={overlays.dashedLines} onChange={() => toggleOverlay('dashedLines')} label="Dashed Lines" />
              <CheckBox checked={overlays.darkMode} onChange={() => toggleOverlay('darkMode')} label="Dark Mode" />
            </span>
          </div>
        </div>
      </div>

      <div className='OutBox'>
        <h1>Quantum State</h1>
        <div>
          <Latex displayMode={true}>{waveFunction}</Latex>
          <Latex displayMode={true}>{waveFunction2}</Latex>
        </div>
      </div>
    </div>
  );
}