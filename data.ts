import { Question, Debate } from './types';

export const QUESTIONS: Question[] = [
  // === MUSIQUE PERSO ===
  {
    id: 'q1',
    type: 'qcm',
    category: 'Musique Perso',
    q: "Qui écoute 'Talking to the Moon' de Bruno Mars ?",
    opts: ["Mickael & Aina", "Mirana", "Nakib", "Tout le monde"],
    ok: 1,
    explanation: "C'est dans les titres likés de Mirana ! Bruno Mars, le romantique par excellence. 🌙"
  },
  {
    id: 'q2',
    type: 'qcm',
    category: 'Musique Perso',
    q: "Quel rappeur français Nakib rajoute en plus dans sa playlist ?",
    opts: ["Ninho", "Timar", "SDM", "Werenoi"],
    ok: 1,
    explanation: "Nakib est fan de Timar ! On retrouve ses sons comme 'SIERRA LEONE' aussi chez le couple 2."
  },
  {
    id: 'q3',
    type: 'qcm',
    category: 'Musique Perso',
    q: "Quel duo chante 'Tsunami' dans la playlist de Mickael & Aina ?",
    opts: ["Tiakola & Ronisia", "Hamza & Damso", "Favé & Timar", "Ninho & SDM"],
    ok: 2,
    explanation: "Favé et Timar sur 'Tsunami', extrait de l'album Pleins Phares. Un son de fou ! 🌊"
  },
  {
    id: 'q4',
    type: 'qcm',
    category: 'Musique Perso',
    q: "Quel titre de Tayc se trouve dans la playlist du couple 2 ?",
    opts: ["Le Temps", "Forévà", "N'y pense plus", "Do It"],
    ok: 1,
    explanation: "Tayc - Forévà, extrait de TESTIMONY. Et aussi 'Comme toi' de Fleur froide ! Tayc en force 💕"
  },
  {
    id: 'q5',
    type: 'qcm',
    category: 'Musique Perso',
    q: "Quel artiste est présent dans les playlists des DEUX couples ?",
    opts: ["Werenoi", "Hamza", "SDM", "Gunna"],
    ok: 1,
    explanation: "Hamza est écouté par tout le monde ! 'Fake Friends' chez Mirana, 'FOREVER' et 'YESTERDAY' chez Mickael & Aina. 🔥"
  },
  {
    id: 'q6',
    type: 'qcm',
    category: 'Musique Perso',
    q: "Quel titre de Shenseea est dans la playlist de Mirana ?",
    opts: ["Blessed", "Foreplay", "Lick", "Hit & Run"],
    ok: 1,
    explanation: "Foreplay de Shenseea ! Un son bien groovy dans les likés de Mirana. 💃"
  },
  {
    id: 'q7',
    type: 'qcm',
    category: 'Musique Perso',
    q: "Qui écoute 'Let Me Love You' de Mario ?",
    opts: ["Mirana", "Nakib", "Mickael & Aina", "Personne"],
    ok: 2,
    explanation: "Le classique R&B 'Let Me Love You' de Mario est dans la playlist du couple 2 ! Un titre intemporel. 🎤"
  },
  {
    id: 'q8',
    type: 'qcm',
    category: 'Musique Perso',
    q: "Quel son de Nono La Grinta est dans la playlist de Mirana ?",
    opts: ["Restaurant", "LOVE YOU", "Amour Fou", "Bella"],
    ok: 1,
    explanation: "LOVE YOU de Nono La Grinta dans les titres likés de Mirana ! Et 'Restaurant' est chez Mickael & Aina. Le gars est partout 😄"
  },
  // === AMOUR & SÉRIES ===
  {
    id: 'q9',
    type: 'qcm',
    category: 'Amour & Séries',
    q: "Dans quel film culte entend-on 'You had me at hello' ?",
    opts: ["Titanic", "Jerry Maguire", "Bridget Jones", "Pretty Woman"],
    ok: 1,
    explanation: "Tom Cruise dans Jerry Maguire (1996). Renée Zellweger lui répond cette réplique mythique. 🎬"
  },
  {
    id: 'q10',
    type: 'qcm',
    category: 'Amour & Séries',
    q: "Dans 'Titanic', comment s'appelle le personnage joué par Leonardo DiCaprio ?",
    opts: ["William", "Jack", "Thomas", "Edward"],
    ok: 1,
    explanation: "Jack Dawson ! 'I'm the king of the world!' 🚢"
  },
  {
    id: 'q11',
    type: 'qcm',
    category: 'Amour & Séries',
    q: "Dans la série 'Friends', qui dit 'We were on a break!' ?",
    opts: ["Joey", "Chandler", "Ross", "Monica"],
    ok: 2,
    explanation: "Le fameux débat de Ross et Rachel ! 'WE WERE ON A BREAK!' est devenu culte. 😂"
  },
  {
    id: 'q12',
    type: 'qcm',
    category: 'Amour & Séries',
    q: "Quelle princesse Disney chante 'Un jour mon prince viendra' ?",
    opts: ["Cendrillon", "Belle", "Blanche-Neige", "Aurore"],
    ok: 2,
    explanation: "Blanche-Neige ! Le tout premier long-métrage Disney (1937). 👸"
  },
  // === SPORT & LOVE ===
  {
    id: 'q13',
    type: 'qcm',
    category: 'Sport & Love',
    q: "Quel couple célèbre du football habite le fameux 'Beckingham Palace' ?",
    opts: ["Cristiano & Georgina", "Mbappé & sa copine", "David & Victoria Beckham", "Neymar & Bruna"],
    ok: 2,
    explanation: "David et Victoria Beckham ont surnommé leur manoir 'Beckingham Palace' ! Le power couple ultime ⚽👗"
  },
  {
    id: 'q14',
    type: 'qcm',
    category: 'Sport & Love',
    q: "Dans quel sport le score 'Love' signifie zéro ?",
    opts: ["Badminton", "Tennis", "Golf", "Cricket"],
    ok: 1,
    explanation: "Au tennis, 'Love' = 0 point ! L'origine viendrait du français 'l'œuf' (la forme du zéro). 🎾💕"
  },
  {
    id: 'q15',
    type: 'qcm',
    category: 'Sport & Love',
    q: "Quel footballeur a célébré un but en dévoilant un t-shirt 'I love you' pour sa femme enceinte ?",
    opts: ["Cristiano Ronaldo", "Memphis Depay", "Neymar", "Griezmann"],
    ok: 0,
    explanation: "Cristiano Ronaldo l'a fait à plusieurs reprises pour Georgina et ses enfants ! Le papa gâteau du foot. ⚽❤️"
  },
  // === CULTURE G SPÉCIALE ===
  {
    id: 'q16',
    type: 'qcm',
    category: 'Culture G Spéciale',
    q: "D'où vient la fête de la Saint-Valentin ?",
    opts: ["Saint Valentin de Rome", "Le dieu Cupidon", "Une invention Hallmark", "Saint Valentin de Terni"],
    ok: 3,
    explanation: "Saint Valentin de Terni, un prêtre du IIIe siècle qui mariait en secret les soldats romains ! 💒"
  },
  {
    id: 'q17',
    type: 'qcm',
    category: 'Culture G Spéciale',
    q: "Quel est le symbole chimique de l'or, celui des alliances ?",
    opts: ["Ag", "Or", "Au", "Go"],
    ok: 2,
    explanation: "'Au' vient du latin 'Aurum'. L'or des alliances symbolise l'éternité car il ne s'oxyde pas. 💍"
  },
  {
    id: 'q18',
    type: 'qcm',
    category: 'Culture G Spéciale',
    q: "Quel pays offre le plus de roses à la Saint-Valentin ?",
    opts: ["France", "États-Unis", "Colombie", "Pays-Bas"],
    ok: 1,
    explanation: "Les Américains achètent environ 250 millions de roses pour la Saint-Valentin chaque année ! 🌹"
  },
  {
    id: 'q19',
    type: 'qcm',
    category: 'Culture G Spéciale',
    q: "En quelle année le premier SMS 'Je t'aime' a-t-il été envoyé ?",
    opts: ["1992", "1997", "2000", "1995"],
    ok: 0,
    explanation: "Le premier SMS a été envoyé en 1992 ! Les SMS d'amour ont vite suivi ! 📱"
  },
  // === MUSIQUE GÉNÉRALE ===
  {
    id: 'q20',
    type: 'qcm',
    category: 'Musique Générale',
    q: "Qui chante 'All of Me', l'une des plus grandes chansons d'amour moderne ?",
    opts: ["Ed Sheeran", "Bruno Mars", "John Legend", "Adele"],
    ok: 2,
    explanation: "John Legend a écrit 'All of Me' pour sa femme Chrissy Teigen. Un classique ! 🎹💕"
  },
  {
    id: 'q21',
    type: 'qcm',
    category: 'Musique Générale',
    q: "Quel artiste chante 'Perfect' en duo avec Beyoncé ?",
    opts: ["Justin Bieber", "Ed Sheeran", "Sam Smith", "Chris Martin"],
    ok: 1,
    explanation: "Ed Sheeran et Beyoncé sur le remix de 'Perfect' ! La version parfaite pour un mariage. 💐"
  },
  {
    id: 'q22',
    type: 'qcm',
    category: 'Musique Générale',
    q: "Quel titre de Craig David parle d'une rencontre qui dure une semaine ?",
    opts: ["Walking Away", "Fill Me In", "7 Days", "Rendezvous"],
    ok: 2,
    explanation: "'7 Days' de Craig David ! Et ce titre est aussi dans la playlist de Mickael & Aina. Le R&B à l'ancienne ! 🎶"
  },
  {
    id: 'q23',
    type: 'qcm',
    category: 'Musique Générale',
    q: "Quel est le vrai nom de l'artiste Damso ?",
    opts: ["William Kalubi", "Stanley Enow", "Daouda Keita", "William Kalubi Mwamba"],
    ok: 0,
    explanation: "William Kalubi Mwamba, connu sous le nom de Damso ! 'Pa Pa Paw' est dans la playlist de Mickael & Aina. 🎤"
  },
  {
    id: 'q24',
    type: 'qcm',
    category: 'Musique Perso',
    q: "Quel son de Ella Mai est dans la playlist du couple 2 ?",
    opts: ["Boo'd Up", "Trip", "Naked", "Not Another Love Song"],
    ok: 2,
    explanation: "Naked (Bonus Track) de Ella Mai et aussi 'Little Things' ! Du pur R&B dans la playlist. 🎵"
  },
  {
    id: 'q25',
    type: 'qcm',
    category: 'Musique Perso',
    q: "Quel titre de Leto se retrouve dans les playlists des DEUX couples ?",
    opts: ["Tout gâché", "AIME MOI (avec Joé Dwèt Filé)", "Bendo", "Les deux premiers"],
    ok: 3,
    explanation: "'Tout gâché' est chez Mirana et 'AIME MOI' avec Joé Dwèt Filé est chez Mickael & Aina ! Leto rassemble ! 🔥"
  }
];

export const DEBATES: Debate[] = [
  {
    id: 'd1',
    type: 'debate',
    category: 'Couple',
    title: "Le téléphone de l'autre 📱",
    scenario: "Ton/ta partenaire te demande de lui montrer ton téléphone, messages et tout. Il/elle dit que 'si t'as rien à cacher, c'est pas un problème'.",
    optionA: "C'est normal, la transparence c'est la base d'un couple.",
    optionB: "Non, chacun a droit à son intimité, même en couple."
  },
  {
    id: 'd2',
    type: 'debate',
    category: 'Relation',
    title: "L'ex qui revient 👀",
    scenario: "L'ex de ton/ta partenaire lui envoie un message 'innocent' pour prendre des nouvelles. Ton/ta partenaire te montre le message.",
    optionA: "Aucun souci, je fais confiance. Il/elle peut répondre.",
    optionB: "Je préfère qu'il/elle ne réponde pas. On ne rallume pas un vieux feu."
  },
  {
    id: 'd3',
    type: 'debate',
    category: 'Intimité',
    title: "Best friend de l'autre sexe 🤝",
    scenario: "Ton/ta partenaire a un(e) meilleur(e) ami(e) du sexe opposé. Ils se voient souvent, parfois en tête-à-tête.",
    optionA: "Pas de problème, l'amitié homme-femme existe !",
    optionB: "Ça me dérange, certaines limites doivent être posées."
  },
  {
    id: 'd4',
    type: 'debate',
    category: 'Futur',
    title: "Mariage : pour ou contre ? 💍",
    scenario: "Après plusieurs années en couple, votre partenaire vous dit qu'il/elle ne veut pas se marier. Il/elle vous aime mais ne croit pas au mariage.",
    optionA: "L'amour suffit, pas besoin de papiers pour prouver quoi que ce soit.",
    optionB: "Le mariage est important pour moi, c'est un engagement qui compte."
  },
  {
    id: 'd5',
    type: 'debate',
    category: 'Couple',
    title: "La charge mentale 🧠",
    scenario: "Dans le couple, une personne gère tout (courses, ménage, planification). L'autre dit qu'il/elle 'aide quand on lui demande'.",
    optionA: "C'est normal de demander, on ne devine pas tout automatiquement.",
    optionB: "Non, un adulte devrait voir ce qu'il y a à faire sans qu'on le dise."
  },
  {
    id: 'd6',
    type: 'debate',
    category: 'Relation',
    title: "Réseaux sociaux & couple 📸",
    scenario: "Ton/ta partenaire ne poste jamais rien de votre couple sur les réseaux. Pas de photos ensemble, pas de story. Il/elle dit que 'c'est privé'.",
    optionA: "Respecte son choix, un couple n'a pas besoin d'être sur Instagram.",
    optionB: "Ça me dérange, j'aimerais qu'il/elle montre qu'on est ensemble."
  },
  {
    id: 'd7',
    type: 'debate',
    category: 'Futur',
    title: "Vivre ensemble vs garder son appart 🏠",
    scenario: "Après 2 ans de relation, vous hésitez entre emménager ensemble ou garder chacun son appart.",
    optionA: "On emménage ensemble, c'est la prochaine étape logique.",
    optionB: "On garde chacun son espace, c'est le secret pour durer."
  },
  {
    id: 'd8',
    type: 'debate',
    category: 'Intimité',
    title: "Le voyage solo ✈️",
    scenario: "Ton/ta partenaire veut partir en voyage une semaine avec ses ami(e)s, sans toi. Destination : Ibiza.",
    optionA: "Bien sûr, chacun a le droit de profiter avec ses amis !",
    optionB: "Ibiza sans moi ? J'ai quand même des doutes..."
  }
];