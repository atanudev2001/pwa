let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
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
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
