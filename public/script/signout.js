$(function() {
    console.log('signout.js');
    console.log(localStorage.getItem('token'));

    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.replace('../');
    // Redirect to /index
});