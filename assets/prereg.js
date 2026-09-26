(function () {
  var CFG = window.PREREG_CONFIG || {};
  var PHONE = CFG.PHONE || "1833-3872";
  var TEL = "tel:" + String(PHONE).replace(/\D/g, "");

  try {
    if (!sessionStorage.getItem("prereg_first_visit_at")) {
      sessionStorage.setItem("prereg_first_visit_at", new Date().toISOString());
    }
    var params = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (key) {
      var value = params.get(key);
      if (value && !sessionStorage.getItem(key)) sessionStorage.setItem(key, value);
    });
  } catch (err) {}

  function stored(key) {
    try { return sessionStorage.getItem(key) || ""; } catch (err) { return ""; }
  }

  function fillSido(select) {
    if (!select || select.dataset.filled) return;
    var list = CFG.SIDO_LIST || [];
    var first = document.createElement("option");
    first.value = "";
    first.textContent = "선택";
    select.appendChild(first);
    list.forEach(function (name) {
      var option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
    select.dataset.filled = "1";
  }

  var form = document.getElementById("prereg-form");
  if (form) {
    fillSido(form.querySelector("[name=addr_sido]"));
    var phone = form.querySelector("[name=phone]");
    var birth = form.querySelector("[name=birth6]");
    var birthWarn = document.getElementById("prereg-birth-warn");
    var step2 = document.getElementById("prereg-step2");
    var done = document.getElementById("prereg-done");
    var alertBox = document.getElementById("prereg-alert");
    var receiptNo = "";
    var createdAt = "";
    var phoneValue = "";

    function hyphen(value) {
      var digits = value.replace(/\D/g, "").slice(0, 11);
      if (digits.length < 4) return digits;
      if (digits.length < 8) return digits.slice(0, 3) + "-" + digits.slice(3);
      return digits.slice(0, 3) + "-" + digits.slice(3, 7) + "-" + digits.slice(7);
    }
    if (phone) phone.addEventListener("input", function () { phone.value = hyphen(phone.value); });

    function showBirthWarn(on) {
      if (!birthWarn) return;
      birthWarn.hidden = !on;
    }
    if (birth) {
      birth.addEventListener("input", function () {
        var raw = birth.value;
        var digits = raw.replace(/\D/g, "");
        if (digits.length >= 7) {
          birth.value = "";
          showBirthWarn(true);
          return;
        }
        showBirthWarn(false);
        birth.value = digits.slice(0, 6);
      });
    }

    document.querySelectorAll("[data-prereg-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = document.getElementById(button.getAttribute("data-prereg-toggle"));
        if (!panel) return;
        panel.hidden = !panel.hidden;
      });
    });

    function mark(name, on) {
      var field = form.querySelector("[name=" + name + "]");
      if (!field) return;
      var wrap = field.closest(".field") || field.closest(".prereg-agree");
      if (wrap) wrap.classList.toggle("err", on);
    }

    function say(message) {
      if (!alertBox) return;
      alertBox.hidden = !message;
      alertBox.textContent = message || "";
    }

    function validDate(value) {
      if (!/^\d{6}$/.test(value)) return false;
      var month = Number(value.slice(2, 4));
      var day = Number(value.slice(4, 6));
      return month >= 1 && month <= 12 && day >= 1 && day <= 31;
    }

    function payloadBase() {
      return {
        consent_version: CFG.CONSENT_VERSION || "2026-09-26-v1",
        site: location.hostname,
        page: location.pathname,
        utm_source: stored("utm_source"),
        utm_medium: stored("utm_medium"),
        utm_campaign: stored("utm_campaign"),
        utm_content: stored("utm_content"),
        utm_term: stored("utm_term"),
        referrer: document.referrer || "",
        first_visit_at: stored("prereg_first_visit_at")
      };
    }

    function post(body, button) {
      if (!CFG.ENDPOINT) {
        say("접수 준비 중입니다. 대표번호 " + PHONE + "로 문의해 주세요.");
        return Promise.resolve(null);
      }
      var label = button.textContent;
      button.disabled = true;
      button.textContent = "접수 중…";
      var timer = new AbortController();
      var timeout = setTimeout(function () { timer.abort(); }, 20000);
      return fetch(CFG.ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: timer.signal
      }).then(function (response) {
        return response.json().catch(function () { return {}; });
      }).then(function (data) {
        if (!data || data.ok !== true) {
          say("접수를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도하시거나 " + PHONE + "로 문의해 주세요.");
          return null;
        }
        say("");
        return data;
      }).catch(function () {
        say("접수를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도하시거나 " + PHONE + "로 문의해 주세요.");
        return null;
      }).finally(function () {
        clearTimeout(timeout);
        button.disabled = false;
        button.textContent = label;
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var honeypot = form.querySelector("[name=hp]");
      if (honeypot && honeypot.value) return;
      var step = step2 && !step2.hidden ? 2 : 1;
      if (step === 1) {
        var name = (form.querySelector("[name=name]").value || "").trim();
        var digits = (phone.value || "").replace(/\D/g, "");
        var agree = form.querySelector("[name=consent_collect]").checked;
        mark("name", name.length < 2 || name.length > 20);
        mark("phone", !(digits.startsWith("010") && digits.length === 11));
        var agreeWrap = form.querySelector("[name=consent_collect]").closest(".prereg-agree");
        if (agreeWrap) agreeWrap.classList.toggle("err", !agree);
        if (name.length < 2 || name.length > 20 || !(digits.startsWith("010") && digits.length === 11) || !agree) return;
        var visit = form.querySelector("[name=visit_request]");
        post(Object.assign(payloadBase(), {
          step: 1,
          name: name,
          phone: hyphen(digits),
          consent_collect: true,
          consent_marketing: !!form.querySelector("[name=consent_marketing]").checked,
          visit_request: !!(visit && visit.checked),
          hp: ""
        }), form.querySelector("[data-prereg-step1]")).then(function (data) {
          if (!data) return;
          receiptNo = data.receipt_no || "";
          createdAt = data.created_at || "";
          phoneValue = hyphen(digits);
          document.getElementById("prereg-receipt").textContent = receiptNo;
          var receipt2 = document.getElementById("prereg-receipt-2");
          if (receipt2) receipt2.textContent = receiptNo;
          document.getElementById("prereg-time").textContent = createdAt;
          document.getElementById("prereg-step1-note").hidden = false;
          form.classList.add("is-step2");
          ["name", "phone", "consent_collect", "consent_marketing"].forEach(function (key) {
            var field = form.querySelector("[name=" + key + "]");
            if (field) field.disabled = true;
          });
          form.querySelector("[data-prereg-step1]").hidden = true;
          step2.hidden = false;
          step2.querySelector("input, select, button").focus();
        });
        return;
      }
      var birthValue = birth.value;
      var sido = form.querySelector("[name=addr_sido]").value;
      var sigungu = (form.querySelector("[name=addr_sigungu]").value || "").trim();
      var dong = (form.querySelector("[name=addr_dong]").value || "").trim();
      mark("birth6", !validDate(birthValue));
      mark("addr_sido", !sido);
      mark("addr_sigungu", sigungu.length < 2 || sigungu.length > 20);
      mark("addr_dong", dong.length < 2 || dong.length > 20);
      if (!validDate(birthValue) || !sido || sigungu.length < 2 || sigungu.length > 20 || dong.length < 2 || dong.length > 20) {
        say("접수를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도하시거나 " + PHONE + "로 문의해 주세요.");
        return;
      }
      var interest = form.querySelector("[name=interest_type]:checked");
      var special = form.querySelector("[name=special_supply]:checked");
      var mgm = form.querySelector("[name=consent_mgm]");
      post({
        step: 2,
        receipt_no: receiptNo,
        phone: phoneValue,
        birth6: birthValue,
        addr_sido: sido,
        addr_sigungu: sigungu,
        addr_dong: dong,
        interest_type: interest ? interest.value : "",
        special_supply: special ? special.value : "",
        consent_mgm: !!(mgm && mgm.checked),
        consent_version: CFG.CONSENT_VERSION || "2026-09-26-v1"
      }, form.querySelector("[data-prereg-step2]")).then(function (data) {
        if (!data) {
          var keep = document.getElementById("prereg-step2-keep");
          if (keep) keep.hidden = false;
          return;
        }
        document.getElementById("prereg-done-no").textContent = data.receipt_no || receiptNo;
        document.getElementById("prereg-done-time").textContent = createdAt;
        form.hidden = true;
        done.hidden = false;
        done.focus();
      });
    });
  }

  var path = location.pathname.replace(/\.html$/, "");
  if (path === "/register" || path === "/privacy") return;
  try {
    if (sessionStorage.getItem("prereg_popup_seen") === "1") return;
    var until = localStorage.getItem("prereg_hide_until");
    if (until && Date.now() < Number(until)) return;
  } catch (err) {}

  window.setTimeout(function () {
    var last = document.activeElement;
    var root = document.createElement("div");
    root.className = "prereg-pop";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "prereg-pop-title");
    var promo = CFG.PROMO_ON === true;
    root.innerHTML =
      '<div class="prereg-pop__bg" data-close="1"></div>' +
      '<div class="prereg-pop__panel">' +
      '<button type="button" class="prereg-pop__x" data-close="1" aria-label="닫기">✕</button>' +
      '<p class="prereg-pop__badge">10월 OPEN 예정</p>' +
      '<p class="prereg-pop__kicker">청라 아크원 푸르지오 APT</p>' +
      '<h2 id="prereg-pop-title">사전고객등록</h2>' +
      (promo
        ? '<p>사전고객등록 고객 중<br>청약 당첨 및 MGM 인정조건 충족 시<br><strong class="prereg-pop__money">백화점 상품권 30만원 증정</strong><br>롯데 · 현대 · 신세계 중 선택</p>'
        : '<p>청약 일정과 모집공고 소식을<br>등록하신 순서대로 안내해 드립니다.</p>') +
      '<a class="btn btn--gold" href="/register">사전고객등록하기</a>' +
      '<a class="prereg-pop__sub" href="' + TEL + '">등록 확인 문의 ' + PHONE + '</a>' +
      '<p class="prereg-pop__fine">※ 사전고객등록은 공식 청약 신청이 아닙니다.<br>공식 청약은 입주자모집공고에 따른 별도 절차로 진행됩니다.</p>' +
      (promo ? '<p class="prereg-pop__fine">※ 상품권은 청약 당첨 및 MGM 인정 등 지급조건을 모두 충족한 고객에 한해 지급됩니다.<br>세부 조건은 <button type="button" class="prereg-link" id="prereg-terms-open">이벤트 유의사항</button>을 확인해 주세요.</p><div id="prereg-terms" hidden></div>' : '') +
      '<div class="prereg-pop__actions"><button type="button" data-today="1">오늘 하루 보지 않기</button><button type="button" data-close="1">닫기</button></div>' +
      '</div>';
    document.body.appendChild(root);
    document.body.classList.add("prereg-lock");
    requestAnimationFrame(function () { root.classList.add("is-in"); });
    try { sessionStorage.setItem("prereg_popup_seen", "1"); } catch (err) {}
    var panel = root.querySelector(".prereg-pop__panel");
    var focusable = function () {
      return Array.prototype.slice.call(panel.querySelectorAll("a, button")).filter(function (el) { return !el.disabled; });
    };
    var first = root.querySelector(".prereg-pop__x");
    first.focus();
    function close() {
      document.body.classList.remove("prereg-lock");
      root.remove();
      if (last && last.focus) last.focus();
    }
    root.addEventListener("click", function (event) {
      if (event.target.getAttribute("data-close")) close();
      if (event.target.getAttribute("data-today")) {
        try {
          var end = new Date();
          end.setHours(23, 59, 59, 999);
          localStorage.setItem("prereg_hide_until", String(end.getTime()));
        } catch (err) {}
        close();
      }
    });
    document.addEventListener("keydown", function onKey(event) {
      if (!document.body.contains(root)) {
        document.removeEventListener("keydown", onKey);
        return;
      }
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab") return;
      var items = focusable();
      if (!items.length) return;
      var index = items.indexOf(document.activeElement);
      if (event.shiftKey && (index <= 0)) { event.preventDefault(); items[items.length - 1].focus(); }
      else if (!event.shiftKey && index === items.length - 1) { event.preventDefault(); items[0].focus(); }
    });
  }, 1500);
})();
