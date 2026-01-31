// Supabase Client Wrapper
// Configure these values from your Supabase project settings

const SUPABASE_URL = 'https://wropjvnrayvoacdzahhx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fHdBPoOZeC3S1jxTkQw2Cw_xAYV5b0Z';

let supabase = null;

// Initialize Supabase client
export function initSupabase() {
  if (typeof window.supabase !== 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  }
  console.error('Supabase SDK not loaded');
  return false;
}

// Check if Supabase is configured
export function isConfigured() {
  return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

// Auth Functions
export async function signUp(email, password) {
  if (!supabase) return { error: { message: 'Supabase not initialized' } };

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  return { data, error };
}

export async function signIn(email, password) {
  if (!supabase) return { error: { message: 'Supabase not initialized' } };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
}

export async function signOut() {
  if (!supabase) return { error: { message: 'Supabase not initialized' } };

  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback) {
  if (!supabase) return null;

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return subscription;
}

// Database Functions - Scores
export async function saveScore(gameName, score, total, percentage) {
  if (!supabase) return { error: { message: 'Supabase not initialized' } };

  const user = await getUser();
  if (!user) return { error: { message: 'Not authenticated' } };

  const { data, error } = await supabase
    .from('scores')
    .insert({
      user_id: user.id,
      game_name: gameName,
      score,
      total,
      percentage
    })
    .select()
    .single();

  return { data, error };
}

export async function getHighScores() {
  if (!supabase) return { data: null, error: { message: 'Supabase not initialized' } };

  const user = await getUser();
  if (!user) return { data: null, error: { message: 'Not authenticated' } };

  // Get best score for each game
  const { data, error } = await supabase
    .from('scores')
    .select('game_name, score, total, percentage, created_at')
    .eq('user_id', user.id)
    .order('score', { ascending: false });

  if (error) return { data: null, error };

  // Group by game and get highest score
  const highScores = {};
  data.forEach(row => {
    if (!highScores[row.game_name] || row.score > highScores[row.game_name].score) {
      highScores[row.game_name] = {
        score: row.score,
        total: row.total,
        percentage: row.percentage,
        date: row.created_at
      };
    }
  });

  return { data: highScores, error: null };
}

export async function getLeaderboard(gameName, limit = 10) {
  if (!supabase) return { data: null, error: { message: 'Supabase not initialized' } };

  // Get top scores for a game (would need user profiles table for names)
  const { data, error } = await supabase
    .from('scores')
    .select('score, total, percentage, created_at, user_id')
    .eq('game_name', gameName)
    .order('score', { ascending: false })
    .limit(limit);

  return { data, error };
}
