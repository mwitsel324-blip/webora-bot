// ─────────────────────────────────────────────────────────────
//  Webora — Assistant automatique GRATUIT pour les DM Instagram
//  Menu à boutons + questionnaire devis + mots-clés. Aucune IA payante.
// ─────────────────────────────────────────────────────────────
import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import { MENU, TEXTS, CHOICES, KEYWORDS } from './messages.js';

const {
  PORT = 3000,
  VERIFY_TOKEN,
  IG_APP_SECRET,
  IG_ACCESS_TOKEN,
  GRAPH_VERSION = 'v26.0',
  PAUSE_HOURS = '12',
  DEBOUNCE_MS = '3000',
} = process.env;

for (const [k, v] of Object.entries({ VERIFY_TOKEN, IG_APP_SECRET, IG_ACCESS_TOKEN })) {
  if (!v) { console.error(`❌ Variable manquante : ${k}`); process.exit(1); }
}

const GRAPH = `https://graph.instagram.com/${GRAPH_VERSION}`;
const pauseMs = Number(PAUSE_HOURS) * 3600 * 1000;
let accessToken = IG_ACCESS_TOKEN;

// ── Mémoire (en RAM) ──
const users       = new Map(); // userId -> { step, answers, misses, known, lastSeen }
const pausedUntil = new Map(); // userId -> timestamp
const pending     = new Map(); // userId -> { parts, payload, timer }
const seenMids    = new Set();
const botEchoes   = new Set(); // "userId|texte" envoyés par le bot

const STEPS = ['activite', 'type', 'contenu', 'delai', 'budget'];

function getUser(id) {
  if (!users.has(id)) users.set(id, { step: null, answers: {}, misses: 0, known: false, lastSeen: Date.now() });
  const u = users.get(id); u.lastSeen = Date.now(); return u;
}
function isPaused(id) {
  const t = pausedUntil.get(id);
  if (!t) return false;
  if (Date.now() > t) { pausedUntil.delete(id); return false; }
  return true;
}
function pause(id, ms = pauseMs) { pausedUntil.set(id, Date.now() + ms); }

// ── Express ──
const app = express();
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

app.get('/', (_req, res) => res.send('Webora bot : en ligne ✅'));

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log('✅ Webhook vérifié par Meta');
    return res.status(200).send(req.query['hub.challenge']);
  }
  res.sendStatus(403);
});

app.post('/webhook', (req, res) => {
  if (!validSignature(req)) { console.warn('⚠️ Signature invalide, ignoré'); return res.sendStatus(401); }
  res.sendStatus(200);
  if (req.body?.object !== 'instagram') return;
  for (const entry of req.body.entry || []) {
    for (const ev of entry.messaging || []) {
      handleEvent(ev).catch((e) => console.error('Erreur :', e.message));
    }
  }
});

function validSignature(req) {
  const sig = req.get('x-hub-signature-256') || '';
  const expected = 'sha256=' + crypto.createHmac('sha256', IG_APP_SECRET).update(req.rawBody || '').digest('hex');
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

// ── Événements ──
async function handleEvent(ev) {
  const msg = ev.message;

  // Message parti de TON compte (bot ou toi)
  if (msg?.is_echo) {
    const userId = ev.recipient?.id;
    const text = (msg.text || '').trim();
    const key = `${userId}|${text}`;
    if (botEchoes.has(key)) { botEchoes.delete(key); return; }
    const cmd = text.toLowerCase();
    if (cmd === '/bot on')  { pausedUntil.delete(userId); getUser(userId).step = null; console.log(`▶️  Bot réactivé pour ${userId}`); return; }
    if (cmd === '/bot off') { pausedUntil.set(userId, Infinity); console.log(`⏸️  Bot coupé pour ${userId}`); return; }
    pause(userId);
    console.log(`👤 Tu as repris la main avec ${userId} → pause ${PAUSE_HOURS} h`);
    return;
  }

  const userId = ev.sender?.id;
  if (!userId) return;

  let text = null, payload = null;
  if (ev.postback) { payload = ev.postback.payload; text = ev.postback.title; }
  if (msg) {
    if (msg.is_deleted || msg.is_unsupported) return;
    if (msg.mid) { if (seenMids.has(msg.mid)) return; seenMids.add(msg.mid); if (seenMids.size > 5000) seenMids.clear(); }
    payload = msg.quick_reply?.payload || payload;
    text = msg.text || (msg.attachments?.length ? '[pièce jointe]' : text);
  }
  if (!text && !payload) return; // réactions, "vu"…
  if (isPaused(userId)) return;

  // Un clic sur un bouton → traité tout de suite ; du texte → on attend un peu (messages en rafale)
  if (payload) return respond(userId, null, payload);
  const p = pending.get(userId) || { parts: [], timer: null };
  p.parts.push(text);
  clearTimeout(p.timer);
  p.timer = setTimeout(() => { pending.delete(userId); respond(userId, p.parts.join(' '), null).catch((e) => console.error('Erreur :', e.message)); }, Number(DEBOUNCE_MS));
  pending.set(userId, p);
}

// ── Logique de conversation ──
async function respond(userId, text, payload) {
  const u = getUser(userId);

  // 1) En plein questionnaire devis
  if (u.step && !(payload && MENU.some((m) => m.payload === payload))) {
    const answer = payload || text;
    if (answer === '[pièce jointe]' && u.step !== 'activite') {
      return send(userId, 'Merci ! Pouvez-vous répondre par écrit ou avec un bouton ? 🙂', CHOICES[u.step]);
    }
    u.answers[u.step] = answer;
    const next = STEPS[STEPS.indexOf(u.step) + 1];
    if (next) { u.step = next; return send(userId, TEXTS['q_' + next], CHOICES[next]); }
    u.step = null;
    await send(userId, TEXTS.recap(u.answers));
    pause(userId);
    console.log(`📝 Nouvelle demande de devis de ${userId} : ${JSON.stringify(u.answers)}`);
    return;
  }

  // 2) Choix d'une action
  u.step = null;
  let action = payload || detect(text);
  const firstTime = !u.known;
  u.known = true;

  if (!action) {
    if (firstTime) return send(userId, TEXTS.bienvenue, MENU);
    u.misses += 1;
    if (u.misses >= 2) { u.misses = 0; await send(userId, TEXTS.incomprisFinal); pause(userId); return; }
    return send(userId, TEXTS.incompris, MENU);
  }
  u.misses = 0;
  if (firstTime && action !== 'DEVIS') await send(userId, TEXTS.bienvenue);

  switch (action) {
    case 'DEVIS':
      u.step = 'activite'; u.answers = {};
      return send(userId, TEXTS.q_activite);
    case 'TARIFS':       return sendWithFollowUp(userId, TEXTS.tarifs);
    case 'DELAIS':       return sendWithFollowUp(userId, TEXTS.delais);
    case 'REALISATIONS': return sendWithFollowUp(userId, TEXTS.realisations);
    case 'HUMAIN':
      await send(userId, TEXTS.humain); pause(userId);
      console.log(`🙋 ${userId} veut te parler`);
      return;
  }
}

function detect(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  for (const k of KEYWORDS) if (k.words.some((w) => t.includes(w))) return k.action;
  return null;
}

async function sendWithFollowUp(userId, text) {
  await send(userId, text);
  await send(userId, TEXTS.suite, MENU);
}

// ── Envoi Instagram ──
async function send(userId, text, buttons) {
  const message = { text };
  if (buttons?.length) message.quick_replies = buttons.map((b) => ({ content_type: 'text', title: b.title, payload: b.payload }));
  botEchoes.add(`${userId}|${text.trim()}`);
  const r = await fetch(`${GRAPH}/me/messages?access_token=${encodeURIComponent(accessToken)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: userId }, message }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Instagram ${r.status} : ${JSON.stringify(data.error || data)}`);
  return data;
}

// Jeton valable 60 jours : prolongé tous les 7 jours tant que le serveur tourne
async function refreshToken() {
  try {
    const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(accessToken)}`);
    const d = await r.json();
    if (d.access_token) { accessToken = d.access_token; console.log('🔄 Jeton Instagram rafraîchi'); }
    else console.warn('Rafraîchissement impossible :', JSON.stringify(d.error || d));
  } catch (e) { console.warn('Rafraîchissement impossible :', e.message); }
}
setInterval(refreshToken, 7 * 24 * 3600 * 1000);

setInterval(() => {
  const limit = Date.now() - 7 * 24 * 3600 * 1000;
  for (const [id, u] of users) if (u.lastSeen < limit) users.delete(id);
}, 6 * 3600 * 1000);

app.listen(PORT, async () => {
  console.log(`🚀 Webora bot démarré sur le port ${PORT}`);
  try {
    const r = await fetch(`${GRAPH}/me?fields=user_id,username&access_token=${encodeURIComponent(accessToken)}`);
    const me = await r.json();
    if (me.username) console.log(`✅ Connecté au compte Instagram @${me.username}`);
    else console.warn('⚠️ Jeton Instagram invalide :', JSON.stringify(me.error || me));
  } catch (e) { console.warn('⚠️ Impossible de joindre Instagram :', e.message); }
});
