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
    return "";
  }
  function termsButton() {
    return "";
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
    promo.innerHTML = '<div><p>예비당첨자 사전고객등록</p><h2>아파트 예비당첨자 안내</h2><p>예비당첨자로 선정되신 고객께서 사전고객등록을 해 주시면 계약 일정·절차·준비 서류를 담당자가 개별 안내해 드립니다.</p><p class="prereg-deadline prereg-line-1128" style="color:#a8834a;font-weight:700;letter-spacing:-0.01em">예비당첨자 추첨 11.28(토) 예정 · 세부 일정은 사업주체가 개별 안내</p><ol class="prereg-event__steps"><li>① 예비당첨자 사전고객등록</li><li>② 담당자 일정·서류 안내</li><li>③ 예비당첨자 계약(공고 기준)</li></ol><p class="prereg-event__schedule">세부 일정은 대표번호 1833-3872로 문의</p><p><b>견본주택 방문은 사전 예약제입니다.</b> 방문 전 <a href="/visit" style="text-decoration:underline">방문예약</a>을 해 주세요. 예약 없이 방문하시면 입장·상담이 제한될 수 있습니다.</p><p>※ 사전고객등록은 공식 청약·계약 신청이 아닙니다. 예비당첨자 선정 여부와 순번은 청약홈·입주자모집공고를 따릅니다.</p><p><a class="btn btn--gold" href="/register?product=apt">예비당첨자 사전고객등록하기</a></p><p class="prereg-confirm">사전고객등록 확인은 대표번호 1833-3872로 문의해 주세요.</p></div>';
    if (Date.now() >= Date.UTC(2026, 10, 28, 15, 0, 0)) {
      var ybLine = promo.querySelector(".prereg-line-1128");
      if (ybLine) ybLine.hidden = true;
    }
    promo.style.overflowAnchor = "none";
    var hero = document.querySelector(".hero");
    if (hero) hero.insertAdjacentElement("afterend", promo);
    if (location.pathname === "/" && !location.hash && !window.__homeUserMoved) window.scrollTo(0, 0);
  }

  if (false && promoReady() && location.pathname === "/") { // 작업지시서 30: 자동 열림 끔
    var repair = new URLSearchParams(location.search).get("repair");
    var forcePopup = repair === "popup-v8" || repair === "popup-v7";
    var popupUntil = 0;
    try { popupUntil = Number(localStorage.getItem("popup_20261128") || 0); } catch (err) {}
    if (forcePopup || Date.now() >= popupUntil) {
      if (!document.querySelector(".prereg-popup")) {
        // 팝업은 브라우저 기본 <dialog>(top layer, 덮개는 ::backdrop)로 띄운다. 화면 전체를 덮는 고정 요소가 DOM 에 없어
        // 「마우스 제한 해제」류 확장이 덮개로 오인해 지우는 일을 피한다. <dialog> 를 못 쓰는 브라우저는 전과 같은 div 로 띄운다.
        var canDialog = typeof HTMLDialogElement === "function" && typeof HTMLDialogElement.prototype.showModal === "function";
        var modal = document.createElement(canDialog ? "dialog" : "div"); modal.className = "prereg-popup"; modal.setAttribute("aria-label", "방문 혜택");
        if (!canDialog) { modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); }
        if (!document.getElementById("prereg-popup-style")) {
          var popupStyle = document.createElement("style"); popupStyle.id = "prereg-popup-style";
          popupStyle.textContent = 'html body dialog.prereg-popup,html body div.prereg-popup{z-index:2147483000 !important}html body dialog.prereg-popup{position:fixed !important;inset:0 !important;width:100% !important;max-width:100% !important;height:100vh !important;max-height:100vh !important;margin:0 !important;padding:8px !important;border:0 !important;background:transparent !important;overflow:hidden !important;box-sizing:border-box !important}dialog.prereg-popup:not([open]){display:none !important}dialog.prereg-popup[open]{display:flex !important;align-items:center;justify-content:center}dialog.prereg-popup::backdrop{background:rgba(0,0,0,.55)}.wo27{display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;max-width:100%;max-height:100%;color:#fff;font-family:"Pretendard","Noto Sans KR","Apple SD Gothic Neo",sans-serif}.wo27__band{width:min(560px,100%);box-sizing:border-box;background:#032B20;text-align:center;padding:8px 12px 10px;border-radius:8px}.wo27__line{margin:0;font-size:14px;font-weight:700;line-height:1.35;word-break:keep-all}.wo27__lg{margin:2px 0 0;font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-.03em;word-break:keep-all}.wo27__row{display:flex;gap:12px;justify-content:center;align-items:center;max-width:100%;overflow:hidden}.wo27 .popup_soon{position:relative !important;inset:auto !important;z-index:auto !important;display:block !important;width:auto !important;height:auto !important;margin:0 !important;background:none !important;animation:none !important;flex:0 0 auto;--pf-unit:min(0.7px,calc((100vw - 40px) / 794),calc((100vh - 230px) / 800))}.wo27 .popup_soon__dialog{position:relative;width:calc(390 * var(--pf-unit));height:calc(800 * var(--pf-unit));overflow:hidden;background:#123}.wo27 .popup_soon__bg{position:absolute;inset:0}.wo27 .popup_soon__bg img{display:block;width:100%;height:100%;object-fit:cover;object-position:center bottom}.wo27 .popup_soon__content{position:absolute;z-index:1;top:calc(90 * var(--pf-unit));left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:calc(18 * var(--pf-unit));width:calc(320 * var(--pf-unit));text-align:center}.wo27 .popup_soon__logo{width:calc(210 * var(--pf-unit));height:auto;margin:0}.wo27 .popup_soon__logo img{display:block;width:100%;height:auto}.wo27 .popup_soon__title{display:flex;flex-direction:column;align-items:center;margin:0;color:#fff;font-family:"Eulyoo1945",serif;font-weight:600;line-height:1.2}.wo27 .popup_soon__brand{font-size:calc(20 * var(--pf-unit));letter-spacing:-.03em}.wo27 .popup_soon__type{margin:calc(4 * var(--pf-unit)) 0 0;font-size:calc(40 * var(--pf-unit));letter-spacing:-.03em}.wo27 .popup_soon__sched{position:absolute;z-index:2;top:calc(400 * var(--pf-unit));left:50%;transform:translateX(-50%);width:calc(330 * var(--pf-unit));text-align:center;color:#fff}.wo27 .popup_soon__sched-kicker{margin:0;font-size:calc(22 * var(--pf-unit));font-weight:700;line-height:1.3}.wo27 .popup_soon__sched-main{margin:calc(8 * var(--pf-unit)) 0 0;font-family:"Eulyoo1945",serif;font-size:calc(34 * var(--pf-unit));line-height:1.25;letter-spacing:-.03em}.wo27 .popup_soon__sched-sub{margin:calc(6 * var(--pf-unit)) 0 0;font-size:calc(16 * var(--pf-unit));font-weight:600;line-height:1.35;word-break:keep-all}.wo27 .popup_soon__cta,.wo27 .popup_soon__cta:visited,.wo27 .popup_soon__cta:active{position:absolute;z-index:2;top:calc(628 * var(--pf-unit));left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;width:calc(320 * var(--pf-unit));height:calc(52 * var(--pf-unit));border-radius:calc(8 * var(--pf-unit));background:#fff;color:#032B20;font-size:calc(16 * var(--pf-unit));font-weight:700;text-decoration:none;white-space:nowrap}.wo27 .popup_soon__note{position:absolute;z-index:2;left:8%;right:8%;bottom:calc(16 * var(--pf-unit));margin:0;color:#fff;font-size:calc(12 * var(--pf-unit));line-height:1.35;text-align:center;word-break:keep-all}.wo27__dots{display:none;gap:8px}.wo27__dots button{width:8px;height:8px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.4);cursor:pointer}.wo27__dots button.is-on{background:#fff}.wo27__foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 14px;color:#fff;font-size:14px;font-weight:700}.wo27__foot a{color:#fff;text-decoration:underline}.wo27__foot button{border:0;background:none;color:#fff;font:inherit;cursor:pointer;min-height:36px}.wo27__fine{margin:0;max-width:720px;font-size:11px;line-height:1.35;text-align:center;color:rgba(255,255,255,.88);word-break:keep-all}@media(max-width:767px){  .wo27__band{width:min(100% - 8px,360px)}  .wo27__line{font-size:13px}  .wo27__lg{font-size:20px}  .wo27__row{--wo27-card:min(212px,calc(100vw - 16px));width:100%;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;justify-content:flex-start;gap:0;scrollbar-width:none}  .wo27__row::-webkit-scrollbar{display:none}  .wo27 .popup_soon{scroll-snap-align:center;--pf-unit:min(0.5436px,calc((100vw - 16px) / 390),calc((100vh - 230px) / 800)) !important}  .wo27__row .popup_soon{margin-left:calc((100% - var(--wo27-card)) / 2) !important;margin-right:calc((100% - var(--wo27-card)) / 2) !important}  .wo27__dots{display:flex}}';
          document.head.appendChild(popupStyle);
        }
        // 작업지시서 13: 문구는 그대로 두고 배치·모양만 아크원푸르지오.site 사전등록 팝업과 같게(제목 → 혜택 → 등록 버튼 → 확인 → 유의 문구 → 하단 버튼)
        modal.innerHTML = '<div class="wo27"><div class="wo27__band"><p class="wo27__line">방문 혜택 · 사전고객등록·방문예약 후 모델하우스 방문 시</p><p class="wo27__lg">스타벅스 커피 쿠폰 증정</p></div><div class="wo27__row"><div class="popup_soon popup_soon--officetel popup_soon--prereg"><div class="popup_soon__dialog"><div class="popup_soon__bg"><img src="/official/soon/officetel_bg_m.png" alt=""></div><div class="popup_soon__content"><p class="popup_soon__logo"><img src="/official/soon/logo.svg" alt="청라 아크원 푸르지오 PRUGIO 로고" width="257" height="45"></p><h2 id="otp-ot-title" class="popup_soon__title"><span class="popup_soon__brand">청라 아크원 푸르지오</span><span class="popup_soon__type">오피스텔</span></h2></div><div class="popup_soon__sched"><p class="popup_soon__sched-kicker">사전고객등록</p><p class="popup_soon__sched-main">12.7(월) 청약</p><p class="popup_soon__sched-sub">12.4(금) 견본주택 오픈 예정</p></div><a class="popup_soon__cta" href="/register?product=officetel">오피스텔 사전고객등록 →</a><p class="popup_soon__note">※ 본 홈페이지에 사용된 CG 및 이미지는 실제와 다를 수 있습니다.</p></div></div><div class="popup_soon popup_soon--commercial popup_soon--prereg"><div class="popup_soon__dialog"><div class="popup_soon__bg"><img src="/official/soon/commercial_bg_m.png" alt=""></div><div class="popup_soon__content"><p class="popup_soon__logo"><img src="/official/soon/logo.svg" alt="청라 아크원 푸르지오 PRUGIO 로고" width="257" height="45"></p><h2 id="otp-cm-title" class="popup_soon__title"><span class="popup_soon__brand">청라 아크원 푸르지오</span><span class="popup_soon__type">상업시설</span></h2></div><div class="popup_soon__sched"><p class="popup_soon__sched-kicker">사전고객등록</p><p class="popup_soon__sched-main">분양 예정</p></div><a class="popup_soon__cta" href="/register?product=commercial">상가 사전고객등록 →</a><p class="popup_soon__note">※ 본 홈페이지에 사용된 CG 및 이미지는 실제와 다를 수 있습니다.</p></div></div></div><div class="wo27__dots"><button type="button" data-dot="0" class="is-on" aria-label="오피스텔 카드"></button><button type="button" data-dot="1" aria-label="상가 카드"></button></div><div class="wo27__foot"><a href="/visit">방문예약만 하실 분은 → 방문예약 하기</a><button type="button" class="prereg-popup__today" data-today="1">오늘 하루 보지 않기</button><button type="button" class="prereg-popup__close" data-close="1" aria-label="닫기">✕</button></div><p class="wo27__fine">※ 쿠폰 지급 기준·기간은 분양문의 1833-3872로 확인해 주세요. 사전 공지 후 변경·조기 종료될 수 있습니다.</p><p class="wo27__fine">※ 사전고객등록은 청약 신청이 아니며, 청약 자격·순위와 관계없습니다.</p></div>';
        // v14.0 §3 (2026-10-12): 휴대폰(767px 이하)에서는 자동으로 띄우지 않는다. 다이얼로그는 만들어 두고 닫아 두며,
        // nav.mbar 위 띠의 「자세히」를 누를 때만 잠그고 연다. 데스크톱 동작(잠금·인트로 대기·표시)은 종전 그대로다.
        var mobileView = false;
        try { mobileView = window.matchMedia("(max-width: 767px)").matches; } catch (err) {}
        function lock() {
          var savedY = mobileView ? (window.scrollY || 0) : (window.__homeUserMoved ? (window.scrollY || 0) : 0);
          if (!mobileView && !window.__homeUserMoved) window.scrollTo(0, 0);
          document.body.dataset.preregScroll = String(savedY);
          document.body.style.position = "fixed";
          document.body.style.top = (-savedY) + "px";
          document.body.style.left = "0";
          document.body.style.right = "0";
          document.body.style.width = "100%";
        }
        if (!mobileView) lock();
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
          if (mobileView && !shown) return; // 휴대폰: 열리지 않은(되돌려 둔) 다이얼로그의 늦은 close 이벤트는 무시
          closed = true;
          if (guard) guard.disconnect();
          ["wheel", "touchstart", "keydown"].forEach(function (type) { window.removeEventListener(type, check); });
          if (canDialog && modal.open) modal.close();
          modal.remove(); unlock();
          if (hideToday) { try { localStorage.setItem("popup_20261128", String(Date.now() + 86400000)); } catch (err) {} }
          if (mobileView) {
            // 휴대폰: 다시 열 수 있게 닫힌 다이얼로그로 되돌리고 띠를 다시 보인다(오늘 하루 보지 않기면 띠도 숨긴다).
            if (hideToday) { if (strip) strip.remove(); return; }
            closed = false; shown = false;
            document.body.appendChild(modal);
            if (strip && !stripClosed()) strip.hidden = false;
          }
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
        (function(){
          var row = modal.querySelector(".wo27__row");
          var dots = modal.querySelectorAll("[data-dot]");
          function sync(){
            if (!row || !row.clientWidth) return;
            var i = row.scrollLeft > row.clientWidth * 0.45 ? 1 : 0;
            for (var n = 0; n < dots.length; n++) dots[n].classList.toggle("is-on", n === i);
          }
          if (row) row.addEventListener("scroll", sync, { passive: true });
          for (var n = 0; n < dots.length; n++) (function(btn, i){
            btn.addEventListener("click", function(){
              var card = row && row.children[i];
              if (card && card.scrollIntoView) card.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
            });
          })(dots[n], n);
        })();
        function arm() {
          if ("MutationObserver" in window) { guard = new MutationObserver(check); guard.observe(document.body, { childList: true }); }
          ["wheel", "touchstart", "keydown"].forEach(function (type) { window.addEventListener(type, check, { passive: true }); });
        }
        function stripClosed() { try { return sessionStorage.getItem("prereg_strip_closed") === "1"; } catch (err) { return false; } }
        try { sessionStorage.removeItem("prereg_strip_closed"); } catch (err) {}
        var strip = null;
        if (mobileView) {
          if (!stripClosed()) {
            strip = document.createElement("div");
            strip.className = "prereg-strip";
            strip.setAttribute("role", "region");
            strip.setAttribute("aria-label", "견본주택 방문예약 안내");
            strip.innerHTML = '<span class="prereg-strip__txt">견본주택 방문은 사전 예약제</span><button type="button" class="prereg-strip__more">자세히</button><button type="button" class="prereg-strip__x" aria-label="닫기">✕</button>';
            strip.addEventListener("click", function (e) {
              if (e.target.closest(".prereg-strip__more")) { strip.hidden = true; lock(); arm(); show(); }
              else if (e.target.closest(".prereg-strip__x")) { try { sessionStorage.setItem("prereg_strip_closed", "1"); } catch (err) {} strip.remove(); strip = null; }
            });
            document.body.appendChild(strip);
          }
        } else {
          arm();
          // 홈 인트로가 도는 동안에는 띄우지 않는다(top layer 는 인트로보다 위에 그려진다). 인트로가 끝나면 official-main.js 가 om:intro-done 을 낸다.
          if (document.documentElement.hasAttribute("data-om-intro")) window.addEventListener("om:intro-done", show, { once: true });
          else show();
        }
      }
    }
  }

  var form = document.getElementById("prereg-form");
  if (!form) return;
  // PM 지시(2026-11-18): 고객등록란 위에 견본주택 방문 사전 예약제 안내를 둔다(폼·전송값은 건드리지 않는다).
  if (!document.getElementById("visit-rule-note") && form.parentNode) {
    var visitRule = document.createElement("aside");
    visitRule.id = "visit-rule-note";
    visitRule.setAttribute("aria-label", "견본주택 방문예약 안내");
    visitRule.style.cssText = "margin:0 0 20px;padding:18px 20px;border:1px solid #a8834a;border-radius:10px;background:#faf6ee;color:#1d2a26;line-height:1.6;text-align:left";
    visitRule.innerHTML = '<p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;color:#a8834a">견본주택 방문 안내</p><p style="margin:4px 0 6px;font-size:20px;font-weight:800;letter-spacing:-.02em;color:#1d2a26">오시기 전에, 예약 먼저.</p><p style="margin:0;font-size:14px;color:#1d2a26">청라 아크원 푸르지오 견본주택은 사전 예약제로 운영합니다. 사전고객등록만으로는 방문예약이 되지 않으니, 방문하실 분은 방문예약을 따로 신청해 주세요.</p><p style="margin:6px 0 0;font-size:13px;font-weight:700;color:#1d2a26">예약 없이 방문하시면 입장·상담이 제한될 수 있습니다.</p><p style="margin:12px 0 0;font-size:14px;font-weight:700"><a href="/visit" style="color:#004b45;text-decoration:underline">방문예약 하기 ›</a> <span aria-hidden="true">·</span> <a href="tel:18333872" style="color:#004b45;text-decoration:underline">전화 예약 1833-3872</a></p>';
    form.parentNode.insertBefore(visitRule, form);
  }

  fillSido(form.querySelector("[name=addr_sido]"));
  var phone = form.querySelector("[name=phone]");
  var birth = form.querySelector("[name=birth6]");
  var birthWarn = document.getElementById("prereg-birth-warn");
  var step1 = document.getElementById("prereg-step1");
  var step2 = document.getElementById("prereg-step2");
  var done = document.getElementById("prereg-done");
  var alertBox = document.getElementById("prereg-alert");
  var requestedProduct = new URLSearchParams(location.search).get("product");
  var product = requestedProduct === "apt" || requestedProduct === "officetel" || requestedProduct === "commercial" ? requestedProduct : "";
  function applyProduct(value) {
    product = value;
    form.querySelectorAll("[data-product-option]").forEach(function (option) { option.hidden = option.getAttribute("data-product-option") !== product; });
    form.querySelectorAll("[data-product-apt-only]").forEach(function (section) { section.hidden = product !== "apt"; });
    form.querySelectorAll("[name=special_supply]").forEach(function (input) { input.checked = false; });
    var officeType = form.querySelector('[name="interest_type"][value="오피스텔"]');
    form.querySelectorAll('[name="interest_type"]').forEach(function (input) { input.checked = false; });
    if (product === "officetel" && officeType) officeType.checked = true;
    if (product === "commercial") { var commercialType = form.querySelector('[name="interest_type"][value="상가"]'); if (commercialType) commercialType.checked = true; }
  }
  form.querySelectorAll('[name="product"]').forEach(function (input) {
    input.checked = input.value === product;
    input.addEventListener("change", function () { if (input.checked) applyProduct(input.value); });
  });
  if (product) applyProduct(product);
  var wo30Titles = { apt: "아파트 사전고객등록", officetel: "오피스텔 사전고객등록", commercial: "상가 사전고객등록" };
  if (wo30Titles[product]) document.title = wo30Titles[product] + " | 청라 아크원 푸르지오";
  if (new URLSearchParams(location.search).get("src") === "fcfs1226") {
    try { if (!sessionStorage.getItem("utm_content")) sessionStorage.setItem("utm_content", "fcfs1226"); } catch (e) {}
    if (!document.querySelector(".wo30-fcfs")) {
      var wo30Note = document.createElement("p");
      wo30Note.className = "wo30-fcfs";
      wo30Note.setAttribute("role", "note");
      wo30Note.textContent = "12.26(토) 아파트 선착순 계약 예정 · 선착순 고객등록은 아파트 사전고객등록으로 접수됩니다.";
      wo30Note.style.cssText = "margin:0 0 16px;padding:12px 14px;border-left:4px solid #C3395A;background:#fdecef;color:#1c2b28;font-weight:700;line-height:1.5";
      form.parentNode.insertBefore(wo30Note, form);
    }
  }

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

  // 작업지시서 13 (2026-10-22): 모델하우스 방문예약은 전용 페이지(/visit)로 분리했다. 이 폼에는 방문 항목이 없다.
  function validateFirst() {
    var name = (form.querySelector("[name=name]").value || "").trim();
    var digits = phone.value.replace(/\D/g, "");
    var age14El = form.querySelector("[name=age14]");
    var ageOk = !age14El || age14El.checked;
    var agree = form.querySelector("[name=consent_collect]").checked;
    var birthValue = birth.value;
    var productWrap = form.querySelector(".prereg-product");
    if (productWrap) productWrap.classList.toggle("err", !product);
    mark("name", name.length < 2 || name.length > 20);
    mark("phone", !(digits.indexOf("010") === 0 && digits.length === 11));
    mark("birth6", !validDate(birthValue));
    if (age14El) mark("age14", !ageOk);
    mark("consent_collect", !agree);
    var missing = [];
    if (name.length < 2 || name.length > 20) missing.push("이름");
    if (digits.indexOf("010") !== 0 || digits.length !== 11) missing.push("휴대전화번호");
    if (!validDate(birthValue)) missing.push("생년월일");
    if (!product) missing.push("등록 상품");
    if (!ageOk) missing.push("만 14세 이상 확인");
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
      var d1 = document.createElement("p"); d1.textContent = (first.duplicate ? "이미 사전등록된 번호입니다. 최초 접수번호 " : "접수번호 ") + receiptNo + " · 접수시각 " + formatKst(createdAt) + " · 상품 " + (product === "officetel" ? "오피스텔" : product === "commercial" ? "상가" : "아파트");
      var sh1 = document.createElement("div");
      step1Note.appendChild(t1); step1Note.appendChild(d1); step1Note.appendChild(sh1); var gv1 = document.createElement("p"); gv1.className = "prereg-visit-go"; gv1.innerHTML = '<a class="btn btn--line" href="/visit">모델하우스 방문예약 하기</a>'; step1Note.appendChild(gv1);
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
  function showDone(duplicate){ document.getElementById("prereg-done-no").textContent=receiptNo; document.getElementById("prereg-done-time").textContent=formatKst(createdAt); document.getElementById("prereg-done-heading").textContent="사전등록 완료되었습니다."; showVisitLine(document.getElementById("prereg-done-heading")); var dp=document.getElementById("prereg-done-product"); if(dp) dp.textContent="등록 상품 "+(product==="officetel"?"오피스텔":product==="commercial"?"상가":"아파트"); if(window.PreregShare) window.PreregShare.mount(document.getElementById("prereg-done-share"), receiptNo, formatKst(createdAt)); if(product==="officetel"){document.getElementById("prereg-steps").innerHTML="<p>STEP 1 오피스텔 사전등록 완료</p><p>STEP 2 담당자가 오피스텔 상품 안내를 드립니다.</p>";} else if(product==="commercial"){document.getElementById("prereg-steps").innerHTML="<p>STEP 1 상가 사전등록 완료</p><p>STEP 2 담당자가 상가 상품 안내를 드립니다.</p>";} if(duplicate){document.getElementById("prereg-existing").hidden=false;document.getElementById("prereg-existing-no").textContent=receiptNo;} form.hidden=true; done.hidden=false; done.scrollIntoView({block:"start"}); }
})();
