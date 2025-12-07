export const WalletConnect = ({ onContinue }) => {
    const handleContinueWithout = () => {
        onContinue({
            connected: false,
            address: null,
            wallet: null,
        });
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#806247",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
        }}>
            <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "24px",
                padding: "50px",
                maxWidth: "520px",
                width: "90%",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                textAlign: "center",
            }}>
                {/* Logo/Icon */}
                <div style={{
                    fontSize: "80px",
                    marginBottom: "20px",
                }}>
                    🎮
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    marginBottom: "15px",
                    color: "#333",
                }}>
                    Welcome to Battle Arena
                </h1>

                {/* Description */}
                <p style={{
                    fontSize: "16px",
                    color: "#666",
                    marginBottom: "40px",
                    lineHeight: "1.6",
                }}>
                    {/* Connect your Solana wallet to unlock SOL rewards, NFT skins, and on-chain stats. Or continue without connecting. */}

                    Enter the arena and battle against other players. Aim, shoot, and dominate!
                </p>

                {/* Connect Wallet Button - DISABLED */}
                <button
                    disabled={true}
                    style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "15px",
                        fontWeight: "bold",
                        color: "white",
                        background: "#999",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "not-allowed",
                        transition: "all 0.2s",
                        marginBottom: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        opacity: 0.6,
                    }}
                >
                    Connect Solana Wallet (Coming Soon)
                </button>

                {/* Wallet Support Info */}
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "15px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    opacity: 0.5,
                }}>
                    <div style={{
                        padding: "6px 12px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#666",
                        fontWeight: "600",
                    }}>
                        Phantom
                    </div>
                    <div style={{
                        padding: "6px 12px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#666",
                        fontWeight: "600",
                    }}>
                        Solflare
                    </div>
                    <div style={{
                        padding: "6px 12px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#666",
                        fontWeight: "600",
                    }}>
                        Backpack
                    </div>
                </div>

                {/* Continue Without Button */}
                <button
                    onClick={handleContinueWithout}
                    style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#666",
                        background: "transparent",
                        border: "2px solid #806247",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = "#806247";
                        e.target.style.color = "#806247";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = "#806247";
                        e.target.style.color = "#666";
                    }}
                >
                    Continue Without Wallet
                </button>

                {/* Benefits List */}
                <div style={{
                    marginTop: "30px",
                    padding: "20px",
                    background: "#f8f9fa",
                    borderRadius: "12px",
                    textAlign: "left",
                    opacity: 0.5,
                }}>
                    <p style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#999",
                        marginBottom: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                    }}>
                        With Solana Wallet Connected (Coming Soon):
                    </p>
                    <div style={{ fontSize: "14px", color: "#666", lineHeight: "1.8" }}>
                        ✓ Earn SOL rewards for wins<br />
                        ✓ Unlock exclusive NFT weapon skins<br />
                        ✓ Track stats on Solana blockchain<br />
                        ✓ Trade items on Magic Eden
                    </div>
                </div>
            </div>
        </div>
    );
};
