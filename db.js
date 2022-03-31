//open database
//create objectStore( can be created or modified only in upgrade needed event)
//make transactions

let db;
let openRequest = indexedDB.open("myDataBase");  //version 1 by default

//console output for 1st time -> DB upgraded
                              // DB success
openRequest.addEventListener("success", (e) => {
    console.log("DB Success");
    db = openRequest.result;
})

openRequest.addEventListener("error", (e) => {
    console.log("DB error");
})

openRequest.addEventListener("upgradeneeded", (e) => {
    console.log("DB upgraded");
    db = openRequest.result;
    
    db.createObjectStore("video", { keyPath: "id"});   //keyPath unique -> to identify objects
    db.createObjectStore("image", { keyPath: "id"});

})
