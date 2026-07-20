(function () {
  document.querySelectorAll("[data-user-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      const row = button.closest("tr");
      const pill = row && row.querySelector(".status-pill");
      if (!row || !pill) return;
      const blocked = row.getAttribute("data-status") === "blocked";
      row.setAttribute("data-status", blocked ? "active" : "blocked");
      pill.className = `status-pill ${blocked ? "active" : "blocked"}`;
      pill.textContent = blocked ? "active" : "blocked";
      button.textContent = blocked ? "Block" : "Activate";
      window.showAdminToast && window.showAdminToast(`User ${blocked ? "active" : "blocked"}`);
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
