function apiDelete(id) {
  console.log('[LOG] apiDelete(id)');
  $.ajax({
    url: "/api/note/" + id,
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem('token'),
    },
  }).done((data, textStatus, xhr) => {
    console.log('(' + xhr.status + ') ' + textStatus + '/' + xhr.statusText + ': ' + data);
  }).fail((xhr, textStatus, err) => {
    console.log('(' + xhr.status + ') ' + textStatus + '/' + err + ': ' + xhr.responseText);
  }).then(() => {
    window.location.href = '/read';
  });
}

function readPost() {
  console.log('LOG: readPost()');
  $.ajax({
    url: "/api/note",
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem('token'),
    },
  }).done((response) => {
    console.log(response);
    for (let i = 0; i < response.length; i++) {
      console.log(response[i]);

      let tagList = '';
      for (let j = 0; j < response[i].tag.length; j++) {
        tagList += response[i].tag[j] + ', ';
      }

      let currDate = new Date(response[i].lastupdated);

      $('#noteList').append('<p>' + response[i].id + ' | ' + tagList + '<br>' + response[i].content + '<br>' + currDate + ' | <a href="/edit/' + response[i].id + '">Edit</a> | <a id="noteItem_' + response[i].id + '" href="#">Delete</a></p>');

      let noteId = '#noteItem_' + response[i].id;

      $(noteId).click(() => {
        apiDelete(response[i].id);
      });
    }
    return false;
  });
}

$(function () {
  console.log('read.js');
  console.log(localStorage.getItem('token'));
  readPost();
  token = localStorage.getItem('token');
  $('#updateLink').click(function () {
    $('#noteList').empty();
    readPost();
  });
});