function readPost(data) {
  $.post("http://localhost:8000/api/read", data, (response) => {
    console.log(response);
    for (let i = 0; i < response.length; i++) {
      console.log(response[i]);
      $('#noteList').append('<p>' + response[i].id + ' | ' + response[i].tags + '<br>' + response[i].content + '<br>' + response[i].lastupdated + ' | <a href="/edit/' + response[i].id + '">Edit</a> | <a href="/api/delete/' + response[i].id + '">Delete</a></p>');
    }
  });
}

$(function () {
  console.log('read.js');
  console.log(localStorage.getItem('token'));

  $('#updateLink').click(function () {
    $('#noteList').empty();
    readPost({
      token
    });
  });

  token = localStorage.getItem('token');
  readPost({
    token
  });
});