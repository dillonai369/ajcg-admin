"use client";

import { useEffect } from "react";

/**
 * Home-only client-side scripts ported verbatim from index.html's inline script:
 *  - Testimonial slider (prev/next/dots + 8s auto-advance)
 *  - Animated number counters with IntersectionObserver
 *
 * The mobile-menu toggle and nav scroll-class live in SiteNav.tsx — this
 * component only owns the bits that are unique to the homepage.
 */
export default function HomeScripts() {
  useEffect(() => {
    // --------- Testimonial slider ---------
    const slides = document.querySelectorAll<HTMLElement>(".testimonial-slide");
    const prev = document.querySelector<HTMLButtonElement>(".testimonial-arrow.prev");
    const next = document.querySelector<HTMLButtonElement>(".testimonial-arrow.next");
    const dotsContainer = document.querySelector<HTMLElement>(".testimonial-dots");
    let timer: ReturnType<typeof setInterval> | null = null;

    if (slides.length && prev && next && dotsContainer) {
      // Build dots
      dotsContainer.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "testimonial-dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Review " + (i + 1));
        dot.addEventListener("click", () => show(i));
        dotsContainer.appendChild(dot);
      });
      const dots = dotsContainer.querySelectorAll<HTMLElement>(".testimonial-dot");

      let current = 0;
      function show(i: number) {
        current = (i + slides.length) % slides.length;
        slides.forEach((s, idx) => s.classList.toggle("is-active", idx === current));
        dots.forEach((d, idx) => d.classList.toggle("is-active", idx === current));
      }

      const onPrev = () => show(current - 1);
      const onNext = () => show(current + 1);
      prev.addEventListener("click", onPrev);
      next.addEventListener("click", onNext);
      timer = setInterval(() => show(current + 1), 8000);
    }

    // --------- Animated counters ---------
    const counters = document.querySelectorAll<HTMLElement>(".counter");
    function animateCounter(el: HTMLElement) {
      if (el.dataset.animated) return;
      el.dataset.animated = "1";
      const target = parseFloat(el.dataset.target || "0");
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const duration = 1800;
      const t0 = performance.now();
      function step(now: number) {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const cur = eased * target;
        el.textContent = decimals ? cur.toFixed(decimals) : Math.floor(cur).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = decimals ? target.toFixed(decimals) : Math.floor(target).toLocaleString();
      }
      requestAnimationFrame(step);
    }
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              animateCounter(e.target as HTMLElement);
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      counters.forEach((el) => {
        el.textContent = "0";
        io!.observe(el);
      });
    } else {
      counters.forEach(animateCounter);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (io) io.disconnect();
    };
  }, []);

  return null;
}
