const cacheName = 'todo-cache-v1';
const assets = [
    './',
    './index.html',
    './style.css',
    './App.js',
    './manifest.json',
    './images/icon-192.png',
    './images/icon-512.png'
];

//evento de instalacion: ocurre la priera ves que el service worker se registra 
self.addEventListener('install',e => {
//espera a que todos los archivos esten en cache antes de completar la instalacion 
e.waitUntil(
    caches.open(cacheName)//abre o crea el cache con el nombre espesificado
    .then(cache=>{
        //agrega todos los archivos ´assets´al cache
        return cache.addAll(assets)
        .then(()=> self.skipwaiting());//fuerza al sw a activarse inmediatamente despues de instalarse 
    })
    .catch(err => console.log('Fallo registro de cache',err))//log de errrores en cache
);
});

// evento de activacion: se ejecuta despues de que el sw se instala y toma el control de la aplicacion
self.addEventListener('activate', e =>{
    const cacheWhitelist = [cacheName];

    //elimina caches antiguos que no estan en la lista de permitidos 
    e.waitUntil(
        caches.keys()//obtine todos los nombres de cache actuales 
        .then(cacheNames=>{
            //mapea y elimina caches que no estan en la whitelist
            return Promise.all(
                cacheNames.map(cName=>{
                    // si el cache actual no esta en la whitelist, eliminalo
                    if (!cacheWhitelist.includes(cName)){
                        return caches.delete(cName);//elimina el cache obsoleto

                    }
                })
            );


        })
        // toma el control  de los clientes inmediatamente despues de activarse
        .then(()=>self.clients.claim())
    );



});
// evento 'fech': intercepta las solicitudes de red y decide como responder 
self.addEventListener('fetch', e=>{
    //responde con el recurso en cache o realiza una solicitud de red si no esta en cache 
    e.respondWith(
        caches.match(e.request)// verifica si el recurso solicitado esta en cache 
        .then(res=>{
            if (res){
                //si el recurso esta en cache, se devuelve desde ahi 
                return res;

            }
            //si el recurso  no esta en cache, realiza una solicitud de red 
            return fetch(e.request);

        })
    );
});

