$(function () {
  // GET
  $.ajax({
    url: "/api/tag",
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem('token'),
    },
    data: {},
  }).done((data) => {
    console.log('GET /api/tag');
    console.log(data);
  });

  /*
  // GET id
  $.ajax({
    url: "/api/tag/" + 1,
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem('token'),
    },
    data: {},
  }).done((data) => {
    console.log('GET /api/tag/:id');
    console.log(data);
  });

  // POST
  $.ajax({
    url: "/api/tag",
    method: "POST",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem('token'),
    },
    data: {
      tag: 'asd',
    },
  }).done((data) => {
    console.log('POST /api/tag/:id');
    console.log(data);
  });

  // PUT
  $.ajax({
    url: "/api/tag/" + 1,
    method: "PUT",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem('token'),
    },
    data: {},
  }).done((data) => {
    console.log('PUT /api/tag/:id');
    console.log(data);
  });

  // DELETE
  $.ajax({
    url: "/api/tag/" + 1,
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem('token'),
    },
    data: {},
  }).done((data) => {
    console.log('DELETE /api/tag/:id');
    console.log(data);
  });
  */
})