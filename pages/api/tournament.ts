import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { createInitialRounds, updateMatchScore, advanceToNextRound, Tournament, Match } from '../../types/tournament/matches';
import { teams } from '../../types/tournament/mlb-teams';

const dataPath = path.join(process.cwd(), 'data', 'tournament.json');

// Function to simulate a match result with random scores
function simulateMatchResult() {
  const team1Score = Math.floor(Math.random() * 10) + 1; // Random score between 1-10
  let team2Score;
  
  // Ensure scores are different to avoid ties
  do {
    team2Score = Math.floor(Math.random() * 10) + 1;
  } while (team1Score === team2Score);
  
  return { team1Score, team2Score };
}

// Function to complete all matches in the current round
function completeCurrentRound(tournament: Tournament): Tournament {
  const currentRound = tournament.rounds[tournament.currentRound - 1];
  
  // Complete all matches in the current round
  currentRound.matches.forEach((match: Match, index: number) => {
    // Skip completed matches and byes
    if (match.isCompleted || match.isBye) {
      return;
    }
    
    // Simulate a match result
    const result = simulateMatchResult();
    
    // Update the match with the simulated result
    const updatedMatch = updateMatchScore(match, result);
    
    // Replace the match in the current round
    currentRound.matches[index] = updatedMatch;
  });
  
  return tournament;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (req.method === 'GET') {
    // Return the current tournament state
    try {
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        const tournament: Tournament = JSON.parse(data);
        res.status(200).json(tournament);
      } else {
        // If no tournament exists, create a new one
        const tournament: Tournament = createInitialRounds(teams);
        fs.writeFileSync(dataPath, JSON.stringify(tournament, null, 2));
        res.status(200).json(tournament);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to get tournament data' });
    }
  } else if (req.method === 'POST') {
    // Handle different actions
    const { action, rounds = 1 } = req.body;

    try {
      let tournament: Tournament;

      if (action === 'reset') {
        // Reset the tournament
        tournament = createInitialRounds(teams);
        fs.writeFileSync(dataPath, JSON.stringify(tournament, null, 2));
        res.status(200).json({ message: 'Tournament reset successfully', tournament });
        return;
      }

      // Load the current tournament
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        tournament = JSON.parse(data);
      } else {
        tournament = createInitialRounds(teams);
      }

      if (action === 'advance') {
        // Advance the tournament by the specified number of rounds
        for (let i = 0; i < rounds; i++) {
          // Complete all matches in the current round
          tournament = completeCurrentRound(tournament);
          
          // Advance to the next round
          tournament = advanceToNextRound(tournament);
        }

        fs.writeFileSync(dataPath, JSON.stringify(tournament, null, 2));
        res.status(200).json({ 
          message: `Tournament advanced by ${rounds} rounds. Current round: ${tournament.currentRound}`,
          tournament 
        });
        return;
      }

      res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to process tournament action' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
