(function () {
  document.querySelectorAll(".status-change").forEach(function (select) {
    select.addEventListener("change", function () {
      const row = select.closest("tr");
      const pill = row && row.querySelector(".status-pill");
      if (row) row.setAttribute("data-status", select.value);
      if (pill) { pill.className = `status-pill ${select.value}`; pill.textContent = select.value; }
      window.showAdminToast && window.showAdminToast("Order status changed");
    });
  });
})();
