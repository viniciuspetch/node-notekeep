function search() {
  console.log("Function: search()");
  let searchString = $("#searchbar").val();
  let tagString = $("#tag-list").val();
  $(".note-item").each(function () {
    if ($(this).find(".note-tags").text().includes(tagString)) {
      if (
        $(this).find(".note-content").text().includes(searchString) ||
        $(this).find(".note-tags").text().includes(searchString)
      ) {
        $(this).show();
      } else {
        $(this).hide();
      }
    } else {
      $(this).hide();
    }
  });
}

function tagUsed() {
  console.log("Function: tagUsed()");
  $.ajax({
    url: "/api/tagUsed",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .done((data, textStatus, xhr) => {
      console.log(
        "(" +
          xhr.status +
          ") " +
          textStatus +
          "/" +
          xhr.statusText +
          ": " +
          data
      );

      for (let i = 0; i < data.length; i++) {
        $("#tag-list").append(
          '<option value="' + data[i].tag + '">' + data[i].tag + "</a>"
        );
      }
    })
    .fail((xhr, textStatus, err) => {
      console.log(
        "(" +
          xhr.status +
          ") " +
          textStatus +
          "/" +
          err +
          ": " +
          xhr.responseText
      );
    });
}

function apiDelete(id) {
  console.log("[LOG] apiDelete(id)");
  $.ajax({
    url: "/api/note/" + id,
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .done((data, textStatus, xhr) => {
      console.log(
        "(" +
          xhr.status +
          ") " +
          textStatus +
          "/" +
          xhr.statusText +
          ": " +
          data
      );
    })
    .fail((xhr, textStatus, err) => {
      console.log(
        "(" +
          xhr.status +
          ") " +
          textStatus +
          "/" +
          err +
          ": " +
          xhr.responseText
      );
    })
    .then(() => {
      window.location.href = "/read";
    });
}

function readPost() {
  console.log("LOG: readPost()");
  $.ajax({
    url: "/api/note",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  }).done((response) => {
    console.log(response);
    for (let i = 0; i < response.length; i++) {
      console.log(response[i]);
      let tagList = response[i].tag.join(", ");
      let urlList = response[i].listURLs.join(", ");
      console.log(response[i].lastupdated);
      let currDate = new Date(response[i].lastupdated);
      $("#noteTemplate")
        .clone()
        .attr("id", "note_" + response[i].id)
        .show()
        .appendTo("#noteList");

      //
      $("#note_" + response[i].id)
        .find("#note-marked")
        .change(function () {
          updateMark(response[i].id, $(this).prop("checked"));
        });
      if (response[i].marked == true) {
        $("#note_" + response[i].id)
          .find("#note-marked")
          .prop("checked", true);
      }

      if (response[i].img == "") {
        $("#note_" + response[i].id)
          .find("img")
          .hide();
      } else {
        $("#note_" + response[i].id)
          .find("img")
          .show();
        $("#note_" + response[i].id)
          .find("img")
          .attr("src", response[i].img);
      }
      $("#note_" + response[i].id)
        .find(".note-id")
        .append(response[i].id);

      if (tagList.length == 0) {
        $("#note_" + response[i].id)
          .find(".note-tags")
          .hide();
      } else {
        $("#note_" + response[i].id)
          .find(".note-tags")
          .show();
        $("#note_" + response[i].id)
          .find(".note-tags")
          .append("Tags: " + tagList);
      }

      $("#note_" + response[i].id)
        .find(".note-content")
        .append(response[i].content);
      $("#note_" + response[i].id)
        .find(".note-date")
        .append(currDate);
      if (urlList.length == 0) {
        $("#note_" + response[i].id)
          .find(".note-urls")
          .hide();
      } else {
        $("#note_" + response[i].id)
          .find(".note-urls")
          .show();
        $("#note_" + response[i].id)
          .find(".note-urls")
          .append("URLs: " + urlList);
      }
      $("#note_" + response[i].id)
        .find(".note-edit")
        .attr("href", "/edit/" + response[i].id);
      $("#note_" + response[i].id)
        .find(".note-delete")
        .attr("id", "noteItem_" + response[i].id);
      let noteId = "#noteItem_" + response[i].id;
      $(noteId).click(() => {
        apiDelete(response[i].id);
      });
    }
    return false;
  });
}

function updateMark(a, b) {
  fetch("/api/note/" + a + "/setMark", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ marked: b }),
  }).then((r) => console.log(r));
}

$(function () {
  console.log("read.js");
  console.log(localStorage.getItem("token"));

  if (localStorage.getItem("token") == null) {
    window.location.href = "/";
  }

  readPost();
  tagUsed();

  token = localStorage.getItem("token");
  $("#updateLink").click(function () {
    $("#noteList").empty();
    readPost();
  });

  $("#tag-list").change(search());
});
