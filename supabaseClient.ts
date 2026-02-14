import { createClient } from '@supabase/supabase-js';

// Configuration extraite de la clé API fournie
const PROJECT_ID = 'pwcyckvoctijcmsrokbz';
const SUPABASE_URL = `https://pwcyckvoctijcmsrokbz.supabase.co`;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3Y3lja3ZvY3RpamNtc3Jva2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzIxODUsImV4cCI6MjA4NDQwODE4NX0.126oO1Wvk3EyYqNOVj81QqYd8GTaZbOblaTH6dvNStw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonction utilitaire pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return SUPABASE_URL.includes(PROJECT_ID) && SUPABASE_ANON_KEY.length > 20;
};