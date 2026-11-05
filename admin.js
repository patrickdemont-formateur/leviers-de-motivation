/* ==========================================================================
   admin.js - Espace animateur : accueil (liens + QR codes), administration, aide
   Affiché quand l'adresse ne contient pas de paramètre ?p=.
   Aucune protection par mot de passe (voulu) ; aucun envoi de données.
   Les réglages sont conservés uniquement sur l'appareil de l'animateur.
   ========================================================================== */
(function () {
  "use strict";

  var SETTINGS_KEY = "leviers-motivation-admin-v1";
  var PARTICIPANTS = ["A", "B", "C"];

  window.LM_ADMIN = { start: start };

  function start(LM) {
    var D = LM.D;
    var h = LM.h;
    var append = LM.append;
    var root = LM.root;
    var toast = LM.toast;

    /* ------------------------------------------------------------------
       Mise en page « large » et roue crantée
       ------------------------------------------------------------------ */
    root.classList.add("container-wide");
    var headerInner = document.querySelector(".header-inner");
    if (headerInner) { headerInner.classList.add("container-wide"); }
    var gear = document.getElementById("admin-link");
    if (gear) { gear.hidden = false; }
    var footerInner = document.querySelector(".site-footer .container");
    if (footerInner) { footerInner.classList.add("container-wide"); }

    /* ------------------------------------------------------------------
       Réglages (localStorage de l'animateur)
       ------------------------------------------------------------------ */
    var settings = { names: ["", "", ""], base: "" };
    var storageOk = true;

    (function load() {
      try {
        var raw = window.localStorage.getItem(SETTINGS_KEY);
        if (!raw) { return; }
        var o = JSON.parse(raw);
        if (o && Array.isArray(o.names)) {
          for (var i = 0; i < 3; i++) {
            settings.names[i] = typeof o.names[i] === "string" ? o.names[i].slice(0, LM.NAME_MAX) : "";
          }
        }
        if (o && typeof o.base === "string") { settings.base = o.base.slice(0, 300); }
      } catch (e) { storageOk = false; }
    })();

    function saveSettings() {
      try { window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
      catch (e) { storageOk = false; }
    }

    /* ------------------------------------------------------------------
       Construction des liens
       ------------------------------------------------------------------ */
    function detectedBase() {
      return window.location.href.split("#")[0].split("?")[0];
    }

    function isValidBase(u) {
      return /^(https?|file):\/\/\S+$/i.test(u);
    }

    function normalizeBase(u) {
      u = u.split("#")[0].split("?")[0];
      var last = u.slice(u.lastIndexOf("/") + 1);
      if (u.slice(-1) !== "/" && !/\.[a-z0-9]+$/i.test(last)) { u += "/"; }
      return u;
    }

    function baseUrl() {
      var custom = (settings.base || "").trim();
      return custom && isValidBase(custom) ? normalizeBase(custom) : detectedBase();
    }

    function cleanNames() {
      return settings.names.map(LM.cleanName);
    }

    function linkFor(P) {
      var url = baseUrl() + "?p=" + P;
      var names = cleanNames();
      if (names.some(function (n) { return n; })) {
        url += "&n=" + encodeURIComponent(names.join("~"));
      }
      return url;
    }

    function label(P) {
      var n = cleanNames()[PARTICIPANTS.indexOf(P)];
      return n ? n + " (" + P + ")" : "Participant " + P;
    }

    function roleHolder(round, role) {
      var q = PARTICIPANTS.filter(function (x) { return D.rotation[round][x] === role; })[0];
      return label(q);
    }

    /* ------------------------------------------------------------------
       Composants
       ------------------------------------------------------------------ */
    function rotationTable() {
      var rows = D.scenarios.map(function (sc, i) {
        var r = i + 1;
        return h("tr", null,
          h("th", { scope: "row", text: "Manche " + r }),
          h("td", { text: sc.titre }),
          h("td", { text: roleHolder(r, "manager") }),
          h("td", { text: roleHolder(r, "collaborateur") }),
          h("td", { text: roleHolder(r, "observateur") }));
      });
      return h("div", { class: "table-wrap" },
        h("table", { class: "table" },
          h("caption", { text: "Qui joue quel rôle, manche par manche" }),
          h("thead", null, h("tr", null,
            h("th", { scope: "col", text: "Manche" }),
            h("th", { scope: "col", text: "Situation" }),
            h("th", { scope: "col", text: "Manager" }),
            h("th", { scope: "col", text: "Collaborateur" }),
            h("th", { scope: "col", text: "Observateur" }))),
          h("tbody", null, rows)));
    }

    function storageNote() {
      if (storageOk) { return null; }
      return h("p", { class: "callout callout-warn", role: "note" },
        h("strong", { text: "Point de vigilance : " }),
        "le stockage local est indisponible (navigation privée ?). Les prénoms saisis ne seront pas conservés si vous actualisez la page.");
    }

    function openQrDialog(P, url, qr) {
      var dlg = document.createElement("dialog");
      dlg.className = "qr-dialog";
      dlg.setAttribute("aria-labelledby", "qr-dlg-title");
      var closeBtn = h("button", { type: "button", class: "btn btn-primary" }, "Fermer");
      dlg.appendChild(h("h2", { id: "qr-dlg-title", text: label(P) }));
      dlg.appendChild(h("div", { class: "qr-box qr-box-large" }, window.QR.svgElement(qr, "QR code du lien de " + label(P))));
      dlg.appendChild(h("p", { class: "url-text", text: url }));
      dlg.appendChild(h("div", { class: "dialog-actions" }, closeBtn));
      document.body.appendChild(dlg);

      function closeDlg() {
        if (typeof dlg.close === "function") { dlg.close(); }
        dlg.removeAttribute("open");
        if (dlg.parentNode) { dlg.parentNode.removeChild(dlg); }
      }
      closeBtn.addEventListener("click", closeDlg);
      dlg.addEventListener("click", function (ev) { if (ev.target === dlg) { closeDlg(); } });
      dlg.addEventListener("close", function () { if (dlg.parentNode) { dlg.parentNode.removeChild(dlg); } });
      if (typeof dlg.showModal === "function") { dlg.showModal(); } else { dlg.setAttribute("open", ""); }
      closeBtn.focus();
    }

    function accessTile(P) {
      var idx = PARTICIPANTS.indexOf(P);
      var name = LM.cleanName(settings.names[idx]);
      var url = linkFor(P);
      var qr = window.QR ? window.QR.encode(url) : null;
      var inputId = "url-" + P;

      var tile = h("section", { class: "card access-tile", "aria-labelledby": "tile-title-" + P });
      tile.appendChild(h("h2", { id: "tile-title-" + P, text: "Participant " + P }));
      tile.appendChild(name
        ? h("p", { class: "access-name", text: name })
        : h("p", { class: "access-name access-name-empty", text: "Prénom non renseigné" }));

      if (qr) {
        tile.appendChild(h("div", { class: "qr-box" }, window.QR.svgElement(qr, "QR code du lien du participant " + P)));
      } else {
        tile.appendChild(h("p", { class: "callout callout-warn", role: "note" },
          h("strong", { text: "QR code indisponible : " }),
          "le lien est trop long. Raccourcissez les prénoms (Administration) ou utilisez le lien ci-dessous."));
      }

      var input = h("input", { type: "text", id: inputId, class: "url-input", readonly: true, value: url, spellcheck: "false", autocomplete: "off" });
      input.addEventListener("focus", function () { input.select(); });
      tile.appendChild(h("div", { class: "field" },
        h("label", { for: inputId, text: "Adresse du lien (à copier ou à saisir)" }), input));

      var copyBtn = h("button", { type: "button", class: "btn btn-primary" }, "Copier l’adresse");
      var copyTimer = null;
      copyBtn.addEventListener("click", function () {
        LM.copyText(url).then(function (ok) {
          if (ok) {
            toast("Adresse du participant " + P + " copiée.");
            copyBtn.textContent = "Adresse copiée";
            window.clearTimeout(copyTimer);
            copyTimer = window.setTimeout(function () { copyBtn.textContent = "Copier l’adresse"; }, 3000);
          } else {
            input.focus();
            input.select();
            toast("Copie automatique impossible : l’adresse est sélectionnée, faites Ctrl+C.");
          }
        });
      });

      var subject = "Exercice « Leviers de motivation » : votre lien personnel";
      var body = "Bonjour" + (name ? " " + name : "") + ",\n\nVoici votre lien personnel pour l’exercice. "
        + "Ouvrez-le sur votre ordinateur ou votre smartphone (et uniquement le vôtre) :\n\n" + url + "\n";
      var mail = h("a", {
        class: "btn btn-secondary",
        href: "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body)
      }, "Préparer un e-mail");

      var actions = h("div", { class: "actions" }, copyBtn);
      if (qr) {
        actions.appendChild(h("button", {
          type: "button", class: "btn btn-secondary",
          onclick: function () { openQrDialog(P, url, qr); }
        }, "Agrandir le QR code"));
      }
      actions.appendChild(mail);
      tile.appendChild(actions);
      return tile;
    }

    function pageLinks(current) {
      var links = [];
      if (current !== "home") { links.push(h("a", { class: "btn btn-secondary", href: "#accueil" }, "Retour aux liens des participants")); }
      if (current !== "admin") { links.push(h("a", { class: "btn btn-secondary", href: "#admin" }, "Administration")); }
      if (current !== "aide") { links.push(h("a", { class: "btn btn-secondary", href: "#aide" }, "Aide")); }
      return h("nav", { class: "actions", "aria-label": "Navigation de l’espace animateur" }, links);
    }

    /* ------------------------------------------------------------------
       Vue : accueil (3 tuiles)
       ------------------------------------------------------------------ */
    function viewHome() {
      var wrap = h("div", { class: "view" });
      wrap.appendChild(h("h1", { text: "Leviers de motivation : accès des participants" }));
      wrap.appendChild(h("p", { class: "muted", text: "Projetez cette page pour faire scanner les QR codes, ou envoyez à chacun son adresse par e-mail. Chaque participant utilise uniquement son propre lien, sur le même appareil pendant tout l’exercice." }));
      if (window.location.protocol === "file:" && !(settings.base || "").trim()) {
        wrap.appendChild(h("p", { class: "callout callout-warn", role: "note" },
          h("strong", { text: "Point de vigilance : " }),
          "cette page est ouverte depuis un fichier local. Ces liens ne fonctionneront pas sur les autres appareils : publiez le site (GitHub Pages) et ouvrez-le depuis son adresse, ou renseignez l’adresse du site dans l’Administration."));
      }
      append(wrap, storageNote());
      wrap.appendChild(h("div", { class: "access-grid" }, PARTICIPANTS.map(accessTile)));
      wrap.appendChild(h("section", { class: "card", "aria-labelledby": "home-rot" },
        h("h2", { id: "home-rot", text: "Rotation des rôles" }),
        rotationTable()));
      wrap.appendChild(pageLinks("home"));
      return wrap;
    }

    /* ------------------------------------------------------------------
       Vue : administration et paramétrage
       ------------------------------------------------------------------ */
    function viewAdmin() {
      var wrap = h("div", { class: "view" });
      wrap.appendChild(h("h1", { text: "Administration et paramètres" }));
      append(wrap, storageNote());

      /* Prénoms */
      var namesCard = h("section", { class: "card", "aria-labelledby": "adm-names" });
      namesCard.appendChild(h("h2", { id: "adm-names", text: "Prénoms des participants" }));
      namesCard.appendChild(h("p", { text: "Les prénoms évitent les confusions et personnalisent l’exercice (accueil, répartition des rôles de chaque manche). Ils sont facultatifs." }));
      PARTICIPANTS.forEach(function (P, i) {
        var id = "adm-name-" + P;
        namesCard.appendChild(h("div", { class: "field" },
          h("label", { for: id, text: "Prénom du participant " + P }),
          h("input", {
            type: "text", id: id, maxlength: LM.NAME_MAX, autocomplete: "off", value: settings.names[i],
            oninput: function (ev) { settings.names[i] = ev.target.value; saveSettings(); }
          })));
      });
      namesCard.appendChild(h("p", { class: "callout callout-warn", role: "note" },
        h("strong", { text: "À savoir : " }),
        "un site statique n’a pas de serveur pour retenir les prénoms. Ils sont donc intégrés dans chaque lien et chaque QR code : après une modification, renvoyez ou faites rescanner les liens. Ils apparaissent dans l’adresse, donc aussi côté hébergeur du site : utilisez un prénom d’usage ou des initiales si cela pose problème."));
      namesCard.appendChild(h("div", { class: "actions" },
        h("a", { class: "btn btn-primary", href: "#accueil" }, "Voir les liens et QR codes")));
      wrap.appendChild(namesCard);

      /* Adresse du site */
      var baseId = "adm-base";
      var baseInput = h("input", {
        type: "url", id: baseId, autocomplete: "off", spellcheck: "false",
        placeholder: detectedBase(), value: settings.base, "aria-describedby": "adm-base-help adm-base-msg"
      });
      var baseMsg = h("p", { id: "adm-base-msg", class: "small", role: "status", "aria-live": "polite" });
      function checkBase() {
        var v = (settings.base || "").trim();
        if (!v) { baseMsg.textContent = "Adresse utilisée : " + detectedBase() + " (détectée automatiquement)."; baseMsg.className = "small muted"; }
        else if (!isValidBase(v)) { baseMsg.textContent = "Adresse non valide : elle doit commencer par https:// . L’adresse détectée est utilisée à la place."; baseMsg.className = "small is-error"; }
        else { baseMsg.textContent = "Adresse utilisée : " + normalizeBase(v); baseMsg.className = "small muted"; }
      }
      baseInput.addEventListener("input", function (ev) { settings.base = ev.target.value; saveSettings(); checkBase(); });
      var baseCard = h("section", { class: "card", "aria-labelledby": "adm-base-title" },
        h("h2", { id: "adm-base-title", text: "Adresse du site" }),
        h("p", { id: "adm-base-help", text: "Par défaut, l’adresse de cette page est utilisée pour fabriquer les liens. Ne la modifiez que si vous préparez les liens depuis un autre emplacement (par exemple en testant en local) : saisissez l’adresse publique du site, par exemple https://compte.github.io/leviers-motivation/" }),
        h("div", { class: "field" }, h("label", { for: baseId, text: "Adresse publique du site (facultatif)" }), baseInput),
        baseMsg);
      checkBase();
      wrap.appendChild(baseCard);

      /* Remise à zéro */
      var resetCard = h("section", { class: "card", "aria-labelledby": "adm-reset" },
        h("h2", { id: "adm-reset", text: "Remise à zéro sur cet appareil" }),
        h("p", { text: "Utile entre deux sessions ou après un test réalisé sur cet ordinateur." }),
        h("div", { class: "actions" },
          h("button", {
            type: "button", class: "btn btn-warn",
            onclick: function () {
              LM.confirmAction("Effacer les prénoms et l’adresse du site enregistrés sur cet appareil ?", "Effacer").then(function (ok) {
                if (!ok) { return; }
                settings = { names: ["", "", ""], base: "" };
                try { window.localStorage.removeItem(SETTINGS_KEY); } catch (e) { /* ignoré */ }
                render(true);
                toast("Les paramètres ont été effacés.");
              });
            }
          }, "Effacer les paramètres"),
          h("button", {
            type: "button", class: "btn btn-warn",
            onclick: function () {
              LM.confirmAction("Effacer la progression, les observations et les synthèses des participants A, B et C enregistrées sur cet appareil ?", "Effacer").then(function (ok) {
                if (!ok) { return; }
                PARTICIPANTS.forEach(function (P) {
                  try { window.localStorage.removeItem("leviers-motivation-v1:" + P); } catch (e) { /* ignoré */ }
                });
                toast("La progression des participants a été effacée sur cet appareil.");
              });
            }
          }, "Effacer la progression des participants")));
      wrap.appendChild(resetCard);

      wrap.appendChild(pageLinks("admin"));
      return wrap;
    }

    /* ------------------------------------------------------------------
       Vue : aide
       ------------------------------------------------------------------ */
    function helpCard(id, title) {
      var card = h("section", { class: "card", "aria-labelledby": id }, h("h2", { id: id, text: title }));
      for (var i = 2; i < arguments.length; i++) { append(card, arguments[i]); }
      return card;
    }

    function viewHelp() {
      var wrap = h("div", { class: "view" });
      wrap.appendChild(h("h1", { text: "Aide pour l’animateur" }));

      wrap.appendChild(helpCard("aide-avant", "Avant la séance",
        h("ol", null,
          h("li", null, "Ouvrez le site depuis son adresse publique (GitHub Pages) : l’accueil affiche alors les liens corrects."),
          h("li", null, "Facultatif : saisissez les prénoms dans l’Administration (roue crantée en haut à gauche)."),
          h("li", null, "Projetez l’accueil pour faire scanner les QR codes (bouton « Agrandir le QR code » pour une projection à distance), ou cliquez sur « Copier l’adresse » / « Préparer un e-mail » pour chaque participant."),
          h("li", null, "Chacun garde le même appareil et le même lien pendant tout l’exercice : la progression est enregistrée sur l’appareil."))));

      wrap.appendChild(helpCard("aide-rythme", "Déroulé d’une manche",
        h("p", { text: D.rythme.map(function (r) { return r.label.toLowerCase() + " " + r.minutes + " min"; }).join(", ") + ". Les trois manches et la synthèse représentent environ 50 minutes." }),
        h("ul", null,
          h("li", { text: "Annoncez chaque étape à voix haute : les appareils ne sont pas synchronisés." }),
          h("li", { text: "À la fin de la simulation, chacun touche « Passer au débriefing » sur son appareil." }),
          h("li", { text: "En cas de faux clic, les boutons « Revenir… » ramènent à l’étape précédente sans rien perdre." })),
        rotationTable()));

      wrap.appendChild(helpCard("aide-obs", "Le rôle d’observateur",
        h("ul", null,
          h("li", { text: "Les 13 critères sont regroupés en 4 thèmes. Touchez + à chaque fois que le comportement est observé, − pour corriger." }),
          h("li", { text: "La jauge se remplit au fil des observations (1 fois : observé, 2 fois ou plus : comportement renforcé)." }),
          h("li", { text: "Rien n’oblige à renseigner tous les critères : quand on découvre le référentiel, mieux vaut noter peu et juste." }),
          h("li", { text: "Les trois champs de texte servent au débriefing : question la plus efficace, interprétation prématurée, suggestion pour le rejeu." }))));

      wrap.appendChild(helpCard("aide-depannage", "Dépannage",
        h("ul", null,
          h("li", null, h("strong", { text: "« Lien invalide » : " }), "le lien doit contenir ?p=A, ?p=B ou ?p=C. Renvoyez le lien depuis l’accueil."),
          h("li", null, h("strong", { text: "Le QR code ouvre une page introuvable : " }), "vérifiez l’adresse du site dans l’Administration ; les liens doivent pointer vers le site publié."),
          h("li", null, h("strong", { text: "Un participant a perdu sa progression : " }), "elle est liée à l’appareil et au navigateur. Il peut reprendre à la bonne manche grâce aux boutons de navigation."),
          h("li", null, h("strong", { text: "La copie ne fonctionne pas : " }), "l’adresse est sélectionnée automatiquement, faites Ctrl+C (ou appui long sur smartphone)."),
          h("li", null, h("strong", { text: "Prénom modifié : " }), "le lien change. Renvoyez-le ou rescannez-le ; la progression déjà enregistrée est conservée."))));

      wrap.appendChild(helpCard("aide-limites", "Confidentialité et limites",
        h("ul", null,
          h("li", { text: "Le cloisonnement des rôles est pédagogique, pas informatique : un site statique ne peut pas empêcher quelqu’un d’ouvrir le code source ou de modifier l’adresse." }),
          h("li", { text: "Aucune donnée n’est envoyée à un serveur applicatif. Les prénoms figurent dans l’adresse des liens, donc dans les journaux de l’hébergeur du site." }),
          h("li", { text: "Les scénarios sont fictifs. Dans la fiche de transfert, n’utilisez que des initiales ou un pseudonyme." }))));

      var notes = h("details", { class: "card notes" },
        h("summary", { text: "Notes de l’animateur : objectifs des situations (révèle les leviers)" }),
        h("p", { class: "callout callout-warn", role: "note" },
          h("strong", { text: "Ne pas projeter : " }), "ces informations révèlent le levier de chaque situation."),
        h("ul", null, D.scenarios.map(function (sc, i) {
          return h("li", null, h("strong", { text: "Manche " + (i + 1) + " (" + sc.notesAnimateur.titreOriginal + ") : " }), sc.notesAnimateur.objectif);
        })));
      wrap.appendChild(notes);

      wrap.appendChild(pageLinks("aide"));
      return wrap;
    }

    /* ------------------------------------------------------------------
       Routage par hash : #accueil (défaut), #admin, #aide
       ------------------------------------------------------------------ */
    function currentRoute() {
      var hsh = window.location.hash.replace(/^#/, "");
      return hsh === "admin" || hsh === "aide" ? hsh : "home";
    }

    var TITLES = { home: "Accès des participants", admin: "Administration", aide: "Aide" };

    function render(moveFocus) {
      var r = currentRoute();
      var view = r === "admin" ? viewAdmin() : (r === "aide" ? viewHelp() : viewHome());
      root.textContent = "";
      root.appendChild(view);
      document.title = "Leviers de motivation - " + TITLES[r];
      if (gear) {
        if (r === "admin") { gear.setAttribute("aria-current", "page"); } else { gear.removeAttribute("aria-current"); }
      }
      if (moveFocus) {
        var title = root.querySelector("h1");
        if (title) { title.setAttribute("tabindex", "-1"); title.focus(); }
        try { window.scrollTo(0, 0); } catch (e) { /* sans importance */ }
      }
    }

    window.addEventListener("hashchange", function () { render(true); });
    render(false);
  }
})();
