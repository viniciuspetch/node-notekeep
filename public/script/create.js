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

function create() {
    console.log('create()');

    let url = '/api/create';
    let content = $('#note').val();
    let tags = $('#tags').val();
    let token = localStorage.getItem('token');

    $.post(url, {
        content,
        tags,
        token
    }, (data) => {
        console.log('test');
    });

    return false;
}

$(function () {
    console.log('create.js');
    console.log(localStorage.getItem('token'));
});