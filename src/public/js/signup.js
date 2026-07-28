console.log("Signup frontend javascript file");

function validateSignupForm() {
    const userNick = document.querySelector(".user-nick").value;
    const userPhone = document.querySelector(".user-phone").value;
    const userPassword = document.querySelector(".user-password").value;
    const confirmPassword = document.querySelector(".confirm-password").value;

    if (
    userNick === "" || 
    userPhone === ""  ||
    userPassword === "" ||
    confirmPassword === "" 
    ) {
        alert ("Please insert all required inputs");
        return false;
    }

    if (userPassword !== confirmPassword) {
        alert("Password differs, please check!");
        return false;
    }

    return true;
}
