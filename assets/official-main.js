/* official-main.js — 공식 메인 복제 구간(.om)의 동작. 두 저장소(D1·D2)가 같은 파일을 쓴다.
   원본: 직원 사이트 A의 official-main.tsx (arkone-cheongna-staff design/v2-20261004 2d5bd6a)의 훅을 보통 자바스크립트로 옮겼다.
   - 인트로(.om-intro), PC 오른쪽 구간 표시(.om-nav), 홍보영상 창(.om-modal)은 여기서 만든다.
   - PC(1025px 이상, 「동작 줄이기」아님)에서는 휠·키보드 한 번에 한 장면씩(15장면 + 기존 본문). 휴대폰은 일반 스크롤.
   - 장면 이동은 좌표를 계산해 window.scrollTo 로 한다(사이트의 scroll-padding-top 영향을 받지 않게).
   - 팝업·전체 메뉴·영상 창이 열려 있는 동안에는 장면을 넘기지 않는다.
   - 사이트 틀의 실제 높이를 --om-util, --om-hd, --om-vh, --om-scale 로 넘긴다. 표시 줄이 화면에 남은 높이는 html 의 --om-util-rest 로 넘긴다(고정 헤더가 있는 사이트가 쓴다).
   - 헤더 상태는 html[data-om-hd="clear|plain"] 로 알린다. 인트로 동안에는 html[data-om-intro] 가 걸린다. 인트로가 끝나면 om:intro-done 이벤트를 낸다. */
(function () {
  "use strict";
  var root = document.querySelector("[data-official-main]");
  if (!root) return;
  var html = document.documentElement;
  var MAIN = "https://arkone-prugio.com/resources/img/pages/main/";
  var YOUTUBE_ID = "OPf_5C5WaJY";
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
  var PC = window.matchMedia("(min-width: 1025px)");
  var SCENE_MS = 1000;
  var SECTIONS = ["hero", "overview", "location", "history", "premium", "brand", "contact", "site-info"];
  var SCENES = [
    { sec: "hero", step: "hero-final" },
    { sec: "hero", step: "hero-definition" },
    { sec: "overview", step: "overview-mask" },
    { sec: "overview", step: "overview-content" },
    { sec: "location", step: "location-01" },
    { sec: "location", step: "location-02" },
    { sec: "history", step: "history-01" },
    { sec: "history", step: "history-02" },
    { sec: "premium", step: "premium-01" },
    { sec: "premium", step: "premium-02" },
    { sec: "premium", step: "premium-03" },
    { sec: "brand", step: "brand-01" },
    { sec: "brand", step: "brand-02" },
    { sec: "brand", step: "brand-03" },
    { sec: "contact", step: "contact-01" },
    { sec: "site-info", step: "info-01" }
  ];
  var NAV_ITEMS = [
    { sec: "hero", label: "HERO" },
    { sec: "overview", label: "OVERVIEW" },
    { sec: "location", label: "LOCATION" },
    { sec: "history", label: "HISTORY" },
    { sec: "premium", label: "PREMIUM" },
    { sec: "brand", label: "BRAND" },
    { sec: "contact", label: "CONTACT" }
  ];

  function sectionEl(id) {
    return id === "site-info" ? document.getElementById("site-info") : document.getElementById("om-" + id);
  }
  function docTop(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    if (children) for (var i = 0; i < children.length; i++) e.appendChild(typeof children[i] === "string" ? document.createTextNode(children[i]) : children[i]);
    return e;
  }

  var state = {
    reduced: REDUCED.matches,
    pc: PC.matches,
    stage: false,
    flow: false,
    intro: false,
    scene: 0,
    busy: false,
    timer: 0,
    define: false,
    visual: 0,
    visualTimer: 0
  };

  /* ── 사이트 틀의 실제 높이를 CSS 변수로 (useChromeVars) ─────────────────────── */
  var utilEl = document.querySelector(".om-util");
  var headerEl = document.querySelector("header.header");
  function syncChromeVars() {
    root.style.setProperty("--om-util", (utilEl ? utilEl.offsetHeight : 0) + "px");
    root.style.setProperty("--om-hd", (headerEl ? headerEl.offsetHeight : 0) + "px");
    root.style.setProperty("--om-vh", window.innerHeight + "px");
    root.style.setProperty("--om-scale", String(html.clientWidth / 1920));
    syncUtilRest();
  }
  function syncUtilRest() {
    var h = utilEl ? utilEl.offsetHeight : 0;
    html.style.setProperty("--om-util-rest", Math.max(0, h - window.scrollY) + "px");
  }

  /* ── 인트로 (Intro) ─────────────────────────────────────────────────────── */
  var introEl = null;
  var introTimers = [];
  function startIntro() {
    state.intro = true;
    html.setAttribute("data-om-intro", "1");
    root.classList.add("om--intro");
    var video = el("video", { class: "om-intro__video", autoplay: "", muted: "", loop: "", playsinline: "", preload: "auto" }, [
      el("source", { src: MAIN + "intro_video_2.mp4", type: "video/mp4" })
    ]);
    video.muted = true;
    var skip = el("button", { type: "button", class: "om-intro__skip", lang: "en", "aria-label": "인트로 건너뛰기" }, ["SKIP"]);
    skip.addEventListener("click", endIntro);
    introEl = el("div", { class: "om-intro is-loading", "aria-label": "청라 아크원 푸르지오 인트로", "aria-hidden": "true" }, [
      el("div", { class: "om-intro__loading" }, [
        el("span", { class: "om-intro__loading_indicator" }),
        el("span", { class: "om-intro__loading_label", lang: "en" }, ["LOADING"])
      ]),
      el("div", { class: "om-intro__scene" }, [
        video,
        el("span", { class: "om-intro__dim" }),
        el("div", { class: "om-intro__copy om-intro__copy-01" }, [el("p", { class: "om-intro__phrase" }, ["청라의 정점을 빛내는"])]),
        el("div", { class: "om-intro__copy om-intro__copy-02" }, [el("p", { class: "om-intro__title" }, ["푸르지오의 완성"])]),
        el("div", { class: "om-intro__copy om-intro__copy-03" }, [
          el("p", { class: "om-intro__kicker" }, ["청라 아크원 푸르지오"]),
          el("p", { class: "om-intro__brand", lang: "en" }, ["CHEONG NA ARK-ONE PRUGIO"])
        ])
      ]),
      skip
    ]);
    root.insertBefore(introEl, root.firstChild);
    introTimers.push(window.setTimeout(function () {
      if (!introEl) return;
      introEl.classList.remove("is-loading");
      introEl.classList.add("is-playing");
      video.play().catch(function () {});
    }, 350));
    introTimers.push(window.setTimeout(endIntro, 5600));
  }
  function endIntro() {
    if (!state.intro) return;
    state.intro = false;
    introTimers.forEach(function (t) { window.clearTimeout(t); });
    introTimers = [];
    if (introEl && introEl.parentNode) introEl.parentNode.removeChild(introEl);
    introEl = null;
    root.classList.remove("om--intro");
    html.removeAttribute("data-om-intro");
    window.dispatchEvent(new CustomEvent("om:intro-done"));
  }

  /* ── 구간 표시 (om-nav) ──────────────────────────────────────────────────── */
  var navButtons = [];
  var nav = (function () {
    var ol = el("ol");
    NAV_ITEMS.forEach(function (item) {
      var b = el("button", { type: "button", "aria-label": item.label + " 구간으로 이동" }, [el("span", { class: "om-blind" }, [item.label])]);
      b.addEventListener("click", function () { goTo(item.sec); });
      navButtons.push({ sec: item.sec, button: b });
      ol.appendChild(el("li", null, [b]));
    });
    return el("nav", { class: "om-nav", "aria-label": "메인 구간 바로가기" }, [ol]);
  })();
  function syncNav() {
    var cur = SCENES[state.scene].sec;
    navButtons.forEach(function (n) {
      var on = state.stage && n.sec === cur;
      n.button.classList.toggle("is-active", on);
      if (on) n.button.setAttribute("aria-current", "true"); else n.button.removeAttribute("aria-current");
    });
  }

  /* ── 홍보영상 창 (VideoModal) ───────────────────────────────────────────── */
  var modal = null;
  function openVideo() {
    if (modal) return;
    var iframe = el("iframe", {
      title: "청라 아크원 홍보영상",
      src: "https://www.youtube-nocookie.com/embed/" + YOUTUBE_ID + "?autoplay=1&rel=0&playsinline=1",
      allow: "autoplay; encrypted-media",
      allowfullscreen: ""
    });
    var close = el("button", { type: "button", class: "om-modal__close", "aria-label": "닫기" }, ["×"]);
    var frame = el("div", { class: "om-modal__frame" }, [iframe, close]);
    frame.addEventListener("click", function (e) { e.stopPropagation(); });
    close.addEventListener("click", closeVideo);
    modal = el("div", { class: "om-modal", role: "dialog", "aria-modal": "true", "aria-label": "청라 아크원 홍보영상" }, [frame]);
    modal.addEventListener("click", closeVideo);
    root.appendChild(modal);
    window.addEventListener("keydown", onModalKey);
  }
  function closeVideo() {
    if (!modal) return;
    modal.parentNode.removeChild(modal);
    modal = null;
    window.removeEventListener("keydown", onModalKey);
  }
  function onModalKey(e) { if (e.key === "Escape") closeVideo(); }
  var trigger = root.querySelector(".om-hero__video_trigger");
  if (trigger) trigger.addEventListener("click", openVideo);

  /* 팝업·전체 메뉴·영상 창·지도 창이 열려 있으면 장면을 넘기지 않는다 */
  function isVisible(e) {
    if (!e) return false;
    var cs = window.getComputedStyle(e);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    var r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function isBlocked() {
    if (modal) return true;
    var dialogs = document.querySelectorAll(".prereg-popup, .prereg-pop, .lightbox.on, [role=\"dialog\"]");
    for (var i = 0; i < dialogs.length; i++) if (isVisible(dialogs[i])) return true;
    if (document.body.classList.contains("menu-open") || document.body.classList.contains("is-locked") || document.body.classList.contains("prereg-lock")) return true;
    var gnav = document.getElementById("global-nav");
    if (gnav && gnav.classList.contains("open")) return true;
    return false;
  }

  /* 이벤트 팝업(prereg.js)은 열려 있는 동안 body 를 고정(D2: position:fixed, D1: .prereg-lock)하고 닫을 때 푼다.
     광고 차단 확장 등이 팝업을 숨기면(display:none) 사용자가 닫을 수 없어 잠금만 남고 스크롤이 전혀 되지 않는다(크롬에서만 막히는 원인).
     팝업이 보이지 않는데 잠금만 남아 있으면 팝업의 닫기와 같은 방식으로 푼다. prereg.js 는 건드리지 않는다. */
  function releaseStaleLock() {
    var body = document.body;
    var locked = body.style.position === "fixed" || body.classList.contains("prereg-lock");
    if (!locked) return false;
    var pops = document.querySelectorAll(".prereg-popup, .prereg-pop");
    for (var i = 0; i < pops.length; i++) if (isVisible(pops[i])) return false;
    for (var j = 0; j < pops.length; j++) if (pops[j].parentNode) pops[j].parentNode.removeChild(pops[j]);
    body.classList.remove("prereg-lock");
    if (body.style.position === "fixed") {
      var y = Number(body.dataset.preregScroll || 0);
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      window.scrollTo(0, y);
    }
    return true;
  }
  window.addEventListener("touchstart", releaseStaleLock, { passive: true });
  window.addEventListener("om:intro-done", function () { window.setTimeout(releaseStaleLock, 1500); });

  /* ── 장면 (useScenes, stepOf) ───────────────────────────────────────────── */
  function stepOf(sec, scene) {
    var cur = SCENES[scene];
    if (cur.sec === sec) return cur.step;
    var idxs = [];
    SCENES.forEach(function (s, i) { if (s.sec === sec) idxs.push(i); });
    return scene > idxs[idxs.length - 1] ? SCENES[idxs[idxs.length - 1]].step : SCENES[idxs[0]].step;
  }
  function render() {
    var cur = SCENES[state.scene];
    for (var i = 0; i < SECTIONS.length - 1; i++) {
      var sec = SECTIONS[i];
      var e = sectionEl(sec);
      if (!e) continue;
      if (state.stage) {
        e.classList.toggle("is-active", cur.sec === sec);
        e.setAttribute("data-step", stepOf(sec, state.scene));
      } else {
        e.classList.remove("is-active");
        if (sec === "hero") e.setAttribute("data-step", state.define ? "hero-definition" : "hero-final");
        else e.removeAttribute("data-step");
      }
    }
    syncNav();
    syncHeader();
    syncVisual();
  }
  function lock() {
    state.busy = true;
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(function () { state.busy = false; }, SCENE_MS);
  }
  // 원본(React)은 장면 상태를 바꾼 직후 스크롤을 시작하고, 화면(is-active·data-step)은 다음 렌더 주기(약 80ms 뒤)에 반영된다.
  // 같은 순서·시점이 되도록 스크롤은 바로, 화면 반영은 RENDER_MS 뒤에 한다(장면 안의 단계별 등장 시점이 원본과 같아진다).
  var RENDER_MS = 120;
  var renderTimer = 0;
  // 부드러운 스크롤이 SETTLE_MS 안에 시작되지 않으면(다른 입력에 끊기는 등) 목표 위치로 바로 옮긴다. 정상 동작에는 영향이 없다.
  var SETTLE_MS = 350;
  var settleTimer = 0;
  function jumpTo(top) {
    // 사이트 전역의 scroll-behavior:smooth 를 잠깐 끄고 바로 옮긴다
    var prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, top);
    html.style.scrollBehavior = prevBehavior;
  }
  function apply(next) {
    var prev = state.scene;
    state.scene = next;
    if (SCENES[next].sec !== SCENES[prev].sec) {
      var e = sectionEl(SCENES[next].sec);
      if (e) {
        var target = SCENES[next].sec === "hero" ? 0 : Math.round(docTop(e));
        var from = window.scrollY;
        window.scrollTo({ top: target, behavior: "smooth" });
        window.clearTimeout(settleTimer);
        if (Math.abs(target - from) > 2) settleTimer = window.setTimeout(function () {
          if (Math.abs(window.scrollY - from) < 2 && Math.abs(window.scrollY - target) > 2) jumpTo(target);
        }, SETTLE_MS);
      }
    }
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(render, RENDER_MS);
  }
  function go(dir) {
    var next = state.scene + dir;
    if (next < 0 || next >= SCENES.length || state.busy) return false;
    lock();
    apply(next);
    return true;
  }
  function goTo(sec) {
    var idx = -1;
    for (var i = 0; i < SCENES.length; i++) if (SCENES[i].sec === sec) { idx = i; break; }
    if (idx < 0) return;
    lock();
    apply(idx);
  }
  function scrollBox(target, dir) {
    var box = target && target.closest ? target.closest("[data-free-scroll]") : null;
    if (!box) return null;
    if (dir === 1) return box.scrollTop + box.clientHeight < box.scrollHeight - 2 ? box : null;
    return box.scrollTop > 2 ? box : null;
  }
  function onWheel(e) {
    releaseStaleLock();
    if (!state.stage) return;
    if (isBlocked()) return;
    if (e.ctrlKey || Math.abs(e.deltaY) < 4) return;
    if (state.intro) { e.preventDefault(); return; }
    var dir = e.deltaY > 0 ? 1 : -1;
    var cur = SCENES[state.scene];
    if (cur.sec === "site-info") {
      // 기존 본문과 푸터는 일반 스크롤. 맨 위에서 위로 올리면 오시는 길로 돌아간다.
      var info = sectionEl("site-info");
      var top = info ? docTop(info) : 0;
      if (dir === 1 || window.scrollY > top + 2) return;
    }
    e.preventDefault();
    if (state.busy) return;
    var box = scrollBox(e.target, dir);
    if (box) {
      // 구간 안의 긴 패널(브랜드 3)은 한 번에 한 화면씩 그 안에서 먼저 움직인다
      lock();
      box.scrollBy({ top: dir * box.clientHeight * 0.92, behavior: "smooth" });
      return;
    }
    go(dir);
  }
  function onKey(e) {
    releaseStaleLock();
    if (!state.stage || state.intro) return;
    if (isBlocked()) return;
    var t = e.target;
    if (t && t.closest && (t.closest("input, textarea, select, [contenteditable]") || t.closest("[role=\"dialog\"]"))) return;
    if (SCENES[state.scene].sec === "site-info") return;
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      go(-1);
    }
  }
  // 스크롤 막대·링크로 움직였을 때: 화면 가운데에 있는 구간으로 장면을 맞춘다
  function onScrollStage() {
    if (!state.stage || state.busy) return;
    var y = window.scrollY + window.innerHeight / 2;
    var sec = SECTIONS[0];
    for (var i = 0; i < SECTIONS.length; i++) {
      var e = sectionEl(SECTIONS[i]);
      if (e && docTop(e) <= y) sec = SECTIONS[i];
    }
    if (sec !== SCENES[state.scene].sec) {
      for (var j = 0; j < SCENES.length; j++) if (SCENES[j].sec === sec) { state.scene = j; break; }
      render();
    }
  }
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);
  window.addEventListener("scroll", onScrollStage, { passive: true });

  var scrollLink = root.querySelector(".om-hero__scroll");
  if (scrollLink) scrollLink.addEventListener("click", function (e) {
    if (state.stage) { e.preventDefault(); goTo("overview"); }
  });

  /* ── 헤더: 히어로 영상 위에서는 투명(흰 글자), 아크원이란? 에서는 투명(어두운 글자), 그 밖은 지금 헤더 ── */
  function syncHeader() {
    var mode = "";
    if (state.stage) {
      var step = SCENES[state.scene].step;
      mode = step === "hero-final" ? "clear" : step === "hero-definition" ? "plain" : "";
    } else if (state.flow) {
      var hero = sectionEl("hero");
      var limit = (hero ? hero.offsetHeight : 0) - window.innerHeight * 0.6;
      mode = window.scrollY < Math.max(limit, 40) ? (state.define ? "plain" : "clear") : "";
    }
    if (mode) html.setAttribute("data-om-hd", mode);
    else html.removeAttribute("data-om-hd");
  }
  window.addEventListener("scroll", function () { syncHeader(); syncUtilRest(); }, { passive: true });

  /* ── 히어로 영상: 화면 폭으로 고른다. 「동작 줄이기」면 받지 않는다 ─────────── */
  var heroVideo = root.querySelector(".om-hero__video");
  function syncHeroVideo() {
    if (!heroVideo || state.reduced) return;
    var src = MAIN + (state.pc ? "hero_video_3.mp4" : "hero_video_m_2.mp4");
    if (heroVideo.getAttribute("src") !== src) {
      heroVideo.setAttribute("src", src);
      heroVideo.preload = "auto";
      heroVideo.load();
    }
    heroVideo.muted = true;
    heroVideo.play().catch(function () {});
  }

  /* ── 프리미엄·브랜드 영상: 보일 때만 받아 재생 (LazyVideo) ────────────────── */
  var lazyVideos = Array.prototype.filter.call(root.querySelectorAll("video"), function (v) {
    return v !== heroVideo && !v.classList.contains("om-intro__video");
  });
  lazyVideos.forEach(function (v) { v.muted = true; });
  var lazyIO = null;
  function syncLazyVideos() {
    if (lazyIO) { lazyIO.disconnect(); lazyIO = null; }
    if (state.reduced || !("IntersectionObserver" in window)) return;
    lazyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (v.preload === "none") v.preload = "auto";
          v.play().catch(function () {});
        } else v.pause();
      });
    }, { threshold: 0.2 });
    lazyVideos.forEach(function (v) { lazyIO.observe(v); });
  }

  /* ── 프리미엄 첫 장면의 왼쪽 사진은 공식처럼 번갈아 보인다 ────────────────── */
  var visuals = root.querySelectorAll(".om-premium__intro_image-visual");
  function paintVisual() {
    for (var i = 0; i < visuals.length; i++) visuals[i].classList.toggle("is-current", i === state.visual);
  }
  function syncVisual() {
    var on = state.stage && SCENES[state.scene].step === "premium-01";
    if (on && !state.visualTimer) {
      state.visualTimer = window.setInterval(function () { state.visual = (state.visual + 1) % 3; paintVisual(); }, 3200);
    } else if (!on && state.visualTimer) {
      window.clearInterval(state.visualTimer);
      state.visualTimer = 0;
    }
  }

  /* ── 휴대폰: 아크원이란? 장면이 화면에 들어오면 히어로가 두 번째 상태로 (useMobileHeroDefine) ── */
  var defineIO = null;
  function syncDefine() {
    if (defineIO) { defineIO.disconnect(); defineIO = null; }
    var on = state.flow && !state.reduced;
    if (!on) { if (state.define) { state.define = false; render(); } return; }
    var target = root.querySelector("[data-hero-definition-scene]");
    if (!target || !("IntersectionObserver" in window)) return;
    defineIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var d = en.intersectionRatio >= 0.12;
        if (d !== state.define) { state.define = d; render(); }
      });
    }, { threshold: [0, 0.12, 0.3] });
    defineIO.observe(target);
  }

  /* ── 휴대폰: 히스토리 연표를 세로 스크롤에 맞춰 옆으로 (useMobileHistoryTrack) ── */
  var timeline = root.querySelector("[data-history-timeline]");
  var track = root.querySelector("[data-history-track]");
  var trackOn = false;
  var trackRaf = 0;
  function updateTrack() {
    trackRaf = 0;
    if (!trackOn || !timeline || !track) return;
    var rect = timeline.getBoundingClientRect();
    var travel = timeline.offsetHeight - window.innerHeight;
    var p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 1;
    var max = Math.max(0, track.scrollWidth - timeline.clientWidth);
    track.style.transform = "translate3d(" + (-p * max) + "px, 0, 0)";
  }
  function onTrackScroll() { if (trackOn && !trackRaf) trackRaf = window.requestAnimationFrame(updateTrack); }
  window.addEventListener("scroll", onTrackScroll, { passive: true });
  function syncTrack() {
    var on = state.flow && !state.reduced && timeline && track;
    if (on === trackOn) { if (on) updateTrack(); return; }
    trackOn = !!on;
    if (trackOn) updateTrack();
    else if (track) track.style.transform = "";
  }

  /* ── 모드: PC 장면 전환(om--stage) / 일반 스크롤(om--flow) ─────────────────── */
  function syncMode() {
    state.reduced = REDUCED.matches;
    state.pc = PC.matches;
    var stage = state.pc && !state.reduced;
    var changed = stage !== state.stage;
    state.stage = stage;
    state.flow = !stage;
    root.classList.toggle("om--stage", state.stage);
    root.classList.toggle("om--flow", state.flow);
    if (changed) {
      state.scene = 0;
      state.busy = false;
      window.clearTimeout(state.timer);
    }
    render();
    syncHeroVideo();
    syncLazyVideos();
    syncDefine();
    syncTrack();
  }
  function onResize() {
    syncChromeVars();
    syncMode();
  }

  /* ── 시작 ──────────────────────────────────────────────────────────────── */
  root.insertBefore(nav, root.firstChild);
  syncChromeVars();
  paintVisual();
  if (!state.reduced) startIntro();
  syncMode();
  window.addEventListener("resize", onResize);
  window.addEventListener("load", syncChromeVars);
  if (PC.addEventListener) { PC.addEventListener("change", onResize); REDUCED.addEventListener("change", onResize); }
  else if (PC.addListener) { PC.addListener(onResize); REDUCED.addListener(onResize); }
  if (state.reduced) window.setTimeout(function () { window.dispatchEvent(new CustomEvent("om:intro-done")); }, 0);
})();
