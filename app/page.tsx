"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Carousel from "@/components/Carousel"; // Implemented separately!
import HeroSection from "@/components/HeroSection";

const Home = () => {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-brand-blue via-blue-100 to-brand-red">
      {/* NAVIGATION */}

      {/* HERO SECTION */}
      <div>
        <HeroSection />
      
      </div>

      {/* CAROUSEL SECTION */}
      <section id="teams" className="w-full py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#000]  mb-4 flex items-center justify-center gap-2">
            Meet the Teams 
          </h2>
          <Carousel /> {/* Implemented below */}
        </div>
      </section>
    </div>
  );
};

export default Home;
