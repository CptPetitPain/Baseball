# Dragons de Ronchin — historique des versions

Règle : correction ou petit ajout → version mineure (1.0 → 1.1) ; grosse nouveauté → version majeure (→ 2.0).
La version est affichée en bas de l'appli et de la feuille de match (fichiers `public/version.js` et `APP_VERSION` dans `src/App.jsx`).

## 2.6 — 9 octobre 2026
- Logo des Apaches de Péronne ajouté (reconnu avec « Péronne » ou « Apaches »).
- Les équipes fournies avec le site s'ajoutent aussi à une liste déjà modifiée dans l'appli ; une équipe supprimée exprès ne revient pas.

## 2.5 — 9 octobre 2026 (équipes et logos gérés depuis l'appli)
- Onglet Matchs : nouvelle carte « Équipes adverses & logos ». Créer une équipe, ses autres noms (ville, surnom), sa couleur, déposer son logo (redimensionné tout seul), modifier, supprimer. Réservé au staff.
- Fiche d'un match : l'« Équipe rencontrée » propose les équipes connues et montre leur logo. Équipe inconnue → lien « Créer … et ajouter son logo ».
- Feuille de match : suggestions d'équipes dans le champ Adversaire.
- Les logos déposés s'affichent partout (live, page d'attente, image de fin, Adversaires) sans nouveau déploiement.

## 2.4 — 9 octobre 2026 (logos + page d'attente du live)
- Logos des adversaires : Kraken d'Amiens, Celtics de Tournai, Imperials de Compiègne, Vipères, Miners du Bassin Minier (+ logo Dragons). Reconnus par le nom saisi dans le calendrier (ville ou surnom). Affichés sur le live, l'image de fin de match et la page Adversaires.
- Page d'attente sur /live : le jour du match, avant le premier lancer, « Jour de match » avec l'image VS, l'heure, le lieu et un compte à rebours ; les 7 jours d'avant, « Prochain match ». Bascule toute seule sur le live dès que la diffusion démarre.
- Visuel de la page d'attente identique pour tous : logo Dragons et logo adverse en pastilles face à face (initiales si pas de logo).
- Calendrier : nouveau champ « Heure » (ex : 14h) pour le compte à rebours.

## 2.3 — 9 octobre 2026
- Saisie des frappes : 3 choix à la création (et dans l'onglet Line-up) — Désactivée (par défaut) · Dragons · Dragons + adversaires. Jamais les adversaires seuls.
- Le terrain s'ouvre tout de suite après l'action et se ferme au premier toucher ; vide à chaque saisie. Taille maximale en tablette (horizontale et verticale).
- Analyse automatique (invisible à la saisie) : chaque balle est attribuée au poste qui la couvre (position de base réaliste et rayon d'action de chaque défenseur, voltigeurs plus mobiles, receveur devant / derrière le marbre). Sert au « le plus souvent vers » et « hits surtout vers ».
- Nouvel onglet « Frappes » : toutes les frappes du match, Dragons et adversaires côte à côte en tablette horizontale, filtrables par joueur (retiré du Récap).

## 2.2 — 9 octobre 2026
- Carte des frappes simplifiée : un seul toucher, deux couleurs seulement — vert = hit, rouge = pas de hit (out, erreur, FC). Plus de boutons roulant / ligne / chandelle.

## 2.1 — 9 octobre 2026
- Carte des frappes : seul un home run peut être placé au-delà de la clôture (un out ou un hit touché trop loin est ramené juste devant la clôture). Un hit tombe forcément en territoire bon (ramené sur la ligne s'il est touché en foul). Un out en foul (chandelle attrapée en foul) reste en foul.
- Home run = point vert, comme tous les hits.

## 2.0 — 9 octobre 2026 (carte des frappes)
- Nouvelle option à la création du match : « Saisie des frappes » Simple (par défaut) ou Avec localisation (spray chart). Activable / désactivable aussi dans l'onglet Line-up.
- Avec localisation : après chaque balle en jeu (hit, ground out, fly out, sacrifice, erreur, FC — en attaque comme en défense), le terrain s'ouvre et on touche l'endroit où la balle est partie. Type de frappe en option (roulant, ligne, chandelle, amorti). « Passer » si on n'a pas vu.
- Récap : carte des frappes Dragons / adversaire, filtrable par joueur, avec répartition gauche / centre / droite, champ intérieur / extérieur et postes les plus visés. Points verts = hits, rouges = outs, jaunes = erreur / FC, cercle vide = chandelle.
- Page Adversaires (coachs) : carte « Où ils frappent contre nous » par équipe, cumulée sur tous les matchs, et une carte par joueur.

## 1.7 — 9 octobre 2026 (match de saison / amical)
- Création du match : choix « Saison » (règles officielles, pas de réentrée) ou « Amical / tournoi » (réentrée autorisée). Deviné automatiquement si le calendrier contient « amical » ou « tournoi ».
- En amical, un joueur sorti peut revenir (remplacement ou pitcher), noté « sorti · réentrée (amical) ». En saison, il reste grisé.
- Onglet Line-up : bouton pour passer le match en saison / amical si on s'est trompé.

## 1.6 — 9 octobre 2026 (audit + match complet simulé)
- Match complet simulé de bout en bout (compo → joueurs → feuille de match 7 manches → scoreuse → live → fin → résultats → adversaires) : tout passe, aucune erreur.
- Appli : les données se rafraîchissent toutes seules (retour sur l'appli, toutes les 2 min) — ex. les résultats envoyés depuis la feuille de match.
- Compo : les joueurs créés localement et présents seulement dans les changements prévus sont aussi ajoutés à l'effectif à l'envoi.
- Live : plus de pop-up par-dessus l'image de fin de match.
- Fin de match : plus de colonne « 8 » vide si on a appuyé sur « Fin d'attaque » avant « Terminer ».
- Récap : les changements adverses apparaissent dans le déroulé, à leur place ; côté scoreuse, synchro avant d'enregistrer un changement (bonne manche).
- Sauvegardes (propriétaire) : l'export inclut aussi les line-ups adverses et les fiches scouting, et la restauration les remet.

## 1.5 — 9 octobre 2026
- Composition côté joueurs : uniquement l'image de Compo & changements. L'ancien terrain dessiné n'est plus montré aux joueurs ; s'il manque l'image, message « la composition arrive bientôt » (et avertissement côté staff pour renvoyer la compo).
- Si le réseau coupe pendant le chargement de l'image, l'appli réessaie au lieu d'afficher l'ancien terrain.

## 1.4 — 9 octobre 2026
- Homonymes repérés sans tenir compte des accents : « Francois » (HERENT) et « François » (WOESTYN) s'affichent « Francois H. » et « François W. » dans Compo & changements et la feuille de match.
- À l'envoi de la compo, un nom qui ressemble à un joueur du club n'est plus créé en double : l'appli demande de choisir le bon joueur.

## 1.3 — 9 octobre 2026
- Mise à jour automatique de l'appli : un téléphone resté sur une ancienne version (onglet ouvert, appli sur l'écran d'accueil) se recharge tout seul dès qu'une nouvelle version est en ligne.
- Compo & changements : à l'envoi, les joueurs créés seulement sur l'ordinateur (ex. Erwan, Noelan) sont ajoutés automatiquement à l'effectif du club, pour apparaître partout.
- Alerte si l'image de la compo n'a pas pu être générée.

## 1.2 — 8 octobre 2026
- Scoreuse, onglet Changements : les deux line-ups côte à côte en tablette (verticale et horizontale), ordre au bâton avec les postes, remplaçants des deux équipes en prénoms compacts (sortis barrés).

## 1.1 — 8 octobre 2026
- Postes en défense suivis dans la feuille de match (repris de la compo) : bouton « Poste » (échange automatique si le poste est pris), le remplaçant prend le poste du joueur qui sort, l'ancien lanceur prend le poste du nouveau.
- Tous les changements sur une seule ligne, dans le journal et sur le /live (« Eliot #53 passe en 1re base »), y compris ceux des adversaires (prénom + numéro).
- Scoreuse : onglet « Changements » (Dragons en défense, historique des deux équipes, ⇄ et poste adverses), encadré jaune jusqu'au premier lancer.
- /live : prénom + numéro du batteur adverse si le line-up adverse est saisi.

## 1.0 — 8 octobre 2026
Première version complète :
- Appli club : présences, compositions (visibles à J-2), résultats, classement, historique, saisons, sauvegardes, rappel WhatsApp, QR du live.
- Compo & changements (staff) : terrain, ordre, DH, changements prévus, image envoyée aux joueurs, masquer / renommer / ajouter des joueurs.
- Feuille de match (staff) : attaque / défense, coureurs forcés seulement, SB, pris en vol, sur erreur, WP / PB / balk, erreurs pick-off (+1) et relais (+2), K3, interférence, FC, lancers comptés (limite 90), remplacements et règles DH 5.11, pas de réentrée, une action = une ligne, affichage mobile / tablette verticale / horizontale, plein écran.
- Page /live publique : prénom + numéro, pop-ups animés, image de fin de match 15 min.
- Compte scoreuse : suivi en direct avec noms complets, line-up adverse, changements adverses, encadré jaune des changements.
- Adversaires (staff) : fiches scouting automatiques, tags, notes, stats contre nous, logos (à fournir).
