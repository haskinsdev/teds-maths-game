// Game Registry - stores all available games
const games = new Map();

export const gameRegistry = {
  // Register a new game
  register(gameModule) {
    games.set(gameModule.name, gameModule);
  },

  // Get a game by name
  get(name) {
    return games.get(name);
  },

  // Get all registered games
  getAll() {
    return Array.from(games.values());
  },

  // Check if a game is registered
  has(name) {
    return games.has(name);
  }
};
