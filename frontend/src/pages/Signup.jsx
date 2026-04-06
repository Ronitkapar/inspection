import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
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
      await signup(formData.username, formData.email, formData.password);
      navigate("/login");
    } catch (requestError) {
      console.error("Signup error:", requestError);
      const message =
        requestError?.response?.data?.detail ||
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Signup failed. Please try again.";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page auth-page-signup">
      <div className="auth-orb auth-orb-left" aria-hidden="true" />
      <div className="auth-orb auth-orb-right" aria-hidden="true" />

      <div className="auth-card auth-card-reverse">
        <aside className="auth-aside">
          <p className="auth-kicker">New growth</p>
          <h1>Plant your profile in the archive.</h1>
          <p className="auth-aside-copy">
            Create an account, set your handle, and step into the forest of
            saved credits, reputation, and future uploads.
          </p>

          <div className="auth-ornament auth-ornament-signup" aria-hidden="true">
            <span className="auth-ornament-stem" />
            <span className="auth-ornament-leaf auth-ornament-leaf-top" />
            <span className="auth-ornament-leaf auth-ornament-leaf-mid" />
          </div>
        </aside>

        <div className="auth-panel">
          <div className="auth-panel-head">
            <p className="auth-kicker">Create account</p>
            <h2>Join the greenhouse.</h2>
            <p className="auth-copy">
              Choose a username, add your email, and set a password.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="test"
                autoComplete="username"
                required
              />
            </label>

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
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
            </label>

            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in instead</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Signup;
