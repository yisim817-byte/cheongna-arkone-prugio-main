(function () {
  var CFG = window.PREREG_CONFIG || {};
  var PHONE = CFG.PHONE || "1833-3872";
  var TEL = "tel:" + String(PHONE).replace(/\D/g, "");

  function promoTerms() { return CFG.PROMO_TERMS || {}; }
  function promoReady() {
    var terms = promoTerms();
    return CFG.PROMO_ON === true && !!(terms.basis && terms.payout_time && terms.refund && terms.tax);
  }
  function formatKst(value) {
    var date = new Date(value);
    if (!value || isNaN(date.getTime())) return value || "";
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(date);
    function pick(type) {
      var found = parts.filter(function (part) { return part.type === type; })[0];
      return found ? found.value : "";
    }
    return pick("year") + "." + pick("month") + "." + pick("day") + " " + pick("hour") + ":" + pick("minute");
  }
  function termsMarkup() {
    var terms = promoTerms();
    return '<div class="prereg-terms" hidden><p><b>청라 아크원 푸르지오 APT 사전고객등록 이벤트 유의사항</b></p><ol>' +
      '<li>대상 : 본 홈페이지에서 사전고객등록을 완료하고 개인정보 제3자 제공(MGM 등록)에 동의한 고객 중, 청라 아크원 푸르지오 아파트 청약에 당첨되어 ' + terms.basis + ' 및 MGM 인정조건을 충족한 고객</li>' +
      '<li>혜택 : 백화점 상품권 30만원 (롯데·현대·신세계 중 1종 선택)</li>' +
      '<li>지급 시기 : ' + terms.payout_time + '</li>' +
      '<li>1인(동일인·동일 휴대전화번호) 1회 지급</li>' +
      '<li>부적격 당첨, 계약 미체결·취소·해제 시 지급 대상에서 제외되며, 지급 후 해당 사유 발생 시 ' + terms.refund + '</li>' +
      '<li>다른 경로로 먼저 MGM 등록된 고객은 MGM 운영 기준에 따라 대상에서 제외될 수 있습니다.</li>' +
      '<li>제세공과금 : ' + terms.tax + '</li>' +
      '<li>본 이벤트는 홈페이지운영 휴메인코리아가 진행하며, 시행·시공사가 제공하는 혜택이 아닙니다.</li>' +
      '<li>이벤트 내용은 사전 공지 후 변경 또는 조기 종료될 수 있습니다.</li>' +
      '<li>사전고객등록은 공식 청약 신청이 아니며, 청약 자격과 일정은 입주자모집공고를 따릅니다.</li>' +
      '</ol><p>등록 확인 및 문의 ' + PHONE + '</p></div>';
  }
  function termsButton() {
    return '<button type="button" class="prereg-link" data-prereg-terms>이벤트 유의사항</button>' + termsMarkup();
  }

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

  function linkConfirm(root) {
    (root || document).querySelectorAll(".prereg-confirm").forEach(function (el) {
      if (el.querySelector("a")) return;
      var text = el.textContent;
      var at = text.indexOf("1833-3872");
      if (at < 0) return;
      el.textContent = "";
      el.appendChild(document.createTextNode(text.slice(0, at)));
      var link = document.createElement("a");
      link.href = "tel:18333872";
      link.textContent = "1833-3872";
      el.appendChild(link);
      el.appendChild(document.createTextNode(text.slice(at + 9)));
    });
  }
  linkConfirm(document);

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

  document.addEventListener("click", function (event) {
    var toggle = event.target.closest && event.target.closest("[data-prereg-toggle]");
    if (toggle) {
      var panel = document.getElementById(toggle.getAttribute("data-prereg-toggle"));
      if (panel) panel.hidden = !panel.hidden;
    }
    var terms = event.target.closest && event.target.closest("[data-prereg-terms]");
    if (terms) {
      var box = terms.parentNode.querySelector(".prereg-terms");
      if (box) box.hidden = !box.hidden;
    }
  });

  var form = document.getElementById("prereg-form");
  if (!form) return;

  fillSido(form.querySelector("[name=addr_sido]"));
  var phone = form.querySelector("[name=phone]");
  var birth = form.querySelector("[name=birth6]");
  var birthWarn = document.getElementById("prereg-birth-warn");
  var step1 = document.getElementById("prereg-step1");
  var step2 = document.getElementById("prereg-step2");
  var done = document.getElementById("prereg-done");
  var alertBox = document.getElementById("prereg-alert");

  function hyphen(value) {
    var digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 8) return digits.slice(0, 3) + "-" + digits.slice(3);
    return digits.slice(0, 3) + "-" + digits.slice(3, 7) + "-" + digits.slice(7);
  }
  phone.addEventListener("input", function () {
    phone.value = hyphen(phone.value);
    mark("phone", false);
  });
  birth.addEventListener("input", function () {
    var digits = birth.value.replace(/\D/g, "");
    if (digits.length >= 7) {
      birth.value = "";
      birthWarn.hidden = false;
      return;
    }
    birthWarn.hidden = true;
    birth.value = digits.slice(0, 6);
    mark("birth6", false);
  });
  form.addEventListener("input", function (event) {
    if (event.target && event.target.name && event.target.name !== "birth6" && event.target.name !== "phone") {
      mark(event.target.name, false);
    }
  });
  form.addEventListener("change", function (event) {
    if (event.target && event.target.name === "consent_collect") mark("consent_collect", false);
  });

  function mark(name, on) {
    var field = form.querySelector("[name=" + name + "]");
    if (!field) return;
    var wrap = field.closest(".field") || field.closest(".prereg-agree");
    if (wrap) wrap.classList.toggle("err", on);
  }
  function say(message) {
    alertBox.hidden = !message;
    alertBox.textContent = message || "";
    if (!message) return;
    var anchor = step2.hidden ? form.querySelector("[data-prereg-next]") : form.querySelector(".register-actions");
    if (anchor) anchor.parentNode.insertBefore(alertBox, anchor);
    alertBox.scrollIntoView({ block: "center" });
  }
  function validDate(value) {
    if (!/^\d{6}$/.test(value)) return false;
    var month = Number(value.slice(2, 4));
    var day = Number(value.slice(4, 6));
    return month >= 1 && month <= 12 && day >= 1 && day <= 31;
  }
  function payloadBase() {
    return {
      consent_version: CFG.CONSENT_VERSION || "2026-09-26-v2",
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
  function post(body) {
    if (!CFG.ENDPOINT) {
      say("접수 준비 중입니다. 대표번호 " + PHONE + "로 문의해 주세요.");
      return Promise.resolve(null);
    }
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
      if (!data || data.ok !== true) return null;
      return data;
    }).catch(function () {
      return null;
    }).finally(function () { clearTimeout(timeout); });
  }

  var mgmName = document.getElementById("prereg-mgm-name");
  if (mgmName && CFG.MGM_RECIPIENT) mgmName.textContent = CFG.MGM_RECIPIENT;
  var mgmHold = document.getElementById("prereg-mgm-hold");
  if (mgmHold && CFG.MGM_RETENTION) mgmHold.textContent = CFG.MGM_RETENTION;

  form.querySelector("[data-prereg-next]").addEventListener("click", function () {
    var name = (form.querySelector("[name=name]").value || "").trim();
    var digits = phone.value.replace(/\D/g, "");
    var agree = form.querySelector("[name=consent_collect]").checked;
    var birthValue = birth.value;
    mark("name", name.length < 2 || name.length > 20);
    mark("phone", !(digits.indexOf("010") === 0 && digits.length === 11));
    mark("birth6", !validDate(birthValue));
    mark("consent_collect", !agree);
    var missing = [];
    if (name.length < 2 || name.length > 20) missing.push("이름");
    if (digits.indexOf("010") !== 0 || digits.length !== 11) missing.push("휴대전화번호");
    if (!validDate(birthValue)) missing.push("생년월일");
    if (!agree) missing.push("개인정보 동의");
    if (missing.length) {
      say(missing.join(", ") + " 항목을 확인해 주세요.");
      var first = form.querySelector(".err");
      if (first) first.scrollIntoView({ block: "center" });
      return;
    }
    say("");
    step2.hidden = false;
    form.querySelector("[data-prereg-next]").hidden = true;
    window.scrollTo(0, step2.getBoundingClientRect().top + window.scrollY - 120);
  });

  form.querySelector("[data-prereg-back]").addEventListener("click", function () {
    say("");
    step2.hidden = true;
    form.querySelector("[data-prereg-next]").hidden = false;
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var honeypot = form.querySelector("[name=hp]");
    if (honeypot && honeypot.value) return;
    var name = (form.querySelector("[name=name]").value || "").trim();
    var digits = phone.value.replace(/\D/g, "");
    var birthValue = birth.value;
    var sido = form.querySelector("[name=addr_sido]").value;
    var sigungu = (form.querySelector("[name=addr_sigungu]").value || "").trim();
    var dong = (form.querySelector("[name=addr_dong]").value || "").trim();
    mark("birth6", !validDate(birthValue));
    mark("addr_sido", !sido);
    mark("addr_sigungu", sigungu.length < 2 || sigungu.length > 20);
    mark("addr_dong", dong.length < 2 || dong.length > 20);
    if (!validDate(birthValue) || !sido || sigungu.length < 2 || sigungu.length > 20 || dong.length < 2 || dong.length > 20) {
      say("입력 내용을 확인해 주세요.");
      var first = form.querySelector("#prereg-step2 .err");
      if (first) first.scrollIntoView({ block: "center" });
      return;
    }
    var button = form.querySelector("[data-prereg-done]");
    var label = button.textContent;
    button.disabled = true;
    button.textContent = "접수 중…";
    say("");
    var mgm = form.querySelector("[name=consent_mgm]");
    post(Object.assign(payloadBase(), {
      step: 1,
      name: name,
      phone: hyphen(digits),
      birth6: birthValue,
      consent_collect: true,
      consent_marketing: !!form.querySelector("[name=consent_marketing]").checked,
      visit_request: false,
      hp: ""
    })).then(function (first) {
      if (!first) {
        say("접수를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도하시거나 " + PHONE + "로 문의해 주세요.");
        return null;
      }
      return post({
        step: 2,
        receipt_no: first.receipt_no,
        phone: hyphen(digits),
        birth6: birthValue,
        addr_sido: sido,
        addr_sigungu: sigungu,
        addr_dong: dong,
        interest_type: "",
        special_supply: "",
        consent_mgm: !!(mgm && mgm.checked),
        consent_version: CFG.CONSENT_VERSION || "2026-09-26-v2"
      }).then(function (second) {
        if (!second) {
          say("접수를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도하시거나 " + PHONE + "로 문의해 주세요.");
          return null;
        }
        return first;
      });
    }).then(function (first) {
      if (!first) return;
      document.getElementById("prereg-done-no").textContent = first.receipt_no || "";
      document.getElementById("prereg-done-time").textContent = formatKst(first.created_at);
      var created = new Date(first.created_at).getTime();
      document.getElementById("prereg-existing").hidden = !(created && Date.now() - created > 120000);
      form.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ block: "start" });
    }).finally(function () {
      button.disabled = false;
      button.textContent = label;
    });
  });
})();
