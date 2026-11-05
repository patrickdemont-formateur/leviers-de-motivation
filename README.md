# Leviers de motivation : exercice en trois manches

Application web statique (HTML, CSS, JavaScript natif) pour animer, en présentiel, un exercice de formation à trois managers sur le thème :

> « Comment identifier les leviers de motivation de ses collaborateurs ? »

Aucun serveur, aucun compte, aucune base de données, aucune bibliothèque externe, aucun cookie, aucun outil d'analyse. Tout fonctionne dans le navigateur de chaque participant. Les QR codes sont générés localement par le fichier `qr.js` : aucun service externe n'est appelé.

---

## 1. Finalité pédagogique

L'exercice entraîne les managers à :

1. observer des faits ;
2. distinguer faits et interprétations ;
3. formuler plusieurs hypothèses ;
4. questionner le collaborateur ;
5. vérifier leurs hypothèses ;
6. identifier les leviers de motivation prioritaires ;
7. déterminer une action managériale réaliste.

Démarche à retenir : **Observer → Interroger → Identifier → Agir** (méthode O.I.I.A.).

Principe essentiel : *« Un comportement observable ne permet pas d'identifier automatiquement sa cause. »*

Ce n'est pas un jeu où l'on devine « le bon levier » : l'évaluation porte sur la qualité du questionnement.

### Rotation des rôles

| Manche | Situation | Participant A | Participant B | Participant C |
|---|---|---|---|---|
| 1 | Entretien avec Sophie | Manager | Collaborateur | Observateur |
| 2 | Entretien avec Alexandre | Observateur | Manager | Collaborateur |
| 3 | Entretien avec Nora | Collaborateur | Observateur | Manager |

Chaque participant joue exactement une fois chaque rôle. Chaque manche dure environ 15 minutes : lecture 2 min, simulation 7 min, débriefing 5 min, transition 1 min.

### Choix pédagogique : titres neutres

Les titres de travail des scénarios et leurs objectifs révéleraient le levier au manager. L'application affiche donc des titres neutres (« Entretien avec Sophie »…). Les titres et objectifs d'origine sont conservés dans `data.js` (champ `notesAnimateur`) et dans l'aide de l'animateur (section repliée « Notes de l'animateur »).

| Manche | Titre d'origine | Objectif |
|---|---|---|
| 1 | La contribution invisible | Identifier un besoin de reconnaissance sans conclure trop rapidement |
| 2 | Le collaborateur sur-cadré | Identifier un besoin d'autonomie et interroger l'effet du style de management |
| 3 | La demande d'évolution | Distinguer la demande exprimée du besoin réel |

---

## 2. Structure des fichiers

```
leviers-motivation/
├── index.html   Page unique (structure, accessibilité, roue crantée, confirmation)
├── styles.css   Mise en forme responsive (couleurs modifiables en tête de fichier)
├── app.js       Routage + parcours des participants (rôles, manches, chronomètre, grille, synthèse)
├── admin.js     Espace animateur : accueil (tuiles, QR codes), administration, aide
├── qr.js        Générateur de QR codes autonome (norme QR Code, niveau de correction M)
├── data.js      Contenus : scénarios, grille d'observation, débriefing, synthèse finale
└── README.md    Ce document
```

L'application est unique. L'adresse détermine ce qui s'affiche :

| Adresse | Affichage |
|---|---|
| `index.html` (sans paramètre) | Accueil de l'animateur : tuiles des 3 participants, QR codes |
| `index.html#admin` | Administration (prénoms, adresse du site, remises à zéro) |
| `index.html#aide` | Aide de l'animateur |
| `index.html?p=A` (ou `B`, `C`) | Parcours du participant |
| `index.html?p=Z`, `?p=` | Message « lien invalide » |

---

## 3. Espace animateur

### Accueil : les trois tuiles

Ouvrez simplement l'adresse du site (sans `?p=`). Trois tuiles s'affichent, une par participant, chacune avec :

- le prénom (s'il est renseigné) ;
- un **QR code** à faire scanner (bouton **Agrandir le QR code** pour une projection vue de loin) ;
- l'**adresse du lien**, dans un champ sélectionnable : **Copier l'adresse**, ou sélection manuelle puis Ctrl+C ;
- **Préparer un e-mail** : ouvre votre messagerie avec l'adresse déjà insérée dans le message.

Un tableau rappelle **qui joue quel rôle à chaque manche** (avec les prénoms).

La page s'adapte à l'écran : trois colonnes sur ordinateur ou vidéoprojecteur, tuiles empilées sur smartphone.

### Roue crantée : administration et aide

La roue crantée, en haut à gauche, ouvre l'**administration** (sans mot de passe) :

- **Prénoms** des participants A, B et C (facultatifs, 20 caractères maximum) ;
- **Adresse du site** (facultatif) : par défaut, l'adresse de la page ouverte est utilisée. À renseigner seulement si vous préparez les liens depuis un autre emplacement (par exemple en test local), avec l'adresse publique du site ;
- **Remises à zéro** sur l'appareil de l'animateur : paramètres, ou progression des participants A, B et C.

Depuis l'administration, le bouton **Aide** ouvre l'aide de l'animateur (préparation, déroulé, rôle d'observateur, dépannage, limites).

### Comment les prénoms arrivent sur les téléphones

Un site statique n'a pas de serveur pour mémoriser les prénoms saisis sur votre ordinateur. Ils sont donc **intégrés dans chaque lien et chaque QR code** :

```
https://compte.github.io/leviers-motivation/index.html?p=B&n=Claire~Marc~Julie
```

Conséquences à connaître :

- après toute modification d'un prénom, les liens changent : renvoyez-les ou faites rescanner les QR codes ; la progression déjà enregistrée sur l'appareil du participant est conservée ;
- les prénoms apparaissent dans l'adresse, donc **aussi dans les journaux de l'hébergeur** du site (GitHub). Si cela pose problème, utilisez des prénoms d'usage ou des initiales, ou laissez les champs vides ;
- les prénoms servent à afficher « Bonjour Marc », le badge en en-tête et la répartition des rôles de chaque manche. Ils ne sont jamais utilisés comme contenu de scénario.

---

## 4. Nouveautés du rôle d'observateur

Les 13 critères sont **regroupés en 4 thèmes** et présentés sous forme de tuiles, sous l'amorce unique « Le manager… » :

| Thème | Critères |
|---|---|
| Partir des faits | Part des faits ; Distingue faits et interprétations |
| Questionner et écouter | Pose des questions ouvertes ; Demande des exemples ; Reformule ; Reconnaît le point de vue du collaborateur ; Évite de projeter ses propres motivations |
| Explorer et vérifier | Explore plusieurs hypothèses ; Vérifie ses hypothèses ; Hiérarchise les leviers ; Distingue besoin et solution |
| Conclure et agir | Évite les promesses prématurées ; Identifie une action réaliste |

Chaque tuile comporte un bouton **+** et un bouton **−** :

- 1 clic sur **+** : comportement observé 1 fois ;
- clics suivants : l'observation se renforce (jusqu'à 5) ; la **jauge** se remplit, la couleur de la tuile s'intensifie et le compteur « ×2 » s'affiche (l'information ne repose donc pas sur la seule couleur) ;
- **−** : diminue le compteur pour corriger une erreur.

L'écran précise que **rien n'oblige à renseigner tous les critères** : un critère à 0 signifie simplement « pas noté ». Les trois champs de texte (question la plus efficace, interprétation prématurée, suggestion pour le rejeu) et le bouton « Effacer mes observations » sont conservés.

Le bouton **« Terminer la manche »** est remplacé par **« Passer au débriefing »**.

---

## 5. Procédure de test local

**Option 1 : double-clic.** Ouvrez directement `index.html` dans le navigateur. Pour tester un participant, ajoutez `?p=A` à l'adresse. Les scripts sont classiques (pas de modules), donc cela fonctionne sans serveur. Attention : depuis un fichier local, les QR codes pointent vers `file://…` et ne fonctionnent pas sur les autres appareils (l'accueil l'indique).

**Option 2 : petit serveur local** (plus proche de la production). Dans le dossier du projet :

```
python3 -m http.server 8000
```

puis ouvrez `http://localhost:8000/` (accueil animateur) ou `http://localhost:8000/index.html?p=A`.

Pour tester les trois participants sur le même ordinateur, utilisez trois fenêtres distinctes : la progression est enregistrée séparément pour chaque participant.

---

## 6. Création du dépôt GitHub

1. Connectez-vous à GitHub, puis **New repository**.
2. Nom conseillé : `leviers-motivation`. Visibilité **Public** (GitHub Pages sur un dépôt privé exige une offre payante).
3. Déposez les fichiers à la **racine** du dépôt :
   - sans ligne de commande : **Add file → Upload files**, glissez les sept fichiers, puis **Commit changes** ;
   - ou en ligne de commande :

```
git init
git add .
git commit -m "Exercice leviers de motivation"
git branch -M main
git remote add origin https://github.com/<compte>/leviers-motivation.git
git push -u origin main
```

---

## 7. Activation de GitHub Pages

1. Dans le dépôt : **Settings → Pages**.
2. **Source** : *Deploy from a branch*.
3. **Branch** : `main`, dossier `/ (root)`, puis **Save**.
4. Attendez une à deux minutes. L'adresse du site s'affiche en haut de la page Pages :
   `https://<compte>.github.io/leviers-motivation/`

---

## 8. Les liens à communiquer

Ouvrez l'adresse du site : **l'accueil de l'animateur fabrique les trois liens pour vous** (avec les prénoms si vous les avez saisis). Vous n'avez rien à taper : scannez, copiez ou envoyez par e-mail.

À titre d'information, le format des liens est :

| Participant | Lien |
|---|---|
| A | `https://<compte>.github.io/leviers-motivation/index.html?p=A` |
| B | `https://<compte>.github.io/leviers-motivation/index.html?p=B` |
| C | `https://<compte>.github.io/leviers-motivation/index.html?p=C` |

Chacun doit garder **le même appareil et le même lien** pendant tout l'exercice.

---

## 9. Modifier les contenus

Tous les contenus sont dans `data.js`, sans toucher à `app.js`.

- **Texte d'un rôle** : dans `scenarios[n]`, les clés `manager`, `collaborateur` et `observateur` contiennent une liste de blocs :
  - `{ t: "p", text: "…" }` paragraphe ;
  - `{ t: "h3", text: "…" }` sous-titre ;
  - `{ t: "ul", items: ["…", "…"] }` liste à puces ;
  - `{ t: "quote", text: "…" }` citation ;
  - `{ t: "alert", text: "…" }` encadré orange (point de vigilance).
- **Titre affiché** : `titre` (gardez-le neutre pour ne pas révéler le levier).
- **Grille d'observation** : `grille.groupes` (thèmes) et, dans chaque groupe, `criteres` (`id` stable + `texte` commençant par un verbe, puisque « Le manager… » est affiché une seule fois dans `grille.amorce`). `grille.max` fixe le plafond de la jauge (5 par défaut).
- **Débriefing** : `debrief.manager`, `debrief.collaborateur`, `debrief.observateur`.
- **Synthèse finale** : `synthese` (principe, démarche, familles de leviers, avertissement DISC/MBTI).
- **Durée du chronomètre** : `dureeSimulation` (en secondes) et `alerteSecondes`.
- **Rotation** : `rotation`. Si vous la modifiez, gardez un participant par rôle dans chaque manche et chaque rôle une fois par participant.

L'application est prévue pour trois manches et trois participants. Respectez la syntaxe JavaScript (guillemets, virgules) et testez en local après chaque modification. Si vous modifiez l'`id` d'un critère, les observations déjà enregistrées pour cet `id` sont perdues.

---

## 10. Modifier les couleurs

En tête de `styles.css`, le bloc `:root` regroupe les variables :

| Variable | Usage |
|---|---|
| `--blue`, `--blue-dark`, `--blue-soft` | Couleur principale (bleu profond) |
| `--teal`, `--teal-soft` | Couleur secondaire (turquoise) |
| `--orange`, `--orange-line`, `--orange-soft` | Points de vigilance |
| `--slate` | Rôle observateur, bouton « − » |
| `--bg`, `--card`, `--text`, `--muted`, `--border` | Fond, cartes, textes, bordures |

Si vous changez une couleur, vérifiez qu'un texte reste lisible dessus (contraste d'au moins 4,5:1 pour respecter WCAG 2.1 AA). Les QR codes restent noir sur blanc : ne les recolorez pas, ils risqueraient de ne plus se scanner.

---

## 11. Remise à zéro

- **Par un participant** : bouton **Recommencer l'exercice** (en bas de chaque page), avec confirmation. Il efface la progression, les observations et la synthèse de ce participant sur cet appareil.
- **Sur l'appareil de l'animateur** : Administration → **Effacer les paramètres** (prénoms, adresse du site) et **Effacer la progression des participants**.
- **Pour tout nettoyer** : vider les données du site dans le navigateur, ou ouvrir les liens en navigation privée.
- **En développement** : dans les outils du navigateur (F12), onglet *Application* (Chrome, Edge) puis *Local Storage*, supprimez les clés `leviers-motivation-v1:A`, `:B`, `:C` et `leviers-motivation-admin-v1`.

---

## 12. Limites de confidentialité d'un site statique

**Le cloisonnement est pédagogique, pas informatique.** L'interface n'affiche que le contenu du rôle actif, mais un site statique envoie tous les fichiers au navigateur. Une personne qui ouvre volontairement le code source (`data.js`), modifie l'adresse (`?p=B`) ou lit le stockage local peut accéder à des contenus qui ne la concernent pas. L'accueil de l'animateur n'est pas protégé : toute personne qui ouvre l'adresse sans paramètre voit les trois liens. L'exercice repose donc sur la bonne foi des participants, ce qui convient à une formation, pas à des données sensibles.

Autres limites à connaître :

- **Pas de synchronisation entre appareils.** Chaque appareil avance seul. L'animateur rythme les manches à voix haute et chacun clique sur son propre bouton. Des boutons **Revenir…** permettent de corriger un faux clic sans rien perdre.
- **Progression liée à l'appareil et au navigateur.** Changer d'appareil ou de navigateur, vider les données du site ou utiliser la navigation privée fait repartir de zéro. Si le stockage est indisponible, un message le signale.
- **Prénoms dans l'adresse.** Voir la section 3 : ils sont visibles dans les journaux de l'hébergeur.
- **Longueur des prénoms.** Le QR code a une capacité limitée. Avec des prénoms de 20 caractères très accentués, le lien peut devenir trop long : l'accueil l'indique et propose l'adresse à copier.
- **Le chronomètre** est local et facultatif. Il ne synchronise pas les appareils, ne produit aucun son et repart à 7:00 si la page est actualisée.
- **Aucune donnée personnelle réelle** : les scénarios sont fictifs et la fiche de transfert n'accepte, par consigne, que des initiales ou un pseudonyme. Rien n'est envoyé vers un serveur applicatif.
- **Aucune ressource distante** n'est chargée (ni police, ni script, ni image, ni statistique). L'en-tête `noindex` demande aux moteurs de recherche de ne pas référencer la page.

---

## Checklist de test

**Espace animateur**
- [ ] L'accueil (sans paramètre) affiche trois tuiles, chacune avec QR code et adresse.
- [ ] Scanner chaque QR code avec un smartphone ouvre le bon participant (A, B, C).
- [ ] « Copier l'adresse » fonctionne (coller dans un message pour vérifier) ; « Préparer un e-mail » ouvre la messagerie avec l'adresse.
- [ ] « Agrandir le QR code » s'affiche lisiblement en projection et se ferme.
- [ ] La roue crantée ouvre l'administration ; saisir trois prénoms, revenir aux liens : les prénoms apparaissent sur les tuiles et dans les liens.
- [ ] Rescanner un QR avec prénom : badge, message d'accueil et rôles de la manche affichent les prénoms.
- [ ] L'aide s'ouvre depuis l'administration ; les « Notes de l'animateur » sont repliées.

**Parcours participants**
- [ ] Tester les trois liens et un lien invalide (`?p=Z`).
- [ ] Vérifier les trois rotations : à chaque manche, un manager, un collaborateur et un observateur ; chacun joue une fois chaque rôle.
- [ ] Vérifier l'absence d'informations confidentielles dans l'interface des autres rôles.
- [ ] Tester le chronomètre (démarrer, pause, reprendre, réinitialiser, alerte visuelle à 1 minute, aucun son, aucun démarrage automatique).
- [ ] Le bouton affiche bien « Passer au débriefing ».
- [ ] Tester la progression (actualiser à chaque étape, puis les boutons « Revenir… »).

**Observateur**
- [ ] Les 13 critères sont groupés en 4 thèmes et l'écran précise que rien n'est obligatoire.
- [ ] + augmente (jauge, couleur, « ×n »), − diminue, le plafond est à 5.
- [ ] Les notes sont conservées après actualisation et au débriefing ; « Effacer mes observations » remet tout à 0.
- [ ] Sur smartphone : les tuiles s'affichent sur deux colonnes, les boutons sont faciles à toucher.

**Fin d'exercice et général**
- [ ] Tester la copie de la synthèse, avec sa confirmation, puis son effacement.
- [ ] Tester la réinitialisation (« Recommencer l'exercice »).
- [ ] Tester dans Chrome, Edge et Safari mobile, console ouverte : aucune erreur.
- [ ] Parcourir une manche au clavier seul (Tab, Espace, Entrée) : le focus doit toujours être visible.
