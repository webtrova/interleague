"use client";

import type { Tournament } from "@/types/tournament/matches";

import { TournamentBracket } from "@/components/tournament/TournamentBracket";
import type { Team } from "@/types/tournament/mlb-teams";
import { mlbTeams, nflTeams, League, Match } from "@/types/tournament";

import {
  createInitialRounds,
  updateMatchScore,
  advanceToNextRound
} from "@/types/tournament/matches";
import { useState, useCallback, useEffect } from "react";

export default function TournamentPage() {
  const [selectedLeague, setSelectedLeague] = useState<League>(League.MLB);
  const [tournament, setTournament] = useState<Tournament>(() => {
    // Clear any cached state
    if (typeof window !== "undefined") {
      localStorage.removeItem("tournamentState");
    }
    return createInitialRounds(mlbTeams.teams);
  });

  const handleMatchUpdate = useCallback((updatedMatch: Match) => {
    setTournament((currentTournament: Tournament) => {
      // First, update the match with proper winner/loser logic
      const processedMatch = updateMatchScore(updatedMatch, updatedMatch.score);

      // Update the match in the current round
      const updatedTournament = {
        ...currentTournament,
        rounds: currentTournament.rounds.map((round) => ({
          ...round,
          matches: round.matches.map((match) =>
            match.id === processedMatch.id ? processedMatch : match
          )
        }))
      };

      // Check if all matches in the current round are completed
      const currentRound =
        updatedTournament.rounds[updatedTournament.currentRound - 1];
      const allMatchesCompleted = currentRound.matches.every(
        (match) => match.isCompleted
      );

      // If all matches are completed, advance to next round
      if (allMatchesCompleted) {
        return advanceToNextRound(updatedTournament);
      }

      return updatedTournament;
    });
  }, []);

  // Reset tournament handler
  const handleReset = useCallback(() => {
    const leagueTeams = selectedLeague === League.MLB ? mlbTeams.teams : nflTeams.teams;
    leagueTeams.forEach((team) => (team.losses = 0));
    setTournament(createInitialRounds(leagueTeams));
  }, [selectedLeague]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tournament Bracket
          </h1>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reset Tournament
          </button>
        </div>
        {/* League Switcher */}
        <div className="flex justify-center mb-6 gap-0">
  <button
    className={`flex items-center gap-2 px-4 py-2 rounded-l border border-r-0 ${selectedLeague === League.MLB ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
    onClick={() => {
      setSelectedLeague(League.MLB);
      setTournament(createInitialRounds(mlbTeams.teams));
    }}
    aria-label="Switch to MLB"
  >
    <img
      src="/mlb-teams/mlb_logo.png"
      alt="MLB Logo"
      className="w-6 h-6"
      style={{ filter: selectedLeague === League.MLB ? 'none' : 'grayscale(1) brightness(1.2)' }}
    />
    MLB
  </button>
  <button
    className={`flex items-center gap-2 px-4 py-2 rounded-r border ${selectedLeague === League.NFL ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
    onClick={() => {
      setSelectedLeague(League.NFL);
      setTournament(createInitialRounds(nflTeams.teams));
    }}
    aria-label="Switch to NFL"
  >
    <img
      src="/nfl-teams/nfl_logo.png"
      alt="NFL Logo"
      className="w-6 h-6"
      style={{ filter: selectedLeague === League.NFL ? 'none' : 'grayscale(1) brightness(1.2)' }}
    />
    NFL
  </button>
</div>
        {/* Tournament Bracket */}
        <TournamentBracket
          tournament={tournament}
          onMatchUpdate={handleMatchUpdate}
          selectedLeague={selectedLeague}
        />

        {/* Tournament Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Active Teams</h3>
            <p className="text-2xl text-blue-600">
              {(selectedLeague === League.MLB ? mlbTeams.teams.length : nflTeams.teams.length) - tournament.eliminatedTeams.length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg overflow-auto max-h-40">
            <h3 className="font-semibold text-red-900 mb-2">
              Eliminated Teams
            </h3>
            {tournament.eliminatedTeams.length === 0 ? (
              <p className="text-red-600">No teams eliminated yet.</p>
            ) : (
              <ul className="list-disc list-inside text-red-600">
                {tournament.eliminatedTeams.map((team) => (
                  <li key={team.id}>{team.name}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">Current Round</h3>
            <p className="text-2xl text-green-600">{tournament.currentRound}</p>
          </div>
        </div>

        {/*
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">
            Tournament Status
          </h3>
          <pre className="text-sm text-gray-600 overflow-auto">
            {JSON.stringify(
              {
                currentRound: tournament.currentRound,
                totalTeams: (selectedLeague === League.MLB ? mlbTeams.teams.length : nflTeams.teams.length),
                eliminatedTeams: tournament.eliminatedTeams.length,
                matchesInCurrentRound:
                  tournament.rounds[tournament.currentRound - 1]?.matches.length
              },
              null,
              2
            )}
          </pre>
        </div>
        */}
      </div>
    </div>
  );
}
