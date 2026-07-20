(function () {
  const adminLayout = document.querySelector(".admin-layout");
  const sidebar = document.getElementById("adminSidebar");
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
      setTimeout(function () { toast.remove(); }, 240);
    }, 2200);
  };

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("open");
    if (adminLayout) adminLayout.classList.remove("sidebar-open");
  }

  document.querySelectorAll("[data-toggle-sidebar]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (sidebar) sidebar.classList.toggle("open");
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

    const visibleCount = document.querySelector("[data-visible-count]");
    if (visibleCount) visibleCount.textContent = String(Array.from(items).filter(function (item) { return !item.hidden; }).length);
  }

  if (searchInput) searchInput.addEventListener("input", filterItems);
  if (statusFilter) statusFilter.addEventListener("change", filterItems);

  window.addEventListener("DOMContentLoaded", function () {
    if (window.lucide) window.lucide.createIcons();
  });
})();
