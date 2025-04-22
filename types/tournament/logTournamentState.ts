// Debug logging for tournament state
export function logTournamentState({
  roundNumber,
  winnersBracketTeams,
  losersBracketTeams,
  matches,
  winnersBracketFinalLoser
}: {
  roundNumber: number,
  winnersBracketTeams: any[],
  losersBracketTeams: any[],
  matches: any[],
  winnersBracketFinalLoser: any
}) {
  // eslint-disable-next-line no-console
  console.log('--- TOURNAMENT DEBUG ---');
  console.log('Round:', roundNumber);
  console.log('Winners Bracket Teams:', winnersBracketTeams.map(t => `${t.name} (${t.id})`).join(', '));
  console.log('Losers Bracket Teams:', losersBracketTeams.map(t => `${t.name} (${t.id})`).join(', '));
  console.log('Matches:');
  matches.forEach(m =>
    console.log(`  [${m.bracket}] ${m.team1?.name ?? 'TBD'} vs ${m.team2?.name ?? 'TBD'} | isCompleted: ${m.isCompleted} | isBye: ${m.isBye}`)
  );
  if (winnersBracketFinalLoser) {
    console.log('Winners Bracket Final Loser:', winnersBracketFinalLoser.name, winnersBracketFinalLoser.id);
  }
  console.log('------------------------');
}
