document.addEventListener('DOMContentLoaded', () => {

    getTableData();

})

//Translation Function, input is text from form then outputs to DOM and has Save button
function translateData(input) {
    //Live fetch, limited to 5 requests per hour
    fetch(`https://api.funtranslations.com/translate/yoda.json?text=${input}`) 

    //Local test version using saved local data so just dummy data
    //fetch(`http://localhost:3000/translations/1`) 
        .then((response) => {
        response
        .json()
        .then((data) => {
            let outputText = data.contents.text;
            //let outputText = data.text;
            let outputTranslated = data.contents.translated;
            //let outputTranslated = data.translated;
            let outputTranslation = data.contents.translation;
            //let outputTranslation = data.translation;
            console.log(data);
            //Output to DOM
            document.getElementById("outputArea").innerHTML = `
            <p>Text: ${outputText}</p>
            <p>Translated: ${outputTranslated}</p>
            <p>Translation Type: ${outputTranslation}</p>
            <button type="button" class="btn btn-primary" id="saveBtn" onclick="saveLocally('${outputText}','${outputTranslated}','${outputTranslation}')">Save Translation</button>
            `;
            getTableData();
            //save translation button
            //const saveButton = document.getElementById("saveBtn");
            //saveButton.addEventListener('click', saveLocally(outputText, outputTranslated, outputTranslation));
        })
        .catch(function(err) {
            console.log('Error: ' + err);
          });
        
    })
}

//Post local data
function saveLocally(text, translated, translation) {
    fetch("http://localhost:3000/translations", {
        method: 'POST',
        body: JSON.stringify({
            "text": text,
            "translated": translated,
            "translation": translation,
        }),
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        },
        })
        .then((response) => response.json())
        .then((json) => console.log(json))
        .catch(function(err) {
            console.log('Error: ' + err);
          });
}



//On Submit listener and call translation function with text as input
const inputForm = document.getElementById("inputForm");
inputForm.addEventListener('submit', function(event) {
    event.preventDefault();
    text=event.target.elements.inputText.value;
    translateData(text);
})


//Populate Table from local Data
function getTableData() {
    fetch('http://localhost:3000/translations') 
        .then((response) => {
        response
        .json()
        .then((data) => {
            const tableBody = document.getElementById("tableBody");
            tableBody.innerHTML = "";
            let x ='';
            data.forEach((element) => {
                x += "<tr>"
                x += `<th scope="row">${element.id}</th>`
                x += `<td>${element.text}</td>`
                x += `<td>${element.translated}</td>`
                x += `<td>${element.translation}</td>`
                x += `<td><button class='btn editBtn' onclick="editForm('${element.id}')">Edit</button></td>`
                x += "</tr>"
            });
            tableBody.insertAdjacentHTML("beforeend", x);
    })
    })
}

//Populate edit form when click edit button
function editForm(id) {
    fetch(`http://localhost:3000/translations/${id}`) 
        .then((response) => {
        response
        .json()
        .then((data) => {
            let text = data.text;
            let translated = data.translated;
            let id = data.id;
            document.getElementById("editForm").innerHTML = `
            <form id="editForm" onsubmit="return editLocalData(this)">
            <div class="mb-3">
              <label for="textEdit" class="form-label">Edit Text</label>
              <input type="text" name="editText" class="form-control" id="editText" aria-describedby="textEdit" value="${text}">
              <div id="editTextHelp" class="form-text">Edit the input text field</div>
            </div>
            <div class="mb-3">
            <label for="translatedEdit" class="form-label">Edit Translated Text</label>
            <input type="text" name="editTranslated" class="form-control" id="editTranslated" aria-describedby="translatedEdit" value="${translated}">
            <div id="editTranslatedHelp" class="form-text">Edit the translated text field</div>
            </div>
            <div class="mb-3 d-none">
            <label for="dataId" class="form-label">Id</label>
            <input type="text" name="dataId" class="form-control" id="dataId" aria-describedby="dataId" value="${id}">
            </div>
            <button type="submit" class="btn btn-primary" id="editSubmitBtn">Submit</button>
            </form>
            `;

    })
    })
}


function editLocalData(form) {
    form.action = "#";
    let dataId = form.dataId.value;
    let text = form.editText.value;
    let translated = form.editTranslated.value;
    fetch(`http://localhost:3000/translations/${dataId}`, {
        method: 'PATCH',
        body: JSON.stringify({
            "text": text,
            "translated": translated
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        })
        .then((response) => response.json())
        .then((json) => console.log(json))
        .then (alert(`The following data has been modified \r\n \r\n ID: ${dataId} \r\n Text: ${text} \r\n Translated Text: ${translated}`));
} 



