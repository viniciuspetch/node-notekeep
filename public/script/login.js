function validateLogin(username, password) {
  var result = true;
  $("#username").removeClass("input-invalid");
  $("#password").removeClass("input-invalid");
  $("#usernameFeedback").hide();
  $("#passwordFeedback").hide();
  if (!username) {
    $("#username").addClass("input-invalid");
    $("#usernameFeedback").show();
    result = false;
  }
  if (!password) {
    $("#password").addClass("input-invalid");
    $("#passwordFeedback").show();
    result = false;
  }

  return result;
}

function login() {
  console.log("login()");
  let url = "http://localhost:8000/api/login";
  let username = $("#username").val();
  let password = $("#password").val();

  if (validateLogin(username, password)) {
    console.log("Status: User information validated");

    $.ajax({
      url: "/api/login",
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
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        window.location.href = "../";
      })
      .fail((xhr, textStatus, err) => {
        $("#errorMessage").text("Invalid login");
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
  console.log("login.js");
  console.log(localStorage.getItem("token"));
});
