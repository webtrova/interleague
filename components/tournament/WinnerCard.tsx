import React from "react";
import { League } from "@/types/tournament";
import type { Team } from "@/types/tournament/mlb-teams";

export function WinnerCard({ winner, selectedLeague }: { winner: Team, selectedLeague: League }) {
  if (!winner) return null;
  const fileName = winner.name.replace(/ /g, "-") + ".png";
  const logoPath = selectedLeague === League.MLB ? `/mlb-teams/${fileName}` : `/nfl-teams/${fileName}`;
  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-2xl border-4 border-transparent champion-gradient animate-fade-in" style={{
      borderImage: 'linear-gradient(135deg, #FFD700 0%, #FFB300 100%) 1',
      margin: '2em auto',
      minHeight: 340
    }}>
      {/* Confetti (simple emoji version for now) */}
      <div className="absolute top-4 left-4 text-3xl select-none pointer-events-none animate-bounce-slow">🎉</div>
      <div className="absolute top-4 right-4 text-3xl select-none pointer-events-none animate-bounce-slow">🎊</div>
      <div className="absolute bottom-4 left-10 text-2xl select-none pointer-events-none animate-bounce">🎉</div>
      <div className="absolute bottom-4 right-10 text-2xl select-none pointer-events-none animate-bounce">🎊</div>

      {/* Trophy Icon */}
      <div className="flex items-center justify-center mb-4">
        <span role="img" aria-label="Trophy" className="text-6xl drop-shadow-lg animate-trophy">🏆</span>
      </div>
      {/* Champion Logo */}
      <div className="w-32 h-32 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center shadow-lg mb-4 overflow-hidden">
        <img
          src={logoPath}
          alt={winner.name}
          className="object-contain w-28 h-28"
          style={{ maxHeight: 112 }}
        />
      </div>
      {/* Champion Name */}
      <div className="text-4xl font-extrabold text-yellow-700 drop-shadow mb-2 flex items-center justify-center">
        {winner.name}
      </div>
      {/* Banner Ribbon */}
      <div className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-lg font-bold rounded-full shadow-lg tracking-widest uppercase mb-1 animate-pulse">
        Champion!
      </div>
      {/* Subtext */}
      <div className="text-lg text-yellow-700 font-medium mt-2">Congratulations to the {winner.name}!</div>
    </div>
  );

}
