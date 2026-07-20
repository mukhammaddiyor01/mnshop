(function () {
  const slides = Array.from(document.querySelectorAll(".animation-slides .slide"));

  if (!slides.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || typeof window.anime !== "function") {
    slides[0].style.opacity = "1";
    return;
  }

  window.anime.set(slides, {
    opacity: 0,
    scale: 0.94,
  });

  const timeline = window.anime.timeline({
    loop: true,
    easing: "easeOutExpo",
  });

  slides.forEach((slide) => {
    const lines = slide.querySelectorAll("p");

    timeline
      .add({
        targets: slide,
        opacity: [0, 1],
        scale: [0.94, 1],
        duration: 650,
        begin: function () {
          slide.style.pointerEvents = "auto";
        },
      })
      .add(
        {
          targets: lines,
          opacity: [0, 1],
          translateY: [24, 0],
          color: ["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.82)"],
          delay: window.anime.stagger(45, { from: "center" }),
          duration: 700,
        },
        "-=450"
      )
      .add({
        targets: lines,
        letterSpacing: ["0em", "0.04em"],
        duration: 1500,
        easing: "easeInOutSine",
      })
      .add({
        targets: slide,
        opacity: 0,
        scale: 1.04,
        duration: 500,
        easing: "easeInQuad",
        complete: function () {
          slide.style.pointerEvents = "none";
        },
      });
  });
})();
