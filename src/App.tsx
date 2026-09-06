import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabaseClient";
import * as usersApi from "./lib/usersApi";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [disabledMessage, setDisabledMessage] = useState<string | null>(null);
  const [checkedAccessToken, setCheckedAccessToken] = useState<string | null>(
    null
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // A disabled account's session token can still technically be valid, so
  // this catches it client-side on top of the real enforcement (RLS, via
  // is_active_user()) and signs them straight back out.
  useEffect(() => {
    if (!session) return;

    usersApi
      .fetchMyProfile(session.user.id)
      .then((profile) => {
        if (profile.isDisabled) {
          setDisabledMessage(
            "Your account has been disabled. Contact an administrator."
          );
          supabase.auth.signOut();
        } else {
          setDisabledMessage(null);
        }
      })
      .catch(() => setDisabledMessage(null))
      .finally(() => setCheckedAccessToken(session.access_token));
  }, [session]);

  const isCheckingAccess = !!session && checkedAccessToken !== session.access_token;

  if (isLoading || isCheckingAccess) {
    return <div className="app-container" />;
  }

  if (disabledMessage) {
    return (
      <div className="app-container">
        <header className="header">
          <h1>Live Event Production Reminder</h1>
        </header>
        <main className="login-page">
          <p className="error-message">{disabledMessage}</p>
        </main>
      </div>
    );
  }

  return session ? <Dashboard session={session} /> : <LoginPage />;
}

export default App;
