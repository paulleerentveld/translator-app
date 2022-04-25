document.addEventListener('DOMContentLoaded', () => {

    getTableData();

})

//Translation Function, input is text from form then outputs to DOM and has Save button
function translateData(type,input) {
    //Live fetch, limited to 5 requests per hour
    fetch(`https://api.funtranslations.com/translate/${type}.json?text=${input}`) 

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
            //console.log(data);
            //Output to DOM
            //Set image in Coloumn1 
            let imageCol = document.getElementById("col-img");
            imageCol.innerHTML = `<img class="img-fluid filter-image" src="/img/${type}.jpg" alt="${type}" title="${type}"></img>`;
            //Add input text and type in Column2
            let inputCol = document.getElementById("col-input");
            let textHtml = document.createElement('p');
            let translationTypeHtml = document.createElement('p');
            translationTypeHtml.innerHTML = `Translation Type: ${outputTranslation}`;
            textHtml.innerHTML = `Text: ${outputText}`;
            inputCol.append(textHtml,translationTypeHtml);
            //Add Translation Text and save button to Column3
            let outputCol = document.getElementById("col-output");
            let translatedHtml = document.createElement('p');
            let saveBtnHtml = document.createElement('button');
            translatedHtml.innerHTML = `Translated: ${outputTranslated}`;
            saveBtnHtml.innerHTML = `Save Translation`;
            outputCol.append(translatedHtml,saveBtnHtml);
            saveBtnHtml.setAttribute('id','saveBtn');
            saveBtnHtml.classList.add("btn","btn-primary");

            //save translation button
            saveBtnHtml.addEventListener('click', function() {saveLocally(outputText, outputTranslated, outputTranslation)});

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
            "translated": `${translated}`,
            "translation": translation,
        }),
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        },
        })
        .then((response) => response.json())
        //.then((json) => console.log(json))
        .catch(function(err) {
            console.log('Error: ' + err);
          });
}


//On Submit listener and call translation function with text as input
const inputForm = document.getElementById("inputForm");
inputForm.addEventListener('submit', function(event) {
    event.preventDefault();
    text=event.target.elements.inputText.value;
    type=event.target.elements.tranlationType.value;
    translateData(type,text);
    
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
                x += `<td>${element.id}</td>`
                x += `<td>${element.text}</td>`
                x += `<td>${element.translated}</td>`
                x += `<td>${element.translation}</td>`
                x += `<td><button class='btn btn-primary me-md-2 editBtn' onclick="editForm('${element.id}')" data-bs-toggle="modal" data-bs-target="#modal-edit">Edit</button><button class='btn btn-danger me-md-2 delBtn' onclick="delRow('${element.id}')">Delete</button></td>`
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

//Post edited data from edit form
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


//Delete row of local data
function delRow(id) {
    fetch(`http://localhost:3000/translations/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        })
        .then((response) => response.json())
        .then((json) => console.log(json))
        .then (alert(`The following data has been deleted \r\n ID: ${id}`));
}
