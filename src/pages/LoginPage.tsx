import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function LoginPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    const { error } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === "sign-up") {
      setInfo("Check your email to confirm your account, then sign in.");
    }
  }

  function toggleMode() {
    setMode(mode === "sign-in" ? "sign-up" : "sign-in");
    setError(null);
    setInfo(null);
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Live Event Production Reminder</h1>
      </header>

      <main className="login-page">
        <form className="create-form login-form" onSubmit={handleSubmit}>
          <h2>{mode === "sign-in" ? "Sign In" : "Sign Up"}</h2>

          {error && <p className="error-message">{error}</p>}
          {info && <p className="info-message">{info}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {mode === "sign-in" ? "Login" : "Create Account"}
          </button>

          <button className="secondary-button" type="button" onClick={toggleMode}>
            {mode === "sign-in"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </form>

        <p className="live-clock">
          {now.toLocaleDateString()} · {now.toLocaleTimeString()}
        </p>
      </main>
    </div>
  );
}

export default LoginPage;
