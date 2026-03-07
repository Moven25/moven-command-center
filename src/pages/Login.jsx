import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    // If user was sent here from a protected page, go back there after login
    return location.state?.from?.pathname || "/mission-control";
  }, [location.state]);

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        setMsg("✅ Account created. Check your email to confirm (if confirmations are enabled).");
        // Many projects auto-login after signUp; if yours does, you can navigate:
        // navigate(redirectTo, { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setMsg(`❌ ${err.message || "Login error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-header">
          <div className="login-title">LaneSync</div>
          <div className="login-subtitle">
            {mode === "signin" ? "Sign in to Sync OS" : "Create your account"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Email
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </label>

          <label className="login-label">
            Password
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </label>

          {msg ? <div className="login-msg">{msg}</div> : null}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Working…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          <button
            className="login-link"
            type="button"
            onClick={() => {
              setMsg("");
              setMode(mode === "signin" ? "signup" : "signin");
            }}
          >
            {mode === "signin"
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}