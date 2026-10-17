
'use strict';

const form = document.getElementById('login-form');
const btn = document.getElementById('submit');
const msg = document.getElementById('message');
const forgotLink = document.getElementById('forgotLink');
const createAccount = document.getElementById('createAccount');

function show(text, ok) {
    msg.textContent = text;
    msg.className = ok ? 'ok' : 'err';
    msg.hidden = false;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const contact = form.elements.contact.value.trim();
    const username = form.elements.username.value.trim();

    if (!contact || !username) {
        show(
            'Remplissez les deux champs avec des données fictives.',
            false
        );
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Vérification…';

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contact,
                username
            })
        });

        const data = await res.json().catch(() => ({}));

        show(
            data.message || 'Réponse inattendue du serveur.',
            res.ok && data.ok === true
        );

    } catch (_err) {
        show(
            'Impossible de joindre le serveur du TP. Vérifiez qu’il est démarré.',
            false
        );

    } finally {
        btn.disabled = false;
        btn.textContent = 'Se connecter';
    }
});

forgotLink.addEventListener('click', (e) => {
    e.preventDefault();

    show(
        'Maquette pédagogique : aucune récupération de compte n’est configurée.',
        false
    );
});

createAccount.addEventListener('click', () => {
    show(
        'Maquette pédagogique : aucune inscription réelle n’est effectuée.',
        false
    );
});
