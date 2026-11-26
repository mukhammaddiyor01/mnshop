(function () {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  document.querySelectorAll(".user-status").forEach(function (select) {
    select.addEventListener("focus", function () {
      select.dataset.previousStatus = select.value;
    });

    select.addEventListener("change", async function () {
      const previousStatus = select.dataset.previousStatus || "ACTIVE";
      select.disabled = true;

      try {
        const response = await fetch("/admin/user/edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({
            _id: select.dataset.userId,
            userStatus: select.value,
          }),
        });

        if (!response.ok) throw new Error("User status update failed");

        const row = select.closest("tr");
        if (row) row.dataset.status = select.value.toLowerCase();
        select.dataset.previousStatus = select.value;
        window.showAdminToast && window.showAdminToast("User status updated");
      } catch (error) {
        select.value = previousStatus;
        window.showAdminToast && window.showAdminToast(error.message);
      } finally {
        select.disabled = false;
      }
    });
  });
})();
