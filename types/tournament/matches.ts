import type { Team } from "./mlb-teams";

export interface Match {
  id: string;
  roundNumber: number;
  team1: Team | null;
  team2: Team | null;
  isCompleted: boolean;
  isBye?: boolean;
  winner?: Team;
  loser?: Team;
  bracket: "winners" | "losers" | "championship";
  score: { team1Score: number; team2Score: number };
  nextMatchId?: string;
  nextLoserMatchId?: string;
  eliminatedLabel?: string; // label for eliminated teams in losers bracket
  requiresRematch?: boolean; // indicates if a championship rematch is required
}

export interface Round {
  roundNumber: number;
  matches: Match[];
  isDoubleElimination: boolean;
  isChampionshipRound: boolean;
}

export interface Tournament {
  rounds: Round[];
  currentRound: number;
  eliminatedTeams: Team[];
  championshipMatchesPlayed: number;
  winner?: Team;
  winnersBracketFinalLoser?: Team; // tracks the winner's bracket final loser for championship rematch logic
  losersBracketFinalLoser?: Team; // tracks the loser's bracket final loser (LLWB)
}

export const createMatch = (
  id: string,
  roundNumber: number,
  team1: Team | null,
  team2: Team | null,
  isBye: boolean = false,
  bracket: "winners" | "losers" | "championship" = "winners",
  nextMatchId?: string,
  nextLoserMatchId?: string
): Match => ({
  id,
  roundNumber,
  team1,
  team2,
  isCompleted: isBye,
  isBye,
  bracket,
  winner: isBye ? team1 ?? team2 ?? undefined : undefined,
  loser: isBye ? undefined : undefined,
  score: { team1Score: 0, team2Score: 0 },
  nextMatchId,
  nextLoserMatchId,
  eliminatedLabel: undefined
});

export const createInitialRounds = (teams: Team[]): Tournament => {
  const numTeams = teams.length;
  const matches: Match[] = [];
  const numRounds = Math.ceil(Math.log2(numTeams));

  const firstRoundMatches = Math.pow(2, numRounds - 1);
  let matchCounter = 1;

  for (let i = 0; i < firstRoundMatches; i++) {
    const team1 = teams[i * 2] || null;
    const team2 = teams[i * 2 + 1] || null;
    const isBye = !team1 || !team2;

    const matchId = `W1-${matchCounter}`;
    const nextMatchId = `W2-${Math.ceil(matchCounter / 2)}`;
    const nextLoserMatchId = `L1-${Math.ceil(matchCounter / 2)}`;

    matches.push(
      createMatch(
        matchId,
        1,
        team1,
        team2,
        isBye,
        "winners",
        nextMatchId,
        nextLoserMatchId
      )
    );
    matchCounter++;
  }

  return {
    rounds: [
      {
        roundNumber: 1,
        matches,
        isDoubleElimination: true,
        isChampionshipRound: false
      }
    ],
    currentRound: 1,
    eliminatedTeams: [],
    championshipMatchesPlayed: 0
  };
};

export const updateMatchScore = (
  match: Match,
  newScore: { team1Score: number; team2Score: number }
): Match => {
  const isCompleted = newScore.team1Score !== newScore.team2Score;
  let winner: Team | undefined = undefined;
  let loser: Team | undefined = undefined;
  if (isCompleted) {
    if (newScore.team1Score > newScore.team2Score) {
      winner = match.team1
        ? {
            ...match.team1,
            wins: (match.team1.wins ?? 0) + 1,
            losses: match.team1.losses ?? 0
          }
        : undefined;
      loser = match.team2
        ? {
            ...match.team2,
            wins: match.team2.wins ?? 0,
            losses: (match.team2.losses ?? 0) + 1
          }
        : undefined;
    } else {
      winner = match.team2
        ? {
            ...match.team2,
            wins: (match.team2.wins ?? 0) + 1,
            losses: match.team2.losses ?? 0
          }
        : undefined;
      loser = match.team1
        ? {
            ...match.team1,
            wins: match.team1.wins ?? 0,
            losses: (match.team1.losses ?? 0) + 1
          }
        : undefined;
    }
  }
  return {
    ...match,
    score: newScore,
    isCompleted,
    winner,
    loser
  };
};

// Helper to deduplicate teams by ID
function dedupeTeams(teams: Team[]): Team[] {
  const seen = new Set<string>();
  return teams.filter((team) => {
    if (!team) return false;
    if (seen.has(team.id)) return false;
    seen.add(team.id);
    return true;
  });
}

// Helper: get all teams with exactly N losses
function teamsWithLosses(
  lossCounts: Record<string, number>,
  n: number
): string[] {
  return Object.keys(lossCounts).filter((teamId) => lossCounts[teamId] === n);
}
export const advanceToNextRound = (tournament: Tournament): Tournament => {
  const currentRound = tournament.rounds[tournament.rounds.length - 1];
  const nextRoundNumber = tournament.currentRound + 1;

  // Track all losses and wins across the tournament
  const lossCounts: Record<string, number> = {};
  const winsCounts: Record<string, number> = {};
  tournament.rounds.forEach((round) => {
    round.matches.forEach((match) => {
      if (match.isCompleted && match.loser) {
        lossCounts[match.loser.id] = (lossCounts[match.loser.id] || 0) + 1;
      }
      if (match.isCompleted && match.winner) {
        winsCounts[match.winner.id] = (winsCounts[match.winner.id] || 0) + 1;
      }
    });
  });

  // Gather all teams
  const allTeams: Team[] = [];
  const teamIds = new Set<string>();
  for (const round of tournament.rounds) {
    for (const match of round.matches) {
      if (match.team1 && !teamIds.has(match.team1.id)) {
        allTeams.push({
          ...match.team1,
          wins: winsCounts[match.team1.id] || 0,
          losses: lossCounts[match.team1.id] || 0
        });
        teamIds.add(match.team1.id);
      }
      if (match.team2 && !teamIds.has(match.team2.id)) {
        allTeams.push({
          ...match.team2,
          wins: winsCounts[match.team2.id] || 0,
          losses: lossCounts[match.team2.id] || 0
        });
        teamIds.add(match.team2.id);
      }
    }
  }

  // Identify newly eliminated teams (2 losses)
  const newlyEliminated: Team[] = [];
  for (const team of allTeams) {
    if (
      (lossCounts[team.id] || 0) >= 2 &&
      !tournament.eliminatedTeams.some((t) => t.id === team.id)
    ) {
      newlyEliminated.push(team);
    }
  }

  // Variables for tracking bracket state
  const winnersBracketTeams = dedupeTeams(
    allTeams.filter(
      (team) =>
        (lossCounts[team.id] || 0) === 0 &&
        !tournament.eliminatedTeams.some((t) => t.id === team.id) &&
        !newlyEliminated.some((t) => t.id === team.id)
    )
  );

  const losersBracketTeams = dedupeTeams(
    allTeams.filter(
      (team) =>
        (lossCounts[team.id] || 0) === 1 &&
        !tournament.eliminatedTeams.some((t) => t.id === team.id) &&
        !newlyEliminated.some((t) => t.id === team.id)
    )
  );

  // Enrich teams with win/loss counts
  winnersBracketTeams.forEach(
    (team) =>
      (team = {
        ...team,
        losses: lossCounts[team.id] || 0,
        wins: winsCounts[team.id] || 0
      })
  );

  losersBracketTeams.forEach(
    (team) =>
      (team = {
        ...team,
        losses: lossCounts[team.id] || 0,
        wins: winsCounts[team.id] || 0
      })
  );

  let isChampionshipRound = false;
  let championshipMatches: Match[] = [];
  let nextRoundMatches: Match[] = [];
  // Flag to track if we've already added a WWB card
  let wwbCardAdded = false;
  // Flag to track if we've already added a LWB card
  let lwbCardAdded = false;

  const prevChampionshipMatches = tournament.rounds
    .filter((r) => r.isChampionshipRound)
    .flatMap((r) => r.matches)
    .filter((m) => m.bracket === "championship");

  // --- CHAMPIONSHIP LOGIC ---

  // Check if a championship match already happened and was completed
  if (
    prevChampionshipMatches.length >= 1 &&
    prevChampionshipMatches[prevChampionshipMatches.length - 1].isCompleted
  ) {
    const lastChampMatch =
      prevChampionshipMatches[prevChampionshipMatches.length - 1];
    const winnersBracketTeam = lastChampMatch.team1;
    const losersBracketTeam = lastChampMatch.team2;

    // If loser's bracket team won the first championship match, winner's bracket team gets another chance
    if (
      lastChampMatch.winner?.id === losersBracketTeam?.id &&
      tournament.championshipMatchesPlayed === 1
    ) {
      isChampionshipRound = true;
      // Create the "reset" match
      championshipMatches.push(
        createMatch(
          `C${nextRoundNumber}-1`,
          nextRoundNumber,
          winnersBracketTeam,
          losersBracketTeam,
          false,
          "championship"
        )
      );

      // Add a placeholder match for the winner's bracket champion in round 8
      if (!wwbCardAdded) {
        nextRoundMatches.push(
          createMatch(
            `W${nextRoundNumber}-1`,
            nextRoundNumber,
            winnersBracketTeam,
            null,
            true,
            "winners"
          )
        );
        wwbCardAdded = true;
      }
    } else {
      // Either winner's bracket team won first match, or this was the reset match
      isChampionshipRound = true;
      // No new matches, winner will be determined in winner detection logic
    }
  }
  // Check if we're ready for the championship match - one team in each bracket and loser's final is complete
  else if (
    winnersBracketTeams.length === 1 &&
    losersBracketTeams.length === 1 &&
    currentRound.matches.some(
      (m) =>
        (m.bracket === "losers" || m.id.includes("LosersLast")) &&
        m.isCompleted &&
        m.winner &&
        losersBracketTeams.some((t) => t.id === m.winner!.id)
    )
  ) {
    // Championship match: Winner's bracket champion vs Loser's bracket champion
    isChampionshipRound = true;
    championshipMatches.push(
      createMatch(
        `C${nextRoundNumber}-1`,
        nextRoundNumber,
        winnersBracketTeams[0], // Winner's bracket champion
        losersBracketTeams[0], // Loser's bracket champion
        false,
        "championship"
      )
    );

    // Also add a placeholder match for the winner's bracket champion
    // This ensures the WWB card is still shown
    if (!wwbCardAdded) {
      nextRoundMatches.push(
        createMatch(
          `W${nextRoundNumber}-1`,
          nextRoundNumber,
          winnersBracketTeams[0],
          null,
          true,
          "winners"
        )
      );
      wwbCardAdded = true;
    }
  }
  // Check if we have a loser from winner's bracket final waiting to play against loser's bracket winner
  else if (
    winnersBracketTeams.length === 1 && // We have a winner's bracket champion
    losersBracketTeams.length >= 1 && // We have at least one team in loser's bracket
    tournament.winnersBracketFinalLoser // We have stored the winner's bracket final loser
  ) {
    // Find the winner of the loser's bracket
    const losersBracketWinner = currentRound.matches
      .filter((m) => m.bracket === "losers" && m.isCompleted && m.winner)
      .map((m) => m.winner!)
      .find((winner) => losersBracketTeams.some((t) => t.id === winner.id));

    if (
      losersBracketWinner &&
      losersBracketWinner.id !== tournament.winnersBracketFinalLoser.id
    ) {
      // Only schedule if they're not the same team!
      nextRoundMatches.push(
        createMatch(
          `LosersLast-${nextRoundNumber}`,
          nextRoundNumber,
          tournament.winnersBracketFinalLoser,
          losersBracketWinner,
          false,
          "losers"
        )
      );
      lwbCardAdded = true;

      // Add a placeholder match for the winner's bracket champion
      if (!wwbCardAdded) {
        nextRoundMatches.push(
          createMatch(
            `W${nextRoundNumber}-1`,
            nextRoundNumber,
            winnersBracketTeams[0],
            null,
            true, // This is a bye match
            "winners"
          )
        );
        wwbCardAdded = true;
      }
    } else {
      // Wait for the losers bracket to resolve properly
      createStandardBracketMatches();

      // Even when waiting, we should still show the WWB and LWB cards
      if (
        winnersBracketTeams.length === 1 &&
        tournament.winnersBracketFinalLoser
      ) {
        // Add a placeholder match for the winner's bracket champion
        if (!wwbCardAdded) {
          nextRoundMatches.push(
            createMatch(
              `W${nextRoundNumber}-1`,
              nextRoundNumber,
              winnersBracketTeams[0],
              null,
              true,
              "winners"
            )
          );
          wwbCardAdded = true;
        }

        // Add a placeholder for the loser of winner's bracket final
        // This ensures the LWB card is shown while waiting
        if (!lwbCardAdded) {
          nextRoundMatches.push(
            createMatch(
              `LWB${nextRoundNumber}-1`,
              nextRoundNumber,
              tournament.winnersBracketFinalLoser,
              null,
              false, // Not a bye, just waiting
              "losers"
            )
          );
          lwbCardAdded = true;
        }
      }
    }
  }
  // Check if this is the winner's bracket final (exactly 2 teams in winner's bracket)
  else if (winnersBracketTeams.length === 2 && losersBracketTeams.length >= 1) {
    // Create the winner's bracket final match
    nextRoundMatches.push(
      createMatch(
        `W${nextRoundNumber}-1`,
        nextRoundNumber,
        winnersBracketTeams[0],
        winnersBracketTeams[1],
        false,
        "winners"
      )
    );
    wwbCardAdded = true;

    // Continue with losers bracket matches
    createLosersBracketMatches();
  }
  // Standard case: create matches for both brackets
  else {
    createStandardBracketMatches();
    createLosersBracketMatches();
  }

  // Helper function to create standard bracket matches
  function createStandardBracketMatches() {
    if (winnersBracketTeams.length === 0) return;

    // If we have exactly one team in winners bracket, create a placeholder
    if (winnersBracketTeams.length === 1 && !wwbCardAdded) {
      nextRoundMatches.push(
        createMatch(
          `W${nextRoundNumber}-1`,
          nextRoundNumber,
          winnersBracketTeams[0],
          null,
          true,
          "winners"
        )
      );
      wwbCardAdded = true;
      return;
    }

    // Create matches for winners bracket
    for (let i = 0; i < winnersBracketTeams.length; i += 2) {
      if (i + 1 < winnersBracketTeams.length) {
        nextRoundMatches.push(
          createMatch(
            `W${nextRoundNumber}-${Math.floor(i / 2) + 1}`,
            nextRoundNumber,
            winnersBracketTeams[i],
            winnersBracketTeams[i + 1],
            false,
            "winners"
          )
        );
      } else if (winnersBracketTeams.length % 2 !== 0) {
        // Handle odd number with a bye
        nextRoundMatches.push(
          createMatch(
            `W${nextRoundNumber}-${Math.floor(i / 2) + 1}`,
            nextRoundNumber,
            winnersBracketTeams[i],
            null,
            true,
            "winners"
          )
        );
      }
    }
  }

  // Helper function to create losers bracket matches based on the specific pattern in the image
  // Update the createLosersBracketMatches function within the advanceToNextRound function

  // This code includes fixes to the losers bracket logic, particularly for Round 6 and beyond

  // This code includes fixes to the losers bracket logic, particularly for Round 6 and beyond

  function createLosersBracketMatches() {
    // For Round 2 (first losers bracket round)
    if (nextRoundNumber === 2) {
      // Get all losers from winners bracket round 1
      const losersFromWinners = tournament.rounds
        .filter((r) => r.roundNumber === 1)
        .flatMap((r) => r.matches)
        .filter((m) => m.bracket === "winners" && m.isCompleted && m.loser)
        .map((m) => ({
          team: m.loser!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Sort by match index to maintain original bracket order
      losersFromWinners.sort((a, b) => a.matchIndex - b.matchIndex);

      // Create matches for losers bracket round 2
      // Following the pattern shown in the image: 1 vs 2, 3 vs 4, etc.
      for (let i = 0; i < losersFromWinners.length; i += 2) {
        if (i + 1 < losersFromWinners.length) {
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${i / 2 + 1}`,
              nextRoundNumber,
              losersFromWinners[i].team,
              losersFromWinners[i + 1].team,
              false,
              "losers"
            )
          );
        }
      }
    }
    // For Round 3 (second losers bracket round) - FIXED PATTERN
    else if (nextRoundNumber === 3) {
      // Get winners from losers bracket round 2
      const losersR2Winners = currentRound.matches
        .filter((m) => m.bracket === "losers" && m.isCompleted && m.winner)
        .map((m) => ({
          team: m.winner!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Get losers from winners bracket round 2
      const winnersR2Losers = currentRound.matches
        .filter((m) => m.bracket === "winners" && m.isCompleted && m.loser)
        .map((m) => ({
          team: m.loser!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Sort both arrays by match index
      losersR2Winners.sort((a, b) => a.matchIndex - b.matchIndex);
      winnersR2Losers.sort((a, b) => a.matchIndex - b.matchIndex);

      // Following the pattern in the image:
      // Last half of losers from WB play first half of winners from LB
      // First half of losers from WB play last half of winners from LB
      const halfPoint = Math.floor(winnersR2Losers.length / 2);

      // Create first half of matches (bottom WB losers vs top LB winners)
      for (let i = 0; i < halfPoint; i++) {
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-${i + 1}`, // start from 1 since we used index 1 above
            nextRoundNumber,
            losersR2Winners[i].team,
            winnersR2Losers[winnersR2Losers.length - halfPoint + i].team,
            false,
            "losers"
          )
        );
      }

      // Create second half of matches (top WB losers vs bottom LB winners)
      for (let i = 0; i < halfPoint; i++) {
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-${halfPoint + i + 1}`,
            nextRoundNumber,
            losersR2Winners[halfPoint + i].team,
            winnersR2Losers[i].team,
            false,
            "losers"
          )
        );
      }
    }
    // For Round 4 (third losers bracket round) - UPDATED ACCORDING TO IMAGE
    else if (nextRoundNumber === 4) {
      // Get winners from losers bracket round 3
      const losersR3Winners = currentRound.matches
        .filter((m) => m.bracket === "losers" && m.isCompleted && m.winner)
        .map((m) => ({
          team: m.winner!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Get losers from winners bracket round 3
      const winnersR3Losers = currentRound.matches
        .filter((m) => m.bracket === "winners" && m.isCompleted && m.loser)
        .map((m) => ({
          team: m.loser!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Sort by match index
      losersR3Winners.sort((a, b) => a.matchIndex - b.matchIndex);
      winnersR3Losers.sort((a, b) => a.matchIndex - b.matchIndex);

      let matchCounter = 1;

      // Based on the image pattern for round 4:
      // 1. First, create matches between the winners bracket losers at top of bracket
      if (winnersR3Losers.length >= 2) {
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-${matchCounter}`,
            nextRoundNumber,
            winnersR3Losers[0].team,
            winnersR3Losers[1].team,
            false,
            "losers"
          )
        );
        matchCounter++;
      }

      // 2. FIXED: Match consecutive winners from losers bracket
      // Group winners by consecutive pairs (not by halves)
      for (let i = 0; i < losersR3Winners.length; i += 2) {
        if (i + 1 < losersR3Winners.length) {
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${matchCounter}`,
              nextRoundNumber,
              losersR3Winners[i].team,
              losersR3Winners[i + 1].team,
              false,
              "losers"
            )
          );
          matchCounter++;
        } else if (losersR3Winners.length % 2 !== 0) {
          // Handle odd number with a bye
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${matchCounter}`,
              nextRoundNumber,
              losersR3Winners[i].team,
              null,
              true,
              "losers"
            )
          );
          matchCounter++;
        }
      }

      // 3. Finally, create matches between the winners bracket losers at bottom of bracket
      if (winnersR3Losers.length >= 4) {
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-${matchCounter}`,
            nextRoundNumber,
            winnersR3Losers[2].team,
            winnersR3Losers[3].team,
            false,
            "losers"
          )
        );
        matchCounter++;
      }
    }
    // For Round 5 (fourth losers bracket round) - UPDATED ACCORDING TO IMAGE
    else if (nextRoundNumber === 5) {
      // Get winners from losers bracket round 4
      const losersR4Winners = currentRound.matches
        .filter((m) => m.bracket === "losers" && m.isCompleted && m.winner)
        .map((m) => ({
          team: m.winner!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Get losers from winners bracket round 4
      const winnersR4Losers = currentRound.matches
        .filter((m) => m.bracket === "winners" && m.isCompleted && m.loser)
        .map((m) => ({
          team: m.loser!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Sort by match index
      losersR4Winners.sort((a, b) => a.matchIndex - b.matchIndex);
      winnersR4Losers.sort((a, b) => a.matchIndex - b.matchIndex);

      let matchCounter = 1;

      // Based on the image pattern for round 5:
      // 1. First, match consecutive winners from losers bracket
      // Group winners by their original bracket position (odd vs even)
      const evenIndexWinners = losersR4Winners.filter(
        (w) => w.matchIndex % 2 === 0
      );
      const oddIndexWinners = losersR4Winners.filter(
        (w) => w.matchIndex % 2 !== 0
      );

      // Sort each group by match index to maintain order
      evenIndexWinners.sort((a, b) => a.matchIndex - b.matchIndex);
      oddIndexWinners.sort((a, b) => a.matchIndex - b.matchIndex);

      // Match consecutive winners (e.g., winners of matches 1&2, 3&4, 5&6, etc.)
      for (
        let i = 0;
        i < Math.min(evenIndexWinners.length, oddIndexWinners.length);
        i++
      ) {
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-${matchCounter}`,
            nextRoundNumber,
            evenIndexWinners[i].team,
            oddIndexWinners[i].team,
            false,
            "losers"
          )
        );
        matchCounter++;
      }

      // Handle any remaining winners (in case of odd number)
      const remainingWinners = [
        ...evenIndexWinners.slice(oddIndexWinners.length),
        ...oddIndexWinners.slice(evenIndexWinners.length)
      ];
      for (let i = 0; i < remainingWinners.length; i += 2) {
        if (i + 1 < remainingWinners.length) {
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${matchCounter}`,
              nextRoundNumber,
              remainingWinners[i].team,
              remainingWinners[i + 1].team,
              false,
              "losers"
            )
          );
          matchCounter++;
        } else {
          // Handle odd number case with a bye
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${matchCounter}`,
              nextRoundNumber,
              remainingWinners[i].team,
              null,
              true,
              "losers"
            )
          );
          matchCounter++;
        }
      }

      // Based on the image pattern:
      // Winners bracket losers face each other at the BOTTOM of the bracket (not the top)
      if (winnersR4Losers.length >= 2) {
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-${matchCounter}`,
            nextRoundNumber,
            winnersR4Losers[0].team,
            winnersR4Losers[1].team,
            false,
            "losers"
          )
        );
        matchCounter++;
      }
    }
    // For Round 6 (fifth losers bracket round)
    else if (nextRoundNumber === 6) {
      // Get winners from losers bracket round 5
      const losersR5Winners = currentRound.matches
        .filter((m) => m.bracket === "losers" && m.isCompleted && m.winner)
        .map((m) => ({
          team: m.winner!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Get losers from losers bracket round 5 (to track LLWB)
      const losersR5Losers = currentRound.matches
        .filter((m) => m.bracket === "losers" && m.isCompleted && m.loser)
        .map((m) => ({
          team: m.loser!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Sort by match index
      losersR5Winners.sort((a, b) => a.matchIndex - b.matchIndex);
      losersR5Losers.sort((a, b) => a.matchIndex - b.matchIndex);

      // Check if we have the winner's bracket final loser
      const hasWinnersBracketFinalLoser = !!tournament.winnersBracketFinalLoser;

      // Set the LLWB (Loser of Loser's Winner Bracket) if available
      if (losersR5Losers.length > 0) {
        tournament.losersBracketFinalLoser = losersR5Losers[0].team;
      }

      // In round 6, we pair winners sequentially as shown in the image
      for (let i = 0; i < losersR5Winners.length; i += 2) {
        if (i + 1 < losersR5Winners.length) {
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${Math.floor(i / 2) + 1}`,
              nextRoundNumber,
              losersR5Winners[i].team,
              losersR5Winners[i + 1].team,
              false,
              "losers"
            )
          );
        } else if (losersR5Winners.length % 2 !== 0) {
          // Handle odd number with a bye
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${Math.floor(i / 2) + 1}`,
              nextRoundNumber,
              losersR5Winners[i].team,
              null,
              true,
              "losers"
            )
          );
        }
      }

      // Add the LWB card if we have a winner's bracket final loser
      if (hasWinnersBracketFinalLoser && tournament.winnersBracketFinalLoser) {
        nextRoundMatches.push(
          createMatch(
            `LWB${nextRoundNumber}-1`,
            nextRoundNumber,
            tournament.winnersBracketFinalLoser,
            null,
            true, // Mark as a bye so it doesn't wait for input
            "losers"
          )
        );
      }

      // Add the LLWB card if we have a loser's bracket final loser
      if (tournament.losersBracketFinalLoser) {
        nextRoundMatches.push(
          createMatch(
            `LLWB${nextRoundNumber}-1`,
            nextRoundNumber,
            tournament.losersBracketFinalLoser,
            null,
            true, // Mark as a bye so it doesn't wait for input
            "losers"
          )
        );
      }
    }
    // For Round 7 (sixth losers bracket round) - Losers Bracket Final
    else if (nextRoundNumber === 7) {
      // Get winners from losers bracket round 6
      const losersR6Winners = currentRound.matches
        .filter((m) => m.bracket === "losers" && m.isCompleted && m.winner)
        .map((m) => ({
          team: m.winner!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Get losers from losers bracket round 6 (to update LLWB)
      const losersR6Losers = currentRound.matches
        .filter((m) => m.bracket === "losers" && m.isCompleted && m.loser)
        .map((m) => ({
          team: m.loser!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Sort by match index
      losersR6Winners.sort((a, b) => a.matchIndex - b.matchIndex);
      losersR6Losers.sort((a, b) => a.matchIndex - b.matchIndex);

      // Update the LLWB (Loser of Loser's Winner Bracket) if available
      if (losersR6Losers.length > 0) {
        tournament.losersBracketFinalLoser = losersR6Losers[0].team;
      }

      // Check if we have the winner's bracket final loser
      const hasWinnersBracketFinalLoser = !!tournament.winnersBracketFinalLoser;
      
      // Check if the LWB card already exists in the current round
      const lwbCardExists = currentRound.matches.some(m => 
        m.team1 && 
        tournament.winnersBracketFinalLoser && 
        m.team1.id === tournament.winnersBracketFinalLoser.id
      );

      // Check if the LLWB card already exists in the current round
      const llwbCardExists = currentRound.matches.some(m => 
        m.team1 && 
        tournament.losersBracketFinalLoser && 
        m.team1.id === tournament.losersBracketFinalLoser.id
      );

      // In round 7, we have the losers bracket final
      // If we have both the LWB and a winner from the losers bracket, match them
      if (losersR6Winners.length > 0 && hasWinnersBracketFinalLoser && tournament.winnersBracketFinalLoser) {
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-1`,
            nextRoundNumber,
            tournament.winnersBracketFinalLoser,
            losersR6Winners[0].team,
            false,
            "losers"
          )
        );
      } 
      // If we have the LWB but no winner from losers bracket yet, show the waiting card
      else if (hasWinnersBracketFinalLoser && tournament.winnersBracketFinalLoser && !lwbCardExists) {
        nextRoundMatches.push(
          createMatch(
            `LWB${nextRoundNumber}-1`,
            nextRoundNumber,
            tournament.winnersBracketFinalLoser,
            null,
            true, // Mark as a bye so it doesn't wait for input
            "losers"
          )
        );
      }
      // Otherwise, just pair the losers bracket winners if we have enough
      else if (losersR6Winners.length >= 2) {
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-1`,
            nextRoundNumber,
            losersR6Winners[0].team,
            losersR6Winners[1].team,
            false,
            "losers"
          )
        );
      }

      // Always add the LLWB card in round 7 if we have a loser's bracket final loser
      if (tournament.losersBracketFinalLoser && !llwbCardExists) {
        nextRoundMatches.push(
          createMatch(
            `LLWB${nextRoundNumber}-1`,
            nextRoundNumber,
            tournament.losersBracketFinalLoser,
            null,
            true, // Mark as a bye so it doesn't wait for input
            "losers"
          )
        );
      }
    }
    // For Round 8 (seventh losers bracket round) - Final Qualifier
    else if (nextRoundNumber === 8) {
      // Get winners from losers bracket round 7 (LWLB - Last Winner of Loser's Bracket)
      const losersR7Winners = currentRound.matches
        .filter((m) => m.bracket === "losers" && m.isCompleted && m.winner)
        .map((m) => ({
          team: m.winner!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }));

      // Sort by match index
      losersR7Winners.sort((a, b) => a.matchIndex - b.matchIndex);

      // In round 8, LLWB (Loser of Loser's Winner Bracket) faces LWLB (Last Winner of Loser's Bracket)
      // for a chance at the championship
      if (losersR7Winners.length > 0 && tournament.losersBracketFinalLoser) {
        // Match LLWB vs LWLB
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-1`,
            nextRoundNumber,
            tournament.losersBracketFinalLoser,
            losersR7Winners[0].team,
            false,
            "losers"
          )
        );
      } 
      // If we have LLWB but no LWLB yet, show the waiting card
      else if (tournament.losersBracketFinalLoser) {
        nextRoundMatches.push(
          createMatch(
            `LLWB${nextRoundNumber}-1`,
            nextRoundNumber,
            tournament.losersBracketFinalLoser,
            null,
            true, // Mark as a bye so it doesn't wait for input
            "losers"
          )
        );
      }
      // If we have LWLB but no LLWB, show the waiting card
      else if (losersR7Winners.length > 0) {
        nextRoundMatches.push(
          createMatch(
            `LWLB${nextRoundNumber}-1`,
            nextRoundNumber,
            losersR7Winners[0].team,
            null,
            true, // Mark as a bye so it doesn't wait for input
            "losers"
          )
        );
      }
    }
    // For later rounds - generalized pattern
    else {
      // Get all eligible teams for losers bracket
      const eligibleLosers = allTeams.filter(
        (team) =>
          (lossCounts[team.id] || 0) === 1 &&
          !tournament.eliminatedTeams.some((t) => t.id === team.id) &&
          !newlyEliminated.some((t) => t.id === team.id)
      );

      // Find teams recently dropped from winners bracket
      const justDroppedFromWinners = currentRound.matches
        .filter((m) => m.bracket === "winners" && m.loser && m.isCompleted)
        .map((m) => ({
          team: m.loser!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }))
        .filter((loser) => eligibleLosers.some((t) => t.id === loser.team.id));

      // Find winners from previous losers bracket
      const winnersFromLosers = currentRound.matches
        .filter(
          (m) =>
            m.bracket === "losers" &&
            m.winner &&
            m.isCompleted &&
            !m.id.includes("LLWB")
        )
        .map((m) => ({
          team: m.winner!,
          matchId: m.id,
          matchIndex: parseInt(m.id.split("-")[1])
        }))
        .filter((winner) =>
          eligibleLosers.some((t) => t.id === winner.team.id)
        );

      // For final rounds, pair remaining teams
      const allLosersBracketTeams = [
        ...winnersFromLosers,
        ...justDroppedFromWinners
      ];
      allLosersBracketTeams.sort((a, b) => a.matchIndex - b.matchIndex);

      for (let i = 0; i < allLosersBracketTeams.length; i += 2) {
        if (i + 1 < allLosersBracketTeams.length) {
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${Math.floor(i / 2) + 1}`,
              nextRoundNumber,
              allLosersBracketTeams[i].team,
              allLosersBracketTeams[i + 1].team,
              false,
              "losers"
            )
          );
        } else if (allLosersBracketTeams.length % 2 !== 0) {
          // Handle odd number with a bye
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${Math.floor(i / 2) + 1}`,
              nextRoundNumber,
              allLosersBracketTeams[i].team,
              null,
              true,
              "losers"
            )
          );
        }
      }

      // Continue showing the LLWB card if applicable
      if (tournament.losersBracketFinalLoser) {
        // Check if the LLWB is already in a match this round
        const llwbAlreadyInMatch = nextRoundMatches.some(
          (m) =>
            m.team1?.id === tournament.losersBracketFinalLoser?.id ||
            m.team2?.id === tournament.losersBracketFinalLoser?.id
        );

        if (!llwbAlreadyInMatch) {
          nextRoundMatches.push(
            createMatch(
              `LLWB${nextRoundNumber}-1`,
              nextRoundNumber,
              tournament.losersBracketFinalLoser,
              null,
              true,
              "losers"
            )
          );
        }
      }
    }
  }

  // Winner detection logic
  let winner: Team | undefined = tournament.winner;

  if (isChampionshipRound) {
    const lastChampMatch =
      championshipMatches[0] ||
      prevChampionshipMatches[prevChampionshipMatches.length - 1];

    if (
      lastChampMatch &&
      lastChampMatch.isCompleted &&
      lastChampMatch.winner &&
      lastChampMatch.loser
    ) {
      const winnersBracketTeam = lastChampMatch.team1;
      const losersBracketTeam = lastChampMatch.team2;
      const losersBracketTeamWon =
        losersBracketTeam && lastChampMatch.winner.id === losersBracketTeam.id;

      if (losersBracketTeamWon && tournament.championshipMatchesPlayed === 1) {
        winner = undefined; // No winner yet, need reset match
      } else {
        winner = lastChampMatch.winner;
      }
    }
  }

  // Infinite recursion guard
  const noMoreMatches =
    (isChampionshipRound && championshipMatches.length === 0) ||
    (!isChampionshipRound && nextRoundMatches.length === 0);

  if (noMoreMatches) {
    return {
      ...tournament,
      winner,
      currentRound: tournament.currentRound
    };
  }

  // Return updated tournament
  return {
    ...tournament,
    rounds: [
      ...tournament.rounds,
      {
        roundNumber: nextRoundNumber,
        matches: isChampionshipRound ? championshipMatches : nextRoundMatches,
        isDoubleElimination: true,
        isChampionshipRound
      }
    ],
    currentRound: nextRoundNumber,
    eliminatedTeams: [
      ...tournament.eliminatedTeams,
      ...newlyEliminated.filter(
        (t) => !tournament.eliminatedTeams.some((et) => et.id === t.id)
      )
    ],
    championshipMatchesPlayed: isChampionshipRound
      ? tournament.championshipMatchesPlayed + 1
      : tournament.championshipMatchesPlayed,
    winnersBracketFinalLoser: tournament.winnersBracketFinalLoser,
    losersBracketFinalLoser: tournament.losersBracketFinalLoser,
    winner
  };
};
