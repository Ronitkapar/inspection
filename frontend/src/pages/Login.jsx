import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(formData.email, formData.password);
      localStorage.setItem("token", data.access_token);
      navigate("/dashboard");
    } catch (requestError) {
      const message =
        requestError?.response?.data?.detail ||
        requestError?.response?.data?.message ||
        "Login failed. Check your email and password.";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-orb auth-orb-left" aria-hidden="true" />
      <div className="auth-orb auth-orb-right" aria-hidden="true" />

      <div className="auth-card">
        <aside className="auth-aside">
          <p className="auth-kicker">Protected access</p>
          <h1>Log in to the canopy.</h1>
          <p className="auth-aside-copy">
            Return to your dashboard, keep your token in the root, and continue
            where your last session left off.
          </p>

          <div className="auth-ornament" aria-hidden="true">
            <span className="auth-ornament-stem" />
            <span className="auth-ornament-leaf auth-ornament-leaf-top" />
            <span className="auth-ornament-leaf auth-ornament-leaf-bottom" />
          </div>
        </aside>

        <div className="auth-panel">
          <div className="auth-panel-head">
            <p className="auth-kicker">Welcome back</p>
            <h2>Enter your details.</h2>
            <p className="auth-copy">
              Use the email and password tied to your account.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="t@t.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Need an account? <Link to="/signup">Create one here</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
