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
      <Canvas
        shadows
        camera={{ position: [0, 30, 0], fov: 30, near: 2 }}
        dpr={[1, 1.5]}
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

