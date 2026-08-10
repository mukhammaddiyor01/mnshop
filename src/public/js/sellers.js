(function () {
  document.querySelectorAll(".seller-status").forEach(function (select) {
    select.addEventListener("focus", function () {
      select.dataset.previousStatus = select.value;
    });

    select.addEventListener("change", async function () {
      const previousStatus = select.dataset.previousStatus || "ACTIVE";
      select.disabled = true;

      try {
        const response = await fetch("/admin/seller/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _id: select.dataset.sellerId,
            sellerStatus: select.value,
          }),
        });

        if (!response.ok) throw new Error("Seller status update failed");

        const row = select.closest("tr");
        if (row) row.dataset.status = select.value.toLowerCase();
        select.dataset.previousStatus = select.value;
        window.showAdminToast && window.showAdminToast("Seller status updated");
      } catch (error) {
        select.value = previousStatus;
        window.showAdminToast && window.showAdminToast(error.message);
      } finally {
        select.disabled = false;
      }
    });
  });

  document.querySelectorAll(".seller-commission").forEach(function (input) {
    input.addEventListener("focus", function () {
      input.dataset.previousValue = input.value;
    });

    input.addEventListener("change", async function () {
      const previousValue = input.dataset.previousValue || "0";
      const percentage = Number(input.value);

      if (percentage < 0 || percentage > 100) {
        input.value = previousValue;
        window.showAdminToast &&
          window.showAdminToast("Commission 0–100 oralig‘ida bo‘lishi kerak");
        return;
      }

      input.disabled = true;

      try {
        const response = await fetch("/admin/seller/edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: input.dataset.sellerId,
            sellerCommisionPercentage: percentage,
          }),
        });

        if (!response.ok) {
          throw new Error("Commission update failed");
        }

        input.dataset.previousValue = input.value;
        window.showAdminToast && window.showAdminToast("Commission updated");
      } catch (error) {
        input.value = previousValue;
        window.showAdminToast && window.showAdminToast(error.message);
      } finally {
        input.disabled = false;
      }
    });
  });
})();
