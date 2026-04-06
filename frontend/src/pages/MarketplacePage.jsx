import React, { useState, useEffect } from "react";

import api from "../api";

const LISTINGS = [
  {
    id: 1,
    title: "Amazon Rainforest Block",
    type: "tree",
    credits_price: 5,
    description: "Protection of 1 hectare of primary canopy.",
  },
  {
    id: 2,
    title: "Sahara Solar Array",
    type: "solar",
    credits_price: 12,
    description: "Offset from high-efficiency photovoltaic panels.",
  },
  {
    id: 3,
    title: "Verdant Compost Basin",
    type: "compost",
    credits_price: 8,
    description: "Methane reduction through organic waste management.",
  },
  {
    id: 4,
    title: "Andean Reforestation",
    type: "tree",
    credits_price: 20,
    description: "Planting native species in high-altitude ecosystems.",
  },
];

function MarketplacePage() {
  const [balance, setBalance] = useState(0);
  const [purchased, setPurchased] = useState({}); // listingId: 'Purchased!' or 'Insufficient credits'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBalance(res.data.credit_balance || 0);
      } catch (err) {
        console.error("Failed to fetch user balance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleBuy = (id, price) => {
    if (balance >= price) {
      setBalance((prev) => prev - price);
      setPurchased((prev) => ({ ...prev, [id]: "Purchased!" }));
    } else {
      setPurchased((prev) => ({ ...prev, [id]: "Insufficient credits" }));
    }
  };

  return (
    <div className="marketplace-page">
      <section className="hero-panel" style={{ marginBottom: "2rem" }}>
        <p className="eyebrow">Marketplace</p>
        <h1>Trade credits for ecological impact.</h1>
        <p className="hero-copy">Select from curated projects to offset your carbon footprint.</p>
      </section>

      <div className="marketplace-container">
        <div className="balance-hero">
          <span className="balance-label">Your Balance</span>
          <div className="balance-value">
            {loading ? "..." : balance.toLocaleString()}
            <span className="balance-unit"> Credits</span>
          </div>
        </div>

        <div className="listings-grid">
          {LISTINGS.map((item) => (
            <div key={item.id} className="market-card">
              <div className="card-header">
                <span className={`tag tag-${item.type}`}>{item.type}</span>
                <span className="card-price">{item.credits_price} CC</span>
              </div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc">{item.description}</p>
              
              <div className="card-footer">
                {purchased[item.id] ? (
                  <span className={`purchase-feedback ${purchased[item.id] === "Purchased!" ? "success" : "error"}`}>
                    {purchased[item.id]}
                  </span>
                ) : (
                  <button 
                    className="buy-button"
                    onClick={() => handleBuy(item.id, item.credits_price)}
                    disabled={loading}
                  >
                    Buy Project
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .marketplace-page {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .marketplace-container {
            width: min(100%, 64rem);
            display: grid;
            gap: 3rem;
          }

          .balance-hero {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 3rem;
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(134, 239, 172, 0.03));
            border: 1px solid var(--surface-border);
            border-radius: 2rem;
            text-align: center;
          }

          .balance-label {
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: var(--accent);
            margin-bottom: 0.5rem;
          }

          .balance-value {
            font-family: "Syne", sans-serif;
            font-size: clamp(3rem, 8vw, 5rem);
            font-weight: 800;
            color: var(--primary);
            text-shadow: 0 0 40px rgba(34, 197, 94, 0.2);
          }

          .balance-unit {
            font-size: 1.2rem;
            font-weight: 400;
            opacity: 0.6;
            letter-spacing: 0;
          }

          .listings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
            gap: 1.5rem;
          }

          .market-card {
            padding: 2rem;
            background: rgba(17, 26, 17, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid var(--surface-border);
            border-radius: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
            transition: transform 200ms ease, border-color 200ms ease;
          }

          .market-card:hover {
            transform: translateY(-4px);
            border-color: var(--primary);
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .tag {
            padding: 0.4rem 0.8rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            background: rgba(34, 197, 94, 0.1);
            color: var(--accent);
          }

          .tag-solar { background: rgba(234, 179, 8, 0.1); color: #facc15; }
          .tag-compost { background: rgba(168, 85, 247, 0.1); color: #c084fc; }

          .card-price {
            font-weight: 800;
            color: var(--primary);
          }

          .card-title {
            margin: 0;
            font-family: "Syne", sans-serif;
            font-size: 1.4rem;
            line-height: 1.2;
          }

          .card-desc {
            margin: 0;
            font-size: 0.95rem;
            color: rgba(240, 253, 244, 0.6);
            line-height: 1.5;
          }

          .card-footer {
            margin-top: auto;
            padding-top: 1rem;
          }

          .buy-button {
            width: 100%;
            padding: 0.9rem;
            background: var(--primary);
            color: #071007;
            border: none;
            border-radius: 1rem;
            font-weight: 800;
            cursor: pointer;
            transition: all 200ms ease;
          }

          .buy-button:hover {
            filter: brightness(1.1);
            box-shadow: 0 8px 20px rgba(34, 197, 94, 0.2);
          }

          .buy-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .purchase-feedback {
            display: block;
            text-align: center;
            font-weight: 700;
            padding: 0.8rem;
            border-radius: 1rem;
          }

          .purchase-feedback.success {
            background: rgba(34, 197, 94, 0.1);
            color: var(--primary);
          }

          .purchase-feedback.error {
            background: rgba(248, 113, 113, 0.1);
            color: #f87171;
          }
        `}</style>
      </div>
    </div>
  );
}

export default MarketplacePage;

