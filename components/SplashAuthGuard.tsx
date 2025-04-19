"use client";
import { useEffect, useState } from "react";
import SplashAuth from "./SplashAuth";

const LOCAL_STORAGE_KEY = "tourneyV5_auth";

export default function SplashAuthGuard({
  children
}: {
  children: React.ReactNode;
}) {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthed =
        localStorage.getItem(LOCAL_STORAGE_KEY) === "authenticated";
      setAuthed(isAuthed);
      setChecked(true);
    }
  }, []);

  if (!checked) return null; // Prevents flicker
  if (!authed) {
    return <SplashAuth onAuthSuccess={() => setAuthed(true)} />;
  }
  return <>{children}</>;
}
