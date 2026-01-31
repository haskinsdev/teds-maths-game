// Results Screen Component

export class Results {
  constructor(container, options) {
    this.container = container;
    this.results = options.results;
    this.isNewHighScore = options.isNewHighScore || false;
    this.onPlayAgain = options.onPlayAgain;
    this.onMainMenu = options.onMainMenu;
  }

  render() {
    const { score, total, percentage, questions, gameDisplayName } = this.results;

    this.container.innerHTML = `
      <div class="results">
        <div class="results-header">
          <h2 class="results-title">${gameDisplayName} Complete!</h2>
        </div>

        ${this.isNewHighScore ? '<div class="new-high-score">New High Score!</div>' : ''}

        <div class="score-display">
          <div class="score-value">${score}/${total}</div>
          <div class="score-label">Questions Correct</div>
          <div class="score-percentage">${percentage}%</div>
        </div>

        <div class="results-breakdown">
          <div class="breakdown-title">Question Breakdown</div>
          <div class="breakdown-list">
            ${questions.map((q, i) => this.renderBreakdownItem(q, i)).join('')}
          </div>
        </div>

        <div class="results-actions">
          <button class="btn btn-primary" id="play-again">Play Again</button>
          <button class="btn btn-secondary" id="main-menu">Main Menu</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderBreakdownItem(item, index) {
    const { question, userAnswer, isCorrect } = item;
    const answerDisplay = userAnswer === null ? 'No answer' : userAnswer;
    const correctClass = isCorrect ? 'correct' : 'incorrect';

    return `
      <div class="breakdown-item ${correctClass}">
        <span class="breakdown-question">
          ${index + 1}. ${question.displayText} = ?
        </span>
        <span class="breakdown-answer">
          <span class="user-answer">${answerDisplay}</span>
          ${!isCorrect ? `<span class="correct-answer">(${question.correctAnswer})</span>` : ''}
        </span>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelector('#play-again').addEventListener('click', () => {
      this.onPlayAgain();
    });

    this.container.querySelector('#main-menu').addEventListener('click', () => {
      this.onMainMenu();
    });
  }

  destroy() {
    // Cleanup if needed
  }
}
