/* 코스트코 선착순 1,000명 이벤트 팝업. 기존 팝업 파일은 읽기만 하고 바꾸지 않는다. */
(function () {
  var PHONE = "1833-3872";
  var TEL = "tel:18333872";
  var REGISTER = "/register";
  var EXISTING = ".prereg-popup";
  var HIDE_KEY = "arkone_costco_pop_hide_until";

  function norm(path) {
    var p = path || "/";
    p = p.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    if (p.length > 1 && p.charAt(p.length - 1) === "/") p = p.slice(0, -1);
    return p || "/";
  }
  function skip() {
    var p = norm(location.pathname);
    return p === "/register" || p === "/privacy" || p === "/terms" || p === "/agreement" || p === "/policy";
  }
  function hidden() {
    try {
      var until = localStorage.getItem(HIDE_KEY);
      return !!(until && Date.now() < Number(until));
    } catch (e) { return false; }
  }
  function nextKstMidnight() {
    var kst = Date.now() + 9 * 60 * 60 * 1000;
    var d = new Date(kst);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - 9 * 60 * 60 * 1000;
  }
  function existingOpen() {
    var el = document.querySelector(EXISTING);
    if (!el) return false;
    if (el.tagName === "DIALOG") return !!el.open;
    var cs = window.getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
    return true;
  }
  function zIndex() {
    var el = document.querySelector(EXISTING);
    var zi = el ? parseInt(window.getComputedStyle(el).zIndex, 10) : NaN;
    return (isFinite(zi) ? zi : 1100) + 1;
  }

  var CSS = ""
    + ".costco-pop{position:fixed;inset:0;z-index:1101;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:transparent;color:#fff;font-family:inherit}"
    + "div.costco-pop--solo{background:rgba(0,0,0,.55)}"
    + "dialog.costco-pop{width:100%;height:100%;max-width:none;max-height:none;margin:0;border:0;padding:16px;background:transparent;overflow:visible}"
    + "dialog.costco-pop::backdrop{background:transparent}"
    + "dialog.costco-pop--solo::backdrop{background:rgba(0,0,0,.55)}"
    + ".costco-pop__panel{width:min(400px,calc(100vw - 32px));box-sizing:border-box;padding:14px 16px 10px;border:1px solid #B5853A;border-radius:16px;background:linear-gradient(180deg,#032B20 0%,#0A3D2D 100%);color:#fff;animation:costcoIn .25s ease}"
    + ".costco-pop__band{margin:0 0 8px;padding-bottom:8px;border-bottom:1px solid #B5853A;font-size:12px;line-height:1.35}"
    + ".costco-pop__title{margin:0;color:#E2B565;font-weight:700;font-size:44px;line-height:1.1;letter-spacing:-.03em}"
    + ".costco-pop__benefit{margin:6px 0 0;font-size:22px;line-height:1.3;font-weight:700}"
    + ".costco-pop__target{margin:6px 0 0;font-size:15px;line-height:1.4}"
    + ".costco-pop__go,.costco-pop__tel{display:flex;align-items:center;justify-content:center;width:100%;box-sizing:border-box;text-decoration:none;border-radius:8px}"
    + ".costco-pop__go{margin-top:12px;height:48px;background:#E2B565;color:#032B20;font-weight:700;font-size:16px;border:0}"
    + ".costco-pop__tel{margin-top:8px;height:44px;background:transparent;color:#fff;border:1px solid #B5853A;font-size:15px}"
    + ".costco-pop__note{margin:4px 0 0;color:rgba(255,255,255,.75);font-size:12px;line-height:1.35}"
    + ".costco-pop__foot{display:flex;justify-content:space-between;gap:8px;margin-top:8px}"
    + ".costco-pop__foot button{background:transparent;border:0;color:rgba(255,255,255,.9);font:inherit;font-size:13px;min-height:36px;padding:0;cursor:pointer}"
    + "@media(max-width:767px){.costco-pop__title{font-size:36px}.costco-pop__benefit{font-size:19px}.costco-pop__target{font-size:14px}.costco-pop__note{font-size:11.5px}.costco-pop__panel{padding:12px 14px 8px}}"
    + "@keyframes costcoIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}"
    + "@media(prefers-reduced-motion:reduce){.costco-pop__panel{animation:none}}";

  function markup() {
    return ''
      + '<div class="costco-pop__panel" role="dialog" aria-modal="true" aria-labelledby="costco-pop-title">'
      + '<p class="costco-pop__band">청라 아크원 푸르지오 · 사전고객등록 EVENT</p>'
      + '<h2 id="costco-pop-title" class="costco-pop__title">선착순 1,000명</h2>'
      + '<p class="costco-pop__benefit">코스트코 1년 회원권 증정</p>'
      + '<p class="costco-pop__target">홈페이지 사전고객등록 후 청약하신 고객 · 청약 당첨 여부와 관계없이</p>'
      + '<a class="costco-pop__go" href="' + REGISTER + '">사전고객등록하기</a>'
      + '<a class="costco-pop__tel" href="tel:18333872">전화 문의 1833-3872</a>'
      + '<p class="costco-pop__note">※ 선착순 1,000명 마감 시 조기 종료됩니다.</p>'
      + '<p class="costco-pop__note">※ 선착순 기준·지급 시기·방법은 담당자가 개별 안내합니다.</p>'
      + '<p class="costco-pop__note">※ 사전고객등록은 공식 청약 신청이 아니며, 등록만으로는 증정되지 않습니다.</p>'
      + '<p class="costco-pop__note">※ 홈페이지 운영자가 진행하는 이벤트로, 시행·시공사 및 코스트코가 제공하는 혜택이 아닙니다.</p>'
      + '<div class="costco-pop__foot"><button type="button" data-today="1">오늘 하루 보지 않기</button><button type="button" data-close="1" aria-label="닫기">닫기</button></div>'
      + '</div>';
  }

  var opened = false;
  function openPopup() {
    if (opened || skip() || hidden()) return;
    opened = true;
    if (!document.getElementById("costco-pop-style")) {
      var style = document.createElement("style");
      style.id = "costco-pop-style";
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    var solo = !existingOpen();
    var top = false;
    var exist = document.querySelector(EXISTING);
    if (exist && exist.tagName === "DIALOG" && exist.open && typeof HTMLDialogElement === "function") top = true;
    var root = document.createElement(top ? "dialog" : "div");
    root.className = "costco-pop" + (solo ? " costco-pop--solo" : "");
    root.style.zIndex = String(zIndex());
    root.innerHTML = markup();
    var prev = document.activeElement;
    var closed = false;
    function close(today) {
      if (closed) return;
      closed = true;
      if (today) {
        try { localStorage.setItem(HIDE_KEY, String(nextKstMidnight())); } catch (e) {}
      }
      document.removeEventListener("keydown", onKey, true);
      if (root.tagName === "DIALOG" && root.open) root.close();
      root.remove();
      if (prev && prev.focus) prev.focus();
    }
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(false); }
    }
    root.addEventListener("click", function (e) {
      if (e.target === root) { close(false); return; }
      var go = e.target.closest && e.target.closest(".costco-pop__go");
      if (go) {
        e.preventDefault();
        close(false);
        var form = document.getElementById("prereg-form");
        if (form && norm(location.pathname) === REGISTER) { form.scrollIntoView({ block: "start" }); return; }
        location.assign(REGISTER);
        return;
      }
      if (e.target.closest && e.target.closest("[data-today]")) close(true);
      else if (e.target.closest && e.target.closest("[data-close]")) close(false);
    });
    root.addEventListener("cancel", function (e) { e.preventDefault(); close(false); });
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(root);
    if (top && root.showModal) root.showModal();
    var goBtn = root.querySelector(".costco-pop__go");
    if (goBtn && goBtn.focus) goBtn.focus();
  }

  function boot() {
    if (skip() || hidden()) return;
    var t0 = Date.now();
    var cap = document.documentElement.hasAttribute("data-om-intro") ? 15000 : 2000;
    function tick() {
      if (opened) return;
      if (existingOpen()) { openPopup(); return; }
      if (Date.now() - t0 >= cap) { openPopup(); return; }
      window.setTimeout(tick, 60);
    }
    if (document.documentElement.hasAttribute("data-om-intro")) {
      window.addEventListener("om:intro-done", function () { t0 = Date.now(); cap = 2000; tick(); }, { once: true });
      window.setTimeout(function () { if (!opened) openPopup(); }, 15000);
      return;
    }
    tick();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
