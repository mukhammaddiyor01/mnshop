(function () {
  const selectAll = document.querySelector("[data-select-all]");
  const selectedCount = document.querySelector("[data-selected-count]");
  const isAdminPage = window.location.pathname.startsWith("/admin/");
  const updateEndpoint = isAdminPage
    ? "/admin/seller/product"
    : "/seller/product";
  const bulkEndpoint = isAdminPage
    ? "/admin/product/bulk-status"
    : "/seller/product/bulk-status";

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
        const response = await fetch(`${updateEndpoint}/${button.dataset.productId}`, {
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
        const response = await fetch(`${updateEndpoint}/${select.dataset.productId}`, {
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
    button.addEventListener("click", async function () {
      const selectedCheckboxes = Array.from(document.querySelectorAll("[data-product-select]:checked"));

      if (!selectedCheckboxes.length) {
        window.showAdminToast && window.showAdminToast("Select products first");
        return;
      }

      const productStatus = button.getAttribute("data-bulk-action");
      if (productStatus === "DELETE" && !window.confirm("Delete selected products?")) return;

      const productIds = selectedCheckboxes.map(function (checkbox) { return checkbox.value; });
      button.disabled = true;

      try {
        const response = await fetch(bulkEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds, productStatus }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Bulk update failed");

        selectedCheckboxes.forEach(function (checkbox) {
          const row = checkbox.closest("tr");
          if (!row) return;

          const statusSelect = row.querySelector(".product-status");
          row.dataset.status = productStatus.toLowerCase();
          checkbox.checked = false;

          if (statusSelect) {
            statusSelect.value = productStatus;
            statusSelect.dataset.previousStatus = productStatus;
          }
        });

        if (selectAll) selectAll.checked = false;
        updateSelectedCount();
        window.showAdminToast && window.showAdminToast(`Bulk ${productStatus} applied`);
      } catch (error) {
        window.showAdminToast && window.showAdminToast(error.message || "Bulk update failed");
      } finally {
        button.disabled = false;
      }
    });
  });
})();
