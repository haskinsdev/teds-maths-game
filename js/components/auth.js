// Authentication Components
import { signIn, signUp } from '../supabase.js';

export class Login {
  constructor(container, options) {
    this.container = container;
    this.onSuccess = options.onSuccess;
    this.onSignUpClick = options.onSignUpClick;
  }

  render() {
    this.container.innerHTML = `
      <div class="auth-container">
        <h2 class="auth-title">Welcome Back!</h2>
        <p class="auth-subtitle">Sign in to sync your scores</p>

        <form class="auth-form" id="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autocomplete="email"
              placeholder="your@email.com"
            >
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autocomplete="current-password"
              placeholder="Your password"
            >
          </div>

          <div class="auth-error" id="auth-error"></div>

          <button type="submit" class="btn btn-primary btn-block" id="submit-btn">
            Sign In
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a href="#" id="signup-link">Sign up</a></p>
          <p><a href="#/" class="back-link">Back to Menu</a></p>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const form = this.container.querySelector('#login-form');
    const signupLink = this.container.querySelector('#signup-link');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(e);
    });

    signupLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.onSignUpClick();
    });
  }

  async handleSubmit(e) {
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const errorEl = this.container.querySelector('#auth-error');
    const submitBtn = this.container.querySelector('#submit-btn');

    // Clear previous errors
    errorEl.textContent = '';
    errorEl.classList.remove('visible');

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    const { data, error } = await signIn(email, password);

    if (error) {
      errorEl.textContent = error.message;
      errorEl.classList.add('visible');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
      return;
    }

    this.onSuccess(data.user);
  }

  destroy() {}
}

export class SignUp {
  constructor(container, options) {
    this.container = container;
    this.onSuccess = options.onSuccess;
    this.onLoginClick = options.onLoginClick;
  }

  render() {
    this.container.innerHTML = `
      <div class="auth-container">
        <h2 class="auth-title">Create Account</h2>
        <p class="auth-subtitle">Sign up to save your scores</p>

        <form class="auth-form" id="signup-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autocomplete="email"
              placeholder="your@email.com"
            >
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autocomplete="new-password"
              minlength="6"
              placeholder="At least 6 characters"
            >
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirmPassword"
              required
              autocomplete="new-password"
              placeholder="Confirm your password"
            >
          </div>

          <div class="auth-error" id="auth-error"></div>

          <button type="submit" class="btn btn-primary btn-block" id="submit-btn">
            Create Account
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a href="#" id="login-link">Sign in</a></p>
          <p><a href="#/" class="back-link">Back to Menu</a></p>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const form = this.container.querySelector('#signup-form');
    const loginLink = this.container.querySelector('#login-link');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(e);
    });

    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.onLoginClick();
    });
  }

  async handleSubmit(e) {
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const errorEl = this.container.querySelector('#auth-error');
    const submitBtn = this.container.querySelector('#submit-btn');

    // Clear previous errors
    errorEl.textContent = '';
    errorEl.classList.remove('visible');

    // Validate passwords match
    if (password !== confirmPassword) {
      errorEl.textContent = 'Passwords do not match';
      errorEl.classList.add('visible');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters';
      errorEl.classList.add('visible');
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    const { data, error } = await signUp(email, password);

    if (error) {
      errorEl.textContent = error.message;
      errorEl.classList.add('visible');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
      return;
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      errorEl.textContent = 'Please check your email to confirm your account';
      errorEl.classList.add('visible');
      errorEl.classList.add('success');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
      return;
    }

    this.onSuccess(data.user);
  }

  destroy() {}
}
