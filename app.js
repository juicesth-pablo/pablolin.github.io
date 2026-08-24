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