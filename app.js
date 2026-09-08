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


/* ===== 捲動進場動畫：元素進入畫面時加上 .in ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 0.08 + "s";
  io.observe(el);
});


/* ===== 首頁選單：點 Work / About / Contact 讓對應區塊在畫面置中 ===== */
document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;                         // 找不到就交回預設行為
    e.preventDefault();

    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });   // 點名字回到最頂
    } else {
      // 區塊比螢幕矮 → 垂直置中；比螢幕高（如手機版作品列）→ 對齊頂端（靠 scroll-margin-top 留白）
      const fits = target.offsetHeight < window.innerHeight - 40;
      target.scrollIntoView({ behavior: "smooth", block: fits ? "center" : "start" });
    }
    history.pushState(null, "", "#" + id);       // 更新網址但不跳動
  });
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
  });
});


/* ===== 作品內頁按 Esc：回首頁 SELECTED WORK（下滑動畫） ===== */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!document.querySelector(".backlink")) return;  // 只在作品內頁生效
  sessionStorage.setItem("vtDir", "back");
  location.href = "../index.html#work";
});


/* ===== 作品內頁：往下滑時，導覽列顯示目前作品標題 ===== */
const caseTitle = document.querySelector(".case-title");
const navBar = document.querySelector("nav");
if (caseTitle && navBar) {
  // 自動用大標文字建立導覽列標題（免手動改各頁 HTML）
  const navTitle = document.createElement("span");
  navTitle.className = "nav-title";
  // 標題若用 <br> 換行，textContent 會把前後段黏在一起 → 先把 <br> 換成空格
  navTitle.textContent = caseTitle.innerHTML
  .replace(/<br\s*\/?>/gi, " ")   // <br> / <br/> / <br /> 一律換成空格
  .replace(/<[^>]+>/g, "")        // 去掉其餘標籤（保險）
  .replace(/\s+/g, " ")           // 多個空白收成一個
  .trim();
  navBar.appendChild(navTitle);

  // 大標滑出畫面才顯示，避免和大標同時出現；-64px 扣掉固定導覽列高度
  const titleWatcher = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      navBar.classList.toggle("show-title", !en.isIntersecting);
    });
  }, { rootMargin: "-64px 0px 0px 0px", threshold: 0 });
  titleWatcher.observe(caseTitle);
}