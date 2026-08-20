# Dragons de Ronchin — Feuille de présence

Version prête à héberger sur Netlify, avec sauvegarde des données via **Netlify Blobs**
(stockage clé-valeur gratuit et intégré à Netlify — pas besoin de créer de compte ailleurs).

## Configuration obligatoire : jeton d'accès pour Netlify Blobs

Sur certaines configurations de compte Netlify, l'injection automatique des identifiants
Netlify Blobs ne fonctionne pas (erreur `MissingBlobsEnvironmentError`). Pour éviter ce
problème, la fonction utilise un jeton fourni manuellement via une variable d'environnement.

1. Va sur [app.netlify.com/user/applications](https://app.netlify.com/user/applications#personal-access-tokens)
   (menu de ton compte → **User settings → Applications → Personal access tokens**).
2. Clique sur **"New access token"**, donne-lui un nom (ex: `dragons-blobs`), génère-le, et
   copie-le immédiatement (il ne sera plus affiché ensuite).
3. Va sur ton site → **Site configuration → Environment variables → Add a variable**.
4. Crée une variable nommée exactement `BLOBS_TOKEN`, colle le jeton comme valeur, sauvegarde.
5. Redéploie le site (**Deploys → Trigger deploy → Deploy site**) pour que la nouvelle
   variable soit prise en compte.

Sans cette étape, l'appli affichera "Impossible de charger les données" et la fonction
`storage` plantera avec l'erreur `MissingBlobsEnvironmentError`.

## Déploiement (méthode la plus simple — sans ligne de commande)

1. Va sur [app.netlify.com](https://app.netlify.com) et crée un compte gratuit si besoin.
2. Une fois connecté, clique sur **"Add new site" → "Deploy manually"**.
3. Dézippe ce dossier sur ton ordinateur, puis dans un terminal, à la racine du dossier :
   ```
   npm install
   npm run build
   ```
   Cela crée un dossier `dist/`.
4. Glisse-dépose le dossier `dist/` dans la zone de dépôt Netlify.

⚠️ Cette méthode simple ne déploie **que le site**, pas la fonction de stockage
(`netlify/functions/storage.js`). Pour que les comptes et les présences se sauvegardent
vraiment, il faut passer par la méthode Git (ci-dessous), qui déploie tout automatiquement,
fonction comprise.

## Déploiement recommandé (avec Git — fonction de stockage incluse)

1. Crée un dépôt sur GitHub (ou GitLab/Bitbucket) et mets-y le contenu de ce dossier.
2. Sur [app.netlify.com](https://app.netlify.com) : **"Add new site" → "Import an existing
   project"**, connecte ton compte GitHub, choisis le dépôt.
3. Netlify détecte automatiquement `netlify.toml` :
   - Build command : `npm run build`
   - Publish directory : `dist`
   - Functions : `netlify/functions`
4. Clique sur **Deploy**. C'est tout — Netlify Blobs fonctionne automatiquement sur les sites
   déployés chez eux, sans configuration supplémentaire ni clé d'API à renseigner.

## Développement en local (optionnel)

```
npm install
npm run dev
```
Attention : en local, la fonction `/.netlify/functions/storage` n'est disponible que si tu
utilises la CLI Netlify (`netlify dev`) plutôt que `npm run dev` seul.

## Ce qui a changé par rapport à la version "artifact" Claude

La seule différence technique est le stockage des données : la version Claude utilisait
`window.storage` (spécifique à l'environnement Claude.ai), remplacé ici par deux petits
fichiers :
- `src/storage.js` — appelle la fonction serverless depuis le navigateur.
- `netlify/functions/storage.js` — lit/écrit les données dans Netlify Blobs.

Tout le reste (comptes joueurs, présences, composition terrain, ordre au bâton, gestion des
matchs, journal des modifications…) fonctionne à l'identique.

## Rappel sécurité

Comme dans la version Claude : les mots de passe sont hashés (SHA-256) mais ce n'est pas un
système d'authentification de niveau professionnel. Toutes les données de l'appli sont
partagées entre tous les visiteurs du site (nécessaire pour que le coach voie tout), donc ne
mets rien de confidentiel dedans.
