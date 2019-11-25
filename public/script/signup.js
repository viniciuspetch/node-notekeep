function isAlphaNumeric(str) {
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
};

function validateLogin(username, password) {
    if (!username) {
        alert('Username is empty');
        return false;
    }
    if (!password) {
        alert('Password is empty');
        return false;
    }
    if (username.length > 32) {
        alert('Username is too long');
        return false;
    }
    if (password.length > 32) {
        alert('Password is too long');
        return false;
    }
    if (password.length < 4) {
        alert('Password is too short');
        return false;
    }
    if (!isAlphaNumeric(username)) {
        alert('Username must be letters or numbers only');
        return false;
    }
    if (!isAlphaNumeric(password)) {
        alert('Password must be letters or numbers only');
        return false;
    }

    return true;
}

function signup() {
    console.log('signup()');

    let url = "http://localhost:8000/api/signup";
    let username = $('#username').val();
    let password = $('#password').val();

    if (!validateLogin(username, password)) {
        $.post(url, {
            username,
            password
        }, (data) => {
            console.log('result: ' + data.result);
            if (data.reason) console.log('reason: ' + data.reason);
            if (data.result == true) {
                localStorage.setItem('token', data.token);
                window.location.href = '../';
            }
        });
    }
}

$(function () {
    console.log('signup.js');
    console.log(localStorage.getItem('token'));
});