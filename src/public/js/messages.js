(function () {
  const messageForm = document.querySelector("[data-chat-form], [data-message-form]");
  if (!messageForm) return;

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

    window.showAdminToast && window.showAdminToast("Message added to frontend thread");
  });
})();
