/* ===== 帶著 #work 進首頁時，直接停在作品區、不從頂端捲下來 ===== */
if (location.hash === "#work") {
  const target = document.getElementById("work");
  if (target) {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    target.scrollIntoView();
    root.style.scrollBehavior = prev;

    // 直接落在作品區時，作品卡立刻顯示（不淡入、不錯開），避免速度不一
    document.querySelectorAll("#work .reveal").forEach((el) => {
      el.style.transition = "none";
      el.classList.add("in");
    });
  }
}


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


/* ===== 頁面切換方向：先看強制指定，否則自動判斷前進/返回 ===== */
window.addEventListener("pagereveal", (e) => {
  if (!e.viewTransition) return;

  // 1) Back to Work / Esc 會設「強制下滑」旗標，優先採用
  const forced = sessionStorage.getItem("vtDir");
  if (forced) {
    e.viewTransition.types.add(forced);
    sessionStorage.removeItem("vtDir");
    return;
  }

  // 2) 否則用 Navigation API 判斷是「返回」還是「前進」
  if (window.navigation) {
    const act = navigation.activation;
    const isBack = act && act.navigationType === "traverse"
      && act.from && act.entry && act.entry.index < act.from.index;
    e.viewTransition.types.add(isBack ? "back" : "forward");
  }
});


/* ===== Back to Work：一律回首頁 SELECTED WORK，並走下滑動畫 ===== */
document.querySelectorAll(".backlink").forEach((link) => {
  link.addEventListener("click", () => {
    sessionStorage.setItem("vtDir", "back");   // 標記下滑，交給上面的 pagereveal 讀
    // 不攔截：照 href="../index.html#work" 正常跳回首頁
  });
});


/* ===== 作品內頁按 Esc：回首頁 SELECTED WORK（下滑動畫） ===== */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!document.querySelector(".backlink")) return;  // 只在作品內頁生效
  sessionStorage.setItem("vtDir", "back");           // 標記下滑
  location.href = "../index.html#work";              // 一律回首頁作品區
});