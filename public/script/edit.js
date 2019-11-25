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

    let url = '/api/edit';
    let content = $('#content').val();
    let tags = $('#tags').val();
    let token = localStorage.getItem('token');
    let currUrlArray = window.location.href.split('/');
    let noteId = currUrlArray[currUrlArray.length - 1];

    let input = {
        content,
        tags,
        token,
        id: noteId
    };
    console.log(input);

    if (validateNote(content, tags)) {
        $.post(url, input, (output) => {
            console.log(output);
            console.log('edit post');
        });
    };

    return false;
}

$(function () {
    console.log('edit.js');
    console.log(localStorage.getItem('token'));
    let token = localStorage.getItem('token');

    let url = '/api/read'
    let currUrlArray = window.location.href.split('/');
    let noteId = currUrlArray[currUrlArray.length - 1];

    console.log(noteId);

    $.post(url, {
        token,
        noteId
    }, (data) => {
        console.log(data[0]);

        $("#content").val(data[0].content);
        $("#tags").val(data[0].tags);
    });
});