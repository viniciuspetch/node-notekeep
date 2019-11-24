function edit() {
    console.log('edit()');

    let url = '/api/edit';
    let content = $('#content').val();
    let tags = $('#tags').val();
    let token = localStorage.getItem('token');
    let currUrlArray = window.location.href.split('/');
    let noteId = currUrlArray[currUrlArray.length - 1];

    let input = {content, tags, token, id: noteId};
    console.log(input);

    $.post(url, input, (output) => {
        console.log(output);
        console.log('edit post');
    })

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