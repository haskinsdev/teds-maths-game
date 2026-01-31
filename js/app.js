// Ted's Maths Game - Main Application
import { state, updateHighScore } from './state.js';
import { gameRegistry } from './games/game-registry.js';
import { Menu } from './components/menu.js';
import { Results } from './components/results.js';

// Import and register games
import speedMathsModule from './games/speed-maths.js';
gameRegistry.register(speedMathsModule);

// Get view container
const viewContainer = document.getElementById('view-container');

// Current view/game instance
let currentView = null;

// Navigation functions
function showMenu() {
  destroyCurrentView();

  currentView = new Menu(viewContainer, {
    onSelectGame: (gameName) => {
      window.location.hash = `#/game/${gameName}`;
    }
  });

  currentView.render();
  state.currentView = 'menu';
}

function startGame(gameName) {
  const gameModule = gameRegistry.get(gameName);
  if (!gameModule) {
    showMenu();
    return;
  }

  destroyCurrentView();

  const game = new gameModule.GameClass({
    container: viewContainer,
    onComplete: (results) => {
      // Check for high score
      const isNewHighScore = updateHighScore(
        results.gameName,
        results.score,
        results.total
      );

      state.lastResults = results;
      state.lastResults.isNewHighScore = isNewHighScore;

      window.location.hash = '#/results';
    }
  });

  currentView = game;
  state.activeGame = game;
  state.currentView = 'game';

  game.init();
  game.start();
}

function showResults() {
  if (!state.lastResults) {
    showMenu();
    return;
  }

  destroyCurrentView();

  currentView = new Results(viewContainer, {
    results: state.lastResults,
    isNewHighScore: state.lastResults.isNewHighScore,
    onPlayAgain: () => {
      window.location.hash = `#/game/${state.lastResults.gameName}`;
    },
    onMainMenu: () => {
      window.location.hash = '#/';
    }
  });

  currentView.render();
  state.currentView = 'results';
}

function destroyCurrentView() {
  if (currentView && currentView.destroy) {
    currentView.destroy();
  }
  currentView = null;
  state.activeGame = null;
}

// Simple hash router
function handleRoute() {
  const hash = window.location.hash || '#/';

  if (hash === '#/' || hash === '') {
    showMenu();
  } else if (hash.startsWith('#/game/')) {
    const gameName = hash.replace('#/game/', '');
    startGame(gameName);
  } else if (hash === '#/results') {
    showResults();
  } else {
    showMenu();
  }
}

// Initialize router
window.addEventListener('hashchange', handleRoute);

// Handle initial route
if (!window.location.hash) {
  window.location.hash = '#/';
} else {
  handleRoute();
}
