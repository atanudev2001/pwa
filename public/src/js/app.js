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
    if('serviceWorker' in navigator){
        let options ={
            body:'You successfully subscribed to our Notifications Service',
            icon:'/src/images/icons/app-icon-96x96.png',
            image:'/src/images/sf-boat.jpg',
            dir:'ltr',
            lang:'en-US',//BCP 47,
            vibrate: [100,50,200], // vibrate for 100 ms pause for 50 ms and again vibrate for 300 ms (not supported by all devices)
            badge:'/src/images/icons/app-icon-96x96.png',
            tag: 'Confirm Notification',
            renotify: true,
            actions:[
                {action:'confirm',title:'Okay',icon:'/src/images/icons/app-icon-96x96.png' },
                {action:'cancel',title:'Cancel',icon:'/src/images/icons/app-icon-96x96.png' }
            ]
        };

        navigator.serviceWorker.ready
            .then(function(swreg){
                swreg.showNotification('Successfully subscribed(from SW)',options);
            });
    }
    
    // new Notification('Successfully subscribed!',options)
}

function configurepushsub(){
    if(!('serviceWorker' in navigator)){
        return; 
    }
    let reg;
    navigator.serviceWorker.ready
        .then(function(swreg){
            return swreg.pushManager.getSubscription();
        })
        .then(function(sub){
            if(sub === null){
                //create a new subscription
                reg.pushManager.subscribe({
                    userVisibleOnly: true
                });
            }else{
                //We have a subscription

            }
        });
}
function notificationstatus(){
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
        enablenotifications[i].addEventListener('click',notificationstatus);
    }
}