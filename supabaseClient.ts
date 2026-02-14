import { createClient } from '@supabase/supabase-js';

// Configuration extraite de la clé API fournie
const PROJECT_ID = 'dhvwuhtstattljfrninx';
const SUPABASE_URL = `https://dhvwuhtstattljfrninx.supabase.co`;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodnd1aHRzdGF0dGxqZnJuaW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODMyODIsImV4cCI6MjA4NjY1OTI4Mn0.-b9PyjBXjUIKOyk3bo5QNT0iFHWc2b4oF8k48ctkHD0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonction utilitaire pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return SUPABASE_URL.includes(PROJECT_ID) && SUPABASE_ANON_KEY.length > 20;
};