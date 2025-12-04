import { Billboard, CameraControls, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, vec3 } from "@react-three/rapier";
import { isHost } from "playroomkit";
import { useEffect, useRef, useState } from "react";
import { CharacterSoldier } from "./CharacterSoldier";
import { MobileRespawnButton } from "./MobileRespawnButton";
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
    space: false, // Shoot key (Space)
    enter: false, // Jump key (Enter)
    shoot: false, // Shoot (mouse click)
    respawn: false, // Respawn key (R)
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false,
  });

  // Track the last facing direction for shooting (based on movement)
  const lastAngle = useRef(0);

  // Mouse look controls
  const mouseRotation = useRef({ x: 0, y: 0 });
  const isPointerLocked = useRef(false);
  
  // Touch controls for mobile camera
  const lastTouchPosition = useRef({ x: 0, y: 0 });
  const isTouchingCamera = useRef(false);

  // Jump controls
  const isGrounded = useRef(true);
  const jumpForce = 8; // Adjust for jump height (default: 8)

  const scene = useThree((state) => state.scene);

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
        { x: 10, y: 1, z: 10 },
        { x: -10, y: 1, z: -10 },
        { x: 10, y: 1, z: -10 },
        { x: -10, y: 1, z: 10 },
        { x: 0, y: 1, z: 15 },
        { x: 0, y: 1, z: -15 },
        { x: 15, y: 1, z: 0 },
        { x: -15, y: 1, z: 0 },
      ];
      const randomSpawn = defaultSpawns[Math.floor(Math.random() * defaultSpawns.length)];
      rigidbody.current.setTranslation(randomSpawn);
    } else {
      console.log(`Found ${spawns.length} spawn points in map`);
      const spawnPos = spawns[Math.floor(Math.random() * spawns.length)].position;
      rigidbody.current.setTranslation(spawnPos);
    }
  };

  // Manual respawn function for hotkey/button
  const manualRespawn = () => {
    if (!rigidbody.current || !isHost()) return;

    // Respawn to get unstuck - works anytime
    const currentHealth = state.state.health;
    const isDead = state.state.dead || currentHealth <= 0;

    // Move to new spawn point
    spawnRandomly();
    rigidbody.current.setEnabled(true);

    // Only restore health if player was dead, otherwise keep current health
    if (isDead) {
      state.setState("health", 100);
      state.setState("dead", false);
    }
    // If alive, keep current health (just reposition)
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
      if (key === 'arrowup') keysPressed.current.arrowup = true;
      if (key === 'arrowdown') keysPressed.current.arrowdown = true;
      if (key === 'arrowleft') keysPressed.current.arrowleft = true;
      if (key === 'arrowright') keysPressed.current.arrowright = true;
      if (key === ' ') {
        e.preventDefault(); // Prevent page scroll
        keysPressed.current.space = true; // Space for shooting
      }
      if (key === 'enter') {
        e.preventDefault(); // Prevent default enter behavior
        keysPressed.current.enter = true; // Enter for jumping
      }
      if (key === 'r') {
        e.preventDefault();
        keysPressed.current.respawn = true; // R for respawn
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w') keysPressed.current.w = false;
      if (key === 'a') keysPressed.current.a = false;
      if (key === 's') keysPressed.current.s = false;
      if (key === 'd') keysPressed.current.d = false;
      if (key === 'arrowup') keysPressed.current.arrowup = false;
      if (key === 'arrowdown') keysPressed.current.arrowdown = false;
      if (key === 'arrowleft') keysPressed.current.arrowleft = false;
      if (key === 'arrowright') keysPressed.current.arrowright = false;
      if (key === ' ') keysPressed.current.space = false;
      if (key === 'enter') keysPressed.current.enter = false;
      if (key === 'r') keysPressed.current.respawn = false;
    };

    // Add mouse click for shooting and pointer lock
    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left mouse button
        keysPressed.current.shoot = true; // Changed from space to shoot

        // Request pointer lock on first click (for mouse look)
        if (!isPointerLocked.current && document.pointerLockElement !== document.body) {
          document.body.requestPointerLock();
        }
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 0) {
        keysPressed.current.shoot = false; // Changed from space to shoot
      }
    };

    // Handle mouse movement for looking around
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === document.body) {
        isPointerLocked.current = true;

        // Mouse sensitivity
        const sensitivity = 0.002;

        // Update horizontal rotation (left/right)
        mouseRotation.current.x -= e.movementX * sensitivity;

        // Update vertical rotation (up/down) - limited to prevent flipping
        mouseRotation.current.y -= e.movementY * sensitivity;
        mouseRotation.current.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mouseRotation.current.y));
      }
    };

    // Handle pointer lock change
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === document.body;
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

      // Update camera rotation
      mouseRotation.current.x -= deltaX * sensitivity;
      mouseRotation.current.y -= deltaY * sensitivity;
      mouseRotation.current.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mouseRotation.current.y));

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
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [userPlayer]);

  useEffect(() => {
    if (isHost()) {
      spawnRandomly();
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

    // CAMERA FOLLOW - With mouse look
    if (controls.current) {
      const cameraDistanceY = window.innerWidth < 1024 ? 4 : 5;
      const cameraDistanceZ = window.innerWidth < 1024 ? 6 : 8;
      const playerWorldPos = vec3(rigidbody.current.translation());

      // Use mouse rotation for camera position
      const horizontalAngle = mouseRotation.current.x;
      const verticalAngle = mouseRotation.current.y;

      // Calculate camera position based on mouse rotation
      const cameraX = playerWorldPos.x - Math.sin(horizontalAngle) * cameraDistanceZ * Math.cos(verticalAngle);
      const cameraY = playerWorldPos.y + cameraDistanceY + Math.sin(verticalAngle) * cameraDistanceZ;
      const cameraZ = playerWorldPos.z - Math.cos(horizontalAngle) * cameraDistanceZ * Math.cos(verticalAngle);

      controls.current.setLookAt(
        cameraX,
        cameraY,
        cameraZ,
        playerWorldPos.x,
        playerWorldPos.y + 1.5,
        playerWorldPos.z,
        true
      );

      // Update character facing direction to match camera horizontal rotation
      lastAngle.current = horizontalAngle;
    }

    if (state.state.dead) {
      setAnimation("Death");
      return;
    }

    // Calculate keyboard movement - character-relative controls
    let isKeyboardMoving = false;
    let isKeyboardTurning = false;

    if (userPlayer) {
      const keys = keysPressed.current;
      const turnSpeed = 3.0 * delta; // Rotation speed
      
      // A/D or Arrow Left/Right = turn the character
      if (keys.a || keys.arrowleft) {
        character.current.rotation.y += turnSpeed;
        mouseRotation.current.x += turnSpeed; // Camera follows
        isKeyboardTurning = true;
      }
      if (keys.d || keys.arrowright) {
        character.current.rotation.y -= turnSpeed;
        mouseRotation.current.x -= turnSpeed; // Camera follows
        isKeyboardTurning = true;
      }
      
      // W/S or Arrow Up/Down = move forward/backward in facing direction
      if (keys.w || keys.arrowup || keys.s || keys.arrowdown) {
        isKeyboardMoving = true;
      }
    }

    // Update player position based on joystick or keyboard
    const joystickAngle = joystick.angle();
    const isJoystickMoving = joystick.isJoystickPressed() && joystickAngle;

    // Handle joystick movement (uses joystick angle relative to camera direction)
    if (isJoystickMoving && joystickAngle !== null) {
      setAnimation("Run");
      // Make joystick relative to camera direction - "up" on joystick moves where camera faces
      const correctedAngle = joystickAngle + Math.PI + mouseRotation.current.x;
      character.current.rotation.y = correctedAngle;
      
      const impulse = {
        x: Math.sin(correctedAngle) * MOVEMENT_SPEED * delta,
        y: 0,
        z: Math.cos(correctedAngle) * MOVEMENT_SPEED * delta,
      };
      rigidbody.current.applyImpulse(impulse, true);
    } 
    // Handle keyboard movement (uses character facing direction)
    else if (isKeyboardMoving) {
      setAnimation("Run");
      const facingAngle = character.current.rotation.y;
      const keys = keysPressed.current;
      
      // Direction multiplier: 1 for forward, -1 for backward
      let direction = 0;
      if (keys.w || keys.arrowup) direction += 1;
      if (keys.s || keys.arrowdown) direction -= 1;
      
      const impulse = {
        x: Math.sin(facingAngle) * MOVEMENT_SPEED * delta * direction,
        y: 0,
        z: Math.cos(facingAngle) * MOVEMENT_SPEED * delta * direction,
      };
      rigidbody.current.applyImpulse(impulse, true);
    } else if (isKeyboardTurning) {
      setAnimation("Idle");
    } else {
      setAnimation("Idle");
    }

    // Track if player is moving (for shooting animation)
    const isMoving = isJoystickMoving || isKeyboardMoving;

    // JUMP LOGIC
    // Check if player is on ground (simple check using y-velocity)
    const velocity = rigidbody.current.linvel();
    isGrounded.current = Math.abs(velocity.y) < 0.5; // Grounded if not moving much vertically

    // Jump when Enter pressed and on ground
    if (keysPressed.current.enter && isGrounded.current) {
      rigidbody.current.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true);
      keysPressed.current.enter = false; // Prevent continuous jumping while holding enter
    }

    // SHOOTING LOGIC
    // Check if fire button is pressed (space, mouse click, or joystick)
    const isFiring = keysPressed.current.space || keysPressed.current.shoot || joystick.isPressed("fire");

    if (isFiring) {
      // fire - use character's actual facing direction
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

    // RESPAWN LOGIC
    // Press R to respawn manually
    if (keysPressed.current.respawn) {
      manualRespawn();
      keysPressed.current.respawn = false; // Prevent spam
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
              setTimeout(() => {
                spawnRandomly();
                rigidbody.current.setEnabled(true);
                state.setState("health", 100);
                state.setState("dead", false);
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
          {userPlayer && (
            <Crosshair
              position={[WEAPON_OFFSET.x, WEAPON_OFFSET.y, WEAPON_OFFSET.z]}
            />
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
      {userPlayer && <MobileRespawnButton onRespawn={manualRespawn} />}
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

const Crosshair = (props) => {
  return (
    <group {...props}>
      <mesh position-z={1}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.9} />
      </mesh>
      <mesh position-z={2}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.85} />
      </mesh>
      <mesh position-z={3}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" transparent opacity={0.8} />
      </mesh>

      <mesh position-z={4.5}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.7} transparent />
      </mesh>

      <mesh position-z={6.5}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.6} transparent />
      </mesh>

      <mesh position-z={9}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="black" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};