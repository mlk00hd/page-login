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

function show(text, ok = false) {
    msg.textContent = text;
    msg.className = ok ? 'ok' : 'err';
    msg.hidden = false;
}

function setBusy(isBusy) {
    btn.disabled = isBusy;
    btn.textContent = isBusy ? 'Connexion...' : 'Se connecter';
}

function updateClearButton(input) {
    const clearButton = document.querySelector(
        `[data-clear="${input.id}"]`
    );

    if (clearButton) {
        clearButton.hidden = input.value.length === 0;
    }
}

[contact, password].forEach((input) => {
    input.addEventListener('input', () => {
        updateClearButton(input);
    });
});

clearButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const input = document.getElementById(button.dataset.clear);

        input.value = '';
        updateClearButton(input);
        input.focus();
    });
});

togglePassword.addEventListener('click', () => {
    const isPassword = password.type === 'password';

    password.type = isPassword ? 'text' : 'password';

    togglePassword.setAttribute(
        'aria-label',
        isPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
    );

    togglePassword.setAttribute(
        'aria-pressed',
        String(isPassword)
    );

    togglePassword.textContent = isPassword ? 'x' : '◉';
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const contactValue = contact.value.trim();
    const passwordValue = password.value.trim();

    if (!contactValue || !passwordValue) {
        show('Remplissez les deux champs');
        return;
    }

    setBusy(true);

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contact: contactValue,
                username: passwordValue
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            show(data.message || 'Erreur lors de la connexion.', false);
            return;
        }

        show(data.message || 'Connexion réussie.', true);
        form.reset();
        [contact, password].forEach((input) => {
            updateClearButton(input);
        });
    } catch (error) {
        show('Impossible de joindre le serveur. Réessayez.', false);
    } finally {
        setBusy(false);
    }
});

forgotLink.addEventListener('click', (e) => {
    e.preventDefault();

    show(
        'Maquette pédagogique : aucune récupération de compte n’est configurée.'
    );
});

createAccount.addEventListener('click', () => {
    show('Maquette pédagogique : création de compte non disponible.');
});

document.getElementById('language').addEventListener('change', (e) => {
    const languages = {
        fr: 'Langue sélectionnée : Français (France).',
        ar: 'Langue sélectionnée : العربية.',
        en: 'Selected language: English (UK).',
        es: 'Idioma seleccionado: Español.'
    };

    show(languages[e.target.value]);
}); redonne le correcte
