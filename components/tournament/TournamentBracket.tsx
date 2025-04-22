"use client";

import { Tournament, Match } from "@/types/tournament";
import { motion, AnimatePresence } from "framer-motion";
import { MatchCard } from "./MatchCard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { WinnerCard } from "@/components/tournament/WinnerCard";

import { League } from "@/types/tournament";

interface TournamentBracketProps {
  tournament: Tournament;
  onMatchUpdate?: (match: Match) => void;
  selectedLeague: League;
  onResetCurrentRound?: () => void;
}

export const TournamentBracket = ({
  tournament,
  onMatchUpdate,
  selectedLeague,
  onResetCurrentRound
}: TournamentBracketProps) => {
  const [selectedRound, setSelectedRound] = useState(tournament.currentRound);
  const [followCurrentRound, setFollowCurrentRound] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedRound]);

  useEffect(() => {
    // Only auto-advance if following the current round
    if (!followCurrentRound) return;

    const currentRoundData = tournament.rounds.find(
      (round) => round.roundNumber === selectedRound
    );

    if (currentRoundData) {
      const allMatchesCompleted = currentRoundData.matches.every(
        (match) => match.isCompleted
      );

      if (allMatchesCompleted) {
        const nextRoundNumber = selectedRound + 1;
        if (
          tournament.rounds.some(
            (round) => round.roundNumber === nextRoundNumber
          )
        ) {
          setSelectedRound(nextRoundNumber);
        }
      }
    }
  }, [selectedRound, tournament.rounds, followCurrentRound]);

  const handleScoreUpdate = useCallback(
    (matchId: string, team1Score: number, team2Score: number) => {
      const round = tournament.rounds.find((r) =>
        r.matches.some((m) => m.id === matchId)
      );
      if (!round) return;

      const match = round.matches.find((m) => m.id === matchId);
      if (!match) return;

      onMatchUpdate?.({
        ...match,
        score: { team1Score, team2Score }
      });
    },
    [tournament, onMatchUpdate]
  );

  // Get all rounds with their matches
  const rounds = useMemo(() => {
    return tournament.rounds.map((round) => {
      const winners = round.matches.filter((m) => m.bracket === "winners").sort((a, b) => {
        if (a.team2 === null && b.team2 !== null) return -1;
        if (a.team2 !== null && b.team2 === null) return 1;
        return 0;
      });
      const losers = round.matches.filter((m) => m.bracket === "losers").sort((a, b) => {
        if (a.team2 === null && b.team2 !== null) return -1;
        if (a.team2 !== null && b.team2 === null) return 1;
        return 0;
      });
      const championship = round.matches.filter(
        (m) => m.bracket === "championship"
      );
      return {
        roundNumber: round.roundNumber,
        winners,
        losers,
        championship,
        isDoubleElimination: round.isDoubleElimination,
        isChampionshipRound: round.isChampionshipRound
      };
    });
  }, [tournament.rounds]);

  // Handle round tab click
  const handleRoundTabClick = (roundNumber: number) => {
    setSelectedRound(roundNumber);
    setFollowCurrentRound(roundNumber === tournament.currentRound);
  };

  // Helper: Assign table numbers for winners, losers, and championship in a round
const getRoundTableNumbers = (winners: any[], losers: any[], championship: any[]) => {
  const tableNumbers: Record<string, number | null> = {};
  const maxTables = 16;
  let tableCounter = 1;

  // Helper to check if both teams are present (not TBD)
  const isPlayable = (match: any) => match.team1 && match.team2 && match.team1.name !== 'TBD' && match.team2.name !== 'TBD';

  // Winners bracket tables
  winners.forEach((match) => {
    if (isPlayable(match) && tableCounter <= maxTables) {
      tableNumbers[match.id] = tableCounter++;
    } else {
      tableNumbers[match.id] = null;
    }
  });
  // Losers bracket tables
  losers.forEach((match) => {
    if (isPlayable(match) && tableCounter <= maxTables) {
      tableNumbers[match.id] = tableCounter++;
    } else {
      tableNumbers[match.id] = null;
    }
  });
  // Championship
  championship.forEach((match) => {
    if (isPlayable(match) && tableCounter <= maxTables) {
      tableNumbers[match.id] = tableCounter++;
    } else {
      tableNumbers[match.id] = null;
    }
  });
  return tableNumbers;
};

return (
    <div className="w-full">
      {/* Reset Tournament & Reset Current Round Buttons */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 transition-colors font-semibold"
          onClick={() => {
            if (typeof (window as any).onResetRound === 'function') {
              (window as any).onResetRound();
            } else {
              window.location.reload();
            }
          }}
        >
          Reset Tournament
        </button>
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-colors font-semibold"
          onClick={() => {
            if (onResetCurrentRound) {
              onResetCurrentRound();
            }
          }}
        >
          Reset Current Round
        </button>
      </div>

      {/* Scroll to top after round/tab change */}
      
      {/* Round Tabs */}
      <div className="mb-8 border-b">
        <div className="flex overflow-x-auto">
          {rounds.map((round) => (
            <button
              key={round.roundNumber}
              onClick={() => handleRoundTabClick(round.roundNumber)}
              className={cn(
                "px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                selectedRound === round.roundNumber
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {round.isChampionshipRound
                ? "Championship"
                : `Round ${round.roundNumber}`}
            </button>
          ))}
        </div>
      </div>

      {/* Round Content */}
      <AnimatePresence mode="wait">
        {rounds.map(
          (round) =>
            round.roundNumber === selectedRound && (
              <motion.div
                key={round.roundNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Championship Matches */}
                {round.championship.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      Championship Match
                      {round.championship[0].requiresRematch && (
                        <span className="ml-3 text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                          Rematch Required
                        </span>
                      )}
                    </h3>
                    <div className="flex justify-center">
                      <div className="w-[400px]">
                        {(() => {
  const tableNumbers = getRoundTableNumbers(round.winners, round.losers, round.championship);
  return round.championship.map((match) => (
    <MatchCard
      key={match.id}
      match={match}
      tournament={tournament}
      tableNumber={tableNumbers[match.id]}
      onScoreUpdate={handleScoreUpdate}
      isEditable={!match.isCompleted}
      selectedLeague={selectedLeague}
    />
  ));
})()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Winners Bracket */}
                {round.winners.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                      Winners Bracket
                      <span className="ml-3 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {round.winners.length} Matches
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(() => {
  const tableNumbers = getRoundTableNumbers(round.winners, round.losers, round.championship);
  return round.winners.map((match) => (
    <MatchCard
      key={match.id}
      match={match}
      tournament={tournament}
      tableNumber={tableNumbers[match.id]}
      onScoreUpdate={handleScoreUpdate}
      isEditable={!match.isCompleted}
      selectedLeague={selectedLeague}
    />
  ));
})()}
                    </div>
                  </div>
                )}

                {/* Losers Bracket */}
                {round.losers.length > 0 && (
                  <div className="pt-8 border-t">
                    <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
                      Losers Bracket
                      <span className="ml-3 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
                        {round.losers.length} Matches
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(() => {
  const tableNumbers = getRoundTableNumbers(round.winners, round.losers, round.championship);
  return round.losers.map((match) => (
    <MatchCard
      key={match.id}
      match={match}
      tournament={tournament}
      tableNumber={tableNumbers[match.id]}
      onScoreUpdate={handleScoreUpdate}
      isEditable={!match.isCompleted}
      selectedLeague={selectedLeague}
    />
  ));
})()}
                    </div>
                  </div>
                )}

                {/* Eliminated Teams */}
                {tournament.eliminatedTeams.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
                      <span>Eliminated Teams</span>
                      <span className="ml-3 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
                        {tournament.eliminatedTeams.length} Teams
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {tournament.eliminatedTeams.map((team) => (
                        <div
                          key={team.id}
                          className="bg-red-50 border border-red-200 rounded-lg p-4"
                        >
                          <div className="flex items-center space-x-3">
                            {team.logo && (
                              <div className="w-8 h-8 relative">
                                <Image
                                  src={team.logo}
                                  alt={team.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-red-700">
                                {team.name}
                              </div>
                              <div className="text-xs text-red-600">
                                {team.losses} Losses
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Round Summary */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {round.isChampionshipRound
                      ? "Championship"
                      : `Round ${round.roundNumber}`}{" "}
                    Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Winners Bracket:</p>
                      <p className="font-medium">
                        {round.winners.length} matches
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Losers Bracket:</p>
                      <p className="font-medium">
                        {round.losers.length} matches
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Championship:</p>
                      <p className="font-medium">
                        {round.championship.length} matches
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Tournament Progress
      <div className="mt-8 pt-8 border-t">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Tournament Progress
          </h3>
          <span className="text-sm text-gray-500">
            {tournament.eliminatedTeams.length} Teams Eliminated
          </span>
        </div>
        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{
              width: `${
                (tournament.eliminatedTeams.length /
                  (tournament.rounds[0].matches.length * 2)) *
                100
              }%`
            }}
          />
        </div>
      </div>
      */}

      {/* Tournament Winner */}
      {tournament.winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-2">Tournament Champion</h3>
          <p className="text-xl">
            {tournament.winner.city} {tournament.winner.name}
          </p>
        </motion.div>
      )}
    </div>
  );
};

// "use client";

// import { Tournament, Match } from "@/types/tournament";
// import { motion, AnimatePresence } from "framer-motion";
// import { MatchCard } from "./MatchCard";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { cn } from "@/lib/utils";
// import Image from "next/image";

// import { WinnerCard } from "@/components/tournament/WinnerCard";
// interface TournamentBracketProps {
//   tournament: Tournament;
//   onMatchUpdate?: (match: Match) => void;
// }

// export const TournamentBracket = ({
//   tournament,
//   onMatchUpdate
// }: TournamentBracketProps) => {
//   const [selectedRound, setSelectedRound] = useState(tournament.currentRound);

//   useEffect(() => {
//     const currentRoundData = tournament.rounds.find(
//       (round) => round.roundNumber === selectedRound
//     );

//     if (currentRoundData) {
//       const allMatchesCompleted = currentRoundData.matches.every(
//         (match) => match.isCompleted
//       );

//       if (allMatchesCompleted) {
//         const nextRoundNumber = selectedRound + 1;
//         if (tournament.rounds.some((round) => round.roundNumber === nextRoundNumber)) {
//           setSelectedRound(nextRoundNumber);
//         }
//       }
//     }
//   }, [selectedRound, tournament.rounds]);

//   const handleScoreUpdate = useCallback(
//     (matchId: string, team1Score: number, team2Score: number) => {
//       const round = tournament.rounds.find((r) =>
//         r.matches.some((m) => m.id === matchId)
//       );
//       if (!round) return;

//       const match = round.matches.find((m) => m.id === matchId);
//       if (!match) return;

//       onMatchUpdate?.({
//         ...match,
//         score: { team1Score, team2Score }
//       });
//     },
//     [tournament, onMatchUpdate]
//   );

//   // Get all rounds with their matches
//   const rounds = useMemo(() => {
//     return tournament.rounds.map((round) => {
//       const winners = round.matches.filter((m) => m.bracket === "winners");
//       const losers = round.matches.filter((m) => m.bracket === "losers");
//       const championship = round.matches.filter(
//         (m) => m.bracket === "championship"
//       );
//       return {
//         roundNumber: round.roundNumber,
//         winners,
//         losers,
//         championship,
//         isDoubleElimination: round.isDoubleElimination,
//         isChampionshipRound: round.isChampionshipRound
//       };
//     });
//   }, [tournament.rounds]);

//   return (
//     <div className="w-full">

//       {/* Round Tabs */}
//       <div className="mb-8 border-b">
//         <div className="flex overflow-x-auto">
//           {rounds.map((round) => (
//             <button
//               key={round.roundNumber}
//               onClick={() => setSelectedRound(round.roundNumber)}
//               className={cn(
//                 "px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
//                 selectedRound === round.roundNumber
//                   ? "border-blue-500 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700"
//               )}
//             >
//               {round.isChampionshipRound
//                 ? "Championship"
//                 : `Round ${round.roundNumber}`}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Round Content */}
//       <AnimatePresence mode="wait">
//         {rounds.map(
//           (round) =>
//             round.roundNumber === selectedRound && (
//               <motion.div
//                 key={round.roundNumber}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 {/* Championship Matches */}
//                 {round.championship.length > 0 && (
//                   <div className="mb-12">
//                     <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//                       Championship Match
//                       {round.championship[0].requiresRematch && (
//                         <span className="ml-3 text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
//                           Rematch Required
//                         </span>
//                       )}
//                     </h3>
//                     <div className="flex justify-center">
//                       <div className="w-[400px]">
//                         <MatchCard
//                           key={round.championship[0].id}
//                           match={round.championship[0]}
//                           tournament={tournament}
//                           onScoreUpdate={handleScoreUpdate}
//                           isEditable={!round.championship[0].isCompleted}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Winners Bracket */}
//                 {round.winners.length > 0 && (
//                   <div className="mb-8">
//                     <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
//                       Winners Bracket
//                       <span className="ml-3 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
//                         {round.winners.length} Matches
//                       </span>
//                     </h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                       {round.winners.map((match) => (
//                         <MatchCard
//                           key={match.id}
//                           match={match}
//                           tournament={tournament}
//                           onScoreUpdate={handleScoreUpdate}
//                           isEditable={!match.isCompleted}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Losers Bracket */}
//                 {round.losers.length > 0 && (
//                   <div className="pt-8 border-t">
//                     <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
//                       Losers Bracket
//                       <span className="ml-3 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
//                         {round.losers.length} Matches
//                       </span>
//                     </h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                       {round.losers.map((match) => (
//                         <MatchCard
//                           key={match.id}
//                           match={match}
//                           tournament={tournament}
//                           onScoreUpdate={handleScoreUpdate}
//                           isEditable={!match.isCompleted}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Eliminated Teams */}
//                 {tournament.eliminatedTeams.length > 0 && (
//                   <div className="mt-8 pt-8 border-t">
//                     <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
//                       <span>Eliminated Teams</span>
//                       <span className="ml-3 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
//                         {tournament.eliminatedTeams.length} Teams
//                       </span>
//                     </h3>
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                       {tournament.eliminatedTeams.map((team) => (
//                         <div
//                           key={team.id}
//                           className="bg-red-50 border border-red-200 rounded-lg p-4"
//                         >
//                           <div className="flex items-center space-x-3">
//                             {team.logo && (
//                               <div className="w-8 h-8 relative">
//                                 <Image
//                                   src={team.logo}
//                                   alt={team.name}
//                                   fill
//                                   className="object-contain"
//                                 />
//                               </div>
//                             )}
//                             <div>
//                               <div className="font-medium text-red-700">
//                                 {team.name}
//                               </div>
//                               <div className="text-xs text-red-600">
//                                 {team.losses} Losses
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Round Summary */}
//                 <div className="mt-8 p-4 bg-gray-50 rounded-lg">
//                   <h4 className="font-medium text-gray-900 mb-2">
//                     {round.isChampionshipRound
//                       ? "Championship"
//                       : `Round ${round.roundNumber}`}{" "}
//                     Summary
//                   </h4>
//                   <div className="grid grid-cols-3 gap-4 text-sm">
//                     <div>
//                       <p className="text-gray-600">Winners Bracket:</p>
//                       <p className="font-medium">
//                         {round.winners.length} matches
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-600">Losers Bracket:</p>
//                       <p className="font-medium">
//                         {round.losers.length} matches
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-600">Championship:</p>
//                       <p className="font-medium">
//                         {round.championship.length} matches
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             )
//         )}
//       </AnimatePresence>

//       {/* Tournament Progress */}
//       <div className="mt-8 pt-8 border-t">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-gray-800">
//             Tournament Progress
//           </h3>
//           <span className="text-sm text-gray-500">
//             {tournament.eliminatedTeams.length} Teams Eliminated
//           </span>
//         </div>
//         <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
//           <div
//             className="h-full bg-blue-500 transition-all duration-500"
//             style={{
//               width: `${
//                 (tournament.eliminatedTeams.length /
//                   (tournament.rounds[0].matches.length * 2)) *
//                 100
//               }%`
//             }}
//           />
//         </div>
//       </div>

//       {/* Tournament Winner */}
//       {tournament.winner && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-center text-white"
//         >
//           <h3 className="text-2xl font-bold mb-2">Tournament Champion</h3>
//           <p className="text-xl">
//             {tournament.winner.city} {tournament.winner.name}
//           </p>
//         </motion.div>
//       )}
//     </div>
//   );
// };
