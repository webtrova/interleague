"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="mb-4 items-center justify-center">
      <div>
        {/* Logo */}
        <Image
          src="/BDC_logo.svg" // Put your logo in /public/logo.png
          alt="Logo"
          width={94}
          height={94}
          className="mb-4"
        />
        <h2 className="text-3xl font-extrabold mb-2 text-red-700">
          Welcome Back
        </h2>
        <p className="mb-6 text-gray-500">Sign in to your account</p>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={handleLogin} className="w-full">
          <input
            type="email"
            className="w-full mb-4 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full mb-2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-between items-center mb-6">
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </a>
            <a
              href="/register"
              className="text-sm text-blue-500 hover:underline"
            >
              Register
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}