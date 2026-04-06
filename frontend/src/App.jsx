import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { healthCheck } from "./api";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MarketplacePage from "./pages/MarketplacePage";
import SignupPage from "./pages/SignupPage";
import SubmitPage from "./pages/SubmitPage";

function App() {
  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const result = await healthCheck();
        console.log(result);
      } catch (error) {
        console.error("Health check failed", error);
      }
    }

    checkBackendHealth();
  }, []);

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" aria-hidden="true" />
      <div className="ambient ambient-right" aria-hidden="true" />
      <Navbar />
      <main className="page-frame">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
