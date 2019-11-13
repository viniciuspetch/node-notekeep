$(function() {
    console.log('edit.js');
    console.log(localStorage.getItem('token'));
    
    let url_array = window.location.href.split('/');
    let url_id = url_array[url_array.length-1];
    console.log(url_id);
    let url_final = "http://localhost:8000/api/read?id=" +  url_id;
    console.log(url_final);

    $.ajax({
        url: url_final,
    }).then(function(data) {
        console.log(data);
        $("#id").val(data.id);
        $("#content").val(data.content);
        $("#tags").val(data.tags);
    });
});