(function () {
  const settingsForm = document.querySelector("[data-settings-form]");
  if (settingsForm) {
    settingsForm.addEventListener("submit", function (event) {
      event.preventDefault();
      window.showAdminToast && window.showAdminToast("Settings saved");
    });
  }

  document.querySelectorAll("[data-toggle-state]").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      toggle.classList.toggle("active");
      window.showAdminToast && window.showAdminToast("Maintenance mode updated");
    });
  });
})();
