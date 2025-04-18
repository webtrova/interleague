"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

// List your team images here or auto-import them if you want
const teamImages = [
  "/mlb-teams/yankees.png",
  "/mlb-teams/red-sox.png",
  "/mlb-teams/dodgers.png",
  "/mlb-teams/cubs.png",
  "/mlb-teams/mets.png",
  "/mlb-teams/padres.png",
  "/mlb-teams/pirates.png",
  "/mlb-teams/orioles.png"
  // Add more as needed
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % teamImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold text-brand-purple mb-4 text-center">Tournament Teams</h2>
      <div className="relative w-full max-w-3xl mx-auto aspect-video overflow-hidden rounded-xl shadow-lg bg-gray-50">
        {teamImages.map((src, idx) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="flex justify-center items-center w-full h-full">
              <Image
                src={src}
                alt={`Team ${idx + 1}`}
                width={220}
                height={110}
                className="object-contain"
                priority={idx === 0}
              />
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {teamImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full ${
                idx === current ? "bg-brand-purple" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

