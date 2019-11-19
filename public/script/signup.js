function signup() {
    console.log('signup()');

    let url = "http://localhost:8000/api/signup";
    let username = $('#username').val();
    let password = $('#password').val();
    
    $.post(url, {username, password}, (data) => {
        console.log('result: ' + data.result);
        if (data.reason) console.log('reason: ' + data.reason);
        if (data.result == true) {
            localStorage.setItem('token', data.token);
            window.location.href = '../';
        }
    });
}

$(function() {
    console.log('signup.js');
    console.log(localStorage.getItem('token'));
});