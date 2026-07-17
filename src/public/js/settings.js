(function () {
  document.querySelectorAll("[data-toggle-state]").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      toggle.classList.toggle("active");
      window.showAdminToast && window.showAdminToast("Setting toggled");
    });
  });
})();
