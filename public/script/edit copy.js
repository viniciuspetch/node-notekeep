$(function() {
    console.log('read.js');
    let url_id = window.location.href.split('/');
    console.log(url_id);
    /*
    $.ajax({
        url = new URL(window.location.href);
        url: "http://localhost:8000/api/read"
    }).then(function(data) {
        console.log(data);

        for (let i = 0; i < data.length; i++) {
            console.log(data[i]);
            $('#noteList').append('<p>' + data[i].id + ' ['+data[i].tags+']:<br>' + data[i].content+'<br>' + data[i].datetime + 
            '<br> <a href="/edit/' + i + '">Edit</a>' + '</p>');
        }
    });
    */
});