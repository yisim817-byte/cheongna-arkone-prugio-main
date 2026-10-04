/* 사전등록 완료 — 카카오톡으로 접수확인 저장 (2026-10-04)
 * 카카오 개발자 앱 1564100의 JavaScript 키(브라우저 공개용, 등록 도메인에서만 동작).
 * 카카오 공유가 안 되면 기기 공유 → 클립보드 복사 순으로 대체한다. */
(function () {
  var KEY = "203cb59ee380ba085e5c3076443b93d4";
  var SDK = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
  var PHONE = (window.PREREG_CONFIG && window.PREREG_CONFIG.PHONE) || "1833-3872";
  var loading = null;

  function load() {
    if (window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()) return Promise.resolve(window.Kakao);
    if (loading) return loading;
    loading = new Promise(function (resolve) {
      function ready() {
        try { if (!window.Kakao.isInitialized()) window.Kakao.init(KEY); resolve(window.Kakao); }
        catch (e) { resolve(null); }
      }
      if (window.Kakao) return ready();
      var s = document.createElement("script");
      s.src = SDK; s.async = true; s.crossOrigin = "anonymous";
      s.onload = ready; s.onerror = function () { loading = null; resolve(null); };
      document.head.appendChild(s);
    });
    return loading;
  }

  function text(receipt, at) {
    return "[청라 아크원 푸르지오] 사전등록 완료되었습니다.\n접수번호 " + receipt + (at ? " · 접수시각 " + at : "") + "\n고객등록 확인은 대표번호 " + PHONE;
  }

  function share(receipt, at, note) {
    var url = location.origin + "/";
    var body = text(receipt, at);
    var k = window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized() ? window.Kakao : null;
    if (k) {
      try {
        k.Share.sendDefault({ objectType: "text", text: body, link: { mobileWebUrl: url, webUrl: url }, buttonTitle: "현장 홈페이지" });
        return;
      } catch (e) { /* 대체 경로 */ }
    }
    if (navigator.share) {
      navigator.share({ title: "청라 아크원 푸르지오 사전등록", text: body + "\n" + url }).catch(function () {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(body + "\n" + url).then(function () {
        note.textContent = "접수 내용이 복사되었습니다. 카카오톡 '나와의 채팅'에 붙여 넣어 보관하세요.";
      }, function () { note.textContent = "이 화면을 캡처해 보관해 주세요."; });
      return;
    }
    note.textContent = "이 화면을 캡처해 보관해 주세요.";
  }

  function mount(container, receipt, at) {
    if (!container) return;
    load();
    container.innerHTML = "";
    var wrap = document.createElement("div"); wrap.className = "prereg-share";
    var btn = document.createElement("button"); btn.type = "button"; btn.className = "prereg-share__btn"; btn.textContent = "카카오톡으로 접수확인 저장";
    var hint = document.createElement("p"); hint.className = "prereg-share__hint"; hint.textContent = "카카오톡 '나와의 채팅'으로 보내 두시면 접수번호를 언제든 확인하실 수 있습니다.";
    var note = document.createElement("p"); note.className = "prereg-share__note"; note.setAttribute("role", "status");
    btn.addEventListener("click", function () { note.textContent = ""; share(receipt, at, note); });
    wrap.appendChild(btn); wrap.appendChild(hint); wrap.appendChild(note);
    container.appendChild(wrap);
  }

  window.PreregShare = { mount: mount, preload: load };
  if (document.getElementById("prereg-form")) load();
})();
