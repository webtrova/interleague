"use client";

import { Match } from "@/types/tournament/matches";
import { motion } from "framer-motion";
import { TeamScore } from "@/components/tournament/TeamScore";
import { useState, useEffect } from "react";
import { Tournament } from "@/types/tournament"; // Import Tournament type

import { League } from "@/types/tournament";
import { leagueThemes } from "./leagueThemes";

interface MatchCardProps {
  match: Match;
  tournament: Tournament;
  tableNumber: number; // Table number for display (1-16)
  onScoreUpdate?: (
    matchId: string,
    team1Score: number,
    team2Score: number
  ) => void;
  isEditable?: boolean;
  selectedLeague: League;
}

export const MatchCard = ({
  match,
  tournament,
  tableNumber,
  onScoreUpdate,
  isEditable = true,
  selectedLeague
}: MatchCardProps) => {
  const getTeamLogoPath = (teamName: string) => {
    const fileName = teamName.replace(/ /g, "-").toLowerCase() + ".png";
    let folder = "/mlb-teams/";
    if (selectedLeague === League.NFL) folder = "/nfl-teams/";
    else if (selectedLeague === League.NBA) folder = "/nba-teams/";
    // Special case for NBA league logo
    if (selectedLeague === League.NBA && teamName.toLowerCase() === "nba") {
      return "/nba_logo.png";
    }
    return `${folder}${fileName}`;
  };

  const team1Logo = match.team1 ? getTeamLogoPath(match.team1.name) : "";
  const team2Logo = match.team2 ? getTeamLogoPath(match.team2.name) : "";
  const team1Name = match.team1 ? match.team1.name : "TBD";
  const team2Name = match.team2 ? match.team2.name : "TBD";
  const team1IsEliminated =
    match.team1 && tournament.eliminatedTeams.includes(match.team1);
  const team2IsEliminated =
    match.team2 && tournament.eliminatedTeams.includes(match.team2);

  const [localScore, setLocalScore] = useState({
    team1Score: match.score.team1Score,
    team2Score: match.score.team2Score
  });

  // Update local score when match score changes externally
  useEffect(() => {
    setLocalScore(match.score);
  }, [match.score]);

  const handleScoreChange = (team: 1 | 2, value: string) => {
    const score = Math.max(0, Math.min(200, parseInt(value) || 0));

    const newScore =
      team === 1
        ? { team1Score: score, team2Score: localScore.team2Score }
        : { team1Score: localScore.team1Score, team2Score: score };

    setLocalScore(newScore);
  };

  const handleSubmit = () => {
    onScoreUpdate?.(match.id, localScore.team1Score, localScore.team2Score);
  };
  const handleReset = () => {
    onScoreUpdate?.(match.id, 0, 0);
  };

  const isMatchActive = !match.isCompleted && isEditable;

  // Get theme based on selectedLeague
  const theme = leagueThemes[selectedLeague] || leagueThemes.default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isMatchActive ? 1.02 : 1 }}
      className={`w-full max-w-full rounded-2xl shadow-xl border-2 px-3 py-4 sm:px-6 sm:py-5 mb-4 font-poppins bg-gradient-to-br ${theme.bg} ${theme.border}`}
    >
      <div className="mb-2 flex justify-between items-center">
        {typeof tableNumber === "number" && (
          <>
            <span
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold shadow-md border-2 mr-2 ${theme.tableLabel}`}
              title={`Table ${tableNumber}`}
            >
              {tableNumber}
            </span>
            <span
              className={`text-xs font-bold tracking-wide uppercase px-2 py-1 rounded ${theme.tableLabel}`}
            >
              Table {tableNumber}
            </span>
          </>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <TeamScore
            team={
              match.team1 ?? { id: "tbd1", name: "TBD", city: "", losses: 0 }
            }
            score={localScore.team1Score}
            wins={match.team1?.wins ?? 0}
            losses={match.team1?.losses ?? 0}
            isWinner={match.winner === match.team1}
            isEliminated={!!team1IsEliminated}
            bracket={match.bracket}
            logo={team1Logo}
            selectedLeague={selectedLeague}
          />
          {isMatchActive && (
            <input
              type="number"
              min="0"
              max={200}
              value={localScore.team1Score}
              onChange={(e) => handleScoreChange(1, e.target.value)}
              className="absolute right-2 top-2 w-16 text-right border-2 border-[#a259f7] bg-black/10 text-black font-bold rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#a259f7]"
              placeholder="0"
            />
          )}
        </div>

        <div className="relative">
          <TeamScore
            team={
              match.team2 ?? { id: "tbd2", name: "TBD", city: "", losses: 0 }
            }
            score={localScore.team2Score}
            wins={match.team2?.wins ?? 0}
            losses={match.team2?.losses ?? 0}
            isWinner={match.winner === match.team2}
            isEliminated={!!team2IsEliminated}
            bracket={match.bracket}
            logo={team2Logo}
            selectedLeague={selectedLeague}
          />
          {isMatchActive && (
            <input
              type="number"
              min="0"
              max={200}
              value={localScore.team2Score}
              onChange={(e) => handleScoreChange(2, e.target.value)}
              className="absolute right-2 top-2 w-16 text-right border-2 border-[#a259f7] bg-black/10 text-black font-bold rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#a259f7]"
              placeholder="0"
            />
          )}
        </div>
        {isMatchActive && (
          <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
            <button
              onClick={handleSubmit}
              className={`w-full sm:w-1/2 py-2 rounded-lg shadow transition ${leagueThemes[selectedLeague].button} ${leagueThemes[selectedLeague].buttonHover}`}
            >
              Submit
            </button>
            <button
              onClick={handleReset}
              className={`w-full sm:w-1/2 py-2 rounded-lg shadow transition ${leagueThemes[selectedLeague].button} ${leagueThemes[selectedLeague].buttonHover}`}
            >
              Reset
            </button>
          </div>
        )}

        {match.isCompleted && match.winner && (
          <>
            {match.bracket === "championship" ? (
              match.requiresRematch ? (
                <div className="font-bold text-lg text-white mt-3 text-center py-2 rounded-lg bg-yellow-100 text-yellow-800 font-semibold text-sm">
                  Championship rematch required!
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                  className={`relative mt-6 text-center py-6 rounded-xl overflow-hidden font-semibold`}
                >
                  {/* Background gradient with shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>
                  <div className="absolute inset-0 bg-[url('/trophy-pattern.png')] opacity-10 bg-repeat"></div>

                  {/* Animated confetti */}
                  <div className="absolute top-2 left-4 text-3xl animate-bounce-slow delay-100">
                    🎉
                  </div>
                  <div className="absolute top-2 right-4 text-3xl animate-bounce-slow delay-300">
                    🎊
                  </div>
                  <div className="absolute bottom-2 left-10 text-2xl animate-bounce delay-200">
                    🎉
                  </div>
                  <div className="absolute bottom-2 right-10 text-2xl animate-bounce delay-400">
                    🎊
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
                    {/* Trophy with glow effect */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-yellow-400 blur-md transform scale-110 opacity-70"></div>
                      <span className="relative text-6xl drop-shadow-lg animate-pulse-slow">
                        🏆
                      </span>
                    </div>

                    {/* Champion name with ribbon effect */}
                    <div className="relative mt-2 mb-1">
                      <h2 className="text-white text-2xl font-bold tracking-wide">
                        {match.winner.name}
                      </h2>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                    </div>

                    {/* Championship banner */}
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-6 py-1.5 rounded-full font-bold tracking-wider uppercase text-sm shadow-lg">
                      Tournament Champion
                    </div>

                    {/* Final score display */}
                    <div className="mt-2 text-white text-sm">
                      Final Score: {match.score.team1Score} -{" "}
                      {match.score.team2Score}
                    </div>

                    {/* Runner-up mention */}
                    {match.loser && (
                      <div className="text-gray-200 text-sm mt-1">
                        Runner-up: {match.loser.name}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`font-bold text-lg mt-3 text-center py-2 rounded-lg text-sm font-medium ${
                  match.bracket === "winners"
                    ? theme.winner
                    : match.bracket === "losers"
                    ? theme.loser
                    : theme.championship
                }`}
              >
                {match.winner.name} Wins!
                {match.loser &&
                  tournament.eliminatedTeams.includes(match.loser) && (
                    <div className="font-bold text-lg text-red-600 mt-1 font-semibold">
                      {match.loser.name} Eliminated
                    </div>
                  )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};
