const inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, false);
function handleFiles() {
  if(this.files != undefined) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/uploadFile', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      file: this.files
    }));
  }

}
