(function () {
  document.querySelectorAll("[data-user-view]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.showAdminToast && window.showAdminToast("Opening " + button.getAttribute("data-user-view"));
    });
  });

  document.querySelectorAll("[data-user-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      const row = button.closest("tr");
      const pill = row && row.querySelector(".status-pill");
      if (!row || !pill) return;
      const blocked = row.getAttribute("data-status") === "blocked";
      const nextStatus = blocked ? "active" : "blocked";
      row.setAttribute("data-status", nextStatus);
      pill.className = "status-pill " + nextStatus;
      pill.textContent = nextStatus;
      button.textContent = blocked ? "Block" : "Activate";
      window.showAdminToast && window.showAdminToast("User " + nextStatus);
    });
  });

  document.querySelectorAll("[data-row-delete]").forEach(function (button) {
    button.addEventListener("click", function () {
      const row = button.closest("tr");
      if (row) row.remove();
      window.showAdminToast && window.showAdminToast("User soft-deleted");
    });
  });
})();
