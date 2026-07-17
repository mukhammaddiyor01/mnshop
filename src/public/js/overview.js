(function () {
  document.querySelectorAll(".quick-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      window.showAdminToast && window.showAdminToast("Opening " + link.textContent.trim());
    });
  });
})();
