# Dragons de Ronchin — historique des versions

Règle : correction ou petit ajout → version mineure (1.0 → 1.1) ; grosse nouveauté → version majeure (→ 2.0).
La version est affichée en bas de l'appli et de la feuille de match (fichiers `public/version.js` et `APP_VERSION` dans `src/App.jsx`).

## 3.9 — 21 novembre 2026 (coachs visibles dans l'écran Joueurs)
- Écran Joueurs : chaque encadré d'équipe affiche ses coachs et son staff (« Coach · Loïc DIDAT », « Staff · Thibaut VANDENBERGHE »), d'après Administration › Droits des comptes. Sans coach : « Pas de coach · à définir dans Administration › Droits des comptes ».
- Dans la liste, un badge « Coach 2 » / « Staff 1 » à côté du nom des joueurs qui coachent une équipe.

## 3.8 — 21 novembre 2026 (correctif Suivi + un classement par équipe)
- **Correctif** : l'écran Suivi plantait (« Une erreur a arrêté l'affichage de cette page ») depuis la 3.4, à cause d'une ligne retirée au mauvais endroit. Corrigé. Ajout de deux contrôles systématiques avant chaque livraison : une vérification de tout le code (aucune variable utilisée sans être déclarée) et un test qui ouvre tous les écrans pour chaque type de compte (propriétaire, coachs, entraîneur, joueur), sur téléphone et ordinateur, et échoue si l'écran d'erreur apparaît.
- **Classement** : un classement séparé par équipe, titré avec sa ligue (le « niveau » de l'équipe dans Administration : D3, Régional 1, Régional 2…). En « Tout le club », les classements des équipes s'affichent les uns sous les autres au lieu d'être mélangés dans un seul tableau (le rang et l'écart GB se calculent dans chaque ligue).

## 3.7 — 21 novembre 2026 (import Excel : calendrier et effectif)
- **Importer un calendrier** (écran Matchs, staff) : un fichier Excel (.xlsx) ou CSV, et tous les matchs de la saison sont créés d'un coup. Colonnes reconnues automatiquement (ordre libre, lignes de titre au-dessus acceptées) : Date, Heure, Équipe, Adversaire, Lieu (Domicile / Extérieur) — ou le format fédé avec Recevant / Visiteur (les matchs sans Ronchin sont ignorés). Dates en 11/04/2027, « samedi 11 avril », vraies cellules date d'Excel… Aperçu avant import (nouveau / déjà là / ligne à corriger, avec la raison), matchs numérotés dans l'ordre des dates, saison créée si besoin. Réimporter un fichier corrigé met à jour les matchs au lieu de les doubler. Un coach n'importe que pour son équipe.
- **Importer l'effectif** (écran Joueurs, propriétaire) : Nom, Prénom (ou une colonne « Joueur »), Numéro, Postes (P, C, 1B, SS, OF… ou en toutes lettres), une colonne par équipe (H = habituel, R = renfort) ou une colonne « Équipes » (« 1/2 », « 1H 2R »), Email. Joueur existant (même nom + prénom, accents ignorés) mis à jour, jamais doublé ; doublons du fichier signalés ; équipes manquantes créées (ex. Équipe 3) ; une adresse déjà choisie par le joueur n'est jamais remplacée. Les joueurs importés apparaissent ensuite dans la liste « Créer un compte ».
- Modèles Excel à remplir (avec listes déroulantes et mode d'emploi) téléchargeables depuis chaque écran d'import.

## 3.6 — 21 novembre 2026 (convocation plus complète)
- Mail de convocation : objet « Tu es sélectionné avec l'Équipe 1 ce week-end (28-29 novembre) », et dans le mail : les matchs (jour, heure, domicile/extérieur, adversaire), **tes coachs** (coachs et staff de l'équipe, noms seulement) et **tes coéquipiers** (sans son propre nom), bouton « Confirmer ma présence dans l'appli ».

## 3.5 — 21 novembre 2026 (roster du week-end : équipes qui ne jouent pas)
- Seules les équipes qui ont un match ce week-end entrent dans la cascade, dans l'ordre de la hiérarchie. Testé : l'Équipe 1 ne joue pas (la 2 commence, puis la 3) ; seule la 3 joue (elle valide directement, récap au propriétaire) ; 1 et 3 seulement (la 3 attend la 1, le mail va directement aux coachs de la 3) ; match de l'Équipe 1 annulé (la 2 ne l'attend plus).
- La date limite suit la place dans la cascade du week-end : la première équipe qui joue valide avant le mercredi soir, la suivante le jeudi, la dernière le vendredi.
- Match annulé ou déplacé après la validation : le roster de cette équipe repasse en brouillon (sélection gardée) et ne bloque plus ses joueurs pour les autres équipes. Si le match revient, l'équipe revalide à son tour : un joueur ne peut jamais se retrouver dans deux rosters validés le même week-end.
- Un joueur de la sélection pris entre-temps par une équipe au-dessus n'est plus compté ni envoyé à la validation.

## 3.4 — 21 novembre 2026 (roster du week-end en cascade Équipe 1 → 2 → 3)
- **Nouvel écran « Roster du week-end »** (staff) : pour chaque week-end, l'Équipe 1 sélectionne ses joueurs et valide en premier (avant le mercredi soir), puis l'Équipe 2 (jeudi), puis l'Équipe 3 (vendredi). L'ordre suit l'ordre des équipes dans Administration ; une équipe sans match ce week-end est sautée.
- **Hiérarchie respectée** : une équipe peut préparer sa sélection en brouillon, mais ne valide qu'après l'équipe du dessus. Un joueur retenu par une équipe validée est verrouillé pour les autres ce week-end (« Retenu en Équipe 1 »), et il sort automatiquement des brouillons des équipes suivantes.
- **Type de chaque joueur** (écran Joueurs, déjà en place) : habituel ou renfort par équipe, donc 1 seule, 2 seule, 3 seule, 1/2, 2/3, 1/2/3… Pastilles 1 · 2 · 3 sur chaque joueur dans le roster (pleine = habituel, cerclée = renfort), avec sa présence aux matchs du week-end.
- **Mails à chaque validation** : le staff de l'équipe suivante reçoit « Roster Équipe 1 validé · à toi pour l'Équipe 2 » avec les joueurs retenus, ceux encore disponibles, la date limite et un lien direct ; à la fin, le propriétaire reçoit le récap de tout le week-end. Chaque joueur retenu reçoit sa **convocation** (équipe, matchs avec date, heure, domicile/extérieur, adversaire, coéquipiers).
- **Modification** : « Rouvrir pour modifier » tant que l'équipe suivante n'a pas validé (ensuite, propriétaire seulement). À la nouvelle validation, seuls les nouveaux joueurs sont convoqués, ceux retirés reçoivent un mail « Changement », et le staff suivant reçoit une « Mise à jour ».
- **Propriétaire** : peut faire et valider le roster de n'importe quelle équipe (si les coachs ne passent pas par l'appli).
- **Accueil joueur** : carte « Ton équipe ce week-end » avec les matchs. **Mon compte › Mails du club** : nouvelle case « Ma convocation du week-end » (cochée par défaut dès qu'une adresse est renseignée).
- **Affichage** : corrigé les champs qui dépassaient de leur carte en mode Auto (Mes infos · postes, Mon compte · mot de passe, Administration · créer un compte, Matchs sur petit téléphone), avec un garde-fou général. Vérifié automatiquement sur tous les écrans de 360 à 1920 px.

## 3.3 — 13 octobre 2026 (lien direct pour voter au MVP)
- **Lien direct vers le vote MVP** (`/?mvp=…`) : il ouvre l'appli directement sur le vote du match (après connexion si besoin, avec le message « Connecte-toi pour voter au MVP du match »).
- **« Partager le vote sur WhatsApp »** dans l'encart MVP (staff de l'équipe, vote ouvert) : message tout prêt avec le match, le score, l'heure de clôture et le lien. Bouton « Copier le lien » aussi.
- **Mail de récap** : gros bouton « 🏅 Voter pour le MVP du match » pour les joueurs qui ont joué (si le vote est encore ouvert à l'envoi).
- **Accueil joueur** : quand le vote est clos, carte « MVP du match » avec les deux MVP pendant 4 jours (matchs joués ou de son équipe), et « 🎉 Bravo, c'est toi ! » pour le gagnant.

## 3.2 — 13 octobre 2026 (récap automatique pour les coachs)
- Les coachs et le staff de l'équipe (et le propriétaire) reçoivent automatiquement le récap de l'équipe après chaque match, même absents, sans rien cocher. Ils apparaissent dans la liste des destinataires (« coach · récap équipe (auto) »).
- Administration › Mails : liste des coachs avec leur adresse. Pour un compte coach sans fiche joueur, l'adresse se saisit ici ; pour un coach joueur, c'est la même que dans son Mon compte.
- Historique : un joueur voit toujours le récap (et le vote MVP) des matchs où il a joué, même quand c'est l'autre équipe qui est sélectionnée (cas du renfort).
- Aperçu des mails (feuille de match) : bouton « M'envoyer cet aperçu (à moi seul) » pour recevoir n'importe quelle version (équipe ou joueur) sur sa propre adresse, objet « [APERÇU] », sans rien envoyer aux joueurs.

## 3.1 — 13 octobre 2026 (mails : récaps et mot de passe oublié · MVP du match)
- **MVP du coach** : dans le récap du match (Historique), le staff de l'équipe choisit un joueur avec un petit mot optionnel. Affiché tout de suite à tous, et dans le mail de récap s'il est choisi avant l'envoi.
- **MVP des coéquipiers** : chaque joueur du match vote pour un coéquipier (pas pour lui-même), carte « Vote MVP » sur son accueil. Vote ouvert 3 jours, modifiable ; on ne voit que le nombre de votes jusqu'à la clôture, puis le résultat (co-MVP en cas d'égalité). Le coach peut clôturer plus tôt ou rouvrir 3 jours. 🏆 / 🏅 visibles dans la liste des récaps.
- **Envoi réel des récaps par mail** : feuille de match › Récap › « Mails du récap · aperçu et envoi ». Liste des destinataires (récap perso avec la carte des frappes, ou récap de l'équipe), bouton « Envoyer les récaps », confirmation, suivi « ✓ envoyé » par joueur. Pas de double envoi ; « Renvoyer à tout le monde » si besoin. Seuls les joueurs qui ont coché la case dans Mon compte reçoivent un mail, chacun le sien (personne ne voit les adresses des autres).
- **Mot de passe oublié** : lien sur l'écran de connexion. Le joueur tape son identifiant ou son adresse mail et reçoit un lien valable 30 minutes, utilisable une seule fois. Les anciennes connexions sont coupées. Sans adresse dans le compte : le staff réinitialise comme avant. Demandes limitées (5 par quart d'heure).
- **Administration › Mails** : état de l'envoi (activé ou pas, adresse d'envoi) et bouton « Envoyer un mail de test ».
- L'envoi passe par n'importe quel serveur SMTP : aujourd'hui un Gmail avec mot de passe d'application (variables Netlify `SMTP_USER` et `SMTP_PASS`), plus tard Brevo avec le nom de domaine en changeant seulement les variables. Objet des mails préfixé « [Dragons] ».

## 3.0 — 13 octobre 2026 (plusieurs équipes, droits par compte, mode ordinateur)
- **Plusieurs équipes** : l'appli gère maintenant plusieurs équipes (« Équipe 1 », « Équipe 2 », d'autres pourront être ajoutées plus tard, comme une D3). Tout ce qui existe aujourd'hui (matchs, résultats, compos, présences, classement) est rangé automatiquement dans l'Équipe 1, sans rien perdre. Le propriétaire crée l'Équipe 2 dans Administration quand elle est prête (nom, niveau, couleur, objectif de joueurs, 12 par défaut).
- **Pas de roster figé** : chaque joueur peut être « habituel » ou « renfort » d'une ou plusieurs équipes (écran Joueurs, un clic par case). Les coachs se partagent les joueurs ; jauge « X habituels sur 12 visés » par équipe.
- **Appel en renfort** : dans Suivi, le coach appelle un joueur d'une autre équipe pour un match. Le joueur voit une carte « L'Équipe 2 a besoin de toi » avec « Je viens » / « Pas dispo » ; le coach voit « appelé… », « renfort ✓ » ou « a dit non ».
- **Raison d'absence** : un joueur absent peut préciser « Je joue en D3 », « Blessé » ou « Pas dispo » ; le coach le voit dans Suivi.
- **Droits par compte** (Administration › Droits des comptes, propriétaire seulement) : pour chaque équipe, rôle coach / staff / scoreuse, et droits cochables (compo, feuille de match, scouting, effectif, présences). Le propriétaire garde l'accès à tout.
- **Casquette entraîneur** : un coach peut voir les autres équipes en lecture seule (bandeau « Lecture seule »), sans rien pouvoir y modifier.
- **Cloisonnement** : un coach ne voit que son équipe (compo, présences, feuilles de match, scouting). Il ne peut plus modifier, supprimer, renommer ou changer le mot de passe d'un joueur ou d'un compte d'une autre équipe ; supprimer un joueur partagé demande les droits sur toutes ses équipes (ou le propriétaire). Changer le rôle d'un compte est réservé au propriétaire.
- **Joueurs hors équipe** : ils gardent leur présence, leur compte et les récaps de tous les matchs, mais ne voient pas les compos ni les infos internes des équipes.
- **Espace test** (Administration) : comptes « test-… » qui ouvrent un espace séparé, vide ou rempli d'un club d'exemple fictif, pour les démos et réunions. Rien ne touche les vraies données ni le vrai live (live test sur /live?test=1).
- **Affichage** : mode ordinateur / tablette avec menu latéral et cartes en colonnes, et choix Auto / Téléphone / Tablette / Ordinateur (pour garder le mode téléphone sur ordi).
- **Feuille de match** : choix de l'équipe, calendrier et listes de joueurs filtrés par équipe (habituels + renforts appelés). Le total de lancers de la journée compte aussi les matchs de l'autre équipe (un lanceur prêté ne dépasse pas sa limite).
- **Aperçu des mails** de fin de match (récap équipe + récap perso avec la carte des frappes du joueur), en attendant le branchement de Brevo.
- Live et récaps : le nom de l'équipe apparaît (« Dragons · Équipe 2 »).
- Corrections : la suppression d'une équipe du classement remarche ; un compte promu (joueur → staff) n'est plus déconnecté.

## 2.17 — 13 octobre 2026 (suivi des accords live)
- Accord live : 3 choix au lieu de 2 — « Je suis majeur : j'accepte », « Je suis mineur : j'ai l'accord de mes parents » et « Je refuse ». On distingue enfin un refus d'un joueur qui n'a pas encore répondu. Refus ou sans réponse : numéro de maillot seulement sur le live.
- Suivi (staff) : nouvel encart repliable « Accords live » avec les compteurs (majeurs, accord parents, refus, sans réponse) et la liste par catégorie. Pour les sans-réponse : « pas encore de compte » ou « compte créé, pas répondu ». Un clic sur un joueur ouvre directement la modification de son accord.
- Badges dans la liste : « accord ✓ », « accord parents ✓ » (vert), « refus » (rouge), « sans réponse » (jaune pointillé).
- Les anciens comptes qui n'avaient pas coché la case apparaissent en « sans réponse » (ils n'avaient pas fait de choix explicite) : à relancer.

## 2.16 — 13 octobre 2026 (accord live majeur / mineur)
- Création de compte et Mon compte : deux cases distinctes pour l'affichage sur le live. « Je suis majeur : je donne mon accord pour que mon nom et mon prénom apparaissent sur le live » et « Je suis mineur : j'ai l'accord de mes parents pour que mon nom et mon prénom apparaissent sur le live ». Une seule case possible ; aucune case cochée = numéro de maillot seulement.
- Côté staff (Suivi) : même choix dans la fenêtre d'accord, badge « Live : nom ✓ (accord parents) » pour un mineur.
- La mention majeur / mineur n'est visible que par le joueur et le staff, jamais par les autres joueurs.

## 2.15 — 13 octobre 2026 (carte des frappes dans le récap + mails du club)
- Récap des matchs (Historique) : nouvel onglet « Frappes ». Chaque joueur voit sa carte des frappes du match (ouverte sur lui par défaut), avec la liste de ses balles et le poste vers lequel elles sont parties (« Triple vers champ centre »). Choix « Toute l'équipe » ou n'importe quel joueur. N'apparaît que si la saisie des frappes était activée pour ce match.
- Mon compte : nouvel encart « Mails du club » (opt-in). Adresse mail + 2 cases à cocher, rien de coché par défaut : « Mes résultats après chaque match » (stats + carte des frappes perso) et « Le récap de l'équipe ». L'adresse n'est visible que par le joueur et le staff.
- Modèle de mail de récap prêt (version perso avec la carte de ses frappes, version équipe). L'envoi sera branché avec Brevo, uniquement aux joueurs qui ont coché.
- Correction carte des frappes : un home run frappé très loin pouvait sortir du cadre et devenir invisible. Il est maintenant placé juste derrière la clôture, toujours visible (live, feuille de match, récap).

## 2.14 — 12 octobre 2026 (récaps des matchs pour les joueurs)
- Appli › Historique : nouvelle section « Récaps des matchs », en lecture seule pour tous les comptes (joueurs, scoreuse, staff). Pour chaque match terminé : score par manche (R/H), stats de chaque joueur (AB, H, R, RBI, HR, BB, K, SB, AVG + passages au bâton), lanceurs (nombre de lancers) et déroulé manche par manche. La ligne du joueur connecté est surlignée, et la liste affiche « toi : 2/3 ».
- Le récap est créé automatiquement quand le coach clôt la feuille de match (envoyé à la synchro). Si le match est rouvert, le récap est retiré ; il revient à la clôture. Les matchs déjà terminés avant la mise à jour envoient leur récap une fois depuis la tablette qui les a saisis.
- Rien de privé dans le récap : pas de notes coach, pas de scouting, adversaires en prénom + numéro seulement. Les feuilles de match complètes restent réservées au staff.
- Feuille de match : les matchs terminés sortent de la liste principale et passent dans un bloc repliable « Matchs terminés » (toujours consultables, pas supprimés : ils servent au total de lancers de la journée et à la page Adversaires).

## 2.13 — 12 octobre 2026
- Mercy rule : texte d'aide aligné sur les RG FFBS art. 210.3 (régional 19+ : 7 manches en programme double → 10 pts après 5 ; 9 manches en programme simple → 15 pts après 5, 10 après 7). Les réglages par défaut correspondaient déjà.

## 2.12 — 12 octobre 2026 (mercy rule + motivation)
- Création du match : durée 7 ou 9 manches et règle de l'écart (mercy rule) réglable. Par défaut en match de saison : 7 manches, arrêt à 10 points d'écart après 5 manches (D2 2026) ; 9 manches : 15 points après 5, 10 après 7. Désactivée en amical (activable).
- Pendant le match : encadré « Règle de l'écart » dès que le seuil est atteint (après les manches complètes, ou dès que l'équipe qui reçoit mène dans sa demi-manche), avec « Terminer le match ». Visible aussi par la scoreuse.
- Quand les Dragons sont menés : petite alerte « On est menés de X · pense à remotiver les troupes » avec une astuce qui change à chaque demi-manche, et un avertissement quand on approche du seuil de la mercy rule.
- Manches supplémentaires : le bouton « coureur en 2e » n'apparaît qu'après la durée réglementaire du match (7 ou 9).

## 2.11 — 11 octobre 2026 (contrôle règlement FFBS 2026)
- Règle 5.10(g) : alerte au changement de lanceur s'il n'a pas affronté 3 frappeurs de suite dans la demi-manche (sauf blessure / fin de demi-manche). Non bloquant.
- Règle 7.01(b) manches supplémentaires : en attaque, bouton « Placer X en 2e » (le frappeur qui précède) au début de chaque demi-manche à partir de la 8e ; en défense, rappel pour placer le coureur adverse en 2e.
- Règle 6.02(b) : un balk sans coureur sur base est un lancer irrégulier, compté comme une balle.
- Règle 7.03(b) : l'alerte « match à 8 » rappelle qu'en match officiel, ne pas aligner 9 joueurs = forfait.

## 2.10 — 11 octobre 2026
- Accord d'affichage sur le live simplifié : une seule case « J'autorise l'affichage de mon prénom et de mon nom », sans distinction majeur / mineur ni nom de parent. Si la case n'est pas cochée, seul le numéro de maillot est affiché (expliqué sous la case).

## 2.9 — 11 octobre 2026 (accord d'affichage sur le live)
- Création de compte : paragraphe « Suivi des matchs en direct ». Majeur : accord pour afficher prénom et nom sur le live. Mineur : accord d'un parent / représentant légal, avec son nom. Choix majeur / mineur obligatoire.
- Sans accord, seul le numéro de maillot apparaît sur le live public (actions, pop-ups, image de fin) ; sans numéro : « Un Dragon ».
- « Mon compte » : carte « Affichage sur le live » pour changer d'avis à tout moment.
- Suivi (staff) : badge « Live : nom ✓ / n° seul » à côté de chaque joueur ; un clic pour enregistrer un accord reçu (papier…), avec date et auteur. Le nom du parent n'est visible que du staff et du joueur concerné.

## 2.8 — 11 octobre 2026
- Feuille de match : listes de joueurs plus courtes. Pour un match du calendrier, seuls les joueurs « Présent » (onglet Suivi) sont proposés (ordre, remplaçants, changements multiples, 9e frappeur, catcher). Bouton « Voir tout l'effectif » en cas d'oubli.
- Choix du lanceur (création du match et « Changer ») : d'abord les joueurs qui ont « Lanceur » dans leurs postes, puis « Autre joueur… » pour les autres.

## 2.7 — 11 octobre 2026 (retours du match)
- Line-up : « Plusieurs changements d'un coup ». Un seul écran pour faire entrer des remplaçants, déplacer plusieurs joueurs et changer de lanceur (P), validé en une fois. L'ordre au bâton ne bouge pas, règles vérifiées (poste en double, réentrée, lanceur déjà passé). « Annuler » défait tout le groupe.
- Défense : « +1 lancer » remplacé par Balle / Strike / Foul (chacun = 1 lancer) avec le compte du frappeur adverse. 4 balles = walk, 3 strikes = strikeout automatiquement. Un hit ou un out adverse compte aussi le lancer. Petits boutons ±1 pour corriger. Le compte s'affiche sur le live.
- Attaque : si le frappeur est encore sur base quand vient son tour, alerte avec « Il a marqué / Il a été retiré / L'enlever de la base ». Il ne peut plus être à la fois sur base et au bâton.
- Match à 8 : alerte au lancement, et « Ajouter un 9e frappeur » en cours de match (il frappe en dernier, avec son poste).
- Live : « passe d'arrêt-court » au lieu de « passe de arrêt-court ».

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
