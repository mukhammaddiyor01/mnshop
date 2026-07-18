(function () {
  const conversations = document.querySelectorAll("[data-conversation]");
  const threadTitle = document.querySelector("[data-thread-title]");
  const messageForm = document.querySelector("[data-chat-form]");

  conversations.forEach(function (conversation) {
    conversation.addEventListener("click", function () {
      conversations.forEach(function (item) {
        item.classList.remove("active");
      });
      conversation.classList.add("active");
      const title = conversation.querySelector("strong");
      if (threadTitle && title) threadTitle.textContent = title.textContent;
      const unread = conversation.querySelector("em");
      if (unread) unread.remove();
    });
  });

  if (!messageForm) return;
  messageForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    const list = document.getElementById("messageList");
    if (!input || !list || !input.value.trim()) return;
    const message = document.createElement("div");
    message.className = "message bubble-right";
    message.innerHTML = "<small>Admin · now</small><p></p>";
    message.querySelector("p").textContent = input.value.trim();
    list.appendChild(message);
    input.value = "";
    list.scrollTop = list.scrollHeight;
    window.showAdminToast && window.showAdminToast("Message sent");
  });
})();
