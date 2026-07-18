(function () {
  const table = document.querySelector(".product-panel .admin-table");
  const selectAll = document.querySelector("[data-select-all]");
  const selectedCount = document.querySelector("[data-selected-count]");
  const visibleCount = document.querySelector("[data-visible-count]");
  if (!table) return;

  function productCheckboxes() {
    return Array.from(table.querySelectorAll("[data-product-select]"));
  }

  function updateCounts() {
    const checkboxes = productCheckboxes();
    const selected = checkboxes.filter(function (checkbox) {
      return checkbox.checked;
    });
    const visibleRows = Array.from(table.querySelectorAll("tbody tr")).filter(function (row) {
      return !row.hidden;
    });
    if (selectedCount) selectedCount.textContent = String(selected.length);
    if (visibleCount) visibleCount.textContent = String(visibleRows.length);
    if (selectAll) selectAll.checked = checkboxes.length > 0 && selected.length === checkboxes.length;
  }

  if (selectAll) {
    selectAll.addEventListener("change", function () {
      productCheckboxes().forEach(function (checkbox) {
        checkbox.checked = selectAll.checked;
      });
      updateCounts();
    });
  }

  productCheckboxes().forEach(function (checkbox) {
    checkbox.addEventListener("change", updateCounts);
  });

  document.querySelectorAll("[data-feature-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      const active = button.classList.toggle("active");
      button.textContent = active ? "Featured" : "Normal";
      window.showAdminToast && window.showAdminToast("Product feature updated");
    });
  });

  document.querySelectorAll("[data-product-status]").forEach(function (button) {
    button.addEventListener("click", function () {
      const row = button.closest("tr");
      const pill = row && row.querySelector(".status-pill");
      if (!row || !pill) return;
      const nextStatus = row.getAttribute("data-status") === "active" ? "draft" : "active";
      row.setAttribute("data-status", nextStatus);
      pill.className = "status-pill " + nextStatus;
      pill.textContent = nextStatus;
      button.textContent = nextStatus === "active" ? "Deactivate" : "Activate";
      window.showAdminToast && window.showAdminToast("Product " + nextStatus);
    });
  });

  document.querySelectorAll("[data-product-edit]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.showAdminToast && window.showAdminToast("Product editor is ready");
    });
  });

  document.querySelectorAll("[data-bulk-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      const action = button.getAttribute("data-bulk-action");
      const selectedRows = productCheckboxes().filter(function (checkbox) {
        return checkbox.checked;
      }).map(function (checkbox) {
        return checkbox.closest("tr");
      });

      if (!selectedRows.length) {
        window.showAdminToast && window.showAdminToast("Select products first");
        return;
      }

      selectedRows.forEach(function (row) {
        if (!row) return;
        if (action === "delete") {
          row.remove();
          return;
        }
        const pill = row.querySelector(".status-pill");
        row.setAttribute("data-status", action);
        if (pill) {
          pill.className = "status-pill " + action;
          pill.textContent = action;
        }
      });

      updateCounts();
      window.showAdminToast && window.showAdminToast("Bulk " + action + " applied");
    });
  });

  document.addEventListener("admin:filter", updateCounts);
  updateCounts();
})();
