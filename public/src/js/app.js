let defferedprompt;
let enablenotifications = document.querySelectorAll('.enable-notifications');

if('serviceWorker' in navigator){
    navigator.serviceWorker
    .register('/sw.js')
    .then(function(){
        console.log('Service Worker registered');    
    });
}


window.addEventListener('beforeinstallpromt', function(e){
    console.log('beforeinstallpromt fired');
    e.preventDefault();
    defferedprompt = e;
    return false;
});

function displaynotifications(){
    let options ={
        body:'You successfully subscribed to our Notifications Service'
    };
    new Notification('Successfully subscribed!',options)
}
function PermissionStatus(){
    Notification.requestPermission(function(PermissionStatus){
        console.log('Permission', PermissionStatus);
        if(PermissionStatus !='granted'){
            console.log('Permission denied');
        }else{
            displaynotifications();
        }

    })
}

if('Notification' in window){
    for(var i=0;i< enablenotifications.length;i++){
        enablenotifications[i].style.display = 'inline-block';
        enablenotifications[i].addEventListener('click',PermissionStatus);
    }
}