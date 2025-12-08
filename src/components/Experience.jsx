import { Environment } from "@react-three/drei";
import {
  Joystick,
  isHost,
  myPlayer,
  onPlayerJoin,
  useMultiplayerState,
} from "playroomkit";
import { useEffect, useState, useRef, useCallback } from "react";
import { Bullet } from "./Bullet.jsx";
import { BulletHit } from "./BulletHit.jsx";
import { CharacterController } from "./CharacterController.jsx";
import { Map } from "./Map.jsx";
import { saveHighscore } from "../lib/supabase.js";

export const Experience = ({ characterData, downgradedPerformance = false }) => {
  const [players, setPlayers] = useState([]);
  const lastSavedKills = useRef(0);
  const saveTimeoutRef = useRef(null);

  // Get wallet info from characterData
  const walletConnected = characterData?.wallet?.connected;
  const walletAddress = characterData?.wallet?.address;

  // Debounced save to Supabase (saves after 2 seconds of no new kills)
  const saveKillsToSupabase = useCallback((kills) => {
    if (!walletConnected || !walletAddress) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save after 2 seconds of no new kills
    saveTimeoutRef.current = setTimeout(async () => {
      if (kills > lastSavedKills.current) {
        const result = await saveHighscore(walletAddress, kills);
        if (result.success) {
          lastSavedKills.current = kills;
          if (result.isNewHighscore) {
            console.log(`New highscore saved: ${kills} kills`);
          }
        }
      }
    }, 2000);
  }, [walletConnected, walletAddress]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // insertCoin is already called in App.jsx
    // Just set up player join handlers

    onPlayerJoin((state) => {
      // Joystick will only create UI for current player (myPlayer)
      const joystick = new Joystick(state, {
        type: "angular",
        buttons: [{ id: "fire", label: "Fire" }],
      });

      const newPlayer = { state, joystick };
      state.setState("health", 100);
      state.setState("deaths", 0);
      state.setState("kills", 0);

      // Set character data from weapon selector
      if (state.id === myPlayer()?.id && characterData) {
        // For current player, set weapon from selector
        state.setState("character", {
          weapon: characterData.weapon,
          skin: state.getState("profile")?.color || "#4ecdc4", // Use Playroom color picker
        });
      } else {
        // For other players, ensure they have character data
        if (!state.getState("character")) {
          state.setState("character", {
            weapon: "AK", // Default weapon
            skin: state.getState("profile")?.color || "#4ecdc4",
          });
        }
      }

      setPlayers((players) => [...players, newPlayer]);

      state.onQuit(() => {
        setPlayers((players) => players.filter((p) => p.state.id !== state.id));
      });
    });
  }, [characterData]);

  const [bullets, setBullets] = useState([]);
  const [hits, setHits] = useState([]);

  const [networkBullets, setNetworkBullets] = useMultiplayerState("bullets", []);
  const [networkHits, setNetworkHits] = useMultiplayerState("hits", []);

  const onFire = (bullet) => {
    setBullets((bullets) => [...bullets, bullet]);
  };

  const onHit = (bulletId, position) => {
    setBullets((bullets) => bullets.filter((bullet) => bullet.id !== bulletId));
    setHits((hits) => [...hits, { id: bulletId, position }]);
  };

  const onHitEnded = (hitId) => {
    setHits((hits) => hits.filter((h) => h.id !== hitId));
  };

  useEffect(() => {
    setNetworkBullets(bullets);
  }, [bullets]);

  useEffect(() => {
    setNetworkHits(hits);
  }, [hits]);

  const onKilled = (_victim, killer) => {
    const killerState = players.find((p) => p.state.id === killer)?.state;
    if (killerState) {
      const newKills = killerState.state.kills + 1;
      killerState.setState("kills", newKills);

      // Save to Supabase if the killer is the current player with connected wallet
      if (killer === myPlayer()?.id && walletConnected) {
        saveKillsToSupabase(newKills);
      }
    }
  };

  return (
    <>
      <Map />
      {players.map(({ state, joystick }) => (
        <CharacterController
          key={state.id}
          state={state}
          userPlayer={state.id === myPlayer()?.id}
          joystick={joystick}
          onKilled={onKilled}
          onFire={onFire}
          downgradedPerformance={downgradedPerformance}
          weapon={state.state.character?.weapon || "AK"}
        />
      ))}
      {(isHost() ? bullets : networkBullets).map((bullet) => (
        <Bullet
          key={bullet.id}
          {...bullet}
          onHit={(position) => onHit(bullet.id, position)}
        />
      ))}
      {(isHost() ? hits : networkHits).map((hit) => (
        <BulletHit key={hit.id} {...hit} onEnded={() => onHitEnded(hit.id)} />
      ))}
      <Environment preset="sunset" />
    </>
  );
};