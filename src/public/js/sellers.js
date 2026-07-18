(function () {
  document.querySelectorAll("[data-seller-status]").forEach(function (button) {
    button.addEventListener("click", function () {
      const row = button.closest("tr");
      const pill = row && row.querySelector(".status-pill");
      if (!row || !pill) return;
      const requestedStatus = button.getAttribute("data-seller-status");
      const currentStatus = row.getAttribute("data-status");
      const nextStatus = requestedStatus === "blocked" && currentStatus === "blocked" ? "active" : requestedStatus;
      row.setAttribute("data-status", nextStatus);
      pill.className = "status-pill " + nextStatus;
      pill.textContent = nextStatus;
      if (requestedStatus === "blocked") button.textContent = nextStatus === "blocked" ? "Unblock" : "Block";
      window.showAdminToast && window.showAdminToast("Seller " + nextStatus);
    });
  });

  document.querySelectorAll(".commission-input input").forEach(function (input) {
    input.addEventListener("change", function () {
      window.showAdminToast && window.showAdminToast("Seller commission updated");
    });
  });
})();
