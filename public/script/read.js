$(function() {
    console.log('read.js');
    console.log(localStorage.getItem('token'));
    
    token = localStorage.getItem('token');
    data = {token};
    $.post("http://localhost:8000/api/read", data, (response) => {
        console.log(response);
        for (let i = 0; i < response.length; i++) {
            console.log(response[i]);
            $('#noteList').append('<p>'
            + response[i].id
            + ' | ' 
            + response[i].tags 
            + '<br>'
            + response[i].content
            + '<br>'
            + response[i].lastupdated
            + ' | <a href="/edit/'
            + response[i].id
            +'">Edit</a> | <a href="/api/delete/'
            + response[i].id
            + '">Delete</a></p>');
        }
    });
});