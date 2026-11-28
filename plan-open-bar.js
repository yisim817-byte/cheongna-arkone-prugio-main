/* 상단 배너. 작업지시서 30: 본사(hq)는 사전고객등록 선택 메뉴. 직원(staff) 줄은 그대로. */
(function () {
  'use strict';
  if (window.__planOpenBar) return;
  window.__planOpenBar = 1;
  if (/\/admin|\/login/i.test(location.pathname)) return;
  var KEY = 'topBar_20261128';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  var s = document.currentScript;
  var MODE = (s && s.getAttribute('data-mode')) || 'hq';
  var PHONE = (s && s.getAttribute('data-phone')) || '1833-3872';
  var TEL = 'tel:' + String(PHONE).replace(/\D/g, '');
  function path() {
    var p = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
    return p || '/';
  }
  function pastKst(y, m, d, hh, mm, ss) {
    return Date.now() > Date.UTC(y, m - 1, d, hh - 9, mm, ss);
  }
  function run() {
    if (document.getElementById('plan-open-bar')) return;
    var p = path();
    var rows = [];
    var menuHtml = '';
    if (MODE === 'staff') {
      if (p !== '/visit') {
        rows.push({ cls: 'pob-lg', href: TEL, text: '전화로 방문고객등록 후 모델하우스 방문 시 스타벅스 커피 쿠폰 증정 · ' + PHONE + ' ›' });
      }
    } else {
      var coupon = !pastKst(2026, 12, 5, 23, 59, 59);
      var fcfs = !pastKst(2026, 12, 26, 23, 59, 59);
      var aptHref = fcfs ? '/register?product=apt&src=fcfs1226' : '/register?product=apt';
      var aptSmall = fcfs ? '<small>12.26(토) 선착순 고객등록 포함</small>' : '';
      var txt = coupon
        ? '<span class="pc">사전고객등록·방문예약 후 모델하우스 방문 시 </span><b>스타벅스 커피 쿠폰 증정</b> (~12.5 토)'
        : '<span class="pc">청라 아크원 푸르지오 사전고객등록 · 방문예약</span><span class="mo">청라 아크원 푸르지오</span>';
      menuHtml = '<div id="pob-menu" class="pob-menu" role="menu" hidden>' +
        '<p>등록하실 상품을 선택해 주세요</p>' +
        '<a role="menuitem" href="' + aptHref + '"><span>아파트 사전고객등록' + aptSmall + '</span><em>›</em></a>' +
        '<a role="menuitem" href="/register?product=officetel"><span>오피스텔 사전고객등록</span><em>›</em></a>' +
        '<a role="menuitem" href="/register?product=commercial"><span>상가 사전고객등록</span><em>›</em></a></div>';
      rows.push({
        cls: 'pob-lg pob-lg--split',
        html: '<span class="pob-lg__txt">' + txt + '</span>' +
          '<span class="pob-lg__btns"><span class="pob-sel">' +
          '<button type="button" class="pob-btn pob-btn--sel" aria-haspopup="menu" aria-expanded="false" aria-controls="pob-menu">' +
          '<span class="pc">사전고객등록</span><span class="mo">사전등록</span> ▾</button>' + menuHtml +
          '</span><a class="pob-btn" href="/visit"><span class="pc">방문예약 ›</span><span class="mo">방문예약 ›</span></a></span>'
      });
    }
    if (!pastKst(2026, 11, 28, 23, 59, 59) && p !== '/103b') {
      rows.push({ cls: 'pob-sm', href: '/103b', text: '11.28(토) 103㎡B 선착순 · 예비당첨자 추첨 예정 · 안내 보기 ›' });
    } else if (MODE !== 'staff' && !pastKst(2026, 12, 26, 23, 59, 59)) {
      rows.push({ cls: 'pob-sm', href: '/register?product=apt&src=fcfs1226', text: '12.26(토) 아파트 선착순 계약 예정 · 선착순 고객등록 ›' });
    }
    if (p !== '/compare') {
      rows.push({ cls: 'pob-sm', href: '/compare', text: '아파트 vs 오피스텔 비교 · 가격·넓이·청약자격·전매 한눈에 ›' });
    }
    if (!rows.length) return;
    var css = document.createElement('style');
    css.textContent = ''
      + '#plan-open-bar{position:fixed;top:0;left:0;right:0;z-index:2147483100;display:flex;flex-direction:column;background:#0f2a26;color:#fff;font-family:"Pretendard","Noto Sans KR","Apple SD Gothic Neo",sans-serif;box-shadow:0 1px 0 rgba(0,0,0,.12);max-width:100%}'
      + '#plan-open-bar a{color:#fff;text-decoration:none}'
      + '#plan-open-bar a.pob-lg{display:flex;align-items:center;justify-content:center;text-align:center;min-height:46px;padding:0 44px;box-sizing:border-box;width:100%;font-size:15px;font-weight:700}'
      + '#plan-open-bar a.pob-sm{display:flex;align-items:center;justify-content:center;text-align:center;min-height:34px;padding:0 44px;box-sizing:border-box;width:100%;font-size:13px;font-weight:600;background:#173a34;border-top:1px solid rgba(255,255,255,.08)}'
      + '#plan-open-bar .pob-lg--split{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 14px;box-sizing:border-box;width:100%;min-height:46px;padding:6px 48px;font-size:14px;font-weight:700;line-height:1.3;text-align:center}'
      + '#plan-open-bar .pob-lg__txt{min-width:0;max-width:100%}#plan-open-bar .pob-lg__txt b{color:#e8c98f}'
      + '#plan-open-bar .pob-lg__btns{display:flex;flex:none;gap:8px;align-items:center;max-width:100%}'
      + '#plan-open-bar .pob-btn, #plan-open-bar button.pob-btn{display:inline-flex;align-items:center;justify-content:center;width:auto;height:30px;min-height:30px;padding:0 14px;border:0;border-radius:15px;background:#e9e3d6;color:#1c2b28;font-size:13px;font-weight:700;white-space:nowrap;line-height:1;cursor:pointer;font-family:inherit;text-decoration:none}'
      + '#plan-open-bar .pob-btn--sel{background:#e8c98f}'
      + '#plan-open-bar .mo{display:none}'
      + '#plan-open-bar .pob-sel{position:relative}'
      + '#plan-open-bar .pob-menu{position:absolute;top:38px;left:50%;transform:translateX(-50%);width:300px;background:#fff;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.35);color:#1c2b28;z-index:2;text-align:left}'
      + '#plan-open-bar .pob-menu[hidden]{display:none}'
      + '#plan-open-bar .pob-menu p{margin:0;font-size:12px;font-weight:500;color:#6a6f6d;padding:12px 16px 6px}'
      + '#plan-open-bar .pob-menu a{display:flex;justify-content:space-between;align-items:center;width:auto;padding:13px 16px;border-top:1px solid #eee;color:#1c2b28;font-weight:700;font-size:15px;background:#fff}'
      + '#plan-open-bar .pob-menu a small{display:block;font-weight:500;font-size:12px;color:#c3395a;margin-top:2px}'
      + '#plan-open-bar .pob-menu a em{font-style:normal;color:#9aa19e}'
      + '#plan-open-bar .pob-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:0}'
      + '#plan-open-bar .pob-bg[hidden]{display:none}'
      + '#plan-open-bar .pob-x{position:absolute;right:8px;top:8px;z-index:3;background:none;border:0;color:#fff;font-size:22px;line-height:1;width:36px;height:36px;cursor:pointer}'
      + '@media(max-width:768px){#plan-open-bar .pc{display:none}#plan-open-bar .mo{display:inline}#plan-open-bar .pob-lg--split{justify-content:space-between;gap:8px;padding:8px 40px 8px 12px;font-size:12px}#plan-open-bar .pob-btn,#plan-open-bar button.pob-btn{height:28px;min-height:28px;padding:0 10px;font-size:12px}#plan-open-bar a.pob-sm{font-size:12.5px;padding:6px 36px 6px 10px;height:auto}#plan-open-bar .pob-menu{position:fixed;top:auto;bottom:0;left:0;right:0;transform:none;width:auto;border-radius:16px 16px 0 0}}'
      + 'html.pob-on body{padding-top:var(--pob-h,140px)!important}';
    document.head.appendChild(css);
    var bar = document.createElement('div');
    bar.id = 'plan-open-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', '방문·일정·비교 안내');
    bar.innerHTML = '<div class="pob-bg" hidden></div>' + rows.map(function (r) {
      if (r.html) return '<div class="' + r.cls + '">' + r.html + '</div>';
      return '<a class="' + r.cls + '" href="' + r.href + '">' + r.text + '</a>';
    }).join('') + '<button type="button" class="pob-x" aria-label="닫기">×</button>';
    document.documentElement.appendChild(bar);
    document.documentElement.classList.add('pob-on');
    var moved = [];
    function shift() {
      var h = bar.offsetHeight || 0;
      document.documentElement.style.setProperty('--pob-h', h + 'px');
      var els = document.body.querySelectorAll('header,[class*=header],[class*=Header],[id*=header]');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el === bar || el.__pob) continue;
        var cs = getComputedStyle(el);
        if ((cs.position === 'fixed' || cs.position === 'sticky') && (parseFloat(cs.top) === 0 || cs.top === '0px') && el.offsetHeight > 0 && el.offsetHeight < 220) {
          el.__pob = 1;
          el.style.setProperty('top', h + 'px', 'important');
          moved.push(el);
        }
      }
    }
    shift();
    setTimeout(shift, 400);
    setTimeout(shift, 1600);
    window.addEventListener('resize', shift);
    bar.querySelector('.pob-x').onclick = function () {
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
      bar.remove();
      document.documentElement.classList.remove('pob-on');
      document.documentElement.style.removeProperty('--pob-h');
      moved.forEach(function (el) { el.style.removeProperty('top'); });
    };
    var sel = bar.querySelector('.pob-btn--sel');
    var menu = bar.querySelector('#pob-menu');
    var shade = bar.querySelector('.pob-bg');
    function setMenu(open) {
      if (!menu || !sel) return;
      menu.hidden = !open;
      sel.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (shade) shade.hidden = !open;
      if (open && window.ArkPopupWO30) window.ArkPopupWO30.close();
      if (open) {
        var first = menu.querySelector('[role="menuitem"]');
        if (first) first.focus();
      }
    }
    if (sel && menu) {
      sel.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setMenu(menu.hidden);
      });
      menu.addEventListener('keydown', function (e) {
        var items = Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]'));
        var i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        else if (e.key === 'Escape') { e.preventDefault(); setMenu(false); sel.focus(); }
      });
      document.addEventListener('click', function (e) {
        if (menu.hidden) return;
        if (!bar.contains(e.target)) setMenu(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu && !menu.hidden) { setMenu(false); sel.focus(); }
      });
      if (shade) shade.addEventListener('click', function () { setMenu(false); });
    }
  }
  if (document.readyState === 'complete') setTimeout(run, 50);
  else window.addEventListener('load', function () { setTimeout(run, 50); });
})();
