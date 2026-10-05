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
      '<li>대상 : 본 홈페이지에서 사전고객등록을 완료하고 담당자 안내에 따라 MGM 등록(개인정보 제3자 제공 동의 포함)을 마친 고객 중, 청라 아크원 푸르지오 아파트 청약에 당첨되어 MGM 인정조건을 충족한 고객</li>' +
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

  if (promoReady() && !/\/(register|privacy)(\.html)?\/?$/.test(location.pathname)) {
    var promo = document.createElement("section");
    promo.className = "prereg-event";
    promo.innerHTML = '<div><p>EVENT · 사전고객등록 고객 혜택</p><h2>백화점 상품권 30만원</h2><p>롯데 · 현대 · 신세계 중 선택</p><p>홈페이지 사전고객등록 후 담당자 안내에 따라 MGM 등록(개인정보 제3자 제공 동의 포함)을 마치고, 청약 당첨 및 MGM 인정조건을 충족하신 고객께 드립니다.</p><ol class="prereg-event__steps"><li>① 사전고객등록</li><li>② MGM 등록 확인</li><li>③ 공식 청약</li><li>④ 당첨·인정 확인</li><li>⑤ 상품권 지급</li></ol><p>지급 시기: 청약 당첨 및 MGM 인정조건 충족 확인 후 계약 당일 지급합니다. 제세공과금 처리 기준은 담당자가 개별 안내합니다.</p><p class="prereg-event__schedule">입주자모집공고 및 GRAND OPEN: 2026년 10월 중 예정 · 세부 일정은 공식 공고로 확인</p><p>사전고객등록은 공식 청약 신청이 아닙니다.</p>' + termsButton() + '<p><a class="btn btn--gold" href="/register">사전고객등록하기</a></p><p class="prereg-confirm">사전고객등록 확인은 대표번호 1833-3872로 문의해 주세요.</p></div>';
    promo.style.overflowAnchor = "none";
    var hero = document.querySelector(".hero");
    if (hero) hero.insertAdjacentElement("afterend", promo);
    if (location.pathname === "/" && !location.hash && !window.__homeUserMoved) window.scrollTo(0, 0);
  }

  if (promoReady() && location.pathname === "/") {
    var repair = new URLSearchParams(location.search).get("repair");
    var forcePopup = repair === "popup-v8" || repair === "popup-v7";
    var popupUntil = 0;
    try { popupUntil = Number(localStorage.getItem("prereg_popup_until_v8") || 0); } catch (err) {}
    if (forcePopup || Date.now() >= popupUntil) {
      if (!document.querySelector(".prereg-popup")) {
        // 팝업은 브라우저 기본 <dialog>(top layer, 덮개는 ::backdrop)로 띄운다. 화면 전체를 덮는 고정 요소가 DOM 에 없어
        // 「마우스 제한 해제」류 확장이 덮개로 오인해 지우는 일을 피한다. <dialog> 를 못 쓰는 브라우저는 전과 같은 div 로 띄운다.
        var canDialog = typeof HTMLDialogElement === "function" && typeof HTMLDialogElement.prototype.showModal === "function";
        var modal = document.createElement(canDialog ? "dialog" : "div"); modal.className = "prereg-popup"; modal.setAttribute("aria-label", "사전고객등록 이벤트 안내");
        if (!canDialog) { modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); }
        if (canDialog && !document.getElementById("prereg-popup-style")) {
          var popupStyle = document.createElement("style"); popupStyle.id = "prereg-popup-style";
          popupStyle.textContent = "dialog.prereg-popup{position:fixed;inset:auto;top:50%;left:50%;transform:translate(-50%,-50%);width:min(480px,calc(100% - 32px));max-width:none;max-height:85vh;margin:0;padding:0;border:0;background:transparent;overflow:visible}dialog.prereg-popup:not([open]){display:none}dialog.prereg-popup[open]{display:block}dialog.prereg-popup::backdrop{background:rgba(0,0,0,.55)}dialog.prereg-popup .prereg-popup__card{width:100%}";
          document.head.appendChild(popupStyle);
        }
        modal.innerHTML = '<div class="prereg-popup__card"><button type="button" class="prereg-popup__close" aria-label="닫기">✕</button><p>입주자모집공고 및 GRAND OPEN: 2026년 10월 중 예정 · 세부 일정은 공식 공고로 확인</p><p>EVENT · 사전고객등록 고객 혜택</p><h2>백화점 상품권 30만원</h2><p>롯데 · 현대 · 신세계 중 선택</p><p>사전고객등록 후 담당자 안내에 따라 MGM 등록을 마치고, 청약 당첨 및 MGM 인정조건을 충족하신 고객께 드립니다.</p><p>사전고객등록은 공식 청약 신청이 아닙니다.</p>' + termsButton() + '<p><a class="btn btn--gold" href="/register">사전고객등록하기</a></p><p>사전고객등록 확인은 대표번호 1833-3872로 문의해 주세요.</p><div class="prereg-popup__actions"><button type="button" class="prereg-popup__today">오늘 하루 보지 않기</button><button type="button" class="prereg-popup__later">닫기</button></div></div>';
        var savedY = window.__homeUserMoved ? (window.scrollY || 0) : 0;
        if (!window.__homeUserMoved) window.scrollTo(0, 0);
        document.body.dataset.preregScroll = String(savedY);
        document.body.style.position = "fixed";
        document.body.style.top = (-savedY) + "px";
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        function unlock() {
          var y = Number(document.body.dataset.preregScroll || 0);
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.left = "";
          document.body.style.right = "";
          document.body.style.width = "";
          document.body.style.overflow = "";
          window.scrollTo(0, y);
        }
        var closed = false, shown = false, guard = null;
        // 확장 프로그램 등이 팝업을 지우거나 숨기면 사용자가 닫을 수 없으므로, 그때는 잠금을 스스로 푼다.
        function check() {
          if (closed) return;
          if (!document.body.contains(modal) || (shown && (window.getComputedStyle(modal).display === "none" || (canDialog && !modal.open)))) close(false);
        }
        function close(hideToday) {
          if (closed) return;
          closed = true;
          if (guard) guard.disconnect();
          ["wheel", "touchstart", "keydown"].forEach(function (type) { window.removeEventListener(type, check); });
          if (canDialog && modal.open) modal.close();
          modal.remove(); unlock();
          if (hideToday) { try { localStorage.setItem("prereg_popup_until_v8", String(Date.now() + 86400000)); } catch (err) {} }
        }
        function show() {
          if (closed || shown) return;
          shown = true;
          if (canDialog) modal.showModal();
          var x = modal.querySelector(".prereg-popup__close");
          if (x) x.focus();
        }
        modal.addEventListener("click", function (e) { if (e.target === modal) close(false); else if (e.target.closest(".prereg-popup__today")) close(true); else if (e.target.closest(".prereg-popup__close, .prereg-popup__later")) close(false); });
        modal.addEventListener("keydown", function (e) { if (e.key === "Escape") close(false); if (e.key === "Tab") { var f=Array.from(modal.querySelectorAll("a,button")),i=f.indexOf(document.activeElement); if(e.shiftKey&&i===0){e.preventDefault();f[f.length-1].focus();}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus();} } });
        if (canDialog) modal.addEventListener("close", function () { close(false); });
        document.body.appendChild(modal);
        if ("MutationObserver" in window) { guard = new MutationObserver(check); guard.observe(document.body, { childList: true }); }
        ["wheel", "touchstart", "keydown"].forEach(function (type) { window.addEventListener(type, check, { passive: true }); });
        // 홈 인트로가 도는 동안에는 띄우지 않는다(top layer 는 인트로보다 위에 그려진다). 인트로가 끝나면 official-main.js 가 om:intro-done 을 낸다.
        if (document.documentElement.hasAttribute("data-om-intro")) window.addEventListener("om:intro-done", show, { once: true });
        else show();
      }
    }
  }

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
  var requestedProduct = new URLSearchParams(location.search).get("product");
  var product = requestedProduct === "apt" || requestedProduct === "officetel" ? requestedProduct : "";
  function applyProduct(value) {
    product = value;
    form.querySelectorAll("[data-product-option]").forEach(function (option) { option.hidden = option.getAttribute("data-product-option") !== product; });
    form.querySelectorAll("[data-product-apt-only]").forEach(function (section) { section.hidden = product !== "apt"; });
    form.querySelectorAll("[name=special_supply]").forEach(function (input) { input.checked = false; });
    var officeType = form.querySelector('[name="interest_type"][value="오피스텔"]');
    form.querySelectorAll('[name="interest_type"]').forEach(function (input) { input.checked = false; });
    if (product === "officetel" && officeType) officeType.checked = true;
  }
  form.querySelectorAll('[name="product"]').forEach(function (input) {
    input.checked = input.value === product;
    input.addEventListener("change", function () { if (input.checked) applyProduct(input.value); });
  });
  if (product) applyProduct(product);

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
      page: location.pathname + "?product=" + product,
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

  var receiptNo = "", createdAt = "", phoneValue = "";
  function validateFirst() {
    var name = (form.querySelector("[name=name]").value || "").trim();
    var digits = phone.value.replace(/\D/g, "");
    var agree = form.querySelector("[name=consent_collect]").checked;
    var birthValue = birth.value;
    var productWrap = form.querySelector(".prereg-product");
    if (productWrap) productWrap.classList.toggle("err", !product);
    mark("name", name.length < 2 || name.length > 20);
    mark("phone", !(digits.indexOf("010") === 0 && digits.length === 11));
    mark("birth6", !validDate(birthValue));
    mark("consent_collect", !agree);
    var missing = [];
    if (name.length < 2 || name.length > 20) missing.push("이름");
    if (digits.indexOf("010") !== 0 || digits.length !== 11) missing.push("휴대전화번호");
    if (!validDate(birthValue)) missing.push("생년월일");
    if (!product) missing.push("등록 상품");
    if (!agree) missing.push("개인정보 동의");
    if (missing.length) {
      say("입력 내용을 확인해 주세요. " + missing.join(", ") + " 항목을 확인해 주세요.");
      var first = form.querySelector(".err");
      if (first) first.scrollIntoView({ block: "center" });
      return;
    }
    return true;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var honeypot = form.querySelector("[name=hp]");
    if (honeypot && honeypot.value) return;
    var button = form.querySelector("[data-prereg-submit]");
    if (!step2.hidden) {
      var sido2 = form.querySelector("[name=addr_sido]").value, sigungu2 = form.querySelector("[name=addr_sigungu]").value.trim(), dong2 = form.querySelector("[name=addr_dong]").value.trim();
      var any = !!(sido2 || sigungu2 || dong2);
      if (any && !(sido2 && sigungu2.length >= 2 && dong2.length >= 2)) { say("주소는 선택 항목입니다. 입력하시려면 시·도, 시·군·구, 읍·면·동을 모두 입력해 주세요."); return; }
      var save = form.querySelector("[data-prereg-save]"), interest = form.querySelector("[name=interest_type]:checked"), special = form.querySelector("[name=special_supply]:checked");
      save.disabled = true; save.textContent = "저장 중…";
      post({step:2, receipt_no:receiptNo, phone:phoneValue, addr_sido:any?sido2:"", addr_sigungu:any?sigungu2:"", addr_dong:any?dong2:"", interest_type:interest?interest.value:"", special_supply:special?special.value:"", consent_mgm:false, consent_version:CFG.CONSENT_VERSION||"2026-09-26-v2"}).then(function (data) { if(data) showDone(false); else say("접수를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도하시거나 1833-3872로 문의해 주세요."); }).finally(function(){save.disabled=false;save.textContent="추가 정보 저장";});
      return;
    }
    if (!validateFirst()) return;
    var name = (form.querySelector("[name=name]").value || "").trim();
    var digits = phone.value.replace(/\D/g, "");
    var birthValue = birth.value;
    var label = button.textContent;
    button.disabled = true;
    button.textContent = "접수 중…";
    say("");
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
      receiptNo = first.receipt_no || ""; createdAt = first.created_at || ""; phoneValue = hyphen(digits);
      document.getElementById("prereg-done-no").textContent = receiptNo;
      document.getElementById("prereg-done-time").textContent = formatKst(createdAt);
      var step1Note = document.createElement("div"); step1Note.className = "prereg-done-box"; step1Note.setAttribute("role", "status");
      var t1 = document.createElement("strong"); t1.className = "prereg-done-title"; t1.textContent = "사전등록 완료되었습니다.";
      var d1 = document.createElement("p"); d1.textContent = (first.duplicate ? "이미 사전등록된 번호입니다. 최초 접수번호 " : "접수번호 ") + receiptNo + " · 접수시각 " + formatKst(createdAt) + " · 상품 " + (product === "officetel" ? "오피스텔" : "아파트");
      var sh1 = document.createElement("div");
      step1Note.appendChild(t1); step1Note.appendChild(d1); step1Note.appendChild(sh1);
      if (window.PreregShare) window.PreregShare.mount(sh1, receiptNo, formatKst(createdAt));
      step1.parentNode.insertBefore(step1Note, step1); step1.querySelectorAll("input,button").forEach(function(el){el.disabled=true;}); button.hidden=true;
      if (first.duplicate) { var existing=document.getElementById("prereg-existing"); existing.hidden=false; document.getElementById("prereg-existing-no").textContent=receiptNo; }
      step2.hidden=false; say(""); step2.scrollIntoView({block:"start"}); var first2=step2.querySelector("select,input,button"); if(first2) first2.focus();
      return null;
    }).then(function (first) {
      if (!first) return;
    }).finally(function () {
      button.disabled = false;
      button.textContent = label;
    });
  });
  form.querySelector("[data-prereg-skip]").addEventListener("click", function(){ if(receiptNo) showDone(false); });
  function showDone(duplicate){ document.getElementById("prereg-done-no").textContent=receiptNo; document.getElementById("prereg-done-time").textContent=formatKst(createdAt); document.getElementById("prereg-done-heading").textContent="사전등록 완료되었습니다."; var dp=document.getElementById("prereg-done-product"); if(dp) dp.textContent="등록 상품 "+(product==="officetel"?"오피스텔":"아파트"); if(window.PreregShare) window.PreregShare.mount(document.getElementById("prereg-done-share"), receiptNo, formatKst(createdAt)); if(product==="officetel"){document.getElementById("prereg-steps").innerHTML="<p>STEP 1 오피스텔 사전등록 완료</p><p>STEP 2 담당자가 오피스텔 상품 안내를 드립니다.</p>";} if(duplicate){document.getElementById("prereg-existing").hidden=false;document.getElementById("prereg-existing-no").textContent=receiptNo;} form.hidden=true; done.hidden=false; done.scrollIntoView({block:"start"}); }
})();
