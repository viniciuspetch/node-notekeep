$(function() {
    console.log('index.js');
    console.log(localStorage.getItem('token'));

    if (localStorage.getItem('token')) {
        $('#create').show()
        $('#read').show()
        $('#signout').show()
        $('#login').hide()
        $('#signup').hide()
        $("#isLogged").append("Logged");
    }
    else {
        $('#create').hide()
        $('#read').hide()
        $('#signout').hide()
        $('#login').show()
        $('#signup').show()
    }
});