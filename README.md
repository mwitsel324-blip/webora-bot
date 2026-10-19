# Webora — Assistant automatique GRATUIT pour les DM Instagram

Cette version ne coûte **0 €**. Elle tourne sans IA payante, avec un menu à boutons, un questionnaire de devis et des mots-clés.

## Ce qu'il fait
- Au premier message, il souhaite la bienvenue (en précisant que c'est un message automatique) et propose 5 boutons : **Demander un devis · Tarifs · Délais · Réalisations · Parler à Adel**.
- Si la personne écrit au lieu de cliquer, il reconnaît les mots-clés (« prix », « combien », « devis », « délai », « exemple »…).
- **Questionnaire devis** en 5 questions : activité, type de site, contenus, délai, budget. Il envoie ensuite un récapitulatif dans la conversation (tu le lis directement dans tes DM) et se met en pause pour que tu envoies le devis.
- S'il ne comprend pas 2 fois de suite, il te passe la main au lieu de tourner en rond.
- **Si tu réponds toi-même, il se met en pause 12 h pour cette personne.**
- Commandes à taper dans une conversation : `/bot on` (le réactiver) et `/bot off` (le couper pour cette personne). Elles sont envoyées au client comme un message normal, donc supprime-les ensuite.

## Les fichiers
| Fichier | Rôle |
|---|---|
| `messages.js` | **Tous les textes, boutons et mots-clés.** C'est le seul fichier à modifier pour changer ce que dit le bot. Les titres de boutons font 20 caractères maximum. |
| `server.js` | Le moteur. Pas besoin d'y toucher. |
| `.env.example` | Les clés à remplir. |
| `package.json` | Les dépendances. |

## Ce qui est gratuit
| Service | Coût |
|---|---|
| API Instagram (Meta) | Gratuit |
| GitHub (dépôt privé) | Gratuit |
| Render (hébergement, offre Free) | Gratuit |
| UptimeRobot (empêche le serveur de s'endormir) | Gratuit |

---

# Mise en place, étape par étape

## Étape 0 — Ce qu'il te faut
- **@webora_2k en compte professionnel** (Paramètres › Type de compte et outils).
- Un compte **Facebook** (pour Meta for Developers), un compte **GitHub** et un compte **Render**, connecté avec GitHub.

## Étape 1 — Mettre le code sur GitHub
1. github.com › **New repository** › nom `webora-bot` › **Private** › Create.
2. **uploading an existing file** › glisse tous les fichiers du dossier › **Commit changes**.
> Tes clés ne vont jamais dans GitHub, uniquement dans Render.

## Étape 2 — Mettre en ligne sur Render
1. render.com › **New › Web Service** › choisis `webora-bot`.
2. Runtime **Node** · Build Command `npm install` · Start Command `npm start` · Instance **Free**.
3. **Environment**, ajoute :
   - `VERIFY_TOKEN` = un mot de passe que tu inventes (ex. `webora-2k-7391`)
   - `IG_APP_SECRET` = `a-remplir` pour l'instant
   - `IG_ACCESS_TOKEN` = `a-remplir` pour l'instant
4. **Create Web Service**. Note ton adresse (`https://webora-bot-xxxx.onrender.com`) et ouvre-la : tu dois voir « Webora bot : en ligne ✅ ».

## Étape 3 — Empêcher le serveur de s'endormir (gratuit)
Sur l'offre gratuite, Render met le serveur en veille après un moment sans visite. Le premier DM mettrait alors environ une minute à recevoir une réponse.
1. Crée un compte sur **uptimerobot.com**.
2. **New monitor** › type **HTTP(s)** › URL = ton adresse Render › intervalle **5 minutes** › Create.
UptimeRobot visite ton serveur toutes les 5 minutes, ce qui le garde éveillé. L'offre Free de Render inclut assez d'heures par mois pour un seul service allumé en permanence.

## Étape 4 — Créer l'app Meta
1. **developers.facebook.com** › Mes apps › **Créer une app**.
2. Cas d'utilisation : celui pour **gérer les messages et le contenu sur Instagram** › nom `Webora Bot` › Créer.
3. Menu de gauche : **Instagram › API setup with Instagram login**.
4. Copie l'**Instagram app secret** (en haut de la page) › Render › Environment › remplace `IG_APP_SECRET` › Save.

## Étape 5 — Connecter @webora_2k
1. Sur Instagram : Paramètres › **Messages et réponses aux stories** › **Outils connectés** › active **Autoriser l'accès aux messages**, si l'option est présente.
2. Sur Meta, section **1. Generate access tokens** › **Add account** › connecte @webora_2k et accepte.
3. **Generate token** › copie › Render › remplace `IG_ACCESS_TOKEN` › Save.
4. Render › **Logs** : tu dois voir `✅ Connecté au compte Instagram @webora_2k`.

## Étape 6 — Brancher le webhook
1. Meta, section **2. Configure webhooks** :
   - Callback URL : `https://webora-bot-xxxx.onrender.com/webhook`
   - Verify token : exactement ton `VERIFY_TOKEN`
2. **Verify and save**. Dans les logs : `✅ Webhook vérifié par Meta`.
3. Abonne-toi au champ **messages**.
4. Section 1 : active **Webhook subscription** à côté de @webora_2k.

## Étape 7 — Tester
En mode développement, seuls les comptes ajoutés à l'app peuvent déclencher le bot.
1. Meta › **Rôles de l'app › Rôles** › ajoute un **deuxième compte Instagram** comme **testeur Instagram**.
2. Accepte l'invitation depuis ce compte (instagram.com › Paramètres › Applications et sites web › Invitations de testeur).
3. Envoie « Bonjour » à @webora_2k depuis ce compte : le menu doit apparaître.
4. Fais le questionnaire devis jusqu'au bout, puis réponds toi-même pour vérifier la pause.

## Étape 8 — Ouvrir le bot à tout le monde
1. Meta › **Paramètres de l'app › Général** : ajoute une **URL de politique de confidentialité** (une page sur ton site), une icône et une catégorie.
2. **Examen de l'app** : demande l'accès avancé pour `instagram_business_basic` et `instagram_business_manage_messages`, avec une vidéo d'écran du test de l'étape 7. Meta peut aussi demander une vérification d'entreprise.
3. Une fois validé, passe l'app en mode **Live**.

---

# Entretien
- **Jeton Instagram (60 jours)** : le serveur le prolonge tout seul, mais repart du jeton enregistré dans Render s'il redémarre. Mets-toi un rappel **tous les 50 jours** : Meta › Generate token › colle-le dans Render.
- **Modifier les textes** : édite `messages.js` sur GitHub, Render redéploie automatiquement.
- La mémoire des conversations est en RAM : un redémarrage remet les conversations à zéro, ce qui n'a pas de conséquence grave.

# En cas de problème
| Symptôme | Cause probable |
|---|---|
| « Verify and save » échoue | `VERIFY_TOKEN` différent entre Render et Meta, ou serveur endormi : ouvre l'URL puis réessaie. |
| `Signature invalide` | Mauvais secret : prends l'**Instagram** app secret. |
| `Jeton Instagram invalide` | Jeton expiré ou mal copié : régénère-le. |
| Aucun log quand tu écris | Champ `messages` ou Webhook subscription non activé, ou le compte qui écrit n'est pas testeur. |
| Les boutons n'apparaissent pas | Certains écrans (Instagram sur ordinateur notamment) n'affichent pas toujours les boutons. Les mots-clés prennent alors le relais. |
