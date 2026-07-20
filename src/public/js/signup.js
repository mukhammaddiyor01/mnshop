(function () {
  const form = document.querySelector(".auth-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    const requiredInputs = form.querySelectorAll("input[required]");
    let hasEmptyInput = false;

    requiredInputs.forEach(function (input) {
      if (!input.value.trim()) hasEmptyInput = true;
    });

    if (hasEmptyInput) {
      event.preventDefault();
      alert("Please insert all required inputs");
    }
  });
})();
