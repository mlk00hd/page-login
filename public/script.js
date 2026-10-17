'use strict';
const form = document.getElementById('login-form');
const btn = document.getElementById('submit');
const msg = document.getElementById('message');

function show(text, ok) {
  msg.textContent = text;
  msg.className = ok ? 'ok' : 'err';
  msg.hidden = false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const contact = form.contact.value.trim();
  const username = form.username.value.trim();
  if (!contact || !username) {
    show('Remplissez les deux champs.', false);
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Connexion… (le premier appel peut prendre jusqu\'à 1 minute)';
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact, username })
    });
    const data = await res.json().catch(() => ({}));
    show(data.message || 'Réponse inattendue du serveur.', res.ok && data.ok === true);
  } catch (err) {
    show('Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.', false);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Se connecter';
  }
});
