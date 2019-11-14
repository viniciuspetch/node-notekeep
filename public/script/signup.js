function signup() {
    console.log('signup()');

    let url = "http://localhost:8000/api/signup";
    username = $('#username').val();
    password = $('#password').val();
    data = {username, password};
    console.log(data);
    $.post(url, data, (response) => {
        console.log(response);
    });
}

$(function() {
    console.log('signup.js');
    console.log(localStorage.getItem('token'));
});