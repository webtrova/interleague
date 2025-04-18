// tournament_simulation.ts

import type { Team } from "./mlb-teams";
import {
  Tournament,
  Match,
  createInitialRounds,
  advanceToNextRound,
  updateMatchScore
} from "./matches";

// Create sample teams
const createSampleTeams = (numTeams: number): Team[] => {
  return Array.from({ length: numTeams }, (_, i) => ({
    id: `team${i + 1}`,
    name: `Team ${i + 1}`,
    seed: i + 1
  }));
};

// Simulate a match result
const simulateMatchResult = (match: Match): Match => {
  if (!match.team1 || !match.team2) {
    return {
      ...match,
      isCompleted: true,
      winner: match.team1 || match.team2,
      loser: null,
      score: { team1Score: 1, team2Score: 0 }
    };
  }

  // Random score generation
  const team1Score = Math.floor(Math.random() * 10);
  const team2Score = Math.floor(Math.random() * 10);

  // Ensure no ties
  const finalScore =
    team1Score === team2Score
      ? { team1Score: team1Score + 1, team2Score }
      : { team1Score, team2Score };

  return updateMatchScore(match, finalScore);
};

// Print match result
const printMatchResult = (match: Match) => {
  if (match.isBye) {
    console.log(`${match.id}: BYE - ${match.winner?.name} advances`);
    return;
  }

  const team1Name = match.team1?.name || "TBD";
  const team2Name = match.team2?.name || "TBD";
  const score = match.score;
  const winner = match.winner?.name;

  console.log(
    `${match.id} (${match.bracket}): ${team1Name} ${score.team1Score} - ${score.team2Score} ${team2Name} | Winner: ${winner}`
  );
};

// Print round summary
const printRoundSummary = (round: Tournament["rounds"][0]) => {
  console.log(`\n=== Round ${round.roundNumber} ===`);
  if (round.isChampionshipRound) {
    console.log("*** CHAMPIONSHIP ROUND ***");
  }
  round.matches.forEach(printMatchResult);
};

// Main simulation function
const simulateTournament = () => {
  console.log("Starting Tournament Simulation...\n");

  // Create 32 teams
  const teams = createSampleTeams(32);

  // Initialize tournament
  let tournament = createInitialRounds(teams);

  // Track eliminated teams for verification
  const eliminatedTeams = new Set<string>();

  // Keep advancing rounds until we have a winner
  while (!tournament.winner) {
    const currentRound = tournament.rounds[tournament.rounds.length - 1];

    // Complete all matches in current round
    currentRound.matches = currentRound.matches.map(simulateMatchResult);

    // Print round results
    printRoundSummary(currentRound);

    // Track eliminated teams
    currentRound.matches.forEach((match) => {
      if (match.loser) {
        const lossCount = tournament.eliminatedTeams.some(
          (t) => t.id === match.loser!.id
        )
          ? 2
          : 1;
        if (lossCount === 2) {
          eliminatedTeams.add(match.loser.id);
        }
      }
    });

    // Advance to next round
    tournament = advanceToNextRound(tournament);

    // Verification checks
    if (tournament.winner) {
      console.log("\n=== Tournament Complete ===");
      console.log(`Winner: ${tournament.winner.name}`);
      console.log(`Total Rounds Played: ${tournament.rounds.length}`);
      console.log(`Teams Eliminated: ${eliminatedTeams.size}`);

      // Verify winner hasn't been eliminated
      if (eliminatedTeams.has(tournament.winner.id)) {
        console.error("ERROR: Winner was previously eliminated!");
      }
    }
  }
};

// Run the simulation
simulateTournament();
