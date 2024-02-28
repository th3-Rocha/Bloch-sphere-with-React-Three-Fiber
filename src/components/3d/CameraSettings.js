import { useThree } from '@react-three/fiber';
const CameraSettings = ({ x, y, z }) => {
    const { camera } = useThree();
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0); // the center of the sphere
    return null;
}

export default CameraSettings;