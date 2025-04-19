"use client";
import { useState } from "react";
import Image from "next/image";

const APP_LOGO = "/BDC_logo.svg"; // You can swap this for a more general app logo if desired
const LOCAL_STORAGE_KEY = "tourneyV5_auth";
const VALID_USER = "BDC";
const VALID_PASS = "Godfirst";

export default function SplashAuth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (user === VALID_USER && pass === VALID_PASS) {
        localStorage.setItem(LOCAL_STORAGE_KEY, "authenticated");
        setError("");
        onAuthSuccess();
      } else {
        setError("Invalid username or password. Try again!");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#a259f7] via-black to-[#a259f7] animate-fade-in">
      <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6 min-w-[320px] max-w-xs">
        <Image
          src={APP_LOGO}
          alt="App Logo"
          width={120}
          height={120}
          className="rounded-2xl animate-bounce bg-transparent"
        />
        <h1 className="text-3xl font-extrabold text-purple-800 tracking-tight drop-shadow mb-2 text-center">
          Welcome to BDC-Tourney
        </h1>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            autoFocus
            className="px-4 py-2 rounded-xl border-2 border-[#1d428a] focus:ring-2 focus:ring-[#c8102e] text-lg outline-none transition"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 rounded-xl border-2 border-[#1d428a] focus:ring-2 focus:ring-[#c8102e] text-lg outline-none transition"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full py-2 rounded-xl font-bold text-lg bg-purple-800 text-white shadow hover:bg-[#c8102e] transition"
            disabled={loading}
          >
            {loading ? "Checking..." : "Enter Tournament"}
          </button>
        </form>
        {error && (
          <div className="text-red-600 font-semibold text-center animate-shake">
            {error}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2 text-center">
          Private access only. Please contact the administrator if you need
          credentials.
        </div>
      </div>
    </div>
  );
}
