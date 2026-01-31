// Main Menu Component
import { gameRegistry } from '../games/game-registry.js';
import { getHighScore } from '../state.js';

export class Menu {
  constructor(container, options) {
    this.container = container;
    this.onSelectGame = options.onSelectGame;
  }

  render() {
    const games = gameRegistry.getAll();

    this.container.innerHTML = `
      <div class="menu">
        <p class="menu-subtitle">Choose a game to play!</p>

        <div class="game-list">
          ${games.map(game => this.renderGameCard(game)).join('')}
        </div>

        ${this.renderHighScores(games)}
      </div>
    `;

    this.bindEvents();
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

    return `
      <div class="high-score-section">
        <div class="high-score-title">Your Best Scores</div>
        ${scores.map(({ game, highScore }) => `
          <div class="high-score-value">
            ${game.displayName}: ${highScore.score}/${highScore.total}
          </div>
        `).join('')}
      </div>
    `;
  }

  bindEvents() {
    const cards = this.container.querySelectorAll('.game-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const gameName = card.dataset.game;
        this.onSelectGame(gameName);
      });
    });
  }

  destroy() {
    // Cleanup if needed
  }
}
