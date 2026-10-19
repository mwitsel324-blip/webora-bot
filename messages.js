// ─────────────────────────────────────────────────────────────
//  TOUS LES TEXTES DU BOT — modifie-les librement ici.
//  (Les boutons Instagram : 20 caractères max par titre.)
// ─────────────────────────────────────────────────────────────

export const MENU = [
  { title: 'Demander un devis', payload: 'DEVIS' },
  { title: 'Tarifs', payload: 'TARIFS' },
  { title: 'Délais', payload: 'DELAIS' },
  { title: 'Réalisations', payload: 'REALISATIONS' },
  { title: 'Parler à Adel', payload: 'HUMAIN' },
];

export const TEXTS = {
  bienvenue:
    "Bonjour et bienvenue chez WEBORA ® 👋\nCeci est un message automatique : je peux vous renseigner tout de suite, et Adel prend le relais pour votre devis.\nQue souhaitez-vous ?",
  rebonjour: "Re-bonjour ! Comment puis-je vous aider ?",

  tarifs:
    "Chez Webora, ce sont les prix les plus bas du marché. Chaque projet est différent, donc Adel vous fait un devis gratuit et sur mesure, adapté à votre budget.",
  delais:
    "Votre site est livré en un temps record, sans des mois d'attente. Le délai exact dépend de votre projet : on le fixe ensemble dans le devis.",
  realisations:
    "Webora a déjà créé des sites e-commerce de mode de luxe, des portfolios de photographe, des sites pour instituts de beauté et cabinets de soins. Jetez un œil à nos publications et à la story à la une « Réalisations » 👀",
  humain:
    "Bien sûr ! Adel a été prévenu et vous répond personnellement dès que possible.",
  incompris:
    "Je n'ai pas bien compris 🙂 Choisissez une option ci-dessous :",
  incomprisFinal:
    "Pas de souci, je laisse Adel vous répondre directement. Il revient vers vous très vite !",
  suite: "Autre chose ?",

  // Questionnaire devis
  q_activite: "Super ! Pour préparer votre devis gratuit, quelques questions rapides.\n1/5 — Quelle est votre activité ?",
  q_type: "2/5 — Quel type de site voulez-vous ?",
  q_contenu: "3/5 — Avez-vous déjà votre logo, vos photos et vos textes ?",
  q_delai: "4/5 — Pour quand aimeriez-vous votre site ?",
  q_budget: "5/5 — Avez-vous un budget en tête ? (écrivez-le, ou touchez le bouton)",
  recap: (a) =>
    `Merci ! Voici le récapitulatif :\n• Activité : ${a.activite}\n• Type de site : ${a.type}\n• Contenus : ${a.contenu}\n• Délai : ${a.delai}\n• Budget : ${a.budget}\n\nAdel revient vers vous très vite avec votre devis gratuit ✅`,
};

export const CHOICES = {
  type: [
    { title: 'Site vitrine', payload: 'Site vitrine' },
    { title: 'E-commerce', payload: 'E-commerce' },
    { title: 'Portfolio', payload: 'Portfolio' },
    { title: 'Autre', payload: 'Autre' },
  ],
  contenu: [
    { title: "Oui, j'ai tout", payload: 'Tout est prêt' },
    { title: 'Une partie', payload: 'Une partie' },
    { title: 'Rien encore', payload: 'Rien encore' },
  ],
  delai: [
    { title: 'Urgent', payload: 'Urgent' },
    { title: 'Dans le mois', payload: 'Dans le mois' },
    { title: 'Pas pressé', payload: 'Pas pressé' },
  ],
  budget: [{ title: 'Je ne sais pas', payload: 'Pas encore défini' }],
};

// Mots-clés reconnus quand la personne écrit au lieu de cliquer
export const KEYWORDS = [
  { action: 'DEVIS', words: ['devis', 'créer un site', 'creer un site', 'faire un site', 'besoin d\'un site', 'projet', 'site web', 'site internet'] },
  { action: 'TARIFS', words: ['prix', 'tarif', 'combien', 'coût', 'cout', 'cher', 'budget', '€', 'euro'] },
  { action: 'DELAIS', words: ['délai', 'delai', 'combien de temps', 'quand', 'rapide', 'vite', 'durée'] },
  { action: 'REALISATIONS', words: ['réalisation', 'realisation', 'exemple', 'portfolio', 'déjà fait', 'travaux'] },
  { action: 'HUMAIN', words: ['adel', 'humain', 'parler à', 'parler a', 'appeler', 'téléphone', 'telephone', 'quelqu\'un'] },
];
