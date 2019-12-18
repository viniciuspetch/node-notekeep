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

function validateNote(content, tagList) {
  if (!content) {
    alert('Content is empty');
    return false;
  }
  
  for (let i = 0; i < tagList.length; i++) {
    if (!isAlphaNumeric(tagList[i])) {
      alert('Tags must have letters or numbers only');
      return false;
    }
  }
  return true;
}

function create() {
  console.log('create()');

  let content = $('#note').val();
  let tagString = $('#tags').val();
  let tagList = tagString.split(',').map(function(tag) {
    return tag.trim();
  });

  if (validateNote(content, tagList)) {
    $.ajax({
      url: '/api/note',
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + localStorage.getItem('token'),
      },
      data: {
        content,
        tagList,
      },
    }).done(() => {
      //window.location.href = '/read';
    });
  }
  return false;
}

$(function () {
  console.log('create.js');
  console.log(localStorage.getItem('token'));
});