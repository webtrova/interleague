// utils/tournament/initializeBracketTournament.ts
import { bracketTeams } from "@/types/tournament/populateTeams";
import { Team } from "@/types/tournament/mlb-teams";
import { Tournament, createInitialRounds } from "@/types/tournament/matches";

// Helper to generate a Team object from a name (minimal fields, can be extended)
function teamFromName(name: string, idx: number): Team {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
    name,
    city: "",
    losses: 0
  };
}

export function initializeBracketTournament(): Tournament {
  const teams: Team[] = bracketTeams.map(teamFromName);
  return createInitialRounds(teams);
}

// Usage:
// import { initializeBracketTournament } from "@/utils/tournament/initializeBracketTournament";
// const tournament = initializeBracketTournament();
