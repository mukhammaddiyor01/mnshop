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
    button.addEventListener("click", async function () {
      const previousValue = button.classList.contains("active");
      button.disabled = true;

      try {
        const response = await fetch(`/admin/seller/product/${button.dataset.productId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productFeatured: !previousValue }),
        });

        if (!response.ok) throw new Error("Product update failed");

        button.classList.toggle("active", !previousValue);
        button.textContent = !previousValue ? "Featured" : "Normal";
        window.showAdminToast && window.showAdminToast("Product updated");
      } catch (error) {
        window.showAdminToast && window.showAdminToast(error.message);
      } finally {
        button.disabled = false;
      }
    });
  });

  document.querySelectorAll(".product-status").forEach(function (select) {
    select.addEventListener("focus", function () {
      select.dataset.previousStatus = select.value;
    });

    select.addEventListener("change", async function () {
      const previousStatus = select.dataset.previousStatus || "PAUSE";
      select.disabled = true;

      try {
        const response = await fetch(`/admin/seller/product/${select.dataset.productId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productStatus: select.value }),
        });

        if (!response.ok) throw new Error("Product status update failed");

        const row = select.closest("tr");
        if (row) row.dataset.status = select.value.toLowerCase();
        select.dataset.previousStatus = select.value;
        window.showAdminToast && window.showAdminToast("Product status updated");
      } catch (error) {
        select.value = previousStatus;
        window.showAdminToast && window.showAdminToast(error.message);
      } finally {
        select.disabled = false;
      }
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
        const statusSelect = row.querySelector(".product-status");
        const checkbox = row.querySelector("[data-product-select]");
        if (statusSelect) {
          statusSelect.dataset.previousStatus = statusSelect.value;
          statusSelect.value = action;
          statusSelect.dispatchEvent(new Event("change"));
        }
        if (checkbox) checkbox.checked = false;
      });
      updateSelectedCount();
      window.showAdminToast && window.showAdminToast(`Bulk ${action} applied`);
    });
  });
})();
