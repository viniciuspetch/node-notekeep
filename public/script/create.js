function create() {
    console.log('create()');

    let url = '/api/create';
    let content = $('#note').val();
    let tags = $('#tags').val();
    let token = localStorage.getItem('token');

    $.post(url, {content, tags, token}, (data) => {
        console.log('test');
    });

    return false;
}

$(function() {
    console.log('create.js');
    console.log(localStorage.getItem('token'));
});