// src/utils/spawnConfig.js - Hardcoded 3 spawn points

export const SPAWN_POSITIONS = [
  [-10, 1, -10],  // Spawn 1: Northwest
  [10, 1, -10],   // Spawn 2: Northeast
  [0, 1, 15]      // Spawn 3: South
];

export const SPAWN_ROTATIONS = [
  Math.PI / 4,    // Spawn 1: Face southeast
  -Math.PI / 4,   // Spawn 2: Face southwest
  Math.PI         // Spawn 3: Face north
];

export function getPlayerSpawn(playerIndex) {
  const spawnIndex = playerIndex % 3;
  const pos = SPAWN_POSITIONS[spawnIndex];
  const rot = SPAWN_ROTATIONS[spawnIndex];
  
  console.log(`🎯 Player ${playerIndex} → Spawn ${spawnIndex + 1}/3 at [${pos[0]}, ${pos[1]}, ${pos[2]}]`);
  
  return { 
    position: pos, 
    rotation: rot,
    index: spawnIndex 
  };
}

export function getRandomSpawn(lastSpawnIndex = -1) {
  let spawnIndex;
  
  if (lastSpawnIndex >= 0 && lastSpawnIndex < 3) {
    const otherSpawns = [0, 1, 2].filter(i => i !== lastSpawnIndex);
    spawnIndex = otherSpawns[Math.floor(Math.random() * 2)];
  } else {
    spawnIndex = Math.floor(Math.random() * 3);
  }
  
  const pos = SPAWN_POSITIONS[spawnIndex];
  const rot = SPAWN_ROTATIONS[spawnIndex];
  
  console.log(`🔄 Respawn → Spawn ${spawnIndex + 1}/3 at [${pos[0]}, ${pos[1]}, ${pos[2]}]`);
  
  return { 
    position: pos, 
    rotation: rot,
    index: spawnIndex 
  };
}
