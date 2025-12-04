import { useState } from "react";
import gunImage from "../assets/gun.png";

export const WeaponSelector = ({ onWeaponChange }) => {
    const [selectedWeapon, setSelectedWeapon] = useState("AK");

    // All 14 weapons with better gun icons/emojis
    const weapons = [
        { id: "AK", icon: "gun", name: "AK-47" },
        { id: "Shotgun", icon: "gun", name: "Shotgun" },
        { id: "Sniper", icon: "🎯", name: "Sniper" },
        { id: "Sniper_2", icon: "gun", name: "Heavy Sniper" },
        { id: "SMG", icon: "gun", name: "SMG" },
        { id: "Pistol", icon: "gun", name: "Pistol" },
        { id: "Revolver", icon: "gun", name: "Revolver" },
        { id: "Revolver_Small", icon: "gun", name: "Compact" },
        { id: "GrenadeLauncher", icon: "💣", name: "Grenade" },
        { id: "RocketLauncher", icon: "🚀", name: "Rocket" },
        { id: "ShortCannon", icon: "💥", name: "Cannon" },
        { id: "Knife_1", icon: "🔪", name: "Knife" },
        { id: "Knife_2", icon: "🗡️", name: "Dagger" },
        { id: "Shovel", icon: "⚒️", name: "Shovel" },
    ];

    const handleWeaponSelect = (weaponId) => {
        setSelectedWeapon(weaponId);
        onWeaponChange(weaponId);
    };

    return (
        <div style={{
            position: "fixed",
            right: "15px",
            top: "10px",
            background: "rgba(30, 30, 30, 0.95)",
            borderRadius: "16px",
            padding: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.7)",
            border: "2px solid rgba(102, 126, 234, 0.3)",
            width: "232px",
            maxHeight: "90vh",
            overflowY: "auto",
            overflowX: "hidden",
            zIndex: 999999,
        }}>
            {/* Weapon Selection */}
            <div>
                <h3 style={{
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "12px",
                    textAlign: "center",
                }}>
                    Choose Weapon
                </h3>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 44px)",
                    gap: "8px",
                    justifyContent: "center",
                }}>
                    {weapons.map((weapon) => (
                        <button
                            key={weapon.id}
                            onClick={() => handleWeaponSelect(weapon.id)}
                            title={weapon.name}
                            style={{
                                width: "44px",
                                height: "44px",
                                background: selectedWeapon === weapon.id
                                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                    : "rgba(255, 255, 255, 0.1)",
                                border: selectedWeapon === weapon.id
                                    ? "2px solid #667eea"
                                    : "1px solid rgba(255, 255, 255, 0.2)",
                                borderRadius: "10px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontSize: "22px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transform: selectedWeapon === weapon.id ? "scale(1.05)" : "scale(1)",
                            }}
                            onMouseEnter={(e) => {
                                if (selectedWeapon !== weapon.id) {
                                    e.target.style.background = "rgba(255, 255, 255, 0.15)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedWeapon !== weapon.id) {
                                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                                }
                            }}
                        >
                            {weapon.icon === "gun" ? (
                                <img 
                                    src={gunImage} 
                                    alt={weapon.name}
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        objectFit: "contain",
                                    }}
                                />
                            ) : (
                                weapon.icon
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selection Info */}
            <div style={{
                marginTop: "15px",
                padding: "10px",
                background: "rgba(102, 126, 234, 0.15)",
                borderRadius: "8px",
                textAlign: "center",
                border: "1px solid rgba(102, 126, 234, 0.3)",
            }}>
                <p style={{
                    color: "rgba(255, 255, 255, 0.95)",
                    fontSize: "11px",
                    margin: 0,
                    fontWeight: "600",
                }}>
                    ✓ {weapons.find(w => w.id === selectedWeapon)?.name} Selected
                </p>
                <p style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "9px",
                    margin: "5px 0 0 0",
                }}>
                    Choose skin color below avatar
                </p>
            </div>
        </div>
    );
};