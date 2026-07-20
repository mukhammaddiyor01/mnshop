(function () {
  const form = document.querySelector("[data-settings-form]");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      window.showAdminToast && window.showAdminToast("Settings saved");
    });
  }
})();
