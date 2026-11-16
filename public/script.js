
'use strict';

const form = document.getElementById('login-form');
const btn = document.getElementById('submit');
const msg = document.getElementById('message');
const forgotLink = document.getElementById('forgotLink');
const createAccount = document.getElementById('createAccount');

const contact = document.getElementById('contact');
const password = document.getElementById('username');
const togglePassword = document.querySelector('.toggle-password');
const clearButtons = document.querySelectorAll('[data-clear]');

const eyeIcon = `
<svg viewBox="0 0 24 24"
     width="21" height="21"
     fill="none"
     stroke="currentColor"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round"
     aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
</svg>`;

const eyeOffIcon = `
<svg viewBox="0 0 24 24"
     width="21" height="21"
     fill="none"
     stroke="currentColor"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round"
     aria-hidden="true">
    <path d="M3 3l18 18"/>
    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
    <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-3 3.8"/>
    <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8"/>
</svg>`;

function show(text, ok = false) {
    msg.textContent = text;
    msg.className = ok ? 'ok' : 'err';
    msg.hidden = false;
}

function setBusy(isBusy) {
    btn.disabled = isBusy;
    btn.textContent = isBusy ? 'Chargement...' : 'Se connecter';
}

function updateClearButton(input) {
    const clearButton = document.querySelector(
        `[data-clear="${input.id}"]`
    );

    if (clearButton) {
        clearButton.hidden = input.value.length === 0;
    }
}

// Afficher ou masquer le mot de passe
togglePassword.innerHTML = eyeIcon;

togglePassword.addEventListener('click', () => {
    const isHidden = password.type === 'password';

    password.type = isHidden ? 'text' : 'password';

    togglePassword.innerHTML = isHidden
        ? eyeOffIcon
        : eyeIcon;

    togglePassword.setAttribute(
        'aria-label',
        isHidden ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
    );

    togglePassword.setAttribute(
        'aria-pressed',
        String(isHidden)
    );
});

// Actualiser les boutons de suppression
[contact, password].forEach((input) => {
    input.addEventListener('input', () => {
        updateClearButton(input);
    });
});

// Vider les champs
clearButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const input = document.getElementById(button.dataset.clear);

        if (!input) return;

        input.value = '';

        updateClearButton(input);
        input.focus();
    });
});

// Soumission locale de la maquette
form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!contact.value.trim() || !password.value) {
        show('Remplissez les deux champs.');
        return;
    }

    show(
        'Maquette pédagogique : aucune authentification ni transmission de données n’est configurée.'
    );
});

// Mot de passe oublié
forgotLink.addEventListener('click', (e) => {
    e.preventDefault();

    show(
        'Maquette pédagogique : aucune récupération de compte n’est configurée.'
    );
});

// Création de compte
createAccount.addEventListener('click', () => {
    show(
        'Maquette pédagogique : création de compte non disponible.'
    );
});

// Changement de langue
document.getElementById('language').addEventListener('change', (e) => {
    const languages = {
        fr: 'Langue sélectionnée : Français (France).',
        ar: 'Langue sélectionnée : العربية.',
        en: 'Selected language: English (UK).',
        es: 'Idioma seleccionado : Español.'
    };

    show(languages[e.target.value], true);
});
