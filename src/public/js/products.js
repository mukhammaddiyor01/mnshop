(function () {
  const rows = Array.from(document.querySelectorAll(".product-panel tbody tr"));
  const selectAll = document.querySelector("[data-select-all]");
  const selectedCount = document.querySelector("[data-selected-count]");

  function updateSelectedCount() {
    const selected = document.querySelectorAll("[data-product-select]:checked").length;
    if (selectedCount) selectedCount.textContent = String(selected);
  }

  if (selectAll) {
    selectAll.addEventListener("change", function () {
      document.querySelectorAll("[data-product-select]").forEach(function (checkbox) { checkbox.checked = selectAll.checked; });
      updateSelectedCount();
    });
  }

  document.querySelectorAll("[data-product-select]").forEach(function (checkbox) {
    checkbox.addEventListener("change", updateSelectedCount);
  });

  document.querySelectorAll("[data-feature-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      button.classList.toggle("active");
      button.textContent = button.classList.contains("active") ? "Featured" : "Normal";
      window.showAdminToast && window.showAdminToast("Product updated");
    });
  });

  document.querySelectorAll("[data-product-status]").forEach(function (button) {
    button.addEventListener("click", function () {
      const row = button.closest("tr");
      const pill = row && row.querySelector(".status-pill");
      if (!row || !pill) return;
      const active = row.getAttribute("data-status") === "active";
      row.setAttribute("data-status", active ? "pause" : "active");
      pill.className = `status-pill ${active ? "pause" : "active"}`;
      pill.textContent = active ? "pause" : "active";
      button.textContent = active ? "Activate" : "Deactivate";
      window.showAdminToast && window.showAdminToast("Product updated");
    });
  });

  document.querySelectorAll("[data-bulk-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      const selectedRows = rows.filter(function (row) { const checkbox = row.querySelector("[data-product-select]"); return checkbox && checkbox.checked; });
      if (!selectedRows.length) {
        window.showAdminToast && window.showAdminToast("Select products first");
        return;
      }
      const action = button.getAttribute("data-bulk-action");
      selectedRows.forEach(function (row) {
        if (action === "delete") row.remove();
        else {
          const pill = row.querySelector(".status-pill");
          row.setAttribute("data-status", action);
          if (pill) { pill.className = `status-pill ${action}`; pill.textContent = action; }
          const checkbox = row.querySelector("[data-product-select]");
          if (checkbox) checkbox.checked = false;
        }
      });
      updateSelectedCount();
      window.showAdminToast && window.showAdminToast(`Bulk ${action} applied`);
    });
  });
})();
