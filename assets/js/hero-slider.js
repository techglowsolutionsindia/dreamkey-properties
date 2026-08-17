"use strict";

/* ==================================================
   HERO AUTO PROJECT SLIDER
================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const heroSlider = document.querySelector("#home.hero-slider");

  if (!heroSlider) return;

  const slides = Array.from(heroSlider.querySelectorAll("[data-hero-slide]"));

  if (slides.length < 2) return;

  const slideDuration = 5000;

  let currentIndex = 0;
  let autoPlayTimer = null;

  const showSlide = (newIndex) => {
    const nextIndex = (newIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === nextIndex;

      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    currentIndex = nextIndex;
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer === null) return;

    window.clearTimeout(autoPlayTimer);
    autoPlayTimer = null;
  };

  const startAutoPlay = () => {
    stopAutoPlay();

    autoPlayTimer = window.setTimeout(() => {
      showSlide(currentIndex + 1);
      startAutoPlay();
    }, slideDuration);
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  showSlide(0);
  startAutoPlay();
});
