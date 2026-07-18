(function () {
  const adminLayout = document.querySelector(".admin-layout");
  const toastArea = document.getElementById("toastArea");
  const searchInput = document.querySelector("[data-admin-search]");
  const statusFilter = document.querySelector("[data-status-filter]");
  const searchTarget = document.querySelector("[data-search-target]");

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

  function closeSidebar() {
    if (adminLayout) adminLayout.classList.remove("sidebar-open");
  }

  document.querySelectorAll("[data-toggle-sidebar]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (adminLayout) adminLayout.classList.toggle("sidebar-open");
    });
  });

  document.querySelectorAll("[data-close-sidebar], .side-link").forEach(function (element) {
    element.addEventListener("click", closeSidebar);
  });

  document.querySelectorAll("[data-toast]").forEach(function (element) {
    element.addEventListener("click", function () {
      window.showAdminToast(element.getAttribute("data-toast"));
    });
  });

  function filterItems() {
    if (!searchTarget) return;
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const status = statusFilter ? statusFilter.value : "all";
    const items = searchTarget.querySelectorAll("tbody tr, [data-conversation]");

    items.forEach(function (item) {
      const matchesQuery = item.textContent.toLowerCase().includes(query);
      const itemStatus = (item.getAttribute("data-status") || "").toLowerCase();
      const matchesStatus = status === "all" || itemStatus === status;
      item.hidden = !matchesQuery || !matchesStatus;
    });

    document.dispatchEvent(new CustomEvent("admin:filter"));
  }

  if (searchInput) searchInput.addEventListener("input", filterItems);
  if (statusFilter) statusFilter.addEventListener("change", filterItems);
})();
