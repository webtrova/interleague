"use client";

import type { Team } from "@/types/tournament/mlb-teams";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { League } from "@/types/tournament";

interface TeamScoreProps {
  team: Team;
  score: number;
  wins?: number;
  losses?: number;
  isWinner?: boolean;
  isEliminated?: boolean;
  bracket?: "winners" | "losers" | "championship";
  logo?: string;
  selectedLeague?: League;
}

export const TeamScore = ({
  team,
  score,
  wins = 0,
  losses = 0,
  isWinner,
  isEliminated,
  bracket = "winners",
  logo,
  selectedLeague
}: TeamScoreProps) => {
  const getBracketColors = () => {
    switch (bracket) {
      case "winners":
        return "bg-blue-50 border-blue-200";
      case "losers":
        return "bg-red-50 border-red-200";
      case "championship":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-100";
    }
  };

  const getStatusColors = () => {
    if (isEliminated) return "text-red-600 font-semibold";
    if (isWinner) {
      switch (bracket) {
        case "winners":
          return "text-blue-700 font-semibold";
        case "losers":
          return "text-red-700 font-semibold";
        case "championship":
          return "text-purple-700 font-semibold";
        default:
          return "text-gray-700 font-semibold";
      }
    }
    return "text-gray-600";
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border flex items-center gap-3 transition-colors",
        getBracketColors(),
        isEliminated && "opacity-75"
      )}
    >
      {/* Team Logo */}
      <div className="w-10 h-10 flex-shrink-0 relative">
        {logo ? (
          <Image
            src={logo}
            alt={team.name}
            fill
            className="object-contain"
            priority
          />
        ) : (
          <span className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
            ?
          </span>
        )}
      </div>
      {/* Team Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate text-gray-900">
            {team.city} {team.name}
          </p>
          {isWinner && (
            <span className="flex-shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
  <p className="text-sm text-gray-500">
    Wins: {wins} | Losses: {losses}
  </p>
  {score > 0 && (
    <p className="text-sm font-medium text-black">
      {score} pts
    </p>
  )}
</div>
      </div>
    </div>
  );
};
