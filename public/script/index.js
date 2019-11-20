$(function() {
    console.log('index.js');
    console.log(localStorage.getItem('token'));

    if (localStorage.getItem('token')) {
        $("#isLogged").append("Logged");
    }
});