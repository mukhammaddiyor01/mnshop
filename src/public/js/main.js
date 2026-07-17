(function () {
  const sidebar = document.getElementById("adminSidebar");
  const toastArea = document.getElementById("toastArea");

  function showToast(message) {
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
  }

  document.querySelectorAll("[data-toggle-sidebar]").forEach(function (button) {
    button.addEventListener("click", function () {
      sidebar && sidebar.classList.toggle("open");
    });
  });

  document.querySelectorAll("[data-toast]").forEach(function (element) {
    element.addEventListener("click", function () {
      showToast(element.getAttribute("data-toast"));
    });
  });

  document.querySelectorAll(".status-change").forEach(function (select) {
    select.addEventListener("change", function () {
      showToast(select.getAttribute("data-toast") || "Status changed");
    });
  });

  document.querySelectorAll("[data-toggle-state]").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      toggle.classList.toggle("active");
      showToast("Setting toggled");
    });
  });

  const searchInput = document.querySelector("[data-admin-search]");
  const searchTarget = document.querySelector("[data-search-target]");
  if (searchInput && searchTarget) {
    searchInput.addEventListener("input", function () {
      const query = searchInput.value.trim().toLowerCase();
      searchTarget.querySelectorAll("tbody tr, .product-box, .chat-user").forEach(function (item) {
        item.style.display = item.textContent.toLowerCase().includes(query) ? "" : "none";
      });
    });
  }

  const messageForm = document.querySelector("[data-chat-form]");
  if (messageForm) {
    messageForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = messageForm.querySelector("input");
      const list = document.getElementById("messageList");
      if (!input || !list || !input.value.trim()) return;
      const message = document.createElement("div");
      message.className = "message bubble-right";
      message.innerHTML = "<strong>Admin</strong><p></p><small>now</small>";
      message.querySelector("p").textContent = input.value.trim();
      list.appendChild(message);
      input.value = "";
      list.scrollTop = list.scrollHeight;
      showToast("Message added to frontend thread");
    });
  }
})();
