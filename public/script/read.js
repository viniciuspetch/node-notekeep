$(function() {
    console.log('read.js');
    $.ajax({
        url: "http://localhost:8000/api/read"
    }).then(function(data) {
        console.log(data);

        for (let i = 0; i < data.length; i++) {
            console.log(data[i]);
            $('#noteList').append('<p>' + data[i].id +
            ' ['+data[i].tags+']:<br>' + data[i].content+'<br>' +
            data[i].datetime + '<br><a href="/edit/' + data[i].id +
            '">Edit</a><br><a href="/api/delete/' + data[i].id + '">Delete</a></p>');
        }
    });
});