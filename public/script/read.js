function apiDelete(token, id) {
  body = {
    token,
    id
  };

  $.ajax({
    url: "/api/note/" + id,
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem('token'),
    },
  }).done((data, textStatus, xhr) => {
    console.log(data);
    console.log(textStatus);
    console.log(xhr.status);
    console.log(xhr);
  }); 
}

function readPost() {
  console.log('LOG: readPost()');
  $.ajax({
    url: "/api/read",
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem('token'),
    },
  }).done((response) => {
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
    readPost();
  });

  token = localStorage.getItem('token');
  readPost();
});