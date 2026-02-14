import { supabase, isSupabaseConfigured } from './supabaseClient';
import { QUESTIONS as LOCAL_QUESTIONS, DEBATES as LOCAL_DEBATES } from './data';
import { Question, Debate, QcmCategory, DebateCategory } from './types';

// Fonction pour récupérer les QCM
export async function fetchQuestions(categories: string[]): Promise<Question[]> {
  // 1. Si Supabase n'est pas configuré, on utilise les données locales
  if (!isSupabaseConfigured()) {
    console.log('Supabase non configuré, utilisation des données locales.');
    let localData = [...LOCAL_QUESTIONS];
    if (categories.length > 0) {
      localData = localData.filter(q => categories.includes(q.category));
    }
    return localData;
  }

  // 2. Tentative de fetch depuis Supabase
  try {
    let query = supabase.from('questions').select('*');
    
    if (categories.length > 0) {
      query = query.in('category', categories);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur Supabase (QCM):", error);
      throw error;
    }

    // Si la table est vide, fallback sur local
    if (!data || data.length === 0) {
        console.warn("Table 'questions' vide ou introuvable, fallback local.");
        let localData = [...LOCAL_QUESTIONS];
        if (categories.length > 0) {
            localData = localData.filter(q => categories.includes(q.category));
        }
        return localData;
    }

    return data as Question[];

  } catch (err) {
    console.warn("Erreur de connexion, fallback sur local:", err);
    // En cas d'erreur réseau, fallback sur local
    let localData = [...LOCAL_QUESTIONS];
    if (categories.length > 0) {
      localData = localData.filter(q => categories.includes(q.category));
    }
    return localData;
  }
}

// Fonction pour récupérer les Débats
export async function fetchDebates(categories: string[]): Promise<Debate[]> {
  if (!isSupabaseConfigured()) {
    let localData = [...LOCAL_DEBATES];
    if (categories.length > 0) {
      localData = localData.filter(d => categories.includes(d.category));
    }
    return localData;
  }

  try {
    let query = supabase.from('debates').select('*');
    
    if (categories.length > 0) {
      query = query.in('category', categories);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur Supabase (Débats):", error);
      throw error;
    }

    if (!data || data.length === 0) {
        let localData = [...LOCAL_DEBATES];
        if (categories.length > 0) {
          localData = localData.filter(d => categories.includes(d.category));
        }
        return localData;
    }

    return data as Debate[];

  } catch (err) {
    let localData = [...LOCAL_DEBATES];
    if (categories.length > 0) {
      localData = localData.filter(d => categories.includes(d.category));
    }
    return localData;
  }
}