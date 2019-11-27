function apiDelete(token, id) {

  alert('here');
  body = {
    token,
    id
  };
  $.post("http://localhost:8000/api/delete", body, (data) => {
    console.log('Note deleted');
    return false;
  });
}

function readPost(data) {
  $.post("http://localhost:8000/api/read", data, (response) => {
    console.log(response);
    for (let i = 0; i < response.length; i++) {
      console.log(response[i]);
      $('#noteList').append('<p>' + response[i].id + ' | ' + response[i].tags + '<br>' + response[i].content + '<br>' + response[i].lastupdated + ' | <a href="/edit/' + response[i].id + '">Edit</a> | <a id="noteItem_' + response[i].id + '" href="#">Delete</a></p>');

      let noteId = '#noteItem_' + response[i].id;

      console.log($(noteId).click(() => {
        apiDelete(token, response[i].id);
      }));
    }

    return false;
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