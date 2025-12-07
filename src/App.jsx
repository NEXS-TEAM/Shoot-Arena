import { Loader, PerformanceMonitor, SoftShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { Suspense, useState, useEffect } from "react";
import { insertCoin } from "playroomkit";
import { Experience } from "./components/Experience.jsx";
import { Leaderboard } from "./components/Leaderboard.jsx";
import { WeaponSelector } from "./components/WeaponSelector.jsx";
import { WalletConnect } from "./components/WalletConnect.jsx";

function App() {
  const [downgradedPerformance, setDowngradedPerformance] = useState(false);
  const [walletStep, setWalletStep] = useState("connect"); // "connect" -> "lobby" -> "game"
  const [walletData, setWalletData] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState("AK");

  // Handle wallet connection or skip
  const handleWalletContinue = (data) => {
    setWalletData(data);
    setWalletStep("lobby");

    // Initialize Playroom after wallet step
    initPlayroom();
  };

  // Initialize Playroom - this will show the lobby automatically
  const initPlayroom = async () => {
    try {
      // insertCoin shows Playroom lobby with random GitHub avatars
      const avatars = [
        'https://i.ibb.co/q3Zd7Ynk/alon.jpg',
        // 'https://avatars.githubusercontent.com/u/1?v=4',
        // 'https://avatars.githubusercontent.com/u/2?v=4',
        // 'https://avatars.githubusercontent.com/u/3?v=4',
        // 'https://avatars.githubusercontent.com/u/4?v=4',
        // 'https://avatars.githubusercontent.com/u/5?v=4',
        // 'https://avatars.githubusercontent.com/u/6?v=4',
        // 'https://avatars.githubusercontent.com/u/7?v=4',
        // 'https://avatars.githubusercontent.com/u/8?v=4',
        // 'https://avatars.githubusercontent.com/u/9?v=4',
        // 'https://avatars.githubusercontent.com/u/10?v=4',
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

  // Show wallet connection screen first
  if (walletStep === "connect") {
    return <WalletConnect onContinue={handleWalletContinue} />;
  }

  // Show weapon selector during lobby (after wallet step)
  if (walletStep === "lobby" && !gameStarted) {
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
}

export default App;