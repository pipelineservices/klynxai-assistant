import React from 'react';

// MOCK DATA
const DEMO_PRODUCT = {
    name: "GlowLab Hydrating Serum",
    brand: "GlowLab",
    image: "https://via.placeholder.com/150", // Placeholder or use local asset if available
    score: 92,
    ingredients: [
        { name: "Hyaluronic Acid", status: "safe", description: "Excellent moisturizer" },
        { name: "Niacinamide", status: "safe", description: "Brightening agent" },
        { name: "Parabens", status: "warning", description: "Preservative (Potential allergen)" }
    ],
    compliance: {
        fda: "Compliant",
        eu: "Compliant",
        score: "A+"
    }
};

export default function ProductIntelligencePanel({
    isVisible,
    onClose,
    colors
}: {
    isVisible: boolean;
    onClose: () => void;
    colors: any;
}) {
    if (!isVisible) return null;

    return (
        <div
            className="glass-panel"
            style={{
                width: 320,
                borderLeft: `1px solid ${colors.panelBorder}`,
                display: "flex",
                flexDirection: "column",
                padding: 20,
                gap: 16,
                color: colors.text,
                overflowY: "auto",
                transition: "width 0.3s ease",
                // Position it if we want overlay, but Flex layout is safer for "Rufus" style
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Product Insights</h3>
                <button
                    onClick={onClose}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: colors.muted,
                        cursor: "pointer",
                        fontSize: 20
                    }}
                >
                    &times;
                </button>
            </div>

            {/* Main Score Card */}
            <div style={{
                background: "rgba(0,0,0,0.2)",
                borderRadius: 12,
                padding: 16,
                textAlign: "center"
            }}>
                <div style={{ fontSize: 13, color: colors.muted, marginBottom: 4 }}>Sustainability Score</div>
                <div style={{
                    fontSize: 42,
                    fontWeight: 900,
                    background: "linear-gradient(90deg, #22c55e, #38bdf8)",
                    WebkitBackgroundClip: "text",
                    color: "transparent"
                }}>
                    {DEMO_PRODUCT.score}
                </div>
                <div style={{ fontSize: 12, color: colors.accentGreen }}>Excellent</div>
            </div>

            {/* Product Info */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 60, height: 60, background: "#fff", borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#000' }}>
                    Product Img
                </div>
                <div>
                    <div style={{ fontWeight: 700 }}>{DEMO_PRODUCT.name}</div>
                    <div style={{ fontSize: 12, color: colors.muted }}>{DEMO_PRODUCT.brand}</div>
                </div>
            </div>

            {/* Ingredients */}
            <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Ingredient Safety</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {DEMO_PRODUCT.ingredients.map((ing, i) => (
                        <div key={i} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            padding: 8,
                            background: colors.btnBg,
                            borderRadius: 8
                        }}>
                            <span>{ing.name}</span>
                            <span style={{
                                color: ing.status === 'warning' ? '#f59e0b' : '#22c55e',
                                fontWeight: 600
                            }}>
                                {ing.status === 'safe' ? 'Safe' : 'Caution'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Partners Mock */}
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${colors.panelBorder}` }}>
                <div style={{ fontSize: 11, marginBottom: 8, textTransform: 'uppercase', color: colors.muted, letterSpacing: 1 }}>Integration Ready</div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['Amazon', 'Walmart', 'BestBuy'].map(p => (
                        <div key={p} style={{
                            padding: '4px 8px',
                            background: colors.chipBg,
                            border: `1px solid ${colors.chipBorder}`,
                            borderRadius: 4,
                            fontSize: 10
                        }}>
                            {p}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
