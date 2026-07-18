(function () {
  const maintenanceButton = document.querySelector("[data-maintenance-toggle]");
  if (!maintenanceButton) return;

  maintenanceButton.addEventListener("click", function () {
    const enabled = maintenanceButton.classList.toggle("active");
    maintenanceButton.textContent = enabled ? "Disable Maintenance Mode" : "Enable Maintenance Mode";
    window.showAdminToast && window.showAdminToast(enabled ? "Maintenance mode enabled" : "Maintenance mode disabled");
  });
})();
