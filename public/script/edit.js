function isAlphaNumeric(str) {
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

function validateNote(content, tags) {
  if (!content) {
    alert('Content is empty');
    return false;
  }
  let tagsList = tags.split(',');
  for (let i = 0; i < tagsList.length; i++) {
    if (!isAlphaNumeric(tagsList[i])) {
      alert('Tags must have letters or numbers only');
      return false;
    }
  }

  return true;
}

function edit() {
  console.log('edit()');

  let content = $('#content').val();
  let tags = $('#tags').val();
  let currUrlArray = window.location.href.split('/');
  let noteId = currUrlArray[currUrlArray.length - 1];

  if (validateNote(content, tags)) {
    $.ajax({
      url: "/api/note/" + noteId,
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem('token'),
      },
      data: {
        content,
        tags,
      },
    }).done(() => {
      console.log('Note modified');
    });
  };

  return false;
}

$(function () {
  console.log('edit.js');
  console.log(localStorage.getItem('token'));
  let token = localStorage.getItem('token');

  let currUrlArray = window.location.href.split('/');
  let noteId = currUrlArray[currUrlArray.length - 1];

  console.log(noteId);

  // Get current note
  $.ajax({
    url: "/api/note/" + noteId,
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem('token'),
    },
  }).done((data, textStatus, xhr) => {
    console.log('(' + xhr.status + ') ' + textStatus + '/' + xhr.statusText + ': ' + data);
    $("#content").val(data[0].content);
    $("#tags").val(data[0].tags);
  }).fail((xhr, textStatus, err) => {
    console.log('(' + xhr.status + ') ' + textStatus + '/' + err + ': ' + xhr.responseText);
  }).then(() => {
    console.log('/api/note/:id POST');
  });
});