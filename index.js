//Auth0 Stuff
let auth0 = null;
const fetchAuthConfig = () => fetch("/auth_config.json");
const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();
  
    auth0 = await createAuth0Client({
      domain: config.domain,
      client_id: config.clientId
    });
  };

window.onload = async () => {
  await configureClient();
  updateUI();
  const isAuthenticated = await auth0.isAuthenticated();
  if (isAuthenticated) {
    // show the gated content
    return;
  }
  // NEW - check for the code and state parameters
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {

    // Process the login state
    await auth0.handleRedirectCallback();
    updateUI();
    // Use replaceState to redirect the user away and remove the querystring parameters
    window.history.replaceState({}, document.title, "/");
  }
};

const updateUI = async () => {
  const isAuthenticated = await auth0.isAuthenticated();

  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;

  // If authenticated - add logic to show/hide table and buttons, show logout button, fetch table data
  if (isAuthenticated) {
    document.getElementById("table-container").classList.remove("hidden");
    document.getElementById("nav-saved-translations").classList.remove("hidden");
    document.getElementById("btn-logout").classList.remove("hidden");
    document.getElementById("btn-login").classList.add("hidden");
    //Load Table data only if Authenticated
    getTableData();

    //Else if not Authenticated - hide buttons and show login button and do not fetch table data
  } else {
    document.getElementById("table-container").classList.add("hidden");
    document.getElementById("nav-saved-translations").classList.add("hidden");
    document.getElementById("btn-logout").classList.add("hidden");
    document.getElementById("btn-login").classList.remove("hidden");
  }
};

const login = async () => {
    await auth0.loginWithRedirect({
      redirect_uri: window.location.origin
    });
  };

  const logout = () => {
    auth0.logout({
      returnTo: window.location.origin
    });
  };


//Load table - Old method. Now doing through Auth0 checks above
document.addEventListener('DOMContentLoaded', () => {
//    getTableData();
})

//Translation Function, input is text from form then outputs to DOM and has Save button
function translateData(type,input) {
    //Live fetch, **Note limited to 5 requests per hour
    fetch(`https://api.funtranslations.com/translate/${type}.json?text=${input}`) 
        .then((response) => {
        response
        .json()
        .then((data) => {
            let outputText = data.contents.text;
            let outputTranslated = data.contents.translated;
            let outputTranslation = data.contents.translation;
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
            translatedHtml.innerHTML = `"${outputTranslated}"`;
            saveBtnHtml.innerHTML = `Save Translation`;
            outputCol.append(translatedHtml,saveBtnHtml);
            translatedHtml.setAttribute('id','translatedOutput');
            saveBtnHtml.setAttribute('id','saveBtn');
            saveBtnHtml.classList.add("btn","btn-primary","mt-3");
            //Save translation button
            saveBtnHtml.addEventListener('click', function() {saveLocally(outputText, outputTranslated, outputTranslation)});
            //Show Output Container
            let outputContainer = document.getElementById("output-container");
            outputContainer.classList.remove("d-none");
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

//Translation Form on Submit listener
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

//Populate edit form in modal when click edit button
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
