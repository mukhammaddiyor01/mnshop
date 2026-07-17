(function () {
  const sidebar = document.getElementById("adminSidebar");
  const toastArea = document.getElementById("toastArea");

  window.showAdminToast = function (message) {
    if (!toastArea) return;
    const toast = document.createElement("div");
    toast.className = "toast-box";
    toast.textContent = message || "Action completed";
    toastArea.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("hide");
      setTimeout(function () {
        toast.remove();
      }, 240);
    }, 2200);
  };

  document.querySelectorAll("[data-toggle-sidebar]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (sidebar) sidebar.classList.toggle("open");
    });
  });

  document.querySelectorAll("[data-toast]").forEach(function (element) {
    element.addEventListener("click", function () {
      window.showAdminToast(element.getAttribute("data-toast"));
    });
  });

  const searchInput = document.querySelector("[data-admin-search]");
  const searchTarget = document.querySelector("[data-search-target]");
  if (searchInput && searchTarget) {
    searchInput.addEventListener("input", function () {
      const query = searchInput.value.trim().toLowerCase();
      searchTarget.querySelectorAll("tbody tr, .product-box, .product-admin-card, .chat-user, .conversation-item").forEach(function (item) {
        item.style.display = item.textContent.toLowerCase().includes(query) ? "" : "none";
      });
    });
  }
})();
