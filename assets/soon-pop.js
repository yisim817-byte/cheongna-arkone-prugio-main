(function () {
  var kind = "";
  var opener = null;
  function $(id) { return document.getElementById(id); }
  function setKind(next) {
    kind = next || "";
    ["officetel", "commercial"].forEach(function (k) {
      var el = $("popup_soon_" + k);
      if (!el) return;
      if (k === kind) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
    });
    document.body.style.overflow = kind ? "hidden" : "";
  }
  function close() {
    setKind("");
    if (location.hash.indexOf("#popup_soon_") === 0) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    if (opener && opener.focus) opener.focus();
  }
  function fromHash() {
    if (location.hash === "#popup_soon_officetel") setKind("officetel");
    else if (location.hash === "#popup_soon_commercial") setKind("commercial");
  }
  function ensureDom() {
    if ($("popup_soon_officetel")) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = `
<div id="popup_soon_officetel" class="popup_soon popup_soon--officetel" hidden>
  <div class="popup_soon__dialog" role="dialog" aria-modal="true" aria-labelledby="popup_soon_officetel_title">
    <div class="popup_soon__bg"><picture><source media="(max-width: 1024px)" srcset="/official/soon/officetel_bg_m.png" /><img src="/official/soon/officetel_bg.png" alt="" /></picture></div>
    <div class="popup_soon__content"><p class="popup_soon__logo"><img src="/official/soon/logo.svg" alt="PRUGIO" width="257" height="45" /></p>
      <div class="popup_soon__heading"><h2 id="popup_soon_officetel_title" class="popup_soon__title"><span class="popup_soon__brand">청라 아크원 푸르지오</span><span class="popup_soon__type">오피스텔</span></h2></div>
    </div>
    <p class="popup_soon__lead">청라가 기다리던<br />또하나의 찬란한 순간</p>
    <div class="popup_soon__message"><p class="popup_soon__tagline">멀티 발코니 오피스텔</p><p class="popup_soon__coming" lang="en">COMING<br class="m-only" /> SOON</p></div>
    <a class="popup_soon__cta" href="/register?product=officetel"><span class="popup_soon__cta_text"><strong>사전고객등록</strong> 바로가기</span><i class="popup_soon__cta_arrow" aria-hidden="true"></i></a>
    <p class="popup_soon__note">※본 홈페이지에 사용된 CG 및 일러스트, 이미지 등은 소비자의 이해를 돕기 위한 것으로 실제와 다를 수 있습니다.</p>
    <button type="button" class="popup_soon__close" aria-label="오피스텔 안내 닫기" data-soon-close>오피스텔 안내 닫기</button>
  </div>
</div>
<div id="popup_soon_commercial" class="popup_soon popup_soon--commercial" hidden>
  <div class="popup_soon__dialog" role="dialog" aria-modal="true" aria-labelledby="popup_soon_commercial_title">
    <div class="popup_soon__bg"><picture><source media="(max-width: 1024px)" srcset="/official/soon/commercial_bg_m.png" /><img src="/official/soon/commercial_bg.png" alt="" /></picture></div>
    <div class="popup_soon__content"><p class="popup_soon__logo"><img src="/official/soon/logo.svg" alt="PRUGIO" width="257" height="45" /></p>
      <div class="popup_soon__heading"><h2 id="popup_soon_commercial_title" class="popup_soon__title"><span class="popup_soon__brand">청라 아크원 푸르지오</span><span class="popup_soon__type">상업시설</span></h2>
        <p class="popup_soon__english" lang="en">CHEONGNA ARCONE PRUGIO <br class="m-only" />COMMERCIAL FACILITIES</p>
        <p class="popup_soon__coming" lang="en">COMING<br />SOON</p></div>
    </div>
    <a class="popup_soon__cta" href="/register?product=commercial"><span class="popup_soon__cta_text"><strong>사전고객등록</strong> 바로가기</span><i class="popup_soon__cta_arrow" aria-hidden="true"></i></a>
    <p class="popup_soon__note">※본 홈페이지에 사용된 CG 및 일러스트, 이미지 등은 소비자의 이해를 돕기 위한 것으로 실제와 다를 수 있습니다.</p>
    <button type="button" class="popup_soon__close" aria-label="상업시설 안내 닫기" data-soon-close>상업시설 안내 닫기</button>
  </div>
</div>`;
    document.body.appendChild(wrap);
  }
  document.addEventListener("DOMContentLoaded", function () {
    ensureDom();
    fromHash();
    document.addEventListener("click", function (event) {
      var t = event.target;
      if (!(t instanceof Element)) return;
      if (t.closest("[data-soon-close]")) { event.preventDefault(); close(); return; }
      var link = t.closest("a[data-popup-soon]");
      if (link) {
        var next = link.getAttribute("data-popup-soon");
        if (next === "officetel" || next === "commercial") {
          event.preventDefault();
          opener = link;
          setKind(next);
          history.replaceState(null, "", "#popup_soon_" + next);
        }
        return;
      }
      if (t.classList.contains("popup_soon") && t.id && t.id.indexOf("popup_soon_") === 0) close();
    });
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  });
})();
