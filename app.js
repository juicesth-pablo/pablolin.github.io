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


/* ===== 頁面切換方向 =====
   首頁↔內頁：看目的地（內頁=上滑、首頁=下滑）
   內頁↔內頁：看歷史方向（前進=上滑、返回=下滑）      */
window.addEventListener("pagereveal", (e) => {
  if (!e.viewTransition) return;

  const toCase = location.pathname.includes("/work/");   // 目的地是內頁?
  let type = toCase ? "forward" : "back";                // 預設：依目的地

  // 內頁 → 內頁：改用歷史前進/返回判斷
  if (window.navigation && navigation.activation) {
    const act = navigation.activation;
    const fromUrl = (act.from && act.from.url) ? act.from.url : "";
    const fromCase = fromUrl.includes("/work/");
    if (fromCase && toCase) {
      const isBack = act.navigationType === "traverse"
        && act.from && act.entry && act.entry.index < act.from.index;
      type = isBack ? "back" : "forward";
    }
  }

  e.viewTransition.types.add(type);
});


/* ===== 作品內頁按 Esc：回首頁 SELECTED WORK ===== */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!document.querySelector(".backlink")) return;  // 只在作品內頁生效
  location.href = "../index.html#work";
});


/* ===== 作品內頁：往下滑時，導覽列顯示目前作品標題 ===== */
const caseTitle = document.querySelector(".case-title, .cw-title");
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


/* ===== Copywriting / split 頁：滿版媒體隨捲動淡出，露出底色 ===== */
const cwHero = document.querySelector(".cw-hero");
if (cwHero) {
  const cwMedia = cwHero.querySelector(".cw-hero-media");
  const cwCaption = cwHero.querySelector(".cw-hero-caption");
  const cwVideo = cwHero.querySelector(".cw-hero-video");

  const onCwScroll = () => {
    const h = cwHero.offsetHeight || 1;
    const progress = Math.min(window.scrollY / h, 1);   // 0（頂端）→ 1（捲過一屏）
    const opacity = 1 - progress;
    if (cwMedia) cwMedia.style.opacity = opacity;
    if (cwCaption) cwCaption.style.opacity = opacity;
    if (cwVideo) cwVideo.style.opacity = opacity;        // ← 移進函式內，跟其他兩行一起
  };

  window.addEventListener("scroll", onCwScroll, { passive: true });
  onCwScroll();
}


/* ===== 導覽列：疊在深色區塊上時自動改淺色（全站，過渡交給 CSS transition）===== */
const navEl = document.querySelector("nav");
// 只有真正深底的區塊才會被標記，跟版型無關
const darkZones = document.querySelectorAll(".nav-dark-zone");
if (navEl && darkZones.length) {
  const navColorWatch = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      navEl.classList.toggle("nav-light", e.isIntersecting);
    });
  }, { rootMargin: "-56px 0px -100% 0px", threshold: 0 });
  darkZones.forEach((z) => navColorWatch.observe(z));
}


/* ===== 首屏影片延後載入：先讓文字＋封面秒開，影片稍後再串流進來 ===== */
const heroVideos = document.querySelectorAll("video[data-src]");
if (heroVideos.length) {
  const startVideo = (v) => {
    if (v.dataset.loaded) return;   // 避免重複載
    v.dataset.loaded = "1";
    v.src = v.dataset.src;          // 這一刻才開始下載影片
    v.play().catch(() => {});       // 靜音自動播放（被擋也不報錯）
  };
  const kick = () => heroVideos.forEach(startVideo);

  // 若正被「預先渲染」，等頁面真正開啟後才拉影片，避免預渲染時就吃頻寬
  if (document.prerendering) {
    document.addEventListener("prerenderingchange", kick, { once: true });
  } else if (document.readyState === "complete") {
    kick();
  } else {
    window.addEventListener("load", kick);
  }
}


/* ===== 首頁：閒置時在背景預抓作品內頁 HTML，點進去就秒開 ===== */
const workLinks = document.querySelectorAll(".work-card[href]");
if (workLinks.length) {
  const prefetch = (url) => {
    // 已經抓過就跳過，避免重複
    if (document.querySelector(`link[rel="prefetch"][href="${url}"]`)) return;
    const l = document.createElement("link");
    l.rel = "prefetch";
    l.href = url;
    document.head.appendChild(l);
  };
  const run = () => workLinks.forEach((a) => prefetch(a.href));
  // 等瀏覽器閒置再抓，不跟首頁的圖片/字型搶頻寬
  if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 3000 });
  else window.addEventListener("load", run);
}


/* ===== 首頁 HERO：柔色團塊背景，隨滑鼠流動 + 自體波動 ===== */
const heroFx = document.querySelector(".hero-fx");
const heroEl = document.getElementById("top");
if (heroFx && heroEl && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const blobs = heroFx.querySelectorAll(".blob");
  // 每團的視差強度(par)與波動參數(振幅 ax/ay、速度 sx/sy、相位 ph)，差異化才有層次
  const cfg = [
    { par: 40, ax: 22, ay: 18, sx: 0.00040, sy: 0.00055, ph: 0 },
    { par: 26, ax: 30, ay: 20, sx: 0.00055, sy: 0.00035, ph: 2 },
    { par: 60, ax: 18, ay: 26, sx: 0.00035, sy: 0.00060, ph: 4 },
  ];
  let tx = 0, ty = 0;   // 目標：滑鼠相對 hero 中心（-0.5 ~ 0.5）
  let cx = 0, cy = 0;   // 緩動後的實際座標

  heroEl.addEventListener("pointermove", (e) => {
    const r = heroEl.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
  });
  heroEl.addEventListener("pointerleave", () => { tx = 0; ty = 0; });  // 離開慢慢回中

  let rafId = null;
  const tick = (t) => {
    cx += (tx - cx) * 0.06;   // 緩動係數：越小越「拖尾」、越流動
    cy += (ty - cy) * 0.06;
    blobs.forEach((b, i) => {
      const c = cfg[i] || cfg[0];
      const dx = cx * c.par + Math.sin(t * c.sx + c.ph) * c.ax;  // 視差(跟滑鼠) + 波動(自體)
      const dy = cy * c.par + Math.cos(t * c.sy + c.ph) * c.ay;
      b.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
    });
    rafId = requestAnimationFrame(tick);
  };

  // 只有 hero 在畫面內才跑動畫，捲離就暫停、回來再續（省電 / 省 CPU）
  const heroVis = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && rafId === null) {
      rafId = requestAnimationFrame(tick);
    } else if (!entry.isIntersecting && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });
  heroVis.observe(heroEl);
}