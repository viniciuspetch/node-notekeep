function isAlphaNumeric(str) {
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)
    ) {
      // lower alpha (a-z)
      return false;
    }
  }
  return true;
}

function validateLogin(username, password) {
  var result = true;
  $("#username").removeClass("input-invalid");
  $("#password").removeClass("input-invalid");
  $("#usernameFeedback").hide();
  $("#passwordFeedback").hide();

  if (username.length > 32) {
    $("#username").addClass("input-invalid");
    $("#usernameFeedback").show();
    $("#usernameFeedback").text("Username is too long");
    result = false;
  }
  if (password.length > 32) {
    $("#password").addClass("input-invalid");
    $("#passwordFeedback").show();
    $("#passwordFeedback").text("Password is too long");
    result = false;
  }
  if (password.length < 4) {
    $("#password").addClass("input-invalid");
    $("#passwordFeedback").show();
    $("#passwordFeedback").text("Password is too short");
    result = false;
  }
  if (!isAlphaNumeric(username)) {
    $("#username").addClass("input-invalid");
    $("#usernameFeedback").show();
    $("#usernameFeedback").text("Username must have letters and numbers only");
    result = false;
  }
  if (!isAlphaNumeric(password)) {
    $("#password").addClass("input-invalid");
    $("#passwordFeedback").show();
    $("#passwordFeedback").text("Password must have letters and numbers only");
    result = false;
  }
  if (!username) {
    $("#username").addClass("input-invalid");
    $("#usernameFeedback").show();
    $("#usernameFeedback").text("Username is required");
    result = false;
  }
  if (!password) {
    $("#password").addClass("input-invalid");
    $("#passwordFeedback").show();
    $("#passwordFeedback").text("Password is required");
    result = false;
  }

  return result;
}

function signup() {
  console.log("signup()");

  let url = "http://localhost:8000/api/signup";
  let username = $("#username").val();
  let password = $("#password").val();

  if (validateLogin(username, password)) {
    console.log("Status: User information validated");

    $.ajax({
      url: "/api/signup",
      method: "POST",
      data: {
        username,
        password,
      },
    })
      .done((data, textStatus, xhr) => {
        console.log(
          "(" +
            xhr.status +
            ") " +
            textStatus +
            "/" +
            xhr.statusText +
            ": " +
            data
        );
        window.location.href = "../";
      })
      .fail((xhr, textStatus, err) => {
        console.log(
          "(" +
            xhr.status +
            ") " +
            textStatus +
            "/" +
            err +
            ": " +
            xhr.responseText
        );
      });
  }
}

$(function () {
  console.log("signup.js");
  console.log(localStorage.getItem("token"));
});
