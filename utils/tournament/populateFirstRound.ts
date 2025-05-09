// utils/tournament/populateFirstRound.ts
import { bracketTeams } from "@/types/tournament/populateTeams";
import { Team } from "@/types/tournament/mlb-teams";
import { Match, createMatch } from "@/types/tournament/matches";

// Helper to generate a Team object from a name (minimal fields, can be extended)
function teamFromName(name: string, idx: number): Team {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
    name,
    city: "",
    losses: 0
  };
}

export function populateFirstRoundMatches(): Match[] {
  const matches: Match[] = [];
  for (let i = 0; i < bracketTeams.length; i += 2) {
    const team1 = teamFromName(bracketTeams[i], i);
    const team2 = teamFromName(bracketTeams[i + 1], i + 1);
    matches.push(
      createMatch(
        `match-${i / 2 + 1}`,
        1, // roundNumber
        team1,
        team2,
        false, // isBye
        "winners"
      )
    );
  }
  return matches;
}

// Usage:
// import { populateFirstRoundMatches } from "@/utils/tournament/populateFirstRound";
// const matches = populateFirstRoundMatches();
