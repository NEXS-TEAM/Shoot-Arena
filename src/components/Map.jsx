import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect } from "react";

export const Map = () => {
  const map = useGLTF("models/map1.glb");  // ← Your map filename here

  useEffect(() => {
    map.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });

  return (
    <group>
      <RigidBody colliders="trimesh" type="fixed">
        <primitive object={map.scene} />
      </RigidBody>

      {/* Random spawn points - elevated to avoid blocking */}
      <group name="spawn_0" position={[8, 3, 8]} />
      <group name="spawn_1" position={[-8, 3, -8]} />
      <group name="spawn_2" position={[8, 3, -8]} />
      <group name="spawn_3" position={[-8, 3, 8]} />
      <group name="spawn_4" position={[0, 3, 12]} />
      <group name="spawn_5" position={[0, 3, -12]} />
      <group name="spawn_6" position={[12, 3, 0]} />
      <group name="spawn_7" position={[-12, 3, 0]} />
    </group>
  );
};

useGLTF.preload("models/custom-map.glb");  // ← Same filename here