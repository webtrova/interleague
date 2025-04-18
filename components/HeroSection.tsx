"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const HeroSection: React.FC = () => {
  return (
 
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black-600 to-black-800 relative">
        {/* Optional: Background image/texture */}
        <img
          src="/95.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
        />

        <div className="container mx-auto flex flex-col items-center text-center px-4">
  <img
    src="/BDC_logo.svg"
    alt="Logo"
    className="w-40 h-40 mb-6 drop-shadow-lg"
  />
  <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow">
    Bergenfield Dominoes Club{" "}
    <span className="text-purple-800 shadow-lg">Tourney</span>
  </h1>
  <p className="text-lg text-gray-100 mb-8 max-w-xl">
    Manage, compete, and track your tournaments with ease. Create an
    account or login to get started!
  </p>
  <div className="flex gap-4">
    <a
      href="/register"
      className="px-6 py-3 bg-secondary text-white font-bold rounded-lg shadow-lg hover:bg-secondary-foreground hover:text-secondary transition border-2 border-secondary"
    >
      Get Started
    </a>
    <a
      href="/login"
      className="px-6 py-3 bg-black text-secondary font-bold rounded-lg shadow-lg border-2 border-secondary hover:bg-secondary hover:text-white transition"
    >
      Login
    </a>
  </div>
</div>
      </main>
  
  );
};





export default HeroSection;