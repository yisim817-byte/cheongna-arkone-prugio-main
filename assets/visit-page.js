/* 모델하우스 방문예약 전용 페이지 /visit (작업지시서 13, 2026-10-22)
   - 날짜는 arkone-visit-config 가 주는 목록만. 설정이 꺼졌거나 불러오지 못하면 날짜·시간대를 숨기고 이름·휴대폰만으로 접수(visit_date 비움).
   - 접수는 arkone-visit-submit(사전고객등록과 별도 표). 고객 문자는 보내지 않는다. */
(function () {
  "use strict";
  var CONFIG_URL = "https://jzmktahlrwtrtejjflrw.supabase.co/functions/v1/arkone-visit-config";
  var SUBMIT_URL = "https://jzmktahlrwtrtejjflrw.supabase.co/functions/v1/arkone-visit-submit";
  var CONSENT_VERSION = "visit-2026-10-22-v1";
  var form = document.getElementById("visit-form");
  if (!form) return;
  var alertBox = document.getElementById("visit-alert");
  var pick = form.querySelector("[data-visit-pick]");
  var off = form.querySelector("[data-visit-off]");
  var dateSel = form.querySelector("[name=visit_date]");
  var phone = form.querySelector("[name=phone]");
  var ready = false;

  try {
    var params = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign"].forEach(function (k) {
      var v = params.get(k); if (v && !sessionStorage.getItem(k)) sessionStorage.setItem(k, v);
    });
  } catch (e) {}
  function stored(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function say(msg) { alertBox.textContent = msg; alertBox.hidden = !msg; }
  function mark(el, bad) { var f = el.closest(".visit-field"); if (f) f.classList.toggle("err", bad); }

  phone.addEventListener("input", function () {
    var d = phone.value.replace(/\D/g, "").slice(0, 11);
    phone.value = d.length > 7 ? d.slice(0, 3) + "-" + d.slice(3, 7) + "-" + d.slice(7) : d.length > 3 ? d.slice(0, 3) + "-" + d.slice(3) : d;
  });
  form.querySelector(".visit-toggle").addEventListener("click", function () {
    var box = document.getElementById("visit-consent");
    box.hidden = !box.hidden; this.setAttribute("aria-expanded", String(!box.hidden));
  });

  function setOff() {
    ready = false;
    pick.hidden = true; off.hidden = false;
    dateSel.required = false; dateSel.value = "";
  }
  if (!window.__arkoneVisitCfg) {
    window.__arkoneVisitCfg = fetch(CONFIG_URL, { method: "GET", credentials: "omit" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { return d && d.enabled === true && Array.isArray(d.dates) && d.dates.length ? d : null; })
      .catch(function () { return null; });
  }
  window.__arkoneVisitCfg.then(function (cfg) {
    if (!cfg) { setOff(); return; }
    cfg.dates.forEach(function (item) {
      var o = document.createElement("option"); o.value = item.value; o.textContent = item.label; dateSel.appendChild(o);
    });
    ready = true;
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var hp = form.querySelector("[name=hp]");
    if (hp && hp.value) return;
    var name = (form.querySelector("[name=name]").value || "").trim();
    var digits = phone.value.replace(/\D/g, "");
    var agree = form.querySelector("[name=consent_privacy]").checked;
    var date = ready ? dateSel.value : "";
    var badName = name.length < 2 || name.length > 20;
    var badPhone = !(digits.indexOf("010") === 0 && digits.length === 11);
    var badDate = ready && !date;
    mark(form.querySelector("[name=name]"), badName);
    mark(phone, badPhone);
    mark(dateSel, badDate);
    form.querySelector(".visit-agree").classList.toggle("err", !agree);
    var missing = [];
    if (badName) missing.push("이름");
    if (badPhone) missing.push("휴대폰번호");
    if (badDate) missing.push("방문 희망일");
    if (!agree) missing.push("개인정보 동의");
    if (missing.length) { say("입력 내용을 확인해 주세요. " + missing.join(", ") + " 항목을 확인해 주세요."); return; }
    var slotEl = form.querySelector("[name=visit_slot]:checked");
    var interestEl = form.querySelector("[name=interest]:checked");
    var button = form.querySelector("[data-visit-submit]");
    var label = button.textContent;
    button.disabled = true; button.textContent = "접수 중…"; say("");
    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
    fetch(SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        phone: digits.slice(0, 3) + "-" + digits.slice(3, 7) + "-" + digits.slice(7),
        visit_date: date,
        visit_slot: ready && slotEl ? slotEl.value : "ANY",
        interest: interestEl ? interestEl.value : "",
        consent_privacy: true,
        consent_version: CONSENT_VERSION,
        page: location.pathname,
        utm_source: stored("utm_source"),
        utm_medium: stored("utm_medium"),
        utm_campaign: stored("utm_campaign"),
        hp: ""
      }),
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) { return r.json().catch(function () { return null; }); })
      .then(function (d) {
        if (!d || d.ok !== true) {
          say("접수를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도하시거나 1833-3872로 문의해 주세요.");
          return;
        }
        var when = [];
        if (d.visit_date && d.date_label) when.push(d.date_label);
        if (d.visit_date && d.slot_label) when.push(d.slot_label);
        document.getElementById("visit-done-when").textContent = when.length ? when.join(" ") + " · " : "";
        document.getElementById("visit-done-no").textContent = d.receipt_no || "";
        form.hidden = true;
        var done = document.getElementById("visit-done");
        done.hidden = false; done.focus();
      })
      .catch(function () { say("접수를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도하시거나 1833-3872로 문의해 주세요."); })
      .finally(function () { clearTimeout(timer); button.disabled = false; button.textContent = label; });
  });
})();
