import { useState, useEffect } from 'react';
import styles from '../styles/TournamentControls.module.css';
import { TournamentModel, setTournamentModel, initTournamentModel } from '@/utils/tournament/modelSwitcher';

interface TournamentControlsProps {
  onTournamentUpdate: () => void;
  onModelChange?: (model: TournamentModel) => void;
  onResetCurrentRound?: () => void;
}

export default function TournamentControls({ onTournamentUpdate, onModelChange, onResetCurrentRound }: TournamentControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentModel, setCurrentModel] = useState<TournamentModel>(TournamentModel.MOREL);
  
  // Initialize the model from localStorage on component mount
  useEffect(() => {
    const initialModel = initTournamentModel();
    setCurrentModel(initialModel);
  }, []);

  const resetTournament = async () => {
    if (!confirm('Are you sure you want to reset the tournament? This cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset' }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Tournament reset successfully!');
        onTournamentUpdate();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Failed to reset tournament');
      console.error('Error resetting tournament:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle model change
  const handleModelChange = (model: TournamentModel) => {
    setCurrentModel(model);
    setTournamentModel(model);
    if (onModelChange) {
      onModelChange(model);
    }
    setMessage(`Switched to ${model === TournamentModel.MOREL ? 'Morel' : 'MDLC'} Model`);
    // Trigger tournament update to refresh with new model
    onTournamentUpdate();
  };

  return (
    <div className={styles.controls}>
      <h2>Tournament Controls</h2>
      
      <div className={styles.controlsContainer}>
        {/* Model Toggle Section */}
        <div className={styles.modelControls}>
          <h3 className={styles.sectionTitle}>Tournament Model</h3>
          <div className={styles.modelToggleContainer}>
            <span className={`${styles.modelLabel} ${currentModel === TournamentModel.MOREL ? styles.activeLabel : ''}`}>
              Morel Model
            </span>
            
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={currentModel === TournamentModel.MDLC}
                onChange={() => handleModelChange(
                  currentModel === TournamentModel.MOREL ? TournamentModel.MDLC : TournamentModel.MOREL
                )}
                disabled={isLoading}
              />
              <span className={styles.toggleSlider}></span>
            </label>
            
            <span className={`${styles.modelLabel} ${currentModel === TournamentModel.MDLC ? styles.activeLabel : ''}`}>
              MDLC Model
            </span>
          </div>
        </div>

        {/* Tournament Actions Section */}
        <div className={styles.tournamentActions}>
          <h3 className={styles.sectionTitle}>Tournament Actions</h3>
          <div className={styles.buttonGroup}>
            <button 
              onClick={resetTournament} 
              disabled={isLoading}
              className={styles.resetButton}
            >
              {isLoading ? 'Resetting...' : 'Reset Tournament'}
            </button>
            
            {onResetCurrentRound && (
              <button 
                onClick={onResetCurrentRound}
                disabled={isLoading}
                className={styles.resetCurrentButton}
              >
                Reset Current Round
              </button>
            )}
          </div>
        </div>
      </div>
      
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
}
