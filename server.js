'use strict';
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { query } = require('./db');

const app = express();
app.set('trust proxy', 1); // Render place un proxy devant l'application
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '2kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Limite les tentatives abusives : 10 essais / 15 min / adresse IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Trop de tentatives. Réessayez dans quelques minutes.' }
});

const GMAIL_RE = /^[A-Za-z0-9._%+-]{1,64}@gmail\.com$/i;
const PHONE_RE = /^\+?[0-9]{8,15}$/;
const USERNAME_RE = /^[\p{L}\p{N} ._-]{2,50}$/u;

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/login', loginLimiter, async (req, res) => {
  const contact = typeof req.body?.contact === 'string' ? req.body.contact.trim() : '';
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';

  // Validation côté serveur
  const contactOk = contact.length <= 254 && (GMAIL_RE.test(contact) || PHONE_RE.test(contact));
  if (!contactOk) {
    return res.status(400).json({ ok: false, message: 'Saisissez une adresse Gmail valide ou un numéro de téléphone (ex. +213550000001).' });
  }
  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ ok: false, message: 'Nom d\'utilisateur invalide (2 à 50 caractères : lettres, chiffres, espace, point, tiret).' });
  }

  try {
    // Requête paramétrée : contact ET nom d'utilisateur vérifiés ensemble
    const found = await query(
      'SELECT id FROM users WHERE contact = ? AND username = ? LIMIT 1',
      [contact, username]
    );
    const success = found.length > 0 ? 1 : 0;

    // Chaque tentative est enregistrée en clair (volontairement, pour le TP)
    await query(
      'INSERT INTO login_attempts (contact, username, success) VALUES (?, ?, ?)',
      [contact, username, success]
    );

    if (success) {
      return res.json({ ok: true, message: 'Connexion réussie. Votre tentative a été enregistrée dans la base MySQL.' });
    }
    return res.status(401).json({ ok: false, message: 'Échec : contact ou nom d\'utilisateur incorrect.' });
  } catch (err) {
    // On journalise uniquement le code d'erreur, jamais les données saisies.
    console.error('Erreur base de données :', err.code || 'UNKNOWN');
    return res.status(503).json({ ok: false, message: 'Service temporairement indisponible. Réessayez dans un instant.' });
  }
});

app.use((req, res) => res.status(404).json({ ok: false, message: 'Page introuvable.' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log('Serveur démarré sur le port', PORT));

