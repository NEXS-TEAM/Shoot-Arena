import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import { getPlayerSpawn, getRandomSpawn } from "../utils/Spawnconfig";
import * as THREE from "three";

export const CharacterController = ({ 
  player,
  userPlayer,
  playerIndex = 0,
  onKilled,
  onFire,
  ...props 
}) => {
  const rigidbody = useRef();
  const character = useRef();
  const group = useRef();
  
  const [health, setHealth] = useState(100);
  const [isDead, setIsDead] = useState(false);
  const [lastSpawnIndex, setLastSpawnIndex] = useState(-1);
  const [initialized, setInitialized] = useState(false);
  const [, getKeys] = useKeyboardControls();
  
  const playerState = player?.state || player;

  // INITIAL SPAWN - Only once
  useEffect(() => {
    if (!rigidbody.current || initialized) return;

    console.log(`🚀 INITIALIZING PLAYER ${playerIndex}`);
    
    const spawn = getPlayerSpawn(playerIndex);
    setLastSpawnIndex(spawn.index);
    setInitialized(true);

    rigidbody.current.setTranslation({
      x: spawn.position[0],
      y: spawn.position[1],
      z: spawn.position[2]
    });

    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), spawn.rotation);
    rigidbody.current.setRotation(quaternion);
    
    rigidbody.current.setLinvel({ x: 0, y: 0, z: 0 });
    rigidbody.current.setAngvel({ x: 0, y: 0, z: 0 });

    console.log(`✅ Player ${playerIndex} spawned at:`, spawn.position);
  }, [rigidbody.current, playerIndex]);

  // RESPAWN
  const respawn = () => {
    if (!rigidbody.current) return;

    console.log(`🔄 RESPAWNING PLAYER ${playerIndex}...`);

    const spawn = getRandomSpawn(lastSpawnIndex);
    setLastSpawnIndex(spawn.index);

    rigidbody.current.setTranslation({
      x: spawn.position[0],
      y: spawn.position[1],
      z: spawn.position[2]
    });

    rigidbody.current.setLinvel({ x: 0, y: 0, z: 0 });
    rigidbody.current.setAngvel({ x: 0, y: 0, z: 0 });

    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), spawn.rotation);
    rigidbody.current.setRotation(quaternion);

    const newHealth = isDead ? 100 : Math.min(health + 25, 100);
    setHealth(newHealth);
    setIsDead(false);

    console.log(`✅ Respawned with ${newHealth} HP`);
  };

  // DEATH HANDLER
  useEffect(() => {
    if (health <= 0 && !isDead) {
      setIsDead(true);
      console.log(`💀 Player ${playerIndex} died!`);

      if (onKilled) {
        onKilled();
      }

      setTimeout(() => {
        respawn();
      }, 3000);
    }
  }, [health, isDead]);

  // FRAME UPDATE
  useFrame((state, delta) => {
    if (!rigidbody.current || !initialized) return;
    if (!userPlayer) return;

    const keys = getKeys();

    // Manual respawn with R key
    if (keys.respawn && !isDead) {
      console.log(`🔑 Manual respawn triggered`);
      respawn();
      return;
    }

    // Your existing movement code can go here
  });

  // TAKE DAMAGE
  const takeDamage = (amount) => {
    if (isDead) return;
    
    const newHealth = Math.max(0, health - amount);
    setHealth(newHealth);
    console.log(`💥 Took ${amount} damage! HP: ${newHealth}/100`);
  };

  useEffect(() => {
    if (character.current) {
      character.current.takeDamage = takeDamage;
    }
  }, [isDead, health]);

  return (
    <RigidBody
      ref={rigidbody}
      colliders="ball"
      mass={1}
      type="dynamic"
      enabledRotations={[false, true, false]}
      linearDamping={0.5}
      angularDamping={0.5}
      {...props}
    >
      <group ref={group}>
        <group ref={character}>
          <mesh castShadow position={[0, 0, 0]}>
            <capsuleGeometry args={[0.3, 0.7]} />
            <meshStandardMaterial 
              color={isDead ? "#ff0000" : (playerState?.profile?.color?.hex || "#00ff00")} 
            />
          </mesh>

          {/* Health bar */}
          <group position={[0, 1.2, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1, 0.1, 0.02]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
            <mesh position={[-(1 - health/100) * 0.5, 0, 0.01]}>
              <boxGeometry args={[health/100, 0.1, 0.02]} />
              <meshBasicMaterial color="#00ff00" />
            </mesh>
          </group>

          {/* Player name */}
          {playerState?.profile?.name && (
            <sprite position={[0, 1.6, 0]} scale={[2, 0.5, 1]}>
              <spriteMaterial color="white" transparent opacity={0.9} />
            </sprite>
          )}
        </group>
      </group>
    </RigidBody>
  );
};
