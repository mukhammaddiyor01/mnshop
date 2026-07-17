$(function(){     });

    //   $(".member-nick").click(function() {
    //     alert(".member-phone").toggle();
    //   });
    // 
function validateSignupForm() {
        // console.log("Executed validateSignupForm");
    const userNick = $(".userr-nick").val();
    const userPhone = $(".user-phone").val();
    const userPassword = $(".user-password").val();
    const userPassword = $(".confirm-password").val();

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
        alert("Password differs, please check!")
        return false;
    }

    
}