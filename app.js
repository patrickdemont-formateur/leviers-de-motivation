/* ==========================================================================
   app.js - Leviers de motivation
   JavaScript natif, aucune dépendance, aucune requête réseau.
   Les contenus sont dans data.js. Toute saisie est insérée via textContent
   ou value (jamais via innerHTML) : pas d'injection HTML possible.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.MOTIV_DATA;
  var root = document.getElementById("app");
  if (!root) { return; }
  if (!D) {
    root.textContent = "Erreur : le fichier data.js n’a pas pu être chargé.";
    return;
  }

  var TOTAL = D.scenarios.length;
  var PHASES = ["intro", "play", "debrief", "final"];

  /* ------------------------------------------------------------------
     Utilitaires DOM
     ------------------------------------------------------------------ */
  function append(parent, child) {
    if (child === null || child === undefined || child === false) { return; }
    if (Array.isArray(child)) {
      child.forEach(function (c) { append(parent, c); });
      return;
    }
    parent.appendChild(typeof child === "object" ? child : document.createTextNode(String(child)));
  }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    var kids = Array.prototype.slice.call(arguments, 2);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === false || v === null || v === undefined) { return; }
        if (k === "class") { el.className = v; }
        else if (k === "text") { el.textContent = v; }
        else if (k === "value") { el.value = v; }
        else if (k === "checked") { el.checked = true; }
        else if (k.slice(0, 2) === "on" && typeof v === "function") { el.addEventListener(k.slice(2), v); }
        else if (v === true) { el.setAttribute(k, ""); }
        else { el.setAttribute(k, v); }
      });
    }
    kids.forEach(function (c) { append(el, c); });
    return el;
  }

  /* ------------------------------------------------------------------
     Retour utilisateur : toast (aria-live) et boîte de confirmation
     ------------------------------------------------------------------ */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  var toastDelay = null;

  function toast(message) {
    if (!toastEl) { return; }
    window.clearTimeout(toastTimer);
    window.clearTimeout(toastDelay);
    toastEl.classList.remove("show");
    toastEl.textContent = "";
    toastDelay = window.setTimeout(function () {
      toastEl.textContent = message;
      toastEl.classList.add("show");
    }, 60);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 5000);
  }

  function confirmAction(message, okLabel) {
    return new Promise(function (resolve) {
      var dlg = document.getElementById("confirm-dialog");
      if (!dlg || typeof dlg.showModal !== "function") {
        resolve(window.confirm(message));
        return;
      }
      document.getElementById("confirm-message").textContent = message;
      document.getElementById("confirm-ok").textContent = okLabel || "Confirmer";
      var opener = document.activeElement;
      function onClose() {
        dlg.removeEventListener("close", onClose);
        resolve(dlg.returnValue === "ok");
        if (opener && typeof opener.focus === "function" && document.contains(opener)) {
          opener.focus();
        }
      }
      dlg.addEventListener("close", onClose);
      dlg.returnValue = "cancel";
      dlg.showModal();
    });
  }

  function copyText(text) {
    function legacy() {
      var ok = false;
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      try {
        ta.select();
        ta.setSelectionRange(0, text.length);
        ok = document.execCommand("copy");
      } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacy(); });
    }
    return Promise.resolve(legacy());
  }

  /* ------------------------------------------------------------------
     Participant (paramètre ?p=A|B|C)
     ------------------------------------------------------------------ */
  var P = "";
  try { P = (new URLSearchParams(window.location.search).get("p") || "").trim().toUpperCase(); }
  catch (e) { P = ""; }
  if (D.participants.indexOf(P) === -1) { P = null; }

  var badge = document.getElementById("participant-badge");

  if (!P) {
    document.title = "Lien invalide - Leviers de motivation";
    root.textContent = "";
    root.appendChild(h("div", { class: "view" },
      h("h1", { text: "Lien personnel absent ou invalide" }),
      h("div", { class: "card" },
        h("p", { text: "Cette application s’utilise avec le lien personnel communiqué par l’animateur." }),
        h("p", { text: "Demandez-lui de vous renvoyer votre lien, puis ouvrez-le depuis cet appareil." }),
        h("p", { class: "muted small", text: "Pour l’animateur : l’adresse doit se terminer par ?p=A, ?p=B ou ?p=C (voir le README)." })
      )
    ));
    return;
  }

  if (badge) {
    badge.textContent = "Participant " + P;
    badge.hidden = false;
  }

  /* ------------------------------------------------------------------
     Persistance locale (localStorage) - une clé par participant
     ------------------------------------------------------------------ */
  var KEY = "leviers-motivation-v1:" + P;

  var storageOk = (function () {
    try {
      var k = "__leviers_test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  function defaultState() {
    return { round: 1, phase: "intro", obs: {}, fiche: {} };
  }

  function isPlainObject(o) {
    return o !== null && typeof o === "object" && !Array.isArray(o);
  }

  function loadState() {
    var s = defaultState();
    if (!storageOk) { return s; }
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) { return s; }
      var o = JSON.parse(raw);
      if (isPlainObject(o)) {
        var r = parseInt(o.round, 10);
        if (r >= 1 && r <= TOTAL) { s.round = r; }
        if (PHASES.indexOf(o.phase) !== -1) { s.phase = o.phase; }
        if (isPlainObject(o.obs)) { s.obs = o.obs; }
        if (isPlainObject(o.fiche)) { s.fiche = o.fiche; }
      }
    } catch (e) { /* données illisibles : on repart de zéro */ }
    if (s.phase === "final") { s.round = TOTAL; }
    return s;
  }

  var state = loadState();

  function save() {
    if (!storageOk) { return; }
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { storageOk = false; }
  }

  function roleFor(round) {
    return D.rotation[round][P];
  }

  /* ------------------------------------------------------------------
     Observations (rôle observateur)
     ------------------------------------------------------------------ */
  function getObs(round) {
    var k = String(round);
    if (!isPlainObject(state.obs[k])) { state.obs[k] = {}; }
    var o = state.obs[k];
    if (!isPlainObject(o.grid)) { o.grid = {}; }
    D.champsObservateur.forEach(function (c) {
      if (typeof o[c.id] !== "string") { o[c.id] = ""; }
    });
    return o;
  }

  /* ------------------------------------------------------------------
     Chronomètre (basé sur l'horloge : pas de dérive)
     ------------------------------------------------------------------ */
  var T = { remaining: D.dureeSimulation, running: false, endTs: 0, id: null, warned: false };

  function stopTimer() {
    if (T.id) { window.clearInterval(T.id); T.id = null; }
    T.running = false;
    T.remaining = D.dureeSimulation;
    T.warned = false;
  }

  function fmt(s) {
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }

  function renderTimer() {
    var card = h("section", { class: "card timer-card", "aria-labelledby": "timer-title" });
    var flag = h("p", { class: "timer-flag", hidden: true });
    var display = h("p", { class: "timer-display", role: "timer", "aria-live": "off", "aria-atomic": "true" });
    var status = h("p", { class: "timer-status", role: "status", "aria-live": "polite", "aria-atomic": "true" });
    var bStart = h("button", { type: "button", class: "btn btn-primary" }, "Démarrer");
    var bPause = h("button", { type: "button", class: "btn btn-secondary" }, "Pause");
    var bReset = h("button", { type: "button", class: "btn btn-secondary" }, "Réinitialiser");

    function setStatus(msg, alertLevel) {
      status.textContent = msg;
      status.classList.toggle("is-alert", !!alertLevel);
    }

    function update() {
      var warn = T.remaining > 0 && T.remaining <= D.alerteSecondes;
      var ended = T.remaining === 0;
      display.textContent = fmt(T.remaining);
      card.classList.toggle("is-warning", warn);
      card.classList.toggle("is-ended", ended);
      flag.hidden = !(warn || ended);
      flag.textContent = ended ? "Temps écoulé" : "Dernière minute";
      bStart.disabled = T.running || ended;
      bPause.disabled = !T.running;
      bStart.textContent = (T.remaining < D.dureeSimulation && T.remaining > 0) ? "Reprendre" : "Démarrer";
    }

    function remainingNow() {
      return Math.max(0, Math.ceil((T.endTs - Date.now()) / 1000));
    }

    function tick() {
      T.remaining = remainingNow();
      if (T.remaining === 0) {
        window.clearInterval(T.id);
        T.id = null;
        T.running = false;
        setStatus("Temps écoulé. Concluez l’entretien.", true);
      } else if (T.remaining <= D.alerteSecondes && !T.warned) {
        T.warned = true;
        setStatus("Attention : il reste moins d’une minute.", true);
      }
      update();
    }

    bStart.addEventListener("click", function () {
      if (T.running || T.remaining === 0) { return; }
      var fresh = T.remaining === D.dureeSimulation;
      T.endTs = Date.now() + T.remaining * 1000;
      T.running = true;
      T.id = window.setInterval(tick, 250);
      setStatus(fresh ? "Chronomètre démarré." : "Chronomètre repris.", false);
      update();
    });

    bPause.addEventListener("click", function () {
      if (!T.running) { return; }
      T.remaining = remainingNow();
      window.clearInterval(T.id);
      T.id = null;
      T.running = false;
      setStatus("Chronomètre en pause.", false);
      update();
    });

    bReset.addEventListener("click", function () {
      if (T.id) { window.clearInterval(T.id); T.id = null; }
      T.running = false;
      T.remaining = D.dureeSimulation;
      T.warned = false;
      setStatus("Chronomètre réinitialisé.", false);
      update();
    });

    card.appendChild(h("h2", { id: "timer-title", text: "Chronomètre (facultatif)" }));
    card.appendChild(h("p", { class: "muted", text: "Simulation : " + Math.round(D.dureeSimulation / 60) + " minutes. Le chronomètre ne démarre jamais automatiquement et reste local à cet appareil." }));
    card.appendChild(flag);
    card.appendChild(display);
    card.appendChild(status);
    card.appendChild(h("div", { class: "actions" }, bStart, bPause, bReset));
    update();
    return card;
  }

  /* ------------------------------------------------------------------
     Blocs de contenu des scénarios
     ------------------------------------------------------------------ */
  function renderBlocks(blocks) {
    var frag = document.createDocumentFragment();
    blocks.forEach(function (b) {
      if (b.t === "p") { frag.appendChild(h("p", { text: b.text })); }
      else if (b.t === "h3") { frag.appendChild(h("h3", { text: b.text })); }
      else if (b.t === "ul") {
        frag.appendChild(h("ul", null, b.items.map(function (i) { return h("li", { text: i }); })));
      }
      else if (b.t === "quote") { frag.appendChild(h("blockquote", { class: "quote", text: b.text })); }
      else if (b.t === "alert") {
        frag.appendChild(h("p", { class: "callout callout-warn" },
          h("strong", { text: "Point de vigilance : " }), b.text));
      }
    });
    return frag;
  }

  /* ------------------------------------------------------------------
     Composants communs
     ------------------------------------------------------------------ */
  function stepper() {
    var ol = h("ol", { class: "steps", "aria-label": "Progression des trois manches" });
    for (var i = 1; i <= TOTAL; i++) {
      var done = i < state.round || state.phase === "final";
      var current = !done && i === state.round && state.phase !== "intro";
      var label = done ? "terminée" : (current ? "en cours" : "à venir");
      var cls = "steps-item" + (done ? " is-done" : "") + (current ? " is-current" : "");
      ol.appendChild(h("li", { class: cls, "aria-current": current ? "step" : false },
        h("span", { class: "steps-n", text: "Manche " + i }),
        h("span", { class: "steps-state", text: label })));
    }
    return ol;
  }

  function roleCard(role) {
    var r = D.roles[role];
    return h("div", { class: "role-card role-" + role },
      h("p", { class: "role-label", text: "Votre rôle" }),
      h("p", { class: "role-name", text: r.label }),
      h("p", { class: "role-desc", text: r.desc }));
  }

  function rhythmText() {
    var parts = D.rythme.map(function (r) { return r.label.toLowerCase() + " " + r.minutes + " min"; });
    var total = D.rythme.reduce(function (a, r) { return a + r.minutes; }, 0);
    return "Une manche dure environ " + total + " minutes : " + parts.join(", ") + ".";
  }

  function storageWarning() {
    if (storageOk) { return null; }
    return h("p", { class: "callout callout-warn", role: "note" },
      h("strong", { text: "Point de vigilance : " }),
      "le stockage local est indisponible sur ce navigateur (navigation privée ?). Votre progression ne sera pas conservée si vous actualisez la page.");
  }

  function goBack() {
    if (state.phase === "play") {
      if (state.round === 1) { state.phase = "intro"; }
      else { state.round -= 1; state.phase = "debrief"; }
    } else if (state.phase === "debrief") {
      state.phase = "play";
    } else if (state.phase === "final") {
      state.round = TOTAL;
      state.phase = "debrief";
    }
    save();
    render(true);
  }

  function backLabel() {
    if (state.phase === "play") {
      return state.round === 1 ? "Revenir à l’accueil" : "Revenir au débriefing de la manche " + (state.round - 1);
    }
    if (state.phase === "debrief") { return "Revenir à la simulation"; }
    return "Revenir au débriefing de la manche " + TOTAL;
  }

  function backButton() {
    return h("button", { type: "button", class: "btn btn-secondary", onclick: goBack }, backLabel());
  }

  /* ------------------------------------------------------------------
     Grille d'observation (observateur uniquement)
     ------------------------------------------------------------------ */
  function renderGrid(round) {
    var o = getObs(round);
    var section = h("section", { class: "card", "aria-labelledby": "grid-title" });
    var count = h("p", { class: "grid-count" });

    function updateCount() {
      var n = Object.keys(o.grid).length;
      count.textContent = n + " critère" + (n > 1 ? "s" : "") + " sur " + D.criteres.length + " renseigné" + (n > 1 ? "s" : "");
    }

    section.appendChild(h("h2", { id: "grid-title", text: "Grille d’observation" }));
    section.appendChild(h("p", { class: "muted", text: "Pour chaque critère, indiquez ce que vous avez observé. Vos notes restent uniquement sur cet appareil." }));
    section.appendChild(count);

    D.criteres.forEach(function (texte, i) {
      var group = h("div", { class: "seg-group" });
      D.niveaux.forEach(function (n) {
        group.appendChild(h("label", { class: "seg" },
          h("input", {
            type: "radio",
            name: "crit-" + round + "-" + i,
            value: n.value,
            checked: o.grid[i] === n.value,
            onchange: function () { o.grid[i] = n.value; save(); updateCount(); }
          }),
          h("span", { text: n.label })));
      });
      section.appendChild(h("fieldset", { class: "crit" },
        h("legend", { text: (i + 1) + ". " + texte }), group));
    });

    D.champsObservateur.forEach(function (c) {
      var id = "obs-" + round + "-" + c.id;
      section.appendChild(h("div", { class: "field" },
        h("label", { for: id, text: c.label }),
        h("textarea", {
          id: id, rows: 3, maxlength: 1000, value: o[c.id],
          oninput: function (ev) { o[c.id] = ev.target.value; save(); }
        })));
    });

    section.appendChild(h("div", { class: "actions" },
      h("button", {
        type: "button", class: "btn btn-warn",
        onclick: function () {
          confirmAction("Effacer toutes vos observations enregistrées sur cet appareil ?", "Effacer").then(function (ok) {
            if (!ok) { return; }
            state.obs[String(round)] = {};
            save();
            var fresh = renderGrid(round);
            section.replaceWith(fresh);
            var t = fresh.querySelector("h2");
            if (t) { t.setAttribute("tabindex", "-1"); t.focus(); }
            toast("Vos observations ont été effacées.");
          });
        }
      }, "Effacer mes observations")));

    updateCount();
    return section;
  }

  /* ------------------------------------------------------------------
     Fiche de transfert (synthèse individuelle)
     ------------------------------------------------------------------ */
  function ficheValue(id) {
    var v = state.fiche[id];
    return typeof v === "string" ? v : "";
  }

  function formatDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    return m ? m[3] + "/" + m[2] + "/" + m[1] : v;
  }

  function ficheText() {
    function v(id) { var x = ficheValue(id).trim(); return x ? x : "-"; }
    var date = ficheValue("date").trim();
    return [
      "FICHE DE PRÉPARATION D’ENTRETIEN - Leviers de motivation",
      "",
      "Collaborateur concerné (initiales ou pseudonyme) : " + v("pseudo"),
      "",
      "Ce que j’observe :",
      v("observe"),
      "",
      "Ce que j’interprète :",
      v("interprete"),
      "",
      "Ce que je sais réellement :",
      v("sais"),
      "",
      "Ce que je ne sais pas :",
      v("saispas"),
      "",
      "Mes trois hypothèses :",
      "1. " + v("hyp1"),
      "2. " + v("hyp2"),
      "3. " + v("hyp3"),
      "",
      "Les trois questions que je vais poser :",
      "1. " + v("q1"),
      "2. " + v("q2"),
      "3. " + v("q3"),
      "",
      "Le levier sur lequel je peux agir : " + v("levier"),
      "Date prévue de l’entretien : " + (date ? formatDate(date) : "-"),
      "",
      "Le résultat que je souhaite observer :",
      v("resultat")
    ].join("\n");
  }

  function renderFiche() {
    var section = h("section", { class: "card", "aria-labelledby": "fiche-title" });

    function field(id, label, kind, extra) {
      var fid = "fiche-" + id;
      var control;
      function onInput(ev) { state.fiche[id] = ev.target.value; save(); }
      if (kind === "textarea") {
        control = h("textarea", { id: fid, rows: 3, maxlength: 1000, value: ficheValue(id), oninput: onInput });
      } else {
        var attrs = { type: kind === "date" ? "date" : "text", id: fid };
        if (kind !== "date") { attrs.maxlength = 300; }
        if (extra) { Object.keys(extra).forEach(function (k) { attrs[k] = extra[k]; }); }
        attrs.value = ficheValue(id);
        attrs.oninput = onInput;
        control = h("input", attrs);
      }
      return h("div", { class: "field" }, h("label", { for: fid, text: label }), control);
    }

    section.appendChild(h("h2", { id: "fiche-title", text: "Ma situation réelle : fiche de préparation" }));
    section.appendChild(h("p", { text: "Choisissez un collaborateur réel et préparez votre prochain entretien avec la démarche de l’exercice." }));
    section.appendChild(h("p", { class: "callout callout-warn", role: "note" },
      h("strong", { text: "Point de vigilance : " }),
      "n’indiquez que des initiales ou un pseudonyme, et aucune information sensible. Rien n’est envoyé vers un serveur."));

    var form = h("form", { novalidate: true, onsubmit: function (ev) { ev.preventDefault(); } });
    form.appendChild(field("pseudo", "Collaborateur concerné (initiales ou pseudonyme uniquement)", "text", { autocomplete: "off" }));
    form.appendChild(field("observe", "Ce que j’observe (des faits)", "textarea"));
    form.appendChild(field("interprete", "Ce que j’interprète", "textarea"));
    form.appendChild(field("sais", "Ce que je sais réellement", "textarea"));
    form.appendChild(field("saispas", "Ce que je ne sais pas", "textarea"));
    form.appendChild(h("fieldset", { class: "fieldset" },
      h("legend", { text: "Mes trois hypothèses" }),
      field("hyp1", "Hypothèse 1", "text"),
      field("hyp2", "Hypothèse 2", "text"),
      field("hyp3", "Hypothèse 3", "text")));
    form.appendChild(h("fieldset", { class: "fieldset" },
      h("legend", { text: "Les trois questions que je vais poser" }),
      field("q1", "Question 1", "text"),
      field("q2", "Question 2", "text"),
      field("q3", "Question 3", "text")));
    form.appendChild(field("levier", "Le levier sur lequel je peux agir", "text"));
    form.appendChild(field("date", "Date prévue de l’entretien", "date"));
    form.appendChild(field("resultat", "Le résultat que je souhaite observer", "textarea"));
    section.appendChild(form);

    var copyBtn = h("button", { type: "button", class: "btn btn-teal" }, "Copier ma synthèse");
    var copyTimer = null;
    var fallback = null;

    copyBtn.addEventListener("click", function () {
      var text = ficheText();
      copyText(text).then(function (ok) {
        if (ok) {
          toast("Synthèse copiée dans le presse-papiers.");
          copyBtn.textContent = "Synthèse copiée";
          window.clearTimeout(copyTimer);
          copyTimer = window.setTimeout(function () { copyBtn.textContent = "Copier ma synthèse"; }, 3000);
        } else {
          toast("La copie automatique a échoué : copiez le texte affiché sous les boutons.");
          if (!fallback) {
            fallback = h("textarea", { class: "copy-fallback", readonly: true, rows: 10, "aria-label": "Texte de ma synthèse à copier manuellement" });
            actions.insertAdjacentElement("afterend", fallback);
          }
          fallback.value = text;
          fallback.focus();
          fallback.select();
        }
      });
    });

    var clearBtn = h("button", {
      type: "button", class: "btn btn-warn",
      onclick: function () {
        confirmAction("Effacer toute votre synthèse enregistrée sur cet appareil ?", "Effacer").then(function (ok) {
          if (!ok) { return; }
          state.fiche = {};
          save();
          var fresh = renderFiche();
          section.replaceWith(fresh);
          var t = fresh.querySelector("h2");
          if (t) { t.setAttribute("tabindex", "-1"); t.focus(); }
          toast("Votre synthèse a été effacée.");
        });
      }
    }, "Effacer ma synthèse");

    var actions = h("div", { class: "actions" }, copyBtn, clearBtn);
    section.appendChild(actions);
    return section;
  }

  /* ------------------------------------------------------------------
     Vues
     ------------------------------------------------------------------ */
  function viewIntro() {
    var wrap = h("div", { class: "view" });
    wrap.appendChild(h("h1", { text: D.titre }));
    append(wrap, storageWarning());
    wrap.appendChild(h("p", { class: "role-label muted", text: "Vous êtes le participant " + P + "." }));

    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "intro-obj" },
      h("h2", { id: "intro-obj", text: "Ce que vous allez pratiquer" }),
      h("p", { text: "À trois, vous vous entraînez à comprendre ce qui motive un collaborateur : observer des faits, formuler plusieurs hypothèses, questionner, vérifier, puis envisager une action réaliste." }),
      h("p", { text: "Il ne s’agit pas de deviner le « bon » levier, mais de pratiquer une démarche d’entretien. Chacun lit uniquement sa propre fiche, sur son propre appareil." })));

    var rows = D.scenarios.map(function (sc, i) {
      return h("tr", null,
        h("th", { scope: "row", text: "Manche " + (i + 1) }),
        h("td", { text: sc.titre }),
        h("td", null, h("strong", { text: D.roles[roleFor(i + 1)].label })));
    });
    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "intro-rot" },
      h("h2", { id: "intro-rot", text: "Votre rotation" }),
      h("p", { text: "Vous jouez chaque rôle une fois. La manche active détermine automatiquement votre rôle." }),
      h("div", { class: "table-wrap" },
        h("table", { class: "table" },
          h("thead", null, h("tr", null,
            h("th", { scope: "col", text: "Manche" }),
            h("th", { scope: "col", text: "Situation" }),
            h("th", { scope: "col", text: "Votre rôle" }))),
          h("tbody", null, rows))),
      h("p", { class: "muted small", text: rhythmText() })));

    wrap.appendChild(h("div", { class: "actions" },
      h("button", {
        type: "button", class: "btn btn-primary",
        onclick: function () { state.phase = "play"; state.round = 1; save(); render(true); }
      }, "Commencer")));
    return wrap;
  }

  function viewPlay() {
    var round = state.round;
    var role = roleFor(round);
    var sc = D.scenarios[round - 1];
    var wrap = h("div", { class: "view" });

    wrap.appendChild(stepper());
    append(wrap, storageWarning());
    wrap.appendChild(h("div", null,
      h("p", { class: "eyebrow", text: "Manche " + round + " sur " + TOTAL }),
      h("h1", { text: sc.titre })));
    wrap.appendChild(roleCard(role));
    wrap.appendChild(h("p", { class: "muted small", text: rhythmText() }));
    wrap.appendChild(renderTimer());

    var card = h("section", {
      class: "card" + (role === "collaborateur" ? " card-confidential" : ""),
      "aria-labelledby": "content-title"
    });
    if (role === "collaborateur") {
      card.appendChild(h("p", { class: "confidential", text: "Informations confidentielles : ne pas montrer aux autres participants" }));
    }
    card.appendChild(h("h2", { id: "content-title", text: D.roles[role].titreContenu }));
    card.appendChild(renderBlocks(sc[role]));
    wrap.appendChild(card);

    if (role === "observateur") { wrap.appendChild(renderGrid(round)); }

    wrap.appendChild(h("div", { class: "actions" },
      h("button", {
        type: "button", class: "btn btn-primary",
        onclick: function () { state.phase = "debrief"; save(); render(true); }
      }, "Terminer la manche"),
      backButton()));
    return wrap;
  }

  function viewDebrief() {
    var round = state.round;
    var role = roleFor(round);
    var sc = D.scenarios[round - 1];
    var last = round === TOTAL;
    var wrap = h("div", { class: "view" });

    wrap.appendChild(stepper());
    append(wrap, storageWarning());
    wrap.appendChild(h("div", null,
      h("p", { class: "eyebrow", text: "Manche " + round + " sur " + TOTAL }),
      h("h1", { text: "Débriefing : " + sc.titre })));
    wrap.appendChild(roleCard(role));

    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "debrief-title" },
      h("h2", { id: "debrief-title", text: "Questions pour le rôle de " + D.roles[role].label.toLowerCase() }),
      h("p", { class: "muted", text: "Échangez à l’oral, environ 5 minutes. Chacun peut répondre à partir de son propre rôle." }),
      h("ol", null, D.debrief[role].map(function (q) { return h("li", { text: q }); }))));

    if (role === "observateur") { wrap.appendChild(renderGrid(round)); }

    wrap.appendChild(h("p", { class: "muted small", text: last
      ? "Prenez environ une minute avant la synthèse finale."
      : "Prenez environ une minute avant la manche suivante : les rôles changent." }));

    wrap.appendChild(h("div", { class: "actions" },
      h("button", {
        type: "button", class: "btn btn-primary",
        onclick: function () {
          if (last) { state.phase = "final"; }
          else { state.round = round + 1; state.phase = "play"; }
          save(); render(true);
        }
      }, last ? "Voir la synthèse finale" : "Passer à la manche suivante"),
      backButton()));
    return wrap;
  }

  function viewFinal() {
    var S = D.synthese;
    var wrap = h("div", { class: "view" });

    wrap.appendChild(stepper());
    append(wrap, storageWarning());
    wrap.appendChild(h("h1", { text: "Synthèse : la méthode O.I.I.A." }));

    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "syn-princ" },
      h("h2", { id: "syn-princ", text: "Le principe à retenir" }),
      h("blockquote", { class: "quote", text: S.principe }),
      h("p", { class: "chain", text: S.demarche }),
      h("div", { class: "oiia" }, S.oiia.map(function (o) {
        return h("div", { class: "oiia-item" },
          h("h3", { text: o.titre }),
          h("p", { text: o.question }),
          h("p", { class: "muted", text: o.rappel }));
      }))));

    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "syn-chaine" },
      h("h2", { id: "syn-chaine", text: "Le fil de l’entretien" }),
      h("p", { class: "chain", text: S.chaine })));

    wrap.appendChild(h("section", { class: "card", "aria-labelledby": "syn-fam" },
      h("h2", { id: "syn-fam", text: "Les grandes familles de leviers" }),
      h("ul", { class: "familles" }, S.familles.map(function (f) {
        return h("li", null, h("strong", { text: f.nom }), " : " + f.desc);
      }))));

    wrap.appendChild(h("p", { class: "callout callout-warn", role: "note" },
      h("strong", { text: "Point de vigilance : " }), S.avertissement));

    wrap.appendChild(renderFiche());
    wrap.appendChild(h("div", { class: "actions" }, backButton()));
    return wrap;
  }

  /* ------------------------------------------------------------------
     Rendu principal
     ------------------------------------------------------------------ */
  function render(moveFocus) {
    stopTimer();
    var view;
    if (state.phase === "play") { view = viewPlay(); }
    else if (state.phase === "debrief") { view = viewDebrief(); }
    else if (state.phase === "final") { view = viewFinal(); }
    else { view = viewIntro(); }

    root.textContent = "";
    root.appendChild(view);
    document.title = "Leviers de motivation - Participant " + P;

    if (moveFocus) {
      var title = root.querySelector("h1");
      if (title) {
        title.setAttribute("tabindex", "-1");
        title.focus();
      }
      try { window.scrollTo(0, 0); } catch (e) { /* sans importance */ }
    }
  }

  /* ------------------------------------------------------------------
     Pied de page : recommencer l'exercice
     ------------------------------------------------------------------ */
  var footer = document.getElementById("footer-actions");
  if (footer) {
    footer.appendChild(h("button", {
      type: "button", class: "btn btn-warn",
      onclick: function () {
        confirmAction("Recommencer l’exercice ? Votre progression, vos observations et votre synthèse enregistrées sur cet appareil seront effacées.", "Recommencer").then(function (ok) {
          if (!ok) { return; }
          try { window.localStorage.removeItem(KEY); } catch (e) { /* ignoré */ }
          state = defaultState();
          render(true);
          toast("L’exercice a été remis à zéro.");
        });
      }
    }, "Recommencer l’exercice"));
  }

  render(false);
})();
