// if('serviceWorker' in navigator){
//     navigator.serviceWorker
//     .register('/sw.js',{scope:'/help/'})
//     .then(function(){
//         console.log('Service Worker registered');    
//     });
// }
var defferedprompt;

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
})