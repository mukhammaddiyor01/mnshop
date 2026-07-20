(function () {
  const messageForm = document.querySelector("[data-message-form]");
  if (!messageForm) return;

  document.querySelectorAll(".conversation-item").forEach(function (conversation) {
    conversation.addEventListener("click", function () {
      document.querySelectorAll(".conversation-item").forEach(function (item) {
        item.classList.remove("active");
      });
      conversation.classList.add("active");
      const title = document.querySelector("[data-thread-title]");
      const unread = conversation.querySelector("em");
      const conversationTitle = conversation.querySelector("strong");
      if (title && conversationTitle) title.textContent = conversationTitle.textContent;
      if (unread) unread.remove();
    });
  });

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

    window.showAdminToast && window.showAdminToast("Message added to admin thread");
  });
})();
