import * as morelModel from '@/types/tournament/matches-morel';
import * as mdlcModel from '@/types/tournament/matches-mdlc';
import type { Team } from '@/types/tournament/mlb-teams';

export enum TournamentModel {
  MOREL = 'morel',
  MDLC = 'mdlc'
}

// Store the current model choice
let currentModel: TournamentModel = TournamentModel.MOREL;

// Get the current tournament model functions
export function getCurrentModel() {
  return currentModel === TournamentModel.MOREL ? morelModel : mdlcModel;
}

// Set the tournament model
export function setTournamentModel(model: TournamentModel) {
  currentModel = model;
  // Save to localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('tournamentModel', model);
  }
  return getCurrentModel();
}

// Initialize the tournament model from localStorage if available
export function initTournamentModel(): TournamentModel {
  if (typeof window !== 'undefined') {
    const savedModel = localStorage.getItem('tournamentModel') as TournamentModel;
    if (savedModel && Object.values(TournamentModel).includes(savedModel)) {
      currentModel = savedModel;
    }
  }
  return currentModel;
}

// Create initial rounds with the current model
export function createInitialRounds(teams: Team[]) {
  return getCurrentModel().createInitialRounds(teams);
}

// Update match score with the current model
export function updateMatchScore(match: morelModel.Match | mdlcModel.Match, newScore: { team1Score: number; team2Score: number }) {
  return getCurrentModel().updateMatchScore(match, newScore);
}

// Advance to next round with the current model
export function advanceToNextRound(tournament: morelModel.Tournament | mdlcModel.Tournament) {
  return getCurrentModel().advanceToNextRound(tournament);
}
