# Dragons de Ronchin — Feuille de présence

Version prête à héberger sur Netlify, avec sauvegarde des données via **Netlify Blobs**
(stockage clé-valeur gratuit et intégré à Netlify — pas besoin de créer de compte ailleurs).

## Configuration obligatoire : jeton Netlify Blobs + codes secrets d'inscription

Cette version utilise une vraie API serveur (`netlify/functions/api.js`) : les mots de passe,
la vérification des droits et les codes secrets ne quittent jamais le serveur. Le navigateur
ne reçoit jamais le contenu des mots de passe hashés ni les codes staff/propriétaire — même
un membre technique du staff ne peut pas les retrouver en lisant le code source du site.

Trois variables d'environnement sont nécessaires. Sur ton site → **Site configuration →
Environment variables → Add a variable** :

1. **`BLOBS_TOKEN`** — un jeton d'accès personnel Netlify. Va sur
   [app.netlify.com/user/applications](https://app.netlify.com/user/applications#personal-access-tokens)
   → **New access token**, génère-le, copie-le immédiatement (affiché une seule fois).
2. **`STAFF_CODE`** — le code que tu communiques à ton coaching staff pour créer un compte
   staff. Choisis une valeur à toi (ex: `DRAGONS2027`), différente de tout exemple montré
   ailleurs.
3. **`OWNER_CODE`** — le code confidentiel pour créer le compte propriétaire (voir plus bas).
   Choisis une valeur différente de `STAFF_CODE`, et ne la communique à personne d'autre que
   toi.

Sans `STAFF_CODE` et `OWNER_CODE` configurés, **personne ne peut créer de compte staff ou
propriétaire** — c'est volontaire, ça évite tout code par défaut oublié dans le projet.

Redéploie le site (**Deploys → Trigger deploy → Deploy site**) après avoir ajouté ces
variables pour qu'elles soient prises en compte.

### Créer le compte propriétaire

Va sur `https://ton-site.netlify.app/?owner`, clique sur "Créer un compte", une case
"Compte propriétaire (accès restreint)" apparaît — coche-la et entre la valeur de
`OWNER_CODE`. Ce lien n'est jamais affiché dans l'interface normale.

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
Attention : en local, la fonction `/.netlify/functions/api` n'est disponible que si tu
utilises la CLI Netlify (`netlify dev`) plutôt que `npm run dev` seul.

## Ce qui a changé par rapport à la version "artifact" Claude

Cette version a une vraie séparation client / serveur :
- `netlify/functions/api.js` — toute la logique métier (comptes, présences, compositions,
  matchs, classement) et toutes les vérifications de droits tournent ici, côté serveur. Les
  mots de passe sont hashés côté serveur, jamais côté navigateur. Les codes secrets
  (`STAFF_CODE`, `OWNER_CODE`) sont lus depuis les variables d'environnement du serveur et ne
  sont jamais envoyés au navigateur.
- `src/api.js` — un simple client qui envoie des requêtes à cette fonction et récupère les
  résultats déjà nettoyés (sans mot de passe).

Le reste (comptes joueurs, présences, composition terrain, ordre au bâton, gestion des
matchs, résultats, classement, journal des modifications…) fonctionne à l'identique.

## Sécurité

Contrairement à la version testable dans Claude (qui n'a pas de vrai serveur et ne peut donc
pas cacher de secrets), cette version Netlify :
- ne stocke ni n'expose jamais de mot de passe en clair ou de code secret au navigateur ;
- vérifie le rôle de la personne connectée **côté serveur** avant chaque action sensible
  (suppression de compte, changement de rôle, saisie de résultats, etc.) — impossible de
  contourner ces vérifications en modifiant le code JavaScript du navigateur ;
- refuse toute action si le jeton de session est invalide ou expiré.

Cela dit, ce n'est toujours pas un système de sécurité de niveau bancaire : pas de limite de
tentatives de connexion, pas d'expiration de session courte, pas d'audit de sécurité externe.
Largement suffisant pour un usage d'équipe amateur, mais garde `STAFF_CODE` et `OWNER_CODE`
pour toi et change-les si tu soupçonnes qu'ils ont fuité (Site configuration → Environment
variables → modifie la valeur → redéploie).
