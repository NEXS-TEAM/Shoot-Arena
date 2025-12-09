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
  const [isFirstPerson, setIsFirstPerson] = useState(false);

  // Listen for V key to toggle crosshair visibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'v') {
        setIsFirstPerson(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Detect if running on mobile phone (Android/iPhone)
  const [isMobilePhone, setIsMobilePhone] = useState(false);
  
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isMobile = isAndroid || isIOS;
    setIsMobilePhone(isMobile);
    
    // Add body class for CSS targeting
    if (isMobile) {
      document.body.classList.add('is-mobile-phone');
      document.body.classList.remove('is-desktop');
    } else {
      document.body.classList.add('is-desktop');
      document.body.classList.remove('is-mobile-phone');
    }
  }, []);

  // Hide Playroom joystick and fire button on desktop (non-mobile)
  useEffect(() => {
    if (!isMobilePhone && gameStarted) {
      // Hide joystick controls after a short delay to ensure they're rendered
      const hideControls = () => {
        // Find and hide fixed position elements (joystick containers)
        const fixedElements = document.querySelectorAll('div[style*="position: fixed"]');
        fixedElements.forEach(el => {
          const style = el.getAttribute('style') || '';
          // Joystick is at bottom-left, fire button container at bottom-right
          if (style.includes('bottom') && (style.includes('left: 10px') || style.includes('right'))) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
          }
        });
        
        // Also find and hide absolute positioned fire button (60x60 with border-radius: 10px)
        const absoluteElements = document.querySelectorAll('div[style*="position: absolute"]');
        absoluteElements.forEach(el => {
          const style = el.getAttribute('style') || '';
          // Fire button has specific dimensions and border-radius
          if (style.includes('60px') && style.includes('border-radius: 10px')) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
          }
        });
        
        // Hide any element with touch-action that looks like a control
        const touchElements = document.querySelectorAll('div[style*="touch-action"]');
        touchElements.forEach(el => {
          const style = el.getAttribute('style') || '';
          if (style.includes('bottom') || style.includes('border-radius: 50%')) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
          }
        });
      };
      
      // Run immediately and after delays to catch dynamically created elements
      hideControls();
      const timer1 = setTimeout(hideControls, 100);
      const timer2 = setTimeout(hideControls, 500);
      const timer3 = setTimeout(hideControls, 1000);
      const timer4 = setTimeout(hideControls, 2000);
      
      // Also use MutationObserver to catch new elements
      const observer = new MutationObserver(hideControls);
      observer.observe(document.body, { childList: true, subtree: true });
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        observer.disconnect();
      };
    }
  }, [gameStarted, isMobilePhone]);

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
      {/* Crosshair - only shown in first-person view */}
      {isFirstPerson && (
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
          <svg width="32" height="32" viewBox="0 0 32 32">
            {/* Center dot */}
            <circle cx="16" cy="16" r="2" fill="#ff3333" />
            {/* Cross lines */}
            <line x1="16" y1="4" x2="16" y2="11" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="21" x2="16" y2="28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="4" y1="16" x2="11" y2="16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="21" y1="16" x2="28" y2="16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}
      {/* Controls hint - only show on desktop, not mobile */}
      {!isMobilePhone && (
        <div className="desktop-controls-hint">
          Click to start | WASD/Arrows: Move | Mouse: Look | Q/E: Rotate | V: First Person | Click/Space: Shoot | ESC: Release
        </div>
      )}
      <Canvas
        shadows
        camera={{ position: [0, 30, 0], fov: 30, near: 2 }}
        dpr={[1, 1.5]}
        className="game-canvas"
        style={{ 
          cursor: 'none',
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
        }}
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

