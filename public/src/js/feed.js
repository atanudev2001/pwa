let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments');
let form = document.querySelector('form');
let titleInput= document.querySelector('#title');
let locationInput= document.querySelector('#location');

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(function () {
    createPostArea.style.transform = 'translateY(0)';
  // }, 1);
  if(defferedprompt){
    defferedprompt.prompt();

    defferedprompt.userChoice.then(function(result){
      console.log(result.outcome);

      if(result.outcome === 'dismissed'){
        console.log('User cancelled');
      }
      else{
        console.log('User added to home screen');
      }
    });
   let defferedprompt=null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}
function createCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}
var url = 'http://localhost:3000/pwapost';
var networkDataReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web', data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then(function(data) {
      if (!networkDataReceived) {
        console.log('From cache', data);
        updateUI(data);
      }
    });
}  
function sendData() {
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      // image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-99adf.appspot.com/o/sf-boat.jpg?alt=media&token=19f4770c-fc8c-4882-92f1-62000ff06f16'
    })
  })
    .then(function(res) {
      console.log('Sent data', res);
      updateUI();
    })
}
form.addEventListener('submit', function(e){
    e.preventDefault();

    if(titleInput.value.trim()==='' || locationInput.value.trim()===''){
        alert('Please enter valid inputs');
        return;
    }
    openCreatePostModal();

    if('serviceWorker' in navigator && 'SyncManager' in window){
      navigator.serviceWorker.ready
        .then(function(sw){
          let post ={
            id: new Date().toISOString(),
            title: titleInput.value,
            location:locationInput.value
          };
          WriteData('sync-posts',post)
          .then(function(){
            return sw.sync.register('sync-new-post');
          })
          .then(function(){
            let snackbarContainer = document.querySelector('#confirmation-toast');
            let data = {message: 'Your Post was saved for syncing!'};
            snackbarContainer.MaterialSnackback.showSnackbar(data)
          })
          .catch(function(err){
            console.log(err)
          });
        });
    }else{
      sendData();
    }
})