// Practice Maths Game - No time limit, learn at your own pace

class QuestionGenerator {
  constructor(settings) {
    this.settings = settings;
  }

  generateSet(count) {
    const questions = [];
    const operations = this.settings.operations;

    // Distribute operations evenly
    for (let i = 0; i < count; i++) {
      const operator = operations[i % operations.length];
      questions.push(this.generateQuestion(operator));
    }

    // Shuffle the questions
    return this.shuffle(questions);
  }

  generateQuestion(operator) {
    const { min, max } = this.settings.numberRange;
    let operand1, operand2, correctAnswer;

    switch (operator) {
      case '+':
        operand1 = this.randomInt(min, max);
        operand2 = this.randomInt(min, max);
        correctAnswer = operand1 + operand2;
        break;

      case '-':
        // Ensure positive result
        operand1 = this.randomInt(min, max);
        operand2 = this.randomInt(min, operand1);
        correctAnswer = operand1 - operand2;
        break;

      case '×':
        operand1 = this.randomInt(min, max);
        operand2 = this.randomInt(min, max);
        correctAnswer = operand1 * operand2;
        break;

      case '÷':
        // Work backwards to ensure whole number result
        operand2 = this.randomInt(Math.max(min, 2), max);
        correctAnswer = this.randomInt(min, max);
        operand1 = operand2 * correctAnswer;
        break;
    }

    return {
      operand1,
      operand2,
      operator,
      correctAnswer,
      displayText: `${operand1} ${operator} ${operand2}`
    };
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

export class PracticeMathsGame {
  constructor(config) {
    this.container = config.container;
    this.onComplete = config.onComplete;

    this.settings = {
      totalQuestions: 20,
      numberRange: { min: 1, max: 12 },
      operations: ['+', '-', '×', '÷']
    };

    this.questionGenerator = new QuestionGenerator(this.settings);

    this.currentIndex = 0;
    this.questions = [];
    this.answers = [];
    this.score = 0;
    this.isRunning = false;
  }

  init() {
    // Generate all questions
    this.questions = this.questionGenerator.generateSet(this.settings.totalQuestions);

    // Build UI (no timer display)
    this.container.innerHTML = `
      <div class="practice-maths">
        <div class="game-progress">
          <span class="question-counter">
            Question <span id="current-q">1</span> of ${this.settings.totalQuestions}
          </span>
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
          </div>
        </div>

        <div class="practice-hint">Take your time!</div>

        <div class="question-display" id="question"></div>

        <div class="answer-display" id="answer-display">?</div>

        <div class="number-pad" id="number-pad"></div>
      </div>
    `;

    this.bindEvents();
    this.renderNumberPad();
  }

  bindEvents() {
    // Store current answer as string
    this.currentAnswer = '';

    // Keyboard input for desktop users
    this.keyHandler = (e) => {
      if (!this.isRunning) return;

      if (e.key >= '0' && e.key <= '9') {
        this.currentAnswer += e.key;
        this.updateAnswerDisplay();
      } else if (e.key === 'Backspace') {
        this.currentAnswer = this.currentAnswer.slice(0, -1);
        this.updateAnswerDisplay();
      } else if (e.key === 'Enter' && this.currentAnswer !== '') {
        this.submitAnswer(parseInt(this.currentAnswer, 10));
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  updateAnswerDisplay() {
    const display = this.container.querySelector('#answer-display');
    display.textContent = this.currentAnswer || '?';
  }

  renderNumberPad() {
    const pad = this.container.querySelector('#number-pad');
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'];

    pad.innerHTML = numbers.map(n => {
      let cls = 'num-btn';
      if (n === 'C') cls += ' num-btn-c';
      if (n === 'OK') cls += ' num-btn-ok';
      return `<button class="${cls}" data-value="${n}">${n}</button>`;
    }).join('');

    pad.addEventListener('click', (e) => {
      const btn = e.target.closest('.num-btn');
      if (!btn || !this.isRunning) return;

      const value = btn.dataset.value;

      if (value === 'C') {
        this.currentAnswer = '';
        this.updateAnswerDisplay();
      } else if (value === 'OK') {
        if (this.currentAnswer !== '') {
          this.submitAnswer(parseInt(this.currentAnswer, 10));
        }
      } else {
        this.currentAnswer += value;
        this.updateAnswerDisplay();
      }
    });
  }

  start() {
    this.isRunning = true;
    this.showQuestion();
  }

  showQuestion() {
    const question = this.questions[this.currentIndex];
    const questionEl = this.container.querySelector('#question');
    const counterEl = this.container.querySelector('#current-q');
    const progressEl = this.container.querySelector('#progress-fill');

    // Update UI
    questionEl.innerHTML = `
      <span class="operand">${question.operand1}</span>
      <span class="operator">${question.operator}</span>
      <span class="operand">${question.operand2}</span>
      <span class="equals">=</span>
    `;

    counterEl.textContent = this.currentIndex + 1;
    progressEl.style.width = `${(this.currentIndex / this.settings.totalQuestions) * 100}%`;

    // Reset answer
    this.currentAnswer = '';
    this.updateAnswerDisplay();
  }

  submitAnswer(answer) {
    if (!this.isRunning) return;

    const question = this.questions[this.currentIndex];
    const isCorrect = answer === question.correctAnswer;

    // Record answer
    this.answers.push({
      question: question,
      userAnswer: answer,
      isCorrect: isCorrect
    });

    if (isCorrect) {
      this.score++;
    }

    // Show feedback
    this.showFeedback(isCorrect, question.correctAnswer, () => {
      // Next question or end
      this.currentIndex++;

      if (this.currentIndex >= this.settings.totalQuestions) {
        this.end();
      } else {
        this.showQuestion();
      }
    });
  }

  showFeedback(isCorrect, correctAnswer, onComplete) {
    const questionEl = this.container.querySelector('#question');

    // Temporarily stop accepting input
    this.isRunning = false;

    if (isCorrect) {
      questionEl.innerHTML += `<span class="feedback feedback-correct">Correct!</span>`;
      setTimeout(() => {
        this.isRunning = true;
        onComplete();
      }, 500);
    } else {
      questionEl.innerHTML += `<span class="feedback feedback-incorrect">The answer was ${correctAnswer}</span>`;
      setTimeout(() => {
        this.isRunning = true;
        onComplete();
      }, 1500);
    }
  }

  end() {
    this.isRunning = false;

    const results = {
      gameName: 'practice-maths',
      gameDisplayName: 'Practice Mode',
      score: this.score,
      total: this.settings.totalQuestions,
      percentage: Math.round((this.score / this.settings.totalQuestions) * 100),
      questions: this.answers
    };

    this.onComplete(results);
  }

  destroy() {
    this.isRunning = false;
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }
  }
}

// Module export for game registry
export default {
  name: 'practice-maths',
  displayName: 'Practice Mode',
  description: '20 questions, no time limit. Practice at your own pace!',
  icon: '📝',
  GameClass: PracticeMathsGame
};
