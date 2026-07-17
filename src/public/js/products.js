(function () {
  document.querySelectorAll(".product-box .btn-row button").forEach(function (button) {
    button.addEventListener("click", function () {
      window.showAdminToast && window.showAdminToast(button.getAttribute("data-toast") || "Product action ready");
    });
  });
})();
