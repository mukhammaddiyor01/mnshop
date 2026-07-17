(function () {
  document.querySelectorAll(".status-change").forEach(function (select) {
    select.addEventListener("change", function () {
      window.showAdminToast && window.showAdminToast("Buyer status changed");
    });
  });
})();
