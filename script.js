let video = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-cont");
let captureBtnCont = document.querySelector(".capture-btn-cont");
let recordBtn = document.querySelector(".record-btn");
let captureBtn = document.querySelector(".capture-btn");
let transparentColor = "transparent";

let recordFlag = false;
let recorder;
let chunks = [];   //media data

let constraints = {
    video: true,
    audio: true
}

//navigator -> gives browser info
//mediadevices -> to access hardware
//getusermedia -> asks for permission

navigator.mediaDevices.getUserMedia(constraints)   
.then((stream) => {
    video.srcObject = stream;

    recorder = new MediaRecorder(stream);
    recorder.addEventListener("start", (e) => {
        chunks = [];
    })
    recorder.addEventListener("dataavailable", (e) => {
        chunks.push(e.data);  
    })

    recorder.addEventListener("stop", (e) => {
        //conversion of chunks to video
        let blob = new Blob(chunks, {type: "video/mp4"});

        //store video
        if(db){
            let videoID = shortid();
            let dbTransaction = db.transaction("video", "readwrite");  //transaction operation -> either success or failure
            let videoStore = dbTransaction.objectStore("video");
            let videoEntry = {
                id: `vid- ${videoID}`,          //keyPath id
                blobData: blob
            }
            videoStore.add(videoEntry);
        }
        // let videoURL = URL.createObjectURL(blob);
        // let a = document.createElement("a");
        // a.href = videoURL;
        // a.download = "stream.mp4";
        // a.click();
    })
})

recordBtnCont.addEventListener("click", (e) => {
    if(!recorder) return;

    recordFlag = !recordFlag;
    if(recordFlag){     //start
        recorder.start();
        recordBtn.classList.add("scale-record");
        startTimer();
    }
    else{      //stop
        recorder.stop();
        recordBtn.classList.remove("scale-record");
        stopTimer();
    }
})

captureBtnCont.addEventListener("click", (e) => {
    captureBtn.classList.add("scale-capture");
    
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let tool = canvas.getContext("2d");     //tool to draw on canvas
    tool.drawImage(video, 0, 0, canvas.width, canvas.height);    //draws image on canvas
    
    //filtering
    tool.fillStyle = transparentColor;
    tool.fillRect(0, 0, canvas.width, canvas.height);

    let imageURl = canvas.toDataURL();

    if(db){
        let imageID = shortid();
        let dbTransaction = db.transaction("image", "readwrite");  //transaction operation -> either success or failure
        let imageStore = dbTransaction.objectStore("image");
        let imageEntry = {
            id: `img- ${imageID}`,          //keyPath id
            url: imageURl
        }
        imageStore.add(imageEntry);
    }

    setTimeout(() => {
        captureBtn.classList.remove("scale-capture");
    }, 500);
})

let timerID;
let counter = 0;  //represents total secpnds
let timer = document.querySelector(".timer");
function startTimer(){
    timer.style.display = "block";
    function displayTimer(){
        let totalSeconds = counter;
         
        let hours = Number.parseInt(totalSeconds/3600);
        totalSeconds = totalSeconds % 3600;   //remaining seconds

        let minutes = Number.parseInt(totalSeconds/60);
        totalSeconds = totalSeconds%60;

        let seconds = totalSeconds;

        hours = (hours<10) ? `0${hours}` : hours;
        minutes = (minutes<10) ? `0${minutes}` : minutes;
        seconds = (seconds<10) ? `0${seconds}` : seconds;

        timer.innerText = `${hours}:${minutes}:${seconds}`;

        counter++;
    }
    timerID = setInterval(displayTimer, 1000)
}

function stopTimer(){
    timer.style.display = "none";
    clearInterval(timerID);
    timer.innerText = "00:00:00";
    counter = 0;
}

//filtering logic

let filterLayer = document.querySelector(".filter-layer");
let allFilters = document.querySelectorAll(".filter");
allFilters.forEach((filterElem) => {
    filterElem.addEventListener("click", (e) => {
        //get
        transparentColor = getComputedStyle(filterElem).getPropertyValue("background-color");
        filterLayer.style.backgroundColor = transparentColor; 
    })
})
