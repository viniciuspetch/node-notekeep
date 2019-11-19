$(function() {
    console.log('signout.js');
    console.log(localStorage.getItem('token'));

    localStorage.removeItem('token');
    window.location.replace('../');
    // Redirect to /index
});