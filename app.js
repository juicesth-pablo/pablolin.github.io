// Scroll reveal — adds .in when an element scrolls into view
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 0.08 + 's';
  io.observe(el);
});


/* ===== 頁面切換方向偵測：前進上滑 / 返回下滑 ===== */
/* 用 Navigation API 判斷這次是「返回」還是「前進」，標記給上面的 CSS 用 */
if (window.navigation) {
  window.addEventListener('pagereveal', (e) => {
    if (!e.viewTransition) return;              // 沒有切換動畫就跳過
    const act = navigation.activation;
    // traverse 且「目標頁的索引 < 來源頁」＝ 使用者按了返回
    const isBack = act && act.navigationType === 'traverse'
      && act.from && act.entry && act.entry.index < act.from.index;
    e.viewTransition.types.add(isBack ? 'back' : 'forward');
  });
}


/* ===== Back to Work：模擬瀏覽器返回，觸發「下滑」動畫 ===== */
/* 若使用者是從站內點進這頁，就用 history.back() 走返回（下滑）；
   若是直接開這頁（沒有站內來源），維持原本連結、正常跳回首頁 */
document.querySelectorAll(".backlink").forEach((link) => {
  link.addEventListener("click", (e) => {
    const fromSameSite =
      document.referrer && new URL(document.referrer).origin === location.origin;
    if (fromSameSite && history.length > 1) {
      e.preventDefault();   // 阻止一般跳轉
      history.back();       // 改用返回 → 觸發 back 下滑動畫
    }
    // 否則不攔截，照 href 正常跳到首頁（上滑）
  });
});


/* ===== 作品內頁按 Esc 返回首頁（同返回鍵、下滑動畫） ===== */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;                    // 只處理 Esc
  if (!document.querySelector(".backlink")) return;  // 只在有返回鍵的作品內頁生效（首頁不觸發）
  const fromSameSite =
    document.referrer && new URL(document.referrer).origin === location.origin;
  if (fromSameSite && history.length > 1) {
    history.back();                        // 從站內進來 → 返回（下滑）
  } else {
    location.href = "../index.html#work";  // 直接開啟這頁 → 正常跳回首頁
  }
});