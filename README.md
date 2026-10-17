# TP Cybersécurité – Connexion sans mot de passe

Application pédagogique : une page, deux champs (Gmail/téléphone + nom d'utilisateur), vérification dans MySQL et enregistrement **en clair** de chaque tentative dans `login_attempts`.

> ⚠️ Ce n'est **pas** une authentification sécurisée. Aucun mot de passe. **Données fictives uniquement** : dites-le aux étudiants (un avertissement figure aussi sur la page).

Comptes de test (créés par `schema.sql`) :

| contact | username |
|---|---|
| etudiant1@gmail.com | etudiant1 |
| etudiant2@gmail.com | etudiant2 |
| +213550000001 | demo_telephone |

Note : seules les tentatives au format valide (Gmail ou téléphone + nom correct) arrivent jusqu'à la base ; un format invalide est refusé par le serveur (HTTP 400) sans être enregistré.

---

## 1. Installer Node.js et tester en local
1. Installez Node.js LTS (≥ 18) depuis https://nodejs.org puis vérifiez : `node -v` et `npm -v`.
2. Dans le dossier du projet : `npm install`
3. Copiez `.env.example` en `.env` (Windows : `copy .env.example .env`) – vous le remplirez à l'étape 4.

## 2. Compte Aiven et offre gratuite
1. Créez un compte sur https://aiven.io.
2. Créez un service **MySQL** et choisissez le plan **Free** s'il est proposé pour votre région. **Vérifiez sur place** : l'offre gratuite peut changer, être limitée à certaines régions, et le service peut être mis hors tension après une période d'inactivité (à rallumer depuis la console). Ne comptez pas sur une disponibilité permanente.
3. Attendez que le service passe à l'état **Running** (quelques minutes).

## 3. Créer les tables
1. Installez MySQL Workbench (https://dev.mysql.com/downloads/workbench/).
2. Nouvelle connexion avec les paramètres de l'étape 4.
3. Ouvrez `schema.sql`, exécutez-le (éclair ⚡). Aiven fournit la base `defaultdb` : inutile d'en créer une.

## 4. Paramètres de connexion et TLS
Dans la console Aiven, page du service, section *Connection information* : notez **Host, Port, User, Password, Database name**, et téléchargez le **CA certificate** (`ca.pem`).
- Dans Workbench : *SSL → Use SSL = Require and Verify CA*, puis indiquez `ca.pem` comme *SSL CA File*.
- Dans `.env` : renseignez `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` et collez le contenu de `ca.pem` dans `DB_CA_CERT`. Si le collage multiligne pose problème dans `.env`, écrivez-le sur une ligne en remplaçant chaque retour à la ligne par `\n` (le code le gère).
- Test local : `npm start` puis http://localhost:3000

## 5. GitHub (sans secret)
1. Créez un dépôt sur https://github.com (public ou privé).
2. Vérifiez que `.env` figure bien dans `.gitignore` (c'est le cas).
3. ```
   git init
   git add .
   git status        # .env ne doit PAS apparaître
   git commit -m "TP connexion"
   git branch -M main
   git remote add origin https://github.com/VOTRE_COMPTE/VOTRE_DEPOT.git
   git push -u origin main
   ```
Si un mot de passe a été publié par erreur : changez-le immédiatement dans Aiven.

## 6. Service Web sur Render
1. Compte sur https://render.com (connexion GitHub possible).
2. *New + → Web Service* → choisissez votre dépôt.
3. Runtime **Node**, Build Command `npm install`, Start Command `npm start`, instance type **Free**.

## 7. Variables d'environnement Render
Dans *Environment*, ajoutez : `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_CA_CERT` (collez le PEM complet). Ne définissez pas `PORT` : Render le fournit.

## 8. Déployer et vérifier les journaux
Cliquez *Create Web Service*. Dans l'onglet *Logs*, vous devez voir « Serveur démarré sur le port … ». Les journaux ne contiennent jamais les données saisies : seulement des codes d'erreur (ex. `ETIMEDOUT`).

## 9. Lien public
Render affiche l'URL `https://votre-service.onrender.com`. Partagez-la aux étudiants.

## 10. Test depuis un autre appareil
Ouvrez le lien depuis un téléphone (en données mobiles) ou un autre ordinateur.

## 11. Vérifier dans MySQL Workbench
```sql
-- Toutes les tentatives, plus récentes d'abord
SELECT * FROM login_attempts ORDER BY attempted_at DESC;

-- Réussies / échouées
SELECT success, COUNT(*) AS total FROM login_attempts GROUP BY success;

-- Tentatives échouées
SELECT contact, username, attempted_at FROM login_attempts WHERE success = 0 ORDER BY attempted_at DESC;

-- Vérifier qu'aucune colonne « mot de passe » n'existe
SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema = DATABASE() AND column_name LIKE '%pass%';   -- doit retourner 0 ligne

-- Vider les données du TP
TRUNCATE TABLE login_attempts;
```

---

## Limites réelles des offres gratuites
- **Render Free** : le service **se met en veille après ~15 min sans visite**. Le réveil prend en général **30 s à 1 min** (parfois plus). Ressources limitées, heures mensuelles limitées.
- **Aiven Free MySQL** : stockage et ressources limités ; service pouvant être arrêté en cas d'inactivité ; conditions susceptibles d'évoluer. Relisez les conditions actuelles avant le TP.
- Prévoyez d'ouvrir le lien 2 minutes avant la séance pour réveiller le serveur. Aucune disponibilité permanente n'est garantie.
- Les données sont stockées chez Aiven : elles **survivent** au redémarrage/veille de Render.

## Procédure de test
1. **Page publique** : ouvrir l'URL → le formulaire s'affiche (attendre le réveil si besoin). `/health` renvoie `{"status":"ok"}`.
2. **Compte valide** : `etudiant1@gmail.com` + `etudiant1` → message vert de réussite.
3. **Refus** : `etudiant1@gmail.com` + `etudiant2`, puis `autre@gmail.com` + `etudiant1` → message rouge.
4. **Enregistrement** : lancer `SELECT * FROM login_attempts ORDER BY attempted_at DESC;` → 1 ligne `success=1` et 2 lignes `success=0`.
5. **Persistance** : dans Render, *Manual Deploy → Restart* (ou attendre la mise en veille), refaire une tentative → les anciennes lignes sont toujours là.
6. **Pas de mot de passe** : exécuter la requête `information_schema` ci-dessus (0 ligne) ; parcourir les *Logs* Render : aucune donnée saisie n'y apparaît.
7. **Limitation** : 11 tentatives rapides → message « Trop de tentatives ».

## Sécurité mise en œuvre
Requêtes paramétrées, secrets en variables d'environnement, TLS vers Aiven, validation serveur, limitation de débit, en-têtes `helmet`, délais d'expiration, journaux sans données saisies.
