// Main Menu Component
import { gameRegistry } from '../games/game-registry.js';
import { getHighScore } from '../state.js';

export class Menu {
  constructor(container, options) {
    this.container = container;
    this.user = options.user;
    this.onSelectGame = options.onSelectGame;
    this.onLogin = options.onLogin;
    this.onSignUp = options.onSignUp;
    this.onLogout = options.onLogout;
  }

  render() {
    const games = gameRegistry.getAll();

    this.container.innerHTML = `
      <div class="menu">
        ${this.renderUserSection()}

        <p class="menu-subtitle">Choose a game to play!</p>

        <div class="game-list">
          ${games.map(game => this.renderGameCard(game)).join('')}
        </div>

        ${this.renderHighScores(games)}
      </div>
    `;

    this.bindEvents();
  }

  renderUserSection() {
    if (this.user) {
      return `
        <div class="user-section logged-in">
          <div class="user-info">
            <span class="user-avatar">${this.getInitials(this.user.email)}</span>
            <span class="user-email">${this.user.email}</span>
          </div>
          <button class="btn btn-small btn-outline" id="logout-btn">Sign Out</button>
        </div>
      `;
    }

    return `
      <div class="user-section logged-out">
        <p class="login-prompt">Sign in to save your scores!</p>
        <div class="auth-buttons">
          <button class="btn btn-small btn-primary" id="login-btn">Sign In</button>
          <button class="btn btn-small btn-outline" id="signup-btn">Sign Up</button>
        </div>
      </div>
    `;
  }

  getInitials(email) {
    return email.substring(0, 2).toUpperCase();
  }

  renderGameCard(game) {
    return `
      <div class="game-card" data-game="${game.name}">
        <div class="game-icon">${game.icon}</div>
        <div class="game-info">
          <div class="game-name">${game.displayName}</div>
          <div class="game-description">${game.description}</div>
        </div>
      </div>
    `;
  }

  renderHighScores(games) {
    const scores = games
      .map(game => {
        const highScore = getHighScore(game.name);
        if (highScore) {
          return { game, highScore };
        }
        return null;
      })
      .filter(Boolean);

    if (scores.length === 0) {
      return '';
    }

    const syncStatus = this.user ? '(synced)' : '(local only)';

    return `
      <div class="high-score-section">
        <div class="high-score-title">Your Best Scores <span class="sync-status">${syncStatus}</span></div>
        ${scores.map(({ game, highScore }) => `
          <div class="high-score-value">
            ${game.displayName}: ${highScore.score}/${highScore.total}
          </div>
        `).join('')}
      </div>
    `;
  }

  bindEvents() {
    // Game cards
    const cards = this.container.querySelectorAll('.game-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const gameName = card.dataset.game;
        this.onSelectGame(gameName);
      });
    });

    // Auth buttons
    const loginBtn = this.container.querySelector('#login-btn');
    const signupBtn = this.container.querySelector('#signup-btn');
    const logoutBtn = this.container.querySelector('#logout-btn');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.onLogin());
    }
    if (signupBtn) {
      signupBtn.addEventListener('click', () => this.onSignUp());
    }
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.onLogout());
    }
  }

  destroy() {
    // Cleanup if needed
  }
}
