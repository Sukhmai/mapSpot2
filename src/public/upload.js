const inputElement = document.getElementById("fileInput");
const form = document.getElementById("uploadForm");
inputElement.addEventListener("change", handleFiles, false);
form.addEventListener("submit", function (event) {
    event.preventDefault();
    submit();
  });

let file = null;
let password = null;
let tilesetName = null;

function handleFiles() {
  file = this.files;
}

function handlePassword(evt) {
  password = evt.target.value;
}

function handleTilesetName(evt) {
  tilesetName = evt.target.value;
}

function submit() {
  if (file != null && password != null && tilesetName != null) {
    let formData = new FormData();
    formData.append("password", password);
    formData.append("tilesetName", tilesetName);
    formData.append("datafile", file[0]);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", '/uploadFile', true);
    // xhr.setRequestHeader("Content-Type", "multipart/form-data")
    console.log(...formData);
    xhr.send(formData);
  }
}
