import { Loader, PerformanceMonitor, SoftShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { Suspense, useState, useEffect } from "react";
import { insertCoin } from "playroomkit";
import { Experience } from "../components/Experience.jsx";
import { Leaderboard } from "../components/Leaderboard.jsx";
import { WeaponSelector } from "../components/WeaponSelector.jsx";

export const GamePage = () => {
  const [downgradedPerformance, setDowngradedPerformance] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState("AK");
  const [walletData, setWalletData] = useState(null);

  // Load wallet data from localStorage on mount
  useEffect(() => {
    const storedWallet = localStorage.getItem('walletAddress');
    const walletConnected = localStorage.getItem('walletConnected');
    
    if (storedWallet && walletConnected === 'true') {
      setWalletData({
        connected: true,
        address: storedWallet,
        wallet: 'Solana',
      });
    } else {
      setWalletData({
        connected: false,
        address: null,
        wallet: null,
      });
    }

    // Initialize Playroom
    initPlayroom();
  }, []);

  // Initialize Playroom - this will show the lobby automatically
  const initPlayroom = async () => {
    try {
      // insertCoin shows Playroom lobby with random GitHub avatars
      const avatars = [
        '/images/TYPE_1.JPG',
        '/images/TYPE_2.JPG',
        '/images/TYPE_3.JPG',
        '/images/TYPE_4.JPG',
        '/images/TYPE_5.png',
      ];

      await insertCoin({
        skipLobby: false,
        avatars,
      });

      // After Launch is clicked, start the game
      setGameStarted(true);
    } catch (error) {
      console.error("Error initializing Playroom:", error);
    }
  };

  // Show weapon selector during lobby
  if (!gameStarted) {
    return (
      <WeaponSelector
        onWeaponChange={setSelectedWeapon}
      />
    );
  }

  // After Launch clicked, show the game
  const characterData = {
    weapon: selectedWeapon,
    skin: "#4ecdc4", // Will be overridden by Playroom profile color
    playerName: "",
    wallet: walletData, // Include wallet data
  };

  return (
    <>
      <Loader />
      <Leaderboard />
      {/* 2D Crosshair overlay for mouse aiming */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        {/* Crosshair */}
        <svg width="40" height="40" viewBox="0 0 40 40">
          {/* Outer circle */}
          <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          {/* Inner dot */}
          <circle cx="20" cy="20" r="3" fill="rgba(255,50,50,0.9)" />
          {/* Cross lines */}
          <line x1="20" y1="5" x2="20" y2="12" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
          <line x1="20" y1="28" x2="20" y2="35" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
          <line x1="5" y1="20" x2="12" y2="20" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
          <line x1="28" y1="20" x2="35" y2="20" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
        </svg>
      </div>
      {/* Controls hint */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '12px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          zIndex: 100,
          textAlign: 'center',
          background: 'rgba(0,0,0,0.3)',
          padding: '8px 16px',
          borderRadius: '4px',
        }}
      >
        Click to start | WASD/Arrows: Move | Mouse: Look | Q/E: Rotate Camera | Click/Space: Shoot | Enter: Jump (x5) | ESC: Release
      </div>
      <Canvas
        shadows
        camera={{ position: [0, 30, 0], fov: 30, near: 2 }}
        dpr={[1, 1.5]}
        style={{ cursor: 'none' }} // Hide default cursor
      >
        <color attach="background" args={["#242424"]} />
        <SoftShadows size={42} />

        <PerformanceMonitor
          onDecline={(fps) => {
            setDowngradedPerformance(true);
          }}
        />
        <Suspense>
          <Physics>
            <Experience
              characterData={characterData}
              downgradedPerformance={downgradedPerformance}
            />
          </Physics>
        </Suspense>
        {!downgradedPerformance && (
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} intensity={1.5} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>
    </>
  );
};

