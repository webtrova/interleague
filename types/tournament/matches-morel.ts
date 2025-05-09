

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

  // Gather all teams ever in the tournament, attaching wins
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

  // Winners: teams with 0 losses and not eliminated
  const winnersBracketTeams = allTeams
    .filter(
      (team) =>
        (lossCounts[team.id] || 0) === 0 &&
        !tournament.eliminatedTeams.some((t) => t.id === team.id) &&
        !newlyEliminated.some((t) => t.id === team.id)
    )
    .map((team) => ({
      ...team,
      losses: lossCounts[team.id] || 0,
      wins: winsCounts[team.id] || 0
    }));

  // Losers: teams with 1 loss and not eliminated
  const losersBracketTeams = allTeams
    .filter(
      (team) =>
        (lossCounts[team.id] || 0) === 1 &&
        !tournament.eliminatedTeams.some((t) => t.id === team.id) &&
        !newlyEliminated.some((t) => t.id === team.id)
    )
    .map((team) => ({
      ...team,
      losses: lossCounts[team.id] || 0,
      wins: winsCounts[team.id] || 0
    }));

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
      // Create the "reset" match with a notification label
      const resetMatch = createMatch(
        `C${nextRoundNumber}-1`,
        nextRoundNumber,
        winnersBracketTeam,
        losersBracketTeam,
        false,
        "championship"
      );
      
      // Add the notification label for the second match requirement
      resetMatch.eliminatedLabel = "SECOND MATCH REQUIRED";
      
      championshipMatches.push(resetMatch);

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
              true,
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

    // Continue with losers bracket matches separately
    createLosersBracketMatches();
  }
  // Otherwise, continue with normal bracket play
  else {
    createStandardBracketMatches();
  }

  // Helper function to create standard bracket matches
  function createStandardBracketMatches() {
    // --- Winners Bracket Matches ---
    let matchCounter = 1;
    for (let i = 0; i < winnersBracketTeams.length; i += 2) {
      const team1 = winnersBracketTeams[i];
      const team2 = winnersBracketTeams[i + 1] ?? null;
      const isBye = !team2;
      nextRoundMatches.push(
        createMatch(
          `W${nextRoundNumber}-${matchCounter}`,
          nextRoundNumber,
          team1,
          team2,
          isBye,
          "winners"
        )
      );
      wwbCardAdded = true;
      matchCounter++;
    }

    // Create losers bracket matches separately
    createLosersBracketMatches();
  }

  // Helper function to create losers bracket matches
  function createLosersBracketMatches() {
    // --- Losers Bracket Matches ---
    const eligibleLosers = allTeams.filter(
      (team) =>
        (lossCounts[team.id] || 0) === 1 &&
        !tournament.eliminatedTeams.some((t) => t.id === team.id) &&
        !newlyEliminated.some((t) => t.id === team.id) &&
        // Exclude winner's bracket final loser if it exists but hasn't played yet in losers
        !(
          tournament.winnersBracketFinalLoser &&
          tournament.winnersBracketFinalLoser.id === team.id
        )
    );

    // Find teams recently dropped from winners bracket
    const justDroppedFromWinners = currentRound.matches
      .filter((m) => m.bracket === "winners" && m.loser && m.isCompleted)
      .map((m) => m.loser!)
      .filter((loser) => eligibleLosers.some((t) => t.id === loser.id));

    // If this is the winner's bracket final, store the loser for later use
    if (
      currentRound.matches.some(
        (m) =>
          m.bracket === "winners" &&
          winnersBracketTeams.length === 1 &&
          m.loser &&
          m.isCompleted
      )
    ) {
      // This is a special case - we found the winner's bracket final loser
      const winnersFinalLoser = currentRound.matches
        .filter((m) => m.bracket === "winners" && m.isCompleted && m.loser)
        .map((m) => m.loser!)
        .pop();

      if (winnersFinalLoser) {
        tournament.winnersBracketFinalLoser = winnersFinalLoser;

        // Always add a placeholder for the loser of winner's bracket final in round 7
        // This ensures the LWB card is shown
        if (nextRoundNumber === 7 && !lwbCardAdded) {
          nextRoundMatches.push(
            createMatch(
              `LWB${nextRoundNumber}-1`,
              nextRoundNumber,
              winnersFinalLoser,
              null,
              true,
              "losers"
            )
          );
          lwbCardAdded = true;
        }
      }
    }

    // MOREL MODIFICATIONS - CUSTOM LOSERS BRACKET PLACEMENTS FOR SPECIFIC ROUNDS

    // Round 3: Bottom 4 LWB play top 4 WLB; Top 4 LWB play bottom 4 WLB from round 2
    if (nextRoundNumber === 3) {
      const losersFromWinnersBracket = justDroppedFromWinners.slice();
      
      // Make sure we have at least 8 losers from winners bracket
      if (losersFromWinnersBracket.length >= 8) {
        // Split into top and bottom groups
        const topLosers = losersFromWinnersBracket.slice(0, 4);
        const bottomLosers = losersFromWinnersBracket.slice(4);
        
        // Get existing losers bracket winners from previous round
        const existingLosers = eligibleLosers.filter(
          (t) => !justDroppedFromWinners.some((jd) => jd.id === t.id)
        );
        
        // Should have 8 existing losers as well, split into top and bottom
        const topExistingLosers = existingLosers.slice(0, 4);
        const bottomExistingLosers = existingLosers.slice(4);
        
        // Create matches: bottom LWB vs top WLB
        for (let i = 0; i < Math.min(bottomLosers.length, topExistingLosers.length); i++) {
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${i+1}`,
              nextRoundNumber,
              bottomLosers[i],
              topExistingLosers[i],
              false,
              "losers"
            )
          );
        }
        
        // Create matches: top LWB vs bottom WLB
        for (let i = 0; i < Math.min(topLosers.length, bottomExistingLosers.length); i++) {
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${i+5}`,
              nextRoundNumber,
              topLosers[i],
              bottomExistingLosers[i],
              false,
              "losers"
            )
          );
        }
        
        return; // Exit the losers bracket creation function
      }
    }
    
    // Round 4: Top 2 losers from winning bracket face top 2 winners from losing bracket,
    // and bottom 2 losers from winning bracket face bottom 2 winners from losing bracket
    else if (nextRoundNumber === 4) {
      const losersFromWinnersBracket = justDroppedFromWinners.slice();
      
      if (losersFromWinnersBracket.length >= 4) {
        // Split winners bracket losers into top and bottom groups
        const topLosersFromWinnersBracket = losersFromWinnersBracket.slice(0, 2);
        const bottomLosersFromWinnersBracket = losersFromWinnersBracket.slice(2, 4);
        
        // Get existing losers bracket winners from previous round
        const existingLosers = eligibleLosers.filter(
          (t) => !justDroppedFromWinners.some((jd) => jd.id === t.id)
        );
        
        // Find the winners from the previous round's losers bracket matches
        const previousRound = tournament.rounds.find(r => r.roundNumber === nextRoundNumber - 1);
        const previousLosersBracketMatches = previousRound ? 
          previousRound.matches.filter(m => m.bracket === "losers" && m.isCompleted && m.winner) : [];
        
        // Get the winners from the previous round's losers bracket matches
        const previousLosersBracketWinners = previousLosersBracketMatches
          .map(m => m.winner!)
          .filter(winner => existingLosers.some(el => el.id === winner.id));
        
        // If we have winners from the previous round, use them directly
        let topWinnersFromLosingBracket = [];
        let bottomWinnersFromLosingBracket = [];
        
        if (previousLosersBracketWinners.length >= 4) {
          // Use the actual winners from previous round's matches
          topWinnersFromLosingBracket = previousLosersBracketWinners.slice(0, 2);
          bottomWinnersFromLosingBracket = previousLosersBracketWinners.slice(-2);
        } else {
          // Fallback to sorting by wins if we don't have enough previous round winners
          const sortedExistingLosers = [...existingLosers].sort((a, b) => {
            // Sort by wins (descending)
            return (b.wins || 0) - (a.wins || 0);
          });
          
          topWinnersFromLosingBracket = sortedExistingLosers.slice(0, 2);
          bottomWinnersFromLosingBracket = sortedExistingLosers.slice(-2); // Last 2 teams
        }
        
        let matchCounter = 1;
        
        // Match the top 2 losers from winning bracket with the top 2 winners from losing bracket
        for (let i = 0; i < Math.min(topLosersFromWinnersBracket.length, topWinnersFromLosingBracket.length); i++) {
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${matchCounter}`,
              nextRoundNumber,
              topLosersFromWinnersBracket[i],
              topWinnersFromLosingBracket[i],
              false,
              "losers"
            )
          );
          matchCounter++;
        }
        
        // Handle middle teams in the losers bracket (if any)
        // Get the remaining teams that aren't in the top or bottom groups
        const remainingTeams = existingLosers.filter(team => 
          !topWinnersFromLosingBracket.some(t => t.id === team.id) && 
          !bottomWinnersFromLosingBracket.some(t => t.id === team.id)
        );
        
        // Pair up the remaining teams
        for (let i = 0; i < remainingTeams.length; i += 2) {
          const team1 = remainingTeams[i];
          const team2 = i + 1 < remainingTeams.length ? remainingTeams[i + 1] : null;
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${matchCounter}`,
              nextRoundNumber,
              team1,
              team2,
              !team2,
              "losers"
            )
          );
          matchCounter++;
        }
        
        // Match the bottom 2 losers from winning bracket with the bottom 2 winners from losing bracket
        for (let i = 0; i < Math.min(bottomLosersFromWinnersBracket.length, bottomWinnersFromLosingBracket.length); i++) {
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${matchCounter}`,
              nextRoundNumber,
              bottomLosersFromWinnersBracket[i],
              bottomWinnersFromLosingBracket[i],
              false,
              "losers"
            )
          );
          matchCounter++;
        }
        
        return; // Exit the losers bracket creation function
      }
    }
    
    // Round 5: First loser of WB plays at top of LB, second loser plays at bottom of LB
    else if (nextRoundNumber === 5) {
      const losersFromWinnersBracket = justDroppedFromWinners.slice();
      
      if (losersFromWinnersBracket.length >= 2) {
        // Get existing losers bracket winners from previous round
        const existingLosers = eligibleLosers.filter(
          (t) => !justDroppedFromWinners.some((jd) => jd.id === t.id)
        );
        
        // First loser from WB plays first match of loser bracket
        let matchCounter = 1;
        
        // Place first loser at top of bracket with first existing loser
        const firstWBLoser = losersFromWinnersBracket[0];
        const firstExistingLoser = existingLosers[0] || null;
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-${matchCounter}`,
            nextRoundNumber,
            firstWBLoser,
            firstExistingLoser,
            !firstExistingLoser,
            "losers"
          )
        );
        matchCounter++;
        
        // Middle matches with remaining existing losers
        const middleExistingLosers = existingLosers.slice(1, existingLosers.length - 1);
        for (let i = 0; i < middleExistingLosers.length; i += 2) {
          const team1 = middleExistingLosers[i];
          const team2 = middleExistingLosers[i + 1] || null;
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${matchCounter}`,
              nextRoundNumber,
              team1,
              team2,
              !team2,
              "losers"
            )
          );
          matchCounter++;
        }
        
        // Place second loser at bottom of bracket with last existing loser
        const secondWBLoser = losersFromWinnersBracket[1];
        const lastExistingLoser = existingLosers[existingLosers.length - 1] || null;
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-${matchCounter}`,
            nextRoundNumber,
            secondWBLoser,
            lastExistingLoser,
            !lastExistingLoser,
            "losers"
          )
        );
        matchCounter++;
        
        return; // Exit the losers bracket creation function
      }
    }

    // If we didn't hit a special round case or couldn't apply the custom logic,
    // fall back to the default losers bracket logic
    
    // Existing losers bracket teams
    const existingLosers = eligibleLosers.filter(
      (t) => !justDroppedFromWinners.some((jd) => jd.id === t.id)
    );

    // Order: most recent drop(s) first
    const orderedLosers = [...justDroppedFromWinners, ...existingLosers];

    if (orderedLosers.length > 0) {
      if (orderedLosers.length % 2 === 1) {
        // Odd: bye goes to the most recent team dropped from winners bracket
        let teamWithBye: Team | null = null;
        if (justDroppedFromWinners.length > 0) {
          teamWithBye =
            justDroppedFromWinners[justDroppedFromWinners.length - 1];
          // Remove the bye team from orderedLosers
          const byeIndex = orderedLosers.findIndex(
            (t) => t.id === teamWithBye!.id
          );
          if (byeIndex !== -1) orderedLosers.splice(byeIndex, 1);
        } else {
          // Defensive: fallback to first team if no recent drop
          teamWithBye = orderedLosers.shift()!;
        }
        nextRoundMatches.push(
          createMatch(
            `L${nextRoundNumber}-1`,
            nextRoundNumber,
            teamWithBye,
            null,
            true,
            "losers"
          )
        );
        // Pair the rest
        for (let i = 0; i < orderedLosers.length; i += 2) {
          const team1 = orderedLosers[i];
          const team2 = orderedLosers[i + 1] ?? null;
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${Math.floor(i / 2) + 2}`,
              nextRoundNumber,
              team1,
              team2,
              !team2,
              "losers"
            )
          );
        }
      } else {
        // Even number: pair all
        for (let i = 0; i < orderedLosers.length; i += 2) {
          const team1 = orderedLosers[i];
          const team2 = orderedLosers[i + 1] ?? null;
          nextRoundMatches.push(
            createMatch(
              `L${nextRoundNumber}-${Math.floor(i / 2) + 1}`,
              nextRoundNumber,
              team1,
              team2,
              !team2,
              "losers"
            )
          );
        }
      }
    }

    // If we're in round 7 and there's a winner's bracket final loser but no LWB card yet
    if (
      nextRoundNumber === 7 &&
      tournament.winnersBracketFinalLoser &&
      !lwbCardAdded
    ) {
      nextRoundMatches.push(
        createMatch(
          `LWB${nextRoundNumber}-1`,
          nextRoundNumber,
          tournament.winnersBracketFinalLoser,
          null,
          true,
          "losers"
        )
      );
      lwbCardAdded = true;
    }
  }

  // --- Winner detection logic ---
  let winner: Team | undefined = tournament.winner;

  if (isChampionshipRound) {
    // Find the last championship match played
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

      // If loser's bracket team won first championship match, winner's bracket team gets another chance
      if (losersBracketTeamWon && tournament.championshipMatchesPlayed === 1) {
        winner = undefined; // No winner yet, need reset match
      } else {
        // Either winner's bracket team won first match, or this was the reset match
        winner = lastChampMatch.winner;
      }
    }
  }

  // --- INFINITE RECURSION GUARD ---
  const noMoreMatches =
    (isChampionshipRound && championshipMatches.length === 0) ||
    (!isChampionshipRound && nextRoundMatches.length === 0);

  if (noMoreMatches) {
    // Tournament is over, do not advance further
    return {
      ...tournament,
      winner,
      currentRound: tournament.currentRound
    };
  }

  // Ensure LWB card is added for round 7 if it hasn't been added yet
  if (
    nextRoundNumber === 7 &&
    tournament.winnersBracketFinalLoser &&
    !lwbCardAdded
  ) {
    nextRoundMatches.push(
      createMatch(
        `LWB${nextRoundNumber}-1`,
        nextRoundNumber,
        tournament.winnersBracketFinalLoser,
        null,
        true,
        "losers"
      )
    );
  }

  // Compose the new tournament object
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
    winner
  };
};