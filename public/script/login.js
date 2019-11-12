function login() {
    console.log("login()");
    let url = "http://localhost:8000/login";

    $.post(url, (data) => {
        console.log(data);
        console.log(data.token);
        localStorage.setItem('token', data.token);
    });
}

$(function() {
    console.log('edit.js');
    console.log(localStorage.getItem('token'));
});