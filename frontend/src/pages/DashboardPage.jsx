import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchDashboardData() {
      try {
        const [userRes, activitiesRes] = await Promise.all([
          api.get("/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/activities/my", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userRes.data);
        setActivities(activitiesRes.data);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
        setError("Failed to synchronize with the botanical network. Please try again.");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [navigate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <section className="hero-panel loading-state">
        <div className="pulse-orb"></div>
        <p className="eyebrow">Syncing...</p>
        <h2 style={{ fontFamily: "Syne", fontSize: "2.5rem" }}>Harvesting Data</h2>
      </section>
    );
  }

  if (error && !user) {
    return (
      <section className="hero-panel">
        <p className="eyebrow" style={{ color: "#f87171" }}>Connection Error</p>
        <h1>Interrupted.</h1>
        <p className="hero-copy">{error}</p>
        <button 
          className="reset-btn" 
          onClick={() => window.location.reload()}
          style={{ marginTop: "2rem" }}
        >
          RETRY SYNC
        </button>
      </section>
    );
  }

  return (
    <div className="dashboard-container" style={{ width: "100%", maxWidth: "64rem" }}>
      {/* MONOLITHIC BALANCE SECTION */}
      <section className="hero-panel" style={{ marginBottom: "2rem", textAlign: "center" }}>
        <p className="eyebrow">Verified Contribution</p>
        <h1 style={{ marginBottom: "1rem" }}>{user?.username}'s Vault</h1>
        
        <div className="credit-display">
          <span className="credit-value">{user?.credit_balance || 0}</span>
          <span className="credit-unit">VERDANT CREDITS</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1rem" }}>
          <div className="stat-badge">
            <span className="stat-label">REPUTATION</span>
            <span className="stat-value">{user?.reputation_score || 0}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">IMPACT TIER</span>
            <span className="stat-value">{(user?.reputation_score || 0) > 100 ? "PRIMORDIAL" : "SAPLING"}</span>
          </div>
        </div>
      </section>

      {/* ACTIVITY HISTORY SECTION */}
      <section className="hero-panel" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2rem", borderBottom: "1px solid var(--surface-border)", paddingBottom: "1rem" }}>
          <h2 style={{ margin: 0, fontFamily: "Syne", fontSize: "2rem" }}>Activity Log</h2>
          <span className="eyebrow" style={{ opacity: 0.6 }}>{activities.length} Recorded Events</span>
        </div>

        {activities.length === 0 ? (
          <div style={{ padding: "4rem 0", textAlign: "center", opacity: 0.5 }}>
            <p className="hero-copy">No growth detected in this cycle.</p>
            <button className="nav-link" onClick={() => navigate("/submit")} style={{ marginTop: "1rem", border: "1px solid var(--surface-border)" }}>
              INITIATE FIRST SUBMISSION
            </button>
          </div>
        ) : (
          <div className="activity-grid" style={{ display: "grid", gap: "1rem" }}>
            {activities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-main">
                  <div className="activity-info">
                    <span className="activity-type">{activity.activity_type.toUpperCase()}</span>
                    <span className="activity-date">{new Date(activity.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="activity-amount">
                    <span className="amount-value">+{activity.credits_earned}</span>
                    <span className="amount-unit">VC</span>
                  </div>
                </div>

                <div className="activity-footer">
                  <div className={`status-pill status-${activity.status.toLowerCase()}`}>
                    {activity.status.toUpperCase()}
                  </div>
                  <div className="tx-snippet">
                    <span className="tx-label">TX:</span>
                    <code title={activity.tx_hash}>{activity.tx_hash.slice(0, 10)}...{activity.tx_hash.slice(-4)}</code>
                    <button className="copy-btn-small" onClick={() => copyToClipboard(activity.tx_hash)}>
                      ⎘
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .stat-badge {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .stat-label {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: var(--accent);
          opacity: 0.8;
        }
        .stat-value {
          font-family: "Syne", sans-serif;
          font-size: 1.5rem;
          color: var(--text);
        }
        .activity-card {
          background: rgba(240, 253, 244, 0.03);
          border: 1px solid var(--surface-border);
          border-radius: 1rem;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 200ms ease, background 200ms ease;
        }
        .activity-card:hover {
          background: rgba(240, 253, 244, 0.05);
          transform: translateX(4px);
          border-color: var(--primary);
        }
        .activity-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .activity-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .activity-type {
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 0.02em;
          color: var(--accent);
        }
        .activity-date {
          font-size: 0.85rem;
          opacity: 0.5;
        }
        .activity-amount {
          text-align: right;
        }
        .amount-value {
          font-family: "Syne", sans-serif;
          font-size: 1.5rem;
          color: var(--primary);
          display: block;
        }
        .amount-unit {
          font-size: 0.7rem;
          font-weight: 800;
          opacity: 0.4;
          letter-spacing: 0.1em;
        }
        .activity-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.8rem;
          border-top: 1px solid rgba(134, 239, 172, 0.05);
        }
        .status-pill {
          font-size: 0.7rem;
          font-weight: 900;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }
        .status-completed {
          background: rgba(34, 197, 94, 0.15);
          color: var(--primary);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .status-pending {
          background: rgba(234, 179, 8, 0.15);
          color: #facc15;
          border: 1px solid rgba(234, 179, 8, 0.2);
        }
        .tx-snippet {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: monospace;
          font-size: 0.8rem;
          background: rgba(0,0,0,0.3);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .tx-label {
          opacity: 0.3;
        }
        .copy-btn-small {
          background: none;
          border: none;
          color: var(--accent);
          cursor: pointer;
          font-size: 1rem;
          opacity: 0.6;
          transition: opacity 200ms;
        }
        .copy-btn-small:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;
