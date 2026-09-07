/* 청라 아크원 푸르지오 · 광고 홈페이지 공통 스크립트 */
(function () {
  "use strict";

  /* 관심고객 접수 — Supabase arkone_leads 테이블에 INSERT 한다.
     INSERT 후 트리거(arkone_leads_kakao_alert)가 Edge Function(arkone-kakao-alert)을 호출해
     담당자 카카오톡으로 접수 알림이 발송된다. 이 흐름은 이미 구축·검증되어 있다.
     아래 키는 anon publishable 키이며, RLS 정책상 consent=true 인 INSERT 만 허용된다. */
  var LEAD_URL = "https://jzmktahlrwtrtejjflrw.supabase.co/rest/v1/arkone_leads";
  var LEAD_KEY = "sb_publishable_AgIXgF5snH1HQKqpnLVcvA_YienrRMO";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── 헤더 배경 전환 ─────────────────────────────── */
  var header = $(".header");
  var top = $(".hero, .subhero");
  function onScroll() {
    if (!header) return;
    var limit = top ? Math.min(top.offsetHeight - 90, window.innerHeight * 0.62) : 30;
    header.classList.toggle("solid", window.scrollY > limit);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ── 전체화면 메뉴 ─────────────────────────────── */
  var menu = $(".menu");
  var menuBtn = $("[data-menu]");
  var lastFocus = null;

  function focusables() {
    return $$("a[href], button:not([disabled])", menu);
  }
  function openMenu() {
    lastFocus = document.activeElement;
    document.body.classList.add("menu-open", "is-locked");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    if (menu) menu.setAttribute("aria-hidden", "false");
    var f = focusables();
    if (f.length) setTimeout(function () { f[0].focus(); }, 80);
  }
  function closeMenu() {
    document.body.classList.remove("menu-open", "is-locked");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    if (menu) menu.setAttribute("aria-hidden", "true");
    if (lastFocus) lastFocus.focus();
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      document.body.classList.contains("menu-open") ? closeMenu() : openMenu();
    });
  }
  $$(".menu a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (document.body.classList.contains("menu-open")) closeMenu();
      var lb = $(".lightbox.on");
      if (lb) closeBox(lb);
    }
    /* 메뉴 포커스 트랩 */
    if (e.key === "Tab" && document.body.classList.contains("menu-open") && menu) {
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ── 스크롤 등장 · 면적 바 ──────────────────────── */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("on");
        $$(".unit__bar i", en.target).forEach(function (b) {
          b.style.width = (b.getAttribute("data-w") || "60") + "%";
        });
        io.unobserve(en.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else {
    $$(".rv").forEach(function (el) { el.classList.add("on"); });
    $$(".unit__bar i").forEach(function (b) { b.style.width = (b.getAttribute("data-w") || "60") + "%"; });
  }

  /* ── FAQ 아코디언 ──────────────────────────────── */
  $$(".faq__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq__item");
      var panel = $(".faq__a", item);
      var open = item.classList.toggle("on");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
    });
  });

  /* ── 지도 크게 보기 ────────────────────────────── */
  function closeBox(lb) {
    lb.classList.remove("on");
    document.body.classList.remove("is-locked");
  }
  $$("[data-zoom]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-zoom");
      var alt = btn.getAttribute("data-zoom-alt") || "확대 이미지";
      var lb = $(".lightbox");
      if (!lb) return;
      $("img", lb).src = src;
      $("img", lb).alt = alt;
      lb.classList.add("on");
      document.body.classList.add("is-locked");
      $(".lightbox__close", lb).focus();
    });
  });
  var lbEl = $(".lightbox");
  if (lbEl) {
    lbEl.addEventListener("click", function (e) {
      if (e.target === lbEl || e.target.classList.contains("lightbox__close")) closeBox(lbEl);
    });
  }

  /* ── 주소 복사 ─────────────────────────────────── */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        var old = btn.textContent;
        btn.textContent = "복사되었습니다";
        setTimeout(function () { btn.textContent = old; }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else fallback();
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (err) { window.prompt("주소를 복사해 주세요", text); }
        document.body.removeChild(ta);
      }
    });
  });

  /* ── 관심고객등록 폼 ───────────────────────────── */
  var form = $("[data-register]");
  if (form) {
    var tel = form.querySelector("[name=phone]");
    if (tel) {
      tel.addEventListener("input", function () {
        var v = tel.value.replace(/[^0-9]/g, "").slice(0, 11);
        tel.value = v.length < 4 ? v
          : v.length < 8 ? v.slice(0, 3) + "-" + v.slice(3)
            : v.slice(0, 3) + "-" + v.slice(3, 7) + "-" + v.slice(7);
      });
    }

    function setErr(name, on, msg) {
      var f = form.querySelector("[name=" + name + "]");
      if (!f) return;
      var wrap = f.closest(".field") || f.closest(".fieldset");
      if (!wrap) return;
      wrap.classList.toggle("err", on);
      var m = $(".msg", wrap);
      if (m && msg) m.textContent = msg;
      if (on) f.setAttribute("aria-invalid", "true"); else f.removeAttribute("aria-invalid");
    }

    var busy = false;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return;

      var name = (form.querySelector("[name=name]").value || "").trim();
      var phone = (tel ? tel.value : "").replace(/[^0-9]/g, "");
      var agree = form.querySelector("[name=agree]").checked;

      var ok = true;
      if (!name) { setErr("name", true, "성함을 입력해 주세요."); ok = false; } else setErr("name", false);
      if (phone.length < 10) { setErr("phone", true, "연락처를 정확히 입력해 주세요."); ok = false; } else setErr("phone", false);
      if (!agree) {
        var box = form.querySelector("[data-agree-wrap]");
        if (box) box.classList.add("err");
        ok = false;
      }
      if (!ok) {
        var first = form.querySelector(".err input, .err select");
        if (first) first.focus();
        return;
      }

      var region = (form.querySelector("[name=region]") || {}).value || "";
      var productEl = form.querySelector("[name=product]:checked");
      var record = {
        name: name,
        phone: tel.value,
        product: productEl ? productEl.value : "undecided",
        consent: true,
        source: "web" + location.pathname + (region ? " · " + region : "") +
          (form.querySelector("[name=marketing]").checked ? " · 마케팅동의" : ""),
        user_agent: (navigator.userAgent || "").slice(0, 300),
      };

      busy = true;
      var btn = form.querySelector("button[type=submit]");
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "접수 중…";

      function finish(success) {
        busy = false;
        btn.disabled = false;
        btn.textContent = label;
        if (!success) {
          alert("접수 중 오류가 발생했습니다.\n대표번호 1833-3872로 문의해 주세요.");
          return;
        }
        form.reset();
        var okBox = $("[data-register-done]");
        if (okBox) {
          form.style.display = "none";
          okBox.classList.add("on");
          okBox.setAttribute("tabindex", "-1");
          okBox.focus();
        } else {
          alert("관심고객 등록이 완료되었습니다.\n담당자가 확인 후 안내드리겠습니다.");
        }
      }

      fetch(LEAD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: LEAD_KEY,
          Authorization: "Bearer " + LEAD_KEY,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(record),
      }).then(function (r) {
        if (!r.ok) {
          return r.text().then(function (t) {
            if (window.console) console.error("[register]", r.status, t);
            finish(false);
          });
        }
        finish(true);
      }).catch(function (e) {
        if (window.console) console.error("[register]", e);
        finish(false);
      });
    });

    form.addEventListener("change", function (e) {
      if (e.target.name === "agree" && e.target.checked) {
        var box = form.querySelector("[data-agree-wrap]");
        if (box) box.classList.remove("err");
      }
    });
  }
})();
