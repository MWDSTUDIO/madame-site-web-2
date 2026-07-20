/* enquiry-form.js — the shared enquiry component.
   ONE component, injected wherever <div data-enquiry-form></div> appears
   (/inquire/ and the closing section of home). Never duplicate the markup.
   Five steps, one visible at a time; hairline progress bar (20% per step);
   per-step validation with discreet inline messages; POST to the Formspree
   endpoint held in assets/js/config.js. */
(function () {
  "use strict";
  var mounts = document.querySelectorAll("[data-enquiry-form]");
  if (!mounts.length) return;
  var CONFIG = (window.MWD && window.MWD.CONFIG) || {};

  var TEMPLATE =
    '<div class="form">' +
    '<div class="progress" aria-hidden="true"><div class="bar"></div></div>' +
    '<form novalidate>' +

    '<fieldset class="step active" data-step="1"><legend class="sk">I — You</legend>' +
    '<div class="field"><label for="{id}-name">Full name(s)</label><input id="{id}-name" name="name" type="text" autocomplete="name" placeholder="Both partners, if you wish"><p class="err" data-err aria-live="polite"></p></div>' +
    '<div class="field"><label for="{id}-email">Email</label><input id="{id}-email" name="email" type="email" autocomplete="email" placeholder="you@email.com"><p class="err" data-err aria-live="polite"></p></div>' +
    '<div class="field"><label for="{id}-phone">Phone / WhatsApp</label><input id="{id}-phone" name="phone" type="tel" autocomplete="tel" placeholder="+1 &hellip;"><p class="err" data-err aria-live="polite"></p></div>' +
    '<div class="field"><span class="glabel" id="{id}-found-l">How did you find us?</span>' +
    '<div class="choices" role="group" aria-labelledby="{id}-found-l" data-name="found" data-single>' +
    chips(["Instagram", "Referral", "Press", "Google / AI search", "Other"]) +
    "</div></div></fieldset>" +

    '<fieldset class="step" data-step="2"><legend class="sk">II — The Celebration</legend>' +
    '<div class="field"><label for="{id}-date">Date or timeframe</label><input id="{id}-date" name="date" type="text" placeholder="A date, a season, or still deciding"></div>' +
    '<div class="field"><label for="{id}-dest">Destination or location</label><input id="{id}-dest" name="destination" type="text" placeholder="City, country — or open to recommendations"></div>' +
    '<div class="field"><span class="glabel" id="{id}-guests-l">Estimated guests</span>' +
    '<div class="choices" role="group" aria-labelledby="{id}-guests-l" data-name="guests" data-single>' +
    chips(["Up to 50", "50–120", "120–250", "250+"]) +
    "</div></div>" +
    '<div class="field"><span class="glabel" id="{id}-type-l">Type of celebration</span>' +
    '<div class="choices" role="group" aria-labelledby="{id}-type-l" data-name="type" data-single>' +
    chips(["Wedding", "Multi-day celebration", "Destination wedding", "Private event"]) +
    "</div></div></fieldset>" +

    '<fieldset class="step" data-step="3"><legend class="sk">III — The Vision</legend>' +
    '<div class="field"><label for="{id}-vision">What kind of experience are you dreaming of?</label><textarea id="{id}-vision" name="vision" placeholder="Tell us, in your own words&hellip;"></textarea></div>' +
    '<div class="field"><span class="glabel" id="{id}-svc-l">Which services do you need?</span>' +
    '<div class="choices" role="group" aria-labelledby="{id}-svc-l" data-name="services">' +
    chips(["Full Wedding Planning & Production", "Creative Direction", "Destination & Logistics"]) +
    "</div></div></fieldset>" +

    '<fieldset class="step" data-step="4"><legend class="sk">IV — Investment</legend>' +
    '<div class="field"><span class="glabel" id="{id}-inv-l">To serve you fully, we design celebrations from a certain scale of investment. Please select your range.</span>' +
    '<div class="tiers" role="group" aria-labelledby="{id}-inv-l" data-name="investment">' +
    tiers(["$100,000 – $250,000", "$250,000 – $500,000", "$500,000 – $1,000,000", "$1,000,000 +", "Prefer to discuss privately"]) +
    '</div><p class="err" data-err aria-live="polite"></p></div></fieldset>' +

    '<fieldset class="step" data-step="5"><legend class="sk">V — A last word</legend>' +
    '<div class="field"><label for="{id}-last">Anything else we should know?</label><textarea id="{id}-last" name="lastword" placeholder="Optional"></textarea></div>' +
    '<div class="field"><label class="gdpr"><input type="checkbox" name="consent" value="yes"> I agree to be contacted by Madame Wedding Design regarding my enquiry.</label>' +
    '<label class="gdpr"><input type="checkbox" name="journal" value="yes"> Receive our journal.</label><p class="err" data-err aria-live="polite"></p></div></fieldset>' +

    '<div class="fnav"><button type="button" class="btn ghost" data-back style="visibility:hidden">Back</button>' +
    '<button type="button" class="btn" data-next>Continue</button></div>' +
    '<p class="err" data-submit-err aria-live="polite" style="text-align:center;margin-top:26px;"></p>' +
    "</form>" +
    '<div class="confirm" role="status"><p class="h">Thank you.</p><p>Your celebration has our full attention. Estelle will write to you, personally.</p></div>' +
    "</div>";

  function chips(labels) {
    return labels.map(function (l) {
      return '<button type="button" class="choice" aria-pressed="false" data-value="' + esc(l) + '">' + esc(l) + "</button>";
    }).join("");
  }
  function tiers(labels) {
    return labels.map(function (l) {
      return '<button type="button" class="tier" aria-pressed="false" data-value="' + esc(l) + '">' + esc(l) + ' <span class="mk">Selected</span></button>';
    }).join("");
  }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  mounts.forEach(function (mount, idx) {
    var uid = "enq" + idx;
    mount.innerHTML = TEMPLATE.split("{id}").join(uid);
    init(mount);
  });

  function init(root) {
    var form = root.querySelector("form");
    var steps = root.querySelectorAll(".step");
    var bar = root.querySelector(".bar");
    var back = root.querySelector("[data-back]");
    var next = root.querySelector("[data-next]");
    var submitErr = root.querySelector("[data-submit-err]");
    var total = steps.length, step = 1;

    /* Chips: single- or multi-select groups. */
    root.querySelectorAll(".choices,.tiers").forEach(function (group) {
      group.addEventListener("click", function (e) {
        var b = e.target.closest("[data-value]");
        if (!b) return;
        if (group.hasAttribute("data-single") || group.classList.contains("tiers")) {
          group.querySelectorAll("[data-value]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
        } else {
          b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
        }
        clearErr(group.closest(".field"));
      });
    });

    function groupValues(name) {
      var g = root.querySelector('[data-name="' + name + '"]');
      if (!g) return [];
      return Array.prototype.map.call(g.querySelectorAll('[aria-pressed="true"]'), function (b) { return b.getAttribute("data-value"); });
    }
    function showErr(field, msg) {
      if (!field) return;
      field.classList.add("invalid");
      var e = field.querySelector("[data-err]");
      if (e) { e.textContent = msg; e.classList.add("show"); }
    }
    function clearErr(field) {
      if (!field) return;
      field.classList.remove("invalid");
      var e = field.querySelector("[data-err]");
      if (e) { e.textContent = ""; e.classList.remove("show"); }
    }
    root.querySelectorAll("input,textarea").forEach(function (el) {
      el.addEventListener("input", function () { clearErr(el.closest(".field")); });
    });

    function validate(n) {
      var ok = true;
      var panel = root.querySelector('.step[data-step="' + n + '"]');
      panel.querySelectorAll(".field").forEach(clearErr);
      if (n === 1) {
        var name = form.name.value.trim(), email = form.email.value.trim();
        if (!name) { showErr(form.name.closest(".field"), "May we have your name?"); ok = false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr(form.email.closest(".field"), "A valid email lets us reply to you."); ok = false; }
      }
      if (n === 4 && !groupValues("investment").length) {
        showErr(panel.querySelector(".field"), "Please select a range — or choose to discuss privately.");
        ok = false;
      }
      if (n === 5 && !form.consent.checked) {
        showErr(form.consent.closest(".field"), "Your consent is required so that we may reply.");
        ok = false;
      }
      return ok;
    }

    function render() {
      steps.forEach(function (s) { s.classList.toggle("active", +s.dataset.step === step); });
      bar.style.transform = "scaleX(" + (step / total) + ")";
      back.style.visibility = step === 1 ? "hidden" : "visible";
      next.textContent = step === total ? "Send enquiry" : "Continue";
      var focusable = root.querySelector(".step.active input, .step.active textarea, .step.active [data-value]");
      if (focusable) focusable.focus({ preventScroll: true });
    }

    next.addEventListener("click", function () {
      if (!validate(step)) return;
      if (step < total) {
        step++; render();
        root.closest("section, main").scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        send();
      }
    });
    back.addEventListener("click", function () { if (step > 1) { step--; render(); } });

    function payload() {
      return {
        "form-name": CONFIG.FORM_NAME || "enquiry",
        "bot-field": "",
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        found: groupValues("found").join(", "),
        date: form.date.value.trim(),
        destination: form.destination.value.trim(),
        guests: groupValues("guests").join(", "),
        type: groupValues("type").join(", "),
        vision: form.vision.value.trim(),
        services: groupValues("services").join(", "),
        investment: groupValues("investment").join(", "),
        lastword: form.lastword.value.trim(),
        consent: form.consent.checked ? "yes" : "no",
        journal: form.journal.checked ? "yes" : "no"
      };
    }

    function send() {
      next.disabled = true;
      next.textContent = "Sending…";
      submitErr.classList.remove("show");
      var data = payload();

      /* Parallel lane — Netlify Forms: silent until detection is enabled in
         the Netlify UI, then the dashboard table fills up too. Fire and forget. */
      var urlencoded = Object.entries(data).map(function (kv) {
        return encodeURIComponent(kv[0]) + "=" + encodeURIComponent(kv[1]);
      }).join("&");
      fetch("/inquire/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: urlencoded
      }).catch(function () {});

      /* Primary lane — FormSubmit: the table email straight to the inbox. */
      var fs = Object.assign({}, data, {
        _subject: "New enquiry — " + (data.name || "unnamed") + (data.destination ? " · " + data.destination : "") + " | Madame Wedding Design",
        _template: "table"
      });
      delete fs["form-name"]; delete fs["bot-field"];
      fetch(CONFIG.FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(fs)
      }).then(function (r) {
        if (!r.ok) throw new Error("send failed");
        /* Leave the name for the thank-you letter ("Dear …"). */
        try { sessionStorage.setItem("mwd-enquiry-name", form.name.value.trim()); } catch (e) {}
        window.location.href = CONFIG.THANK_YOU_URL || "/inquire/thank-you/";
      }).catch(function () {
        next.disabled = false;
        next.textContent = "Send enquiry";
        submitErr.textContent = "Something interrupted the sending. Nothing was lost — please try once more, or write to " + (CONFIG.CONTACT_EMAIL || "hello@madamewedding.design") + ".";
        submitErr.classList.add("show");
      });
    }

    render();
  }
})();
