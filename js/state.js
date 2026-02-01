// Simple state management
export const state = {
  currentView: 'menu',
  activeGame: null,
  lastResults: null,
  highScores: JSON.parse(localStorage.getItem('mathBrainHighScores') || '{}'),
  // Auth state
  user: null,
  isAuthLoading: true
};

// Save high scores to localStorage
export function saveHighScores() {
  localStorage.setItem('mathBrainHighScores', JSON.stringify(state.highScores));
}

// Check and update high score for a game
export function updateHighScore(gameName, score, total) {
  const current = state.highScores[gameName];
  if (!current || score > current.score) {
    state.highScores[gameName] = {
      score,
      total,
      date: new Date().toISOString()
    };
    saveHighScores();
    return true; // New high score
  }
  return false;
}

// Get high score for a game
export function getHighScore(gameName) {
  return state.highScores[gameName] || null;
}
