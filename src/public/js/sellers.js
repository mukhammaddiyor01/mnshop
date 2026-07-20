(function () {
  document.querySelectorAll("[data-seller-status]").forEach(function (button) {
    button.addEventListener("click", function () {
      const row = button.closest("tr");
      const pill = row && row.querySelector(".status-pill");
      if (!row || !pill) return;
      let status = button.getAttribute("data-seller-status");
      if (status === "blocked" && row.getAttribute("data-status") === "blocked") status = "active";
      row.setAttribute("data-status", status);
      pill.className = `status-pill ${status}`;
      pill.textContent = status;
      window.showAdminToast && window.showAdminToast("Seller updated");
    });
  });
})();
