(function () {
  const toggle = document.querySelector("[data-maintenance-toggle]");
  if (!toggle) return;
  toggle.addEventListener("click", function () {
    const enabled = toggle.textContent.trim().startsWith("Enable");
    toggle.textContent = enabled ? "Disable Maintenance Mode" : "Enable Maintenance Mode";
    window.showAdminToast && window.showAdminToast(enabled ? "Maintenance mode enabled" : "Maintenance mode disabled");
  });
})();
