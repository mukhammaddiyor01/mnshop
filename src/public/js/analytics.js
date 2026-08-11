(function () {
  document.querySelectorAll("[data-bar-height]").forEach(function (bar) {
    bar.style.height = bar.getAttribute("data-bar-height") + "%";
  });

  document.querySelectorAll("[data-progress-width]").forEach(function (progress) {
    progress.style.width = progress.getAttribute("data-progress-width") + "%";
  });

  const chart = document.querySelector(".bar-chart");
  if (chart) chart.setAttribute("data-ready", "true");
})();
