# Leviers de motivation : exercice en trois manches

Application web statique (HTML, CSS, JavaScript natif) pour animer, en présentiel, un exercice de formation à trois managers sur le thème :

> « Comment identifier les leviers de motivation de ses collaborateurs ? »

Aucun serveur, aucun compte, aucune base de données, aucune bibliothèque externe, aucun cookie, aucun outil d'analyse. Tout fonctionne dans le navigateur de chaque participant.

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

Les titres de travail des scénarios (« La contribution invisible », « Le collaborateur sur-cadré », « La demande d'évolution ») et leurs objectifs révéleraient le levier au manager. L'application affiche donc des titres neutres (« Entretien avec Sophie »…). Les titres et objectifs d'origine sont conservés dans `data.js` (champ `notesAnimateur`) et ne sont jamais affichés. Pour l'animateur :

| Manche | Titre d'origine | Objectif |
|---|---|---|
| 1 | La contribution invisible | Identifier un besoin de reconnaissance sans conclure trop rapidement |
| 2 | Le collaborateur sur-cadré | Identifier un besoin d'autonomie et interroger l'effet du style de management |
| 3 | La demande d'évolution | Distinguer la demande exprimée du besoin réel |

---

## 2. Structure des fichiers

```
leviers-motivation/
├── index.html   Page unique (structure, accessibilité, boîte de confirmation)
├── styles.css   Mise en forme responsive (couleurs modifiables en tête de fichier)
├── app.js       Logique : rôles, manches, chronomètre, grille, synthèse, stockage local
├── data.js      Contenus : scénarios, grille, débriefing, synthèse finale
└── README.md    Ce document
```

L'application est unique. Le paramètre `p` de l'adresse (`?p=A`, `?p=B` ou `?p=C`) détermine le participant ; la manche active détermine son rôle.

---

## 3. Procédure de test local

**Option 1 : double-clic.** Ouvrez directement `index.html?p=A` dans le navigateur (par exemple en collant le chemin du fichier suivi de `?p=A` dans la barre d'adresse). Les scripts sont classiques (pas de modules), donc cela fonctionne sans serveur.

**Option 2 : petit serveur local** (plus proche de la production). Dans le dossier du projet :

```
python3 -m http.server 8000
```

puis ouvrez `http://localhost:8000/index.html?p=A` (puis `?p=B`, `?p=C`).

Pour tester les trois participants sur le même ordinateur, utilisez trois fenêtres distinctes : la progression est enregistrée séparément pour chaque participant.

---

## 4. Création du dépôt GitHub

1. Connectez-vous à GitHub, puis **New repository**.
2. Nom conseillé : `leviers-motivation`. Visibilité **Public** (GitHub Pages sur un dépôt privé exige une offre payante).
3. Déposez les fichiers à la **racine** du dépôt :
   - sans ligne de commande : **Add file → Upload files**, glissez les cinq fichiers, puis **Commit changes** ;
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

## 5. Activation de GitHub Pages

1. Dans le dépôt : **Settings → Pages**.
2. **Source** : *Deploy from a branch*.
3. **Branch** : `main`, dossier `/ (root)`, puis **Save**.
4. Attendez une à deux minutes. L'adresse du site s'affiche en haut de la page Pages :
   `https://<compte>.github.io/leviers-motivation/`

---

## 6. Les trois liens à communiquer

Remplacez `<compte>` par votre identifiant GitHub :

| Participant | Lien |
|---|---|
| A | `https://<compte>.github.io/leviers-motivation/index.html?p=A` |
| B | `https://<compte>.github.io/leviers-motivation/index.html?p=B` |
| C | `https://<compte>.github.io/leviers-motivation/index.html?p=C` |

Astuce : générez trois QR codes (un par lien) pour que chacun ouvre son lien sur smartphone sans le saisir. Veillez à ce que chacun scanne le bon code et garde le même appareil pendant tout l'exercice.

Un lien sans paramètre, ou avec une valeur autre que A, B ou C, affiche un message d'erreur clair et aucun contenu.

---

## 7. Modifier les scénarios

Tous les contenus sont dans `data.js`, sans toucher à `app.js`.

- **Texte d'un rôle** : dans `scenarios[n]`, les clés `manager`, `collaborateur` et `observateur` contiennent une liste de blocs :
  - `{ t: "p", text: "…" }` paragraphe ;
  - `{ t: "h3", text: "…" }` sous-titre ;
  - `{ t: "ul", items: ["…", "…"] }` liste à puces ;
  - `{ t: "quote", text: "…" }` citation ;
  - `{ t: "alert", text: "…" }` encadré orange (point de vigilance).
- **Titre affiché** : `titre` (gardez-le neutre pour ne pas révéler le levier).
- **Grille d'observation** : `criteres` (liste de critères) et `niveaux` (trois choix).
- **Débriefing** : `debrief.manager`, `debrief.collaborateur`, `debrief.observateur`.
- **Synthèse finale** : `synthese` (principe, démarche, familles de leviers, avertissement DISC/MBTI).
- **Durée du chronomètre** : `dureeSimulation` (en secondes) et `alerteSecondes`.
- **Rotation** : `rotation`. Si vous la modifiez, gardez un participant par rôle dans chaque manche et chaque rôle une fois par participant.

L'application est prévue pour trois manches et trois participants. Respectez la syntaxe JavaScript (guillemets, virgules) et testez en local après chaque modification.

---

## 8. Modifier les couleurs

En tête de `styles.css`, le bloc `:root` regroupe les variables :

| Variable | Usage |
|---|---|
| `--blue`, `--blue-dark`, `--blue-soft` | Couleur principale (bleu profond) |
| `--teal`, `--teal-soft` | Couleur secondaire (turquoise) |
| `--orange`, `--orange-line`, `--orange-soft` | Points de vigilance |
| `--slate` | Rôle observateur |
| `--bg`, `--card`, `--text`, `--muted`, `--border` | Fond, cartes, textes, bordures |

Si vous changez une couleur, vérifiez qu'un texte reste lisible dessus (contraste d'au moins 4,5:1 pour respecter WCAG 2.1 AA).

---

## 9. Remise à zéro

- **Par un participant** : bouton **Recommencer l'exercice** (en bas de chaque page), avec confirmation. Il efface la progression, les observations et la synthèse de ce participant sur cet appareil.
- **Pour tout nettoyer entre deux sessions** : demandez à chacun d'utiliser ce bouton, ou de vider les données du site dans le navigateur, ou d'ouvrir le lien en navigation privée.
- **En développement** : dans les outils du navigateur (F12), onglet *Application* (Chrome, Edge) puis *Local Storage*, supprimez les clés `leviers-motivation-v1:A`, `:B`, `:C`.

---

## 10. Limites de confidentialité d'un site statique

**Le cloisonnement est pédagogique, pas informatique.** L'interface n'affiche que le contenu du rôle actif, mais un site statique envoie tous les fichiers au navigateur. Une personne qui ouvre volontairement le code source (`data.js`), modifie l'adresse (`?p=B`) ou lit le stockage local peut accéder à des contenus qui ne la concernent pas. L'exercice repose donc sur la bonne foi des participants, ce qui convient à une formation, pas à des données sensibles.

Autres limites à connaître :

- **Pas de synchronisation entre appareils.** Chaque appareil avance seul. L'animateur rythme les manches à voix haute (« on passe à la manche 2 ») et chacun clique sur son propre bouton. Des boutons **Revenir…** permettent de corriger un faux clic sans rien perdre.
- **Progression liée à l'appareil et au navigateur.** Changer d'appareil ou de navigateur, vider les données du site ou utiliser la navigation privée fait repartir de zéro. Si le stockage est indisponible, un message le signale.
- **Le chronomètre** est local et facultatif. Il ne synchronise pas les appareils, ne produit aucun son et repart à 7:00 si la page est actualisée.
- **Aucune donnée personnelle réelle** : les scénarios sont fictifs et la fiche de transfert n'accepte, par consigne, que des initiales ou un pseudonyme. Rien n'est envoyé vers un serveur.
- **Aucune ressource distante** n'est chargée (ni police, ni script, ni image, ni statistique). L'en-tête `noindex` demande aux moteurs de recherche de ne pas référencer la page.

---

## Checklist de test

- [ ] Tester les trois liens (`?p=A`, `?p=B`, `?p=C`) et un lien invalide (`?p=Z`, sans paramètre).
- [ ] Vérifier les trois rotations : à chaque manche, un manager, un collaborateur et un observateur.
- [ ] Vérifier que chacun joue une fois chaque rôle (tableau de rotation de l'accueil).
- [ ] Tester l'affichage sur smartphone (lisibilité, boutons d'au moins 44 px, grille sans défilement horizontal).
- [ ] Tester la grille d'observation (choix, champs texte, actualisation de la page, effacement avec confirmation).
- [ ] Tester le chronomètre (démarrer, pause, reprendre, réinitialiser, alerte visuelle à 1 minute, aucun son, aucun démarrage automatique).
- [ ] Tester la progression (actualiser la page à chaque étape, puis les boutons de retour).
- [ ] Tester la copie de la synthèse, avec sa confirmation, puis son effacement.
- [ ] Tester la réinitialisation (**Recommencer l'exercice**).
- [ ] Vérifier l'absence d'informations confidentielles dans l'interface des autres rôles (le manager ne voit pas la fiche du collaborateur, ni la grille ; l'observateur ne voit ni contexte ni fiche).
- [ ] Tester dans Chrome, Edge et Safari mobile, console ouverte : aucune erreur.
- [ ] Parcourir une manche au clavier seul (Tab, Espace, Entrée) : le focus doit toujours être visible.
