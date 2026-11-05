/* ==========================================================================
   data.js - Contenus pédagogiques de l'exercice
   « Comment identifier les leviers de motivation de ses collaborateurs ? »

   Ce fichier peut être modifié sans toucher à app.js.
   Chaque rôle d'un scénario est une liste de « blocs » :
     { t: "p",     text: "Paragraphe" }
     { t: "h3",    text: "Sous-titre" }
     { t: "ul",    items: ["Puce 1", "Puce 2"] }
     { t: "quote", text: "Citation" }
     { t: "alert", text: "Point de vigilance (encadré orange)" }

   Rappel : le cloisonnement des rôles est pédagogique, pas informatique.
   Toute personne qui ouvre ce fichier peut lire tous les contenus.
   ========================================================================== */
window.MOTIV_DATA = {
  titre: "Comment identifier les leviers de motivation de ses collaborateurs ?",
  dureeSimulation: 420,   /* secondes (7 minutes) */
  alerteSecondes: 60,     /* alerte visuelle à 1 minute de la fin */
  participants: ["A", "B", "C"],

  rythme: [
    { label: "Lecture", minutes: 2 },
    { label: "Simulation", minutes: 7 },
    { label: "Débriefing", minutes: 5 },
    { label: "Transition", minutes: 1 }
  ],

  roles: {
    manager: {
      label: "Manager",
      desc: "Vous menez l’entretien pour comprendre la situation du collaborateur.",
      titreContenu: "Votre contexte et votre mission"
    },
    collaborateur: {
      label: "Collaborateur",
      desc: "Vous jouez le collaborateur en vous appuyant sur votre fiche confidentielle.",
      titreContenu: "Votre fiche confidentielle"
    },
    observateur: {
      label: "Observateur",
      desc: "Vous observez l’entretien sans intervenir et vous renseignez la grille d’observation.",
      titreContenu: "Votre mission d’observation"
    }
  },

  /* Rotation : chaque participant joue une fois chaque rôle */
  rotation: {
    1: { A: "manager",       B: "collaborateur", C: "observateur" },
    2: { A: "observateur",   B: "manager",       C: "collaborateur" },
    3: { A: "collaborateur", B: "observateur",   C: "manager" }
  },

  /* ----------------------------------------------------------------------
     SCÉNARIOS
     « titre » est le titre AFFICHÉ aux joueurs : il est volontairement neutre
     pour ne pas révéler le levier. « notesAnimateur » n'est jamais affiché.
     ---------------------------------------------------------------------- */
  scenarios: [
    {
      id: 1,
      titre: "Entretien avec Sophie",
      notesAnimateur: {
        titreOriginal: "La contribution invisible",
        objectif: "Identifier un besoin de reconnaissance sans conclure trop rapidement."
      },

      manager: [
        { t: "p", text: "Sophie travaille dans l’équipe depuis trois ans. Son travail reste fiable et les objectifs sont atteints." },
        { t: "p", text: "Depuis quelques semaines :" },
        { t: "ul", items: [
          "Sophie intervient moins en réunion ;",
          "Sophie propose moins spontanément son aide ;",
          "Sophie réalise ce qui est demandé, sans aller au-delà ;",
          "après les bons résultats du mois, l’équipe a reçu un message collectif de félicitations ;",
          "Sophie a récemment déclaré : « Que l’on s’investisse beaucoup ou juste ce qu’il faut, cela ne change pas grand-chose. »"
        ] },
        { t: "h3", text: "Votre mission" },
        { t: "p", text: "Vous disposez de 7 minutes pour comprendre ce qui contribue au retrait de Sophie." },
        { t: "p", text: "Vous devez :" },
        { t: "ul", items: [
          "partir des faits ;",
          "explorer plusieurs hypothèses ;",
          "poser des questions ouvertes ;",
          "demander des exemples ;",
          "reformuler ;",
          "vérifier votre compréhension ;",
          "éviter de proposer immédiatement une solution."
        ] }
      ],

      collaborateur: [
        { t: "p", text: "Vous jouez Sophie." },
        { t: "p", text: "Votre travail vous intéresse et vous ne souhaitez pas quitter l’équipe." },
        { t: "p", text: "Depuis plusieurs mois :" },
        { t: "ul", items: [
          "vous avez pris en charge plusieurs urgences ;",
          "vous avez aidé des collègues ;",
          "votre manager intervient principalement lorsqu’un problème apparaît ;",
          "les réussites sont reconnues collectivement ;",
          "vous ne savez pas si votre contribution individuelle est réellement identifiée."
        ] },
        { t: "h3", text: "Votre besoin principal" },
        { t: "p", text: "Une reconnaissance précise et sincère de votre contribution." },
        { t: "p", text: "Vous ne recherchez pas particulièrement des félicitations publiques. Vous souhaitez surtout :" },
        { t: "ul", items: [
          "savoir ce qui est apprécié dans votre travail ;",
          "recevoir des retours plus réguliers ;",
          "connaître la perception de votre contribution."
        ] },
        { t: "h3", text: "Comment jouer votre rôle" },
        { t: "alert", text: "Ne révélez pas immédiatement toutes ces informations." },
        { t: "ul", items: [
          "Si le manager pose des questions fermées, répondez brièvement.",
          "Si le manager pose des questions ouvertes, demande des exemples et reformule sans jugement, donnez progressivement davantage d’informations."
        ] }
      ],

      observateur: [
        { t: "p", text: "Vous observez l’entretien entre le manager et Sophie. Vous n’intervenez pas : vous notez ce que vous entendez, avec des exemples concrets." },
        { t: "h3", text: "Points spécifiques à observer" },
        { t: "p", text: "Vérifiez notamment si le manager :" },
        { t: "ul", items: [
          "distingue reconnaissance individuelle et félicitations collectives ;",
          "demande des exemples ;",
          "identifie le besoin sans le suggérer trop directement ;",
          "évite les promesses prématurées."
        ] }
      ]
    },

    {
      id: 2,
      titre: "Entretien avec Alexandre",
      notesAnimateur: {
        titreOriginal: "Le collaborateur sur-cadré",
        objectif: "Identifier un besoin d’autonomie et interroger l’effet du style de management."
      },

      manager: [
        { t: "p", text: "Alexandre possède une forte expérience technique. Ses résultats sont satisfaisants et la qualité de son travail est reconnue." },
        { t: "p", text: "Depuis quelque temps :" },
        { t: "ul", items: [
          "Alexandre attend davantage les instructions ;",
          "Alexandre demande fréquemment une validation avant d’agir ;",
          "Alexandre formule moins de propositions ;",
          "lorsqu’une nouvelle tâche lui est confiée, Alexandre répond : « Dites-moi exactement ce que vous attendez et je le ferai. » ;",
          "Alexandre applique les procédures sans initiative particulière."
        ] },
        { t: "h3", text: "Votre mission" },
        { t: "p", text: "Comprendre la situation, explorer plusieurs hypothèses et identifier les leviers de motivation prioritaires." },
        { t: "p", text: "Vous devez également examiner si le fonctionnement managérial actuel peut contribuer au retrait d’Alexandre." }
      ],

      collaborateur: [
        { t: "p", text: "Vous jouez Alexandre." },
        { t: "p", text: "Vous maîtrisez votre métier et appréciez les responsabilités." },
        { t: "p", text: "Depuis l’arrivée d’un nouveau fonctionnement managérial :" },
        { t: "ul", items: [
          "votre travail est davantage contrôlé ;",
          "les consignes décrivent précisément la manière de procéder ;",
          "plusieurs décisions auparavant autonomes nécessitent une validation ;",
          "vos suggestions sont régulièrement reformulées ou reprises ;",
          "vous avez cessé de prendre certaines initiatives pour éviter d’être corrigé."
        ] },
        { t: "h3", text: "Votre besoin principal" },
        { t: "p", text: "L’autonomie. Vous souhaitez :" },
        { t: "ul", items: [
          "disposer d’un périmètre de décision clair ;",
          "être évalué sur les résultats ;",
          "conserver des contrôles utiles sans validation permanente ;",
          "retrouver la possibilité de proposer et d’expérimenter."
        ] },
        { t: "h3", text: "Comment jouer votre rôle" },
        { t: "alert", text: "Ne dites pas immédiatement : « Je veux plus d’autonomie »." },
        { t: "ul", items: [
          "Décrivez progressivement les effets du sur-cadrage lorsque les questions du manager vous permettent de le faire."
        ] }
      ],

      observateur: [
        { t: "p", text: "Vous observez l’entretien entre le manager et Alexandre. Vous n’intervenez pas : vous notez ce que vous entendez, avec des exemples concrets." },
        { t: "h3", text: "Points spécifiques à observer" },
        { t: "p", text: "Vérifiez notamment si le manager :" },
        { t: "ul", items: [
          "interroge son propre fonctionnement ;",
          "explore le niveau réel d’autonomie du collaborateur ;",
          "évite de confondre contrôle et accompagnement ;",
          "recherche un périmètre de décision adapté ;",
          "effectue un lien pertinent avec le management situationnel."
        ] }
      ]
    },

    {
      id: 3,
      titre: "Entretien avec Nora",
      notesAnimateur: {
        titreOriginal: "La demande d’évolution",
        objectif: "Distinguer la demande exprimée du besoin réel."
      },

      manager: [
        { t: "p", text: "Nora maîtrise parfaitement son poste et atteint régulièrement ses objectifs." },
        { t: "p", text: "Lors d’un échange récent, Nora a déclaré : « J’aimerais savoir ce que l’entreprise prévoit pour moi. »" },
        { t: "p", text: "Par ailleurs :" },
        { t: "ul", items: [
          "Nora accomplit rapidement les missions habituelles ;",
          "Nora participe moins aux échanges sur les tâches récurrentes ;",
          "Nora s’intéresse aux nouveaux projets ;",
          "Nora propose parfois d’aider les nouveaux arrivants ;",
          "aucune promotion n’est actuellement disponible dans l’équipe."
        ] },
        { t: "h3", text: "Votre mission" },
        { t: "p", text: "Comprendre ce que Nora recherche réellement derrière sa demande d’évolution." },
        { t: "p", text: "Vous ne devez pas :" },
        { t: "ul", items: [
          "conclure immédiatement à une demande d’augmentation ;",
          "promettre une promotion ;",
          "fermer la discussion parce qu’aucun poste n’est disponible."
        ] }
      ],

      collaborateur: [
        { t: "p", text: "Vous jouez Nora." },
        { t: "p", text: "La rémunération et le statut ne constituent pas votre priorité immédiate." },
        { t: "p", text: "Vous maîtrisez votre poste et avez le sentiment de ne plus progresser." },
        { t: "h3", text: "Ce que vous recherchez surtout" },
        { t: "ul", items: [
          "de nouveaux apprentissages ;",
          "des missions plus complexes ;",
          "une participation à des projets transversaux ;",
          "la possibilité de transmettre votre expertise ;",
          "une visibilité sur le développement de vos compétences."
        ] },
        { t: "h3", text: "Comment jouer votre rôle" },
        { t: "alert", text: "Votre demande d’évolution est volontairement ambiguë." },
        { t: "ul", items: [
          "Si le manager demande seulement « Vous voulez une promotion ? », répondez : « Pas nécessairement. J’aimerais surtout que quelque chose évolue. »",
          "Le manager doit explorer ce que signifient pour vous : progresser, évoluer, apprendre, contribuer autrement. Ne détaillez ces attentes que s’il les explore."
        ] }
      ],

      observateur: [
        { t: "p", text: "Vous observez l’entretien entre le manager et Nora. Vous n’intervenez pas : vous notez ce que vous entendez, avec des exemples concrets." },
        { t: "h3", text: "Points spécifiques à observer" },
        { t: "p", text: "Vérifiez notamment si le manager :" },
        { t: "ul", items: [
          "distingue demande exprimée et besoin réel ;",
          "explore les possibilités de développement ;",
          "envisage des solutions autres qu’une promotion ;",
          "demande au collaborateur de hiérarchiser ses attentes ;",
          "vérifie ce qui aurait le plus d’impact."
        ] }
      ]
    }
  ],

  /* ----------------------------------------------------------------------
     GRILLE D'OBSERVATION
     ---------------------------------------------------------------------- */
  niveaux: [
    { value: "non",     label: "Non observé" },
    { value: "partiel", label: "Partiellement observé" },
    { value: "clair",   label: "Clairement observé" }
  ],

  criteres: [
    "Le manager part des faits.",
    "Le manager distingue faits et interprétations.",
    "Le manager pose des questions ouvertes.",
    "Le manager explore plusieurs hypothèses.",
    "Le manager demande des exemples.",
    "Le manager reformule.",
    "Le manager reconnaît le point de vue du collaborateur.",
    "Le manager évite de projeter ses propres motivations.",
    "Le manager vérifie ses hypothèses.",
    "Le manager hiérarchise les leviers.",
    "Le manager distingue besoin et solution.",
    "Le manager évite les promesses prématurées.",
    "Le manager identifie une action réaliste."
  ],

  champsObservateur: [
    { id: "best",      label: "Question la plus efficace" },
    { id: "premature", label: "Interprétation prématurée repérée" },
    { id: "replay",    label: "Suggestion pour le rejeu" }
  ],

  /* ----------------------------------------------------------------------
     DÉBRIEFING PAR RÔLE
     ---------------------------------------------------------------------- */
  debrief: {
    manager: [
      "Quel levier avez-vous identifié ?",
      "Sur quels faits et propos vous appuyez-vous ?",
      "Quelle question a fait progresser l’entretien ?",
      "Quelle hypothèse avez-vous formulée trop rapidement ?",
      "Quelle action managériale pourriez-vous envisager ?"
    ],
    collaborateur: [
      "À quel moment avez-vous eu le sentiment que votre situation était réellement explorée ?",
      "Quelle question vous a permis de préciser votre besoin ?",
      "Quel comportement du manager a facilité votre expression ?",
      "Quel comportement a freiné votre expression ?"
    ],
    observateur: [
      "Quelle question a fait progresser l’entretien ?",
      "À quel moment une hypothèse a-t-elle été vérifiée ?",
      "Quelle interprétation prématurée avez-vous repérée ?",
      "Quelle autre question aurait pu être posée ?",
      "Le levier identifié repose-t-il sur des éléments concrets ?"
    ]
  },

  /* ----------------------------------------------------------------------
     SYNTHÈSE FINALE
     ---------------------------------------------------------------------- */
  synthese: {
    principe: "Un comportement observable ne permet pas d’identifier automatiquement sa cause.",
    demarche: "Observer → Interroger → Identifier → Agir",
    chaine: "Comportement observé → Hypothèses → Questionnement → Vérification → Action managériale",
    oiia: [
      { titre: "Observer",   question: "Que constatez-vous réellement ?",                              rappel: "Des faits, pas des interprétations." },
      { titre: "Interroger", question: "Que vit le collaborateur de son point de vue ?",               rappel: "Questions ouvertes, exemples, reformulation." },
      { titre: "Identifier", question: "Quels leviers comptent actuellement pour cette personne ?",    rappel: "Des hypothèses vérifiées, puis hiérarchisées." },
      { titre: "Agir",       question: "Sur quels leviers pouvez-vous raisonnablement agir comme manager ?", rappel: "Une action réaliste, sans promesse prématurée." }
    ],
    familles: [
      { nom: "Reconnaissance",        desc: "sentir que sa contribution est vue et appréciée." },
      { nom: "Autonomie",             desc: "disposer d’une marge de décision et d’initiative." },
      { nom: "Accomplissement",       desc: "réussir, atteindre des résultats dont on est fier." },
      { nom: "Développement",         desc: "apprendre, progresser, élargir ses compétences." },
      { nom: "Appartenance",          desc: "se sentir membre d’un collectif, avec des relations de confiance." },
      { nom: "Sens et utilité",       desc: "comprendre à quoi son travail sert." },
      { nom: "Équité perçue",         desc: "avoir le sentiment que charges, règles et récompenses sont justes." },
      { nom: "Conditions de travail", desc: "disposer d’un cadre, de moyens et d’un rythme soutenables." }
    ],
    avertissement: "Le DISC ou le MBTI peuvent aider à adapter la communication, mais ne permettent pas de déduire automatiquement les leviers de motivation d’une personne."
  }
};
