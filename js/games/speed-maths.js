// Speed Maths Game

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

class Timer {
  constructor() {
    this.intervalId = null;
    this.remaining = 0;
    this.tickCallbacks = [];
    this.timeoutCallbacks = [];
  }

  start(seconds) {
    this.stop();
    this.remaining = seconds;

    // Emit initial tick
    this.tickCallbacks.forEach(cb => cb(this.remaining));

    this.intervalId = setInterval(() => {
      this.remaining--;
      this.tickCallbacks.forEach(cb => cb(this.remaining));

      if (this.remaining <= 0) {
        this.stop();
        this.timeoutCallbacks.forEach(cb => cb());
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onTick(callback) {
    this.tickCallbacks.push(callback);
  }

  onTimeout(callback) {
    this.timeoutCallbacks.push(callback);
  }
}

export class SpeedMathsGame {
  constructor(config) {
    this.container = config.container;
    this.onComplete = config.onComplete;

    this.settings = {
      totalQuestions: 20,
      timePerQuestion: 5,
      numberRange: { min: 1, max: 12 },
      operations: ['+', '-', '×', '÷']
    };

    this.questionGenerator = new QuestionGenerator(this.settings);
    this.timer = new Timer();

    this.currentIndex = 0;
    this.questions = [];
    this.answers = [];
    this.score = 0;
    this.isRunning = false;
  }

  init() {
    // Generate all questions
    this.questions = this.questionGenerator.generateSet(this.settings.totalQuestions);

    // Build UI
    this.container.innerHTML = `
      <div class="speed-maths">
        <div class="game-progress">
          <span class="question-counter">
            Question <span id="current-q">1</span> of ${this.settings.totalQuestions}
          </span>
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
          </div>
        </div>

        <div class="timer-display" id="timer">
          <span class="timer-value" id="timer-value">${this.settings.timePerQuestion}</span>
        </div>

        <div class="question-display" id="question"></div>

        <div class="answer-input">
          <input
            type="number"
            id="answer-input"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="off"
            placeholder="?"
          >
        </div>

        <div class="number-pad" id="number-pad"></div>
      </div>
    `;

    this.bindEvents();
    this.renderNumberPad();
  }

  bindEvents() {
    const input = this.container.querySelector('#answer-input');

    // Keyboard input
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value !== '') {
        this.submitAnswer(parseInt(input.value, 10));
      }
    });

    // Timer events
    this.timer.onTimeout(() => {
      this.submitAnswer(null);
    });

    this.timer.onTick((remaining) => {
      this.updateTimerDisplay(remaining);
    });
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
      const input = this.container.querySelector('#answer-input');

      if (value === 'C') {
        input.value = '';
      } else if (value === 'OK') {
        if (input.value !== '') {
          this.submitAnswer(parseInt(input.value, 10));
        }
      } else {
        input.value += value;
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
    const input = this.container.querySelector('#answer-input');
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

    // Reset input
    input.value = '';
    input.focus();

    // Start timer
    this.timer.start(this.settings.timePerQuestion);
  }

  submitAnswer(answer) {
    if (!this.isRunning) return;

    this.timer.stop();

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

    // Next question or end
    this.currentIndex++;

    if (this.currentIndex >= this.settings.totalQuestions) {
      this.end();
    } else {
      this.showQuestion();
    }
  }

  updateTimerDisplay(remaining) {
    const timerEl = this.container.querySelector('#timer');
    const valueEl = this.container.querySelector('#timer-value');

    valueEl.textContent = remaining;
    timerEl.classList.toggle('timer-warning', remaining <= 2);
  }

  end() {
    this.isRunning = false;
    this.timer.stop();

    const results = {
      gameName: 'speed-maths',
      gameDisplayName: 'Speed Maths',
      score: this.score,
      total: this.settings.totalQuestions,
      percentage: Math.round((this.score / this.settings.totalQuestions) * 100),
      questions: this.answers
    };

    this.onComplete(results);
  }

  destroy() {
    this.timer.stop();
    this.isRunning = false;
  }
}

// Module export for game registry
export default {
  name: 'speed-maths',
  displayName: 'Speed Maths',
  description: '20 questions, 5 seconds each. How fast is your maths?',
  icon: '⚡',
  GameClass: SpeedMathsGame
};
