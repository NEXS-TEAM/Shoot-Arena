import { Billboard, CameraControls, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, vec3 } from "@react-three/rapier";
import { isHost } from "playroomkit";
import { useEffect, useRef, useState } from "react";
import { CharacterSoldier } from "./CharacterSoldier.jsx";
const MOVEMENT_SPEED = 202;
const FIRE_RATE = 380;
export const WEAPON_OFFSET = {
  x: -0.2,
  y: 1.4,
  z: 0.8,
};

export const CharacterController = ({
  state,
  joystick,
  userPlayer,
  onKilled,
  onFire,
  downgradedPerformance,
  weapon: selectedWeapon,
  ...props
}) => {
  const group = useRef();
  const character = useRef();
  const rigidbody = useRef();
  const [animation, setAnimation] = useState("Idle");
  const [weapon, setWeapon] = useState(selectedWeapon || "AK");
  const lastShoot = useRef(0);

  // Update weapon when selection changes
  useEffect(() => {
    if (selectedWeapon) {
      setWeapon(selectedWeapon);
    }
  }, [selectedWeapon]);

  // Keyboard controls state
  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    q: false, // Rotate camera left
    e: false, // Rotate camera right
    space: false, // Shoot key (Space)
    shoot: false, // Shoot (mouse click)
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false,
  });

  // Camera/look direction (mouse controls this)
  const lookAngle = useRef(0); // Horizontal look angle only (Y axis locked)
  const [cameraFront, setCameraFront] = useState(false); // V key toggles front/back camera view
  
  // Touch controls for mobile camera
  const lastTouchPosition = useRef({ x: 0, y: 0 });
  const isTouchingCamera = useRef(false);


  const { scene } = useThree();

  const spawnRandomly = () => {
    if (!rigidbody.current) return; // Safety check

    const spawns = [];
    for (let i = 0; i < 1000; i++) {
      const spawn = scene.getObjectByName(`spawn_${i}`);
      if (spawn) {
        spawns.push(spawn);
      } else {
        break;
      }
    }

    // If no spawn points found in map, use default positions
    if (spawns.length === 0) {
      console.log("No spawn points found in map, using default positions");
      const defaultSpawns = [
        { x: 8, y: 3, z: 8 },
        { x: -8, y: 3, z: -8 },
        { x: 8, y: 3, z: -8 },
        { x: -8, y: 3, z: 8 },
        { x: 0, y: 3, z: 12 },
        { x: 0, y: 3, z: -12 },
        { x: 12, y: 3, z: 0 },
        { x: -12, y: 3, z: 0 },
      ];
      const randomSpawn = defaultSpawns[Math.floor(Math.random() * defaultSpawns.length)];
      rigidbody.current.setTranslation(randomSpawn);
    } else {
      console.log(`Found ${spawns.length} spawn points in map`);
      const spawnPos = spawns[Math.floor(Math.random() * spawns.length)].position;
      rigidbody.current.setTranslation(spawnPos);
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    if (!userPlayer) return; // Only add keyboard controls for the current player

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w') keysPressed.current.w = true;
      if (key === 'a') keysPressed.current.a = true;
      if (key === 's') keysPressed.current.s = true;
      if (key === 'd') keysPressed.current.d = true;
      if (e.key === 'ArrowUp') keysPressed.current.arrowup = true;
      if (e.key === 'ArrowDown') keysPressed.current.arrowdown = true;
      if (e.key === 'ArrowLeft') keysPressed.current.arrowleft = true;
      if (e.key === 'ArrowRight') keysPressed.current.arrowright = true;
      if (key === ' ') {
        e.preventDefault(); // Prevent page scroll
        keysPressed.current.space = true; // Space for shooting
      }
      // Q/E to rotate camera (smooth hold)
      if (key === 'q') keysPressed.current.q = true;
      if (key === 'e') keysPressed.current.e = true;
      // V to toggle first-person/third-person camera view
      if (key === 'v') {
        setCameraFront(prev => {
          const newValue = !prev;
          window.isFirstPersonView = newValue; // For GamePage crosshair visibility
          return newValue;
        });
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w') keysPressed.current.w = false;
      if (key === 'a') keysPressed.current.a = false;
      if (key === 's') keysPressed.current.s = false;
      if (key === 'd') keysPressed.current.d = false;
      if (e.key === 'ArrowUp') keysPressed.current.arrowup = false;
      if (e.key === 'ArrowDown') keysPressed.current.arrowdown = false;
      if (e.key === 'ArrowLeft') keysPressed.current.arrowleft = false;
      if (e.key === 'ArrowRight') keysPressed.current.arrowright = false;
      if (key === ' ') keysPressed.current.space = false;
      if (key === 'q') keysPressed.current.q = false;
      if (key === 'e') keysPressed.current.e = false;
    };

    // Add mouse click for shooting
    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left mouse button - shoot
        keysPressed.current.shoot = true;
        // Request pointer lock for FPS-style mouse look
        if (document.pointerLockElement !== document.body) {
          document.body.requestPointerLock();
        }
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 0) {
        keysPressed.current.shoot = false;
      }
    };

    // Handle mouse movement for looking around (FPS-style)
    const handleMouseMove = (e) => {
      // Only use mouse movement when pointer is locked (FPS style)
      if (document.pointerLockElement === document.body) {
        const sensitivity = 0.002;
        // Horizontal mouse movement rotates camera/look direction (Y axis locked)
        lookAngle.current -= e.movementX * sensitivity;
      }
    };

    // Prevent context menu on right click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    
    // Handle ESC to exit pointer lock
    const handlePointerLockChange = () => {
      // Pointer lock state changed
    };

    // Touch controls for mobile camera
    const isInButtonArea = (x, y) => {
      // Exclude bottom-right corner where fire button is (roughly 150x150px area)
      const isBottomRight = x > window.innerWidth - 150 && y > window.innerHeight - 150;
      // Exclude bottom-left corner where joystick is
      const isBottomLeft = x < 200 && y > window.innerHeight - 200;
      return isBottomRight || isBottomLeft;
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[e.touches.length - 1]; // Use the latest touch
      // Skip if touch is on UI buttons (joystick or fire button areas)
      if (isInButtonArea(touch.clientX, touch.clientY)) return;
      
      // Use touches on the right 70% of screen for camera (left side is joystick)
      if (touch.clientX > window.innerWidth * 0.3) {
        lastTouchPosition.current = { x: touch.clientX, y: touch.clientY };
        isTouchingCamera.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isTouchingCamera.current) return;
      
      // Find a valid camera touch (not on button areas)
      let cameraTouch = null;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (t.clientX > window.innerWidth * 0.3 && !isInButtonArea(t.clientX, t.clientY)) {
          cameraTouch = t;
          break;
        }
      }
      
      if (!cameraTouch) return;

      const sensitivity = 0.005;
      const deltaX = cameraTouch.clientX - lastTouchPosition.current.x;
      const deltaY = cameraTouch.clientY - lastTouchPosition.current.y;

      // Update look angle (mobile) - Y axis locked
      lookAngle.current -= deltaX * sensitivity;

      lastTouchPosition.current = { x: cameraTouch.clientX, y: cameraTouch.clientY };
    };

    const handleTouchEnd = (e) => {
      // Check if any remaining touches are for camera
      let hasCameraTouch = false;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (t.clientX > window.innerWidth * 0.3 && !isInButtonArea(t.clientX, t.clientY)) {
          hasCameraTouch = true;
          break;
        }
      }
      if (!hasCameraTouch) {
        isTouchingCamera.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [userPlayer]);

  // Track if initial spawn has happened to prevent double spawn
  const hasSpawned = useRef(false);

  useEffect(() => {
    if (isHost() && !hasSpawned.current) {
      hasSpawned.current = true;
      // Small delay to ensure rigidbody is ready
      setTimeout(() => {
        if (rigidbody.current) {
      spawnRandomly();
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (state.state.dead) {
      const audio = new Audio("/audios/dead.mp3");
      audio.volume = 0.5;
      audio.play();
    }
  }, [state.state.dead]);

  useEffect(() => {
    if (state.state.health < 100) {
      const audio = new Audio("/audios/hurt.mp3");
      audio.volume = 0.4;
      audio.play();
    }
  }, [state.state.health]);

  useFrame((_, delta) => {
    // Early return if components not ready
    if (!rigidbody.current || !character.current) return;

    const playerWorldPos = vec3(rigidbody.current.translation());

    // Q/E smooth camera rotation (hold to rotate)
    if (userPlayer) {
      const rotateSpeed = 0.8 * delta; // Slower, more precise rotation
      if (keysPressed.current.q) {
        lookAngle.current += rotateSpeed;
      }
      if (keysPressed.current.e) {
        lookAngle.current -= rotateSpeed;
      }
    }

    // CAMERA FOLLOW - V toggles first-person (COD style ADS) / third-person view
    if (controls.current && userPlayer) {
      const horizontalAngle = lookAngle.current;
      
      if (cameraFront) {
        // First-person view (V pressed) - camera at character's head, looking forward
        const headHeight = 1.7; // Eye level
        const lookDistance = 10; // How far ahead to look
        
        // Camera at character's head position
        const cameraX = playerWorldPos.x;
        const cameraY = playerWorldPos.y + headHeight;
        const cameraZ = playerWorldPos.z;
        
        // Look target: in front of the character based on facing direction
        const lookAtX = playerWorldPos.x + Math.sin(horizontalAngle) * lookDistance;
        const lookAtY = playerWorldPos.y + headHeight;
        const lookAtZ = playerWorldPos.z + Math.cos(horizontalAngle) * lookDistance;

      controls.current.setLookAt(
        cameraX,
        cameraY,
        cameraZ,
          lookAtX,
          lookAtY,
          lookAtZ,
          true
        );
      } else {
        // Third-person view (default) - camera behind player, offset to right for aim line visibility
        const cameraDistance = window.innerWidth < 1024 ? 8 : 10;
        const cameraHeight = window.innerWidth < 1024 ? 2 : 2.5;
        const sideOffset = 1.5; // Offset camera to the right to see aim line

        // Calculate right direction perpendicular to look angle
        const rightX = Math.cos(horizontalAngle) * sideOffset;
        const rightZ = -Math.sin(horizontalAngle) * sideOffset;

        const cameraX = playerWorldPos.x - Math.sin(horizontalAngle) * cameraDistance + rightX;
        const cameraY = playerWorldPos.y + cameraHeight;
        const cameraZ = playerWorldPos.z - Math.cos(horizontalAngle) * cameraDistance + rightZ;

        // Look slightly ahead of player to show aim line
        const lookAheadX = playerWorldPos.x + Math.sin(horizontalAngle) * 2;
        const lookAheadZ = playerWorldPos.z + Math.cos(horizontalAngle) * 2;

        controls.current.setLookAt(
          cameraX,
          cameraY,
          cameraZ,
          lookAheadX,
        playerWorldPos.y + 1.5,
          lookAheadZ,
        true
      );
      }
    }

    // CHARACTER FACING - Only for keyboard/mouse (desktop)
    // Mobile joystick handles its own rotation (soccer style - face movement direction)
    const joystickActive = joystick.isJoystickPressed();
    if (userPlayer && !joystickActive) {
      character.current.rotation.y = lookAngle.current;
    }

    if (state.state.dead) {
      setAnimation("Death");
      return;
    }

    // MOVEMENT - Standard FPS controls (CoD style)
    // W/Up = forward, S/Down = backward, A/Left = strafe left, D/Right = strafe right
    let isKeyboardMoving = false;
    let forwardBack = 0; // +1 = forward, -1 = backward
    let leftRight = 0;   // +1 = right, -1 = left

    if (userPlayer) {
      const keys = keysPressed.current;
      
      // Forward/Backward (relative to facing direction)
      if (keys.w || keys.arrowup) forwardBack += 1;
      if (keys.s || keys.arrowdown) forwardBack -= 1;
      
      // Strafe Left/Right (relative to facing direction)
      if (keys.a || keys.arrowleft) leftRight -= 1;
      if (keys.d || keys.arrowright) leftRight += 1;
      
      if (forwardBack !== 0 || leftRight !== 0) {
        isKeyboardMoving = true;
        
        // Normalize diagonal movement so you don't move faster diagonally
        const length = Math.sqrt(forwardBack * forwardBack + leftRight * leftRight);
        forwardBack /= length;
        leftRight /= length;
        
        // Calculate world-space movement based on look direction
        // Forward is the direction the character is facing
        const facingAngle = lookAngle.current;
        
        // Forward/backward movement
        const forwardX = Math.sin(facingAngle) * forwardBack;
        const forwardZ = Math.cos(facingAngle) * forwardBack;
        
        // Strafe movement (perpendicular to forward)
        // Left = negative leftRight, Right = positive leftRight
        const strafeX = -Math.cos(facingAngle) * leftRight;
        const strafeZ = Math.sin(facingAngle) * leftRight;
        
        const impulse = {
          x: (forwardX + strafeX) * MOVEMENT_SPEED * delta,
          y: 0,
          z: (forwardZ + strafeZ) * MOVEMENT_SPEED * delta,
        };
        rigidbody.current.applyImpulse(impulse, true);
      }
    }

    // Update player position based on joystick (mobile) - Soccer game style
    const joystickAngle = joystick.angle();
    const isJoystickMoving = joystick.isJoystickPressed() && joystickAngle !== null;

    // Handle joystick movement - character faces movement direction (soccer style)
    if (isJoystickMoving) {
      // Joystick angle relative to camera - "up" on joystick moves where camera faces
      const movementAngle = joystickAngle + Math.PI + lookAngle.current;
      
      // Move in joystick direction
      const impulse = {
        x: Math.sin(movementAngle) * MOVEMENT_SPEED * delta,
        y: 0,
        z: Math.cos(movementAngle) * MOVEMENT_SPEED * delta,
      };
      rigidbody.current.applyImpulse(impulse, true);
      
      // Rotate character to face movement direction (soccer game style)
      const currentRotation = character.current.rotation.y;
      let targetRotation = movementAngle;
      
      // Normalize angle difference for smooth rotation
      let diff = targetRotation - currentRotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      
      // Smooth rotation towards movement direction
      character.current.rotation.y = currentRotation + diff * Math.min(1, delta * 12);
    }

    // Track if player is moving (for animation)
    const isMoving = isJoystickMoving || isKeyboardMoving;
    
    // Set animation based on movement
    if (isMoving) {
      setAnimation("Run");
    } else {
      setAnimation("Idle");
    }

    // SHOOTING LOGIC
    // Check if fire button is pressed (space, mouse click, or joystick)
    const isFiring = keysPressed.current.space || keysPressed.current.shoot || joystick.isPressed("fire");

    if (isFiring) {
      // Fire in the direction the character is facing (which is towards cursor)
      const shootAngle = character.current.rotation.y;
      setAnimation(isMoving ? "Run_Shoot" : "Idle_Shoot");
      if (isHost()) {
        if (Date.now() - lastShoot.current > FIRE_RATE) {
          lastShoot.current = Date.now();
          const newBullet = {
            id: state.id + "-" + +new Date(),
            position: vec3(rigidbody.current.translation()),
            angle: shootAngle,
            player: state.id,
          };
          onFire(newBullet);
        }
      }
    }

    if (isHost()) {
      state.setState("pos", rigidbody.current.translation());
    } else {
      const pos = state.getState("pos");
      if (pos) {
        rigidbody.current.setTranslation(pos);
      }
    }
  });
  const controls = useRef();
  const directionalLight = useRef();

  useEffect(() => {
    if (character.current && userPlayer) {
      directionalLight.current.target = character.current;
    }
  }, [character.current]);

  return (
    <group {...props} ref={group}>
      {userPlayer && <CameraControls ref={controls} />}
      <RigidBody
        ref={rigidbody}
        colliders={false}
        linearDamping={12}
        lockRotations
        type={isHost() ? "dynamic" : "kinematicPosition"}
        onIntersectionEnter={({ other }) => {
          if (
            isHost() &&
            other.rigidBody.userData.type === "bullet" &&
            state.state.health > 0
          ) {
            const newHealth =
              state.state.health - other.rigidBody.userData.damage;
            if (newHealth <= 0) {
              state.setState("deaths", state.state.deaths + 1);
              state.setState("dead", true);
              state.setState("health", 0);
              rigidbody.current.setEnabled(false);
              // Stop all movement
              rigidbody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
              rigidbody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
              setTimeout(() => {
                if (!rigidbody.current) return; // Safety check
                // Reset velocity before respawn
                rigidbody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                rigidbody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
                spawnRandomly();
                rigidbody.current.setEnabled(true);
                state.setState("health", 100);
                state.setState("dead", false);
                // Force position sync to prevent ghost/clone
                state.setState("pos", rigidbody.current.translation());
              }, 2000);
              onKilled(state.id, other.rigidBody.userData.player);
            } else {
              state.setState("health", newHealth);
            }
          }
        }}
      >
        <PlayerInfo state={state.state} />
        <group ref={character}>
          <CharacterSoldier
            color={state.state.character?.skin || state.state.profile?.color}
            animation={animation}
            weapon={weapon}
          />
          {/* Aim line for third-person view */}
          {userPlayer && !cameraFront && (
            <AimLine />
          )}
        </group>
        {userPlayer && (
          <directionalLight
            ref={directionalLight}
            position={[25, 18, -25]}
            intensity={0.3}
            castShadow={!downgradedPerformance}
            shadow-camera-near={0}
            shadow-camera-far={100}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />
        )}
        <CapsuleCollider args={[0.7, 0.6]} position={[0, 1.28, 0]} />
      </RigidBody>
    </group>
  );
};

const PlayerInfo = ({ state }) => {
  const health = state.health;
  const name = state.character?.playerName || state.profile?.name || "Player";
  const color = state.character?.skin || state.profile?.color || "#ff6b6b";
  return (
    <Billboard position-y={2.5}>
      <Text position-y={0.36} fontSize={0.4}>
        {name}
        <meshBasicMaterial color={color} />
      </Text>
      <mesh position-z={-0.1}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial color="black" transparent opacity={0.5} />
      </mesh>
      <mesh scale-x={health / 100} position-x={-0.5 * (1 - health / 100)}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </Billboard>
  );
};

// Aim line for third-person view (broken/dashed lines)
const AimLine = () => {
  // Create broken line segments
  const segments = [];
  const segmentLength = 1.2;
  const gapLength = 0.6;
  const totalLength = 18;
  
  let currentPos = 1;
  let index = 0;
  while (currentPos < totalLength) {
    segments.push(
      <mesh key={index} position={[0, 0, currentPos + segmentLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, segmentLength, 6]} />
        <meshBasicMaterial color="#ff3333" transparent opacity={0.8} />
      </mesh>
    );
    currentPos += segmentLength + gapLength;
    index++;
  }
  
  return (
    <group position={[0, 1.4, 0.5]}>
      {segments}
    </group>
  );
};
