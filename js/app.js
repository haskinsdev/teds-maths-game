// Math Brain - Main Application
import { state, updateHighScore } from './state.js';
import { gameRegistry } from './games/game-registry.js';
import { Menu } from './components/menu.js';
import { Results } from './components/results.js';
import { Login, SignUp } from './components/auth.js';
import {
  initSupabase,
  isConfigured,
  getSession,
  onAuthStateChange,
  saveScore,
  getHighScores,
  signOut
} from './supabase.js';

// Import and register games
import speedMathsModule from './games/speed-maths.js';
import practiceMathsModule from './games/practice-maths.js';
gameRegistry.register(speedMathsModule);
gameRegistry.register(practiceMathsModule);

// Get view container
const viewContainer = document.getElementById('view-container');

// Current view/game instance
let currentView = null;

// Initialize Supabase
const supabaseReady = initSupabase();
const supabaseConfigured = isConfigured();

// Navigation functions
function showMenu() {
  destroyCurrentView();

  currentView = new Menu(viewContainer, {
    user: state.user,
    onSelectGame: (gameName) => {
      window.location.hash = `#/game/${gameName}`;
    },
    onLogin: () => {
      window.location.hash = '#/login';
    },
    onSignUp: () => {
      window.location.hash = '#/signup';
    },
    onLogout: async () => {
      await signOut();
      state.user = null;
      // Reload high scores from localStorage
      state.highScores = JSON.parse(localStorage.getItem('mathBrainHighScores') || '{}');
      showMenu();
    }
  });

  currentView.render();
  state.currentView = 'menu';
}

function showLogin() {
  destroyCurrentView();

  currentView = new Login(viewContainer, {
    onSuccess: (user) => {
      state.user = user;
      loadCloudHighScores().then(() => {
        window.location.hash = '#/';
      });
    },
    onSignUpClick: () => {
      window.location.hash = '#/signup';
    }
  });

  currentView.render();
  state.currentView = 'login';
}

function showSignUp() {
  destroyCurrentView();

  currentView = new SignUp(viewContainer, {
    onSuccess: (user) => {
      state.user = user;
      window.location.hash = '#/';
    },
    onLoginClick: () => {
      window.location.hash = '#/login';
    }
  });

  currentView.render();
  state.currentView = 'signup';
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
    onComplete: async (results) => {
      // Save to localStorage (always)
      const isNewHighScore = updateHighScore(
        results.gameName,
        results.score,
        results.total
      );

      // Save to cloud if logged in
      if (state.user && supabaseConfigured) {
        await saveScore(
          results.gameName,
          results.score,
          results.total,
          results.percentage
        );
        // Refresh cloud high scores
        await loadCloudHighScores();
      }

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

// Load high scores from Supabase
async function loadCloudHighScores() {
  if (!state.user || !supabaseConfigured) return;

  const { data, error } = await getHighScores();
  if (!error && data) {
    // Merge cloud scores with local (cloud takes priority)
    state.highScores = { ...state.highScores, ...data };
  }
}

// Simple hash router
function handleRoute() {
  const hash = window.location.hash || '#/';

  if (hash === '#/' || hash === '') {
    showMenu();
  } else if (hash === '#/login') {
    if (state.user) {
      window.location.hash = '#/';
    } else {
      showLogin();
    }
  } else if (hash === '#/signup') {
    if (state.user) {
      window.location.hash = '#/';
    } else {
      showSignUp();
    }
  } else if (hash.startsWith('#/game/')) {
    const gameName = hash.replace('#/game/', '');
    startGame(gameName);
  } else if (hash === '#/results') {
    showResults();
  } else {
    showMenu();
  }
}

// Initialize auth state
async function initAuth() {
  if (!supabaseReady || !supabaseConfigured) {
    state.isAuthLoading = false;
    handleRoute();
    return;
  }

  // Check for existing session
  const session = await getSession();
  if (session) {
    state.user = session.user;
    await loadCloudHighScores();
  }

  state.isAuthLoading = false;

  // Listen for auth changes
  onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      state.user = session.user;
      loadCloudHighScores();
    } else if (event === 'SIGNED_OUT') {
      state.user = null;
    }
  });

  handleRoute();
}

// Initialize router
window.addEventListener('hashchange', handleRoute);

// Initialize app
initAuth();
