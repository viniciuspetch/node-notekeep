function validateLogin(username, password) {
    if (!username) {
        alert('Username is empty');
        return false;
    }
    if (!password) {
        alert('Password is empty');
        return false;
    }

    return true;
}

function login() {
    console.log("login()");

    let url = "http://localhost:8000/login";
    let username = $('#username').val();
    let password = $('#password').val();
    if (validateLogin(username, password)) {
        $.post(url, {
            username,
            password
        }, (data) => {
            console.log('result: ' + data.result);
            if (data.reason) console.log('reason: ' + data.reason);
            if (data.token) console.log('token: ' + data.token);
            if (data.result == true) {
                localStorage.setItem('token', data.token);
                window.location.href = '../';
            }
        });
    }

}

$(function () {
    console.log('login.js');
    console.log(localStorage.getItem('token'));
});