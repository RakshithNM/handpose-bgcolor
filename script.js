'use strict';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const body = document.querySelector('body');
let message = "loading the model...";

canvas.width = 1280;
canvas.height = 960;

const drawRect = (p1, width, height, color) => {
  context.beginPath();
  context.rect(p1.x, p1.y, width, height);
  context.fillStyle = color;
  context.fill();
}

const drawText = () => {
  context.font = "15px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#000000";
  context.fillText(message, canvas.width/2, 100);
}

const drawTitle = () => {
  context.font = "30px Arial";
  context.fillText("HAND RECOGNITION BACKGROUND COLOR CHANGE", canvas.width/2, 50);
}

const draw = () => {
  drawRect({x: 0,y: 0}, 640, 480, "#ff0000");
  drawRect({x: 640,y: 0}, 640, 480, "#00ff00");
  drawRect({x: 0,y: 480}, 640, 480, "#0000ff");
  drawRect({x: 640,y: 480}, 640, 480, "#ffff00");
  drawText();
}

draw();
drawTitle();

const hasGetUserMedia = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if(hasGetUserMedia()) {
  let predictions = [];
  const constraints = {
    video: true,
  }

  const video = document.querySelector('video');
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
  });

  const modelLoaded = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    message = "Show you hand within the color quadrants to change the background color of the body";
    draw();
    drawTitle();  
  }

  const handpose = ml5.handpose(video, modelLoaded); 

  handpose.on('predict', results => {
    predictions = results;
    for(const prediction of predictions) {
      const landmarks = prediction.landmarks;
      const indexFingerLandmarks = [landmarks[5],landmarks[6],landmarks[7],landmarks[8]];
      for(const point of indexFingerLandmarks) {
        if(point[0] > 0 && point[0] < 320 && point[1] > 0 && point[1] < 240) {
          body.style.backgroundColor = "red";
        }
        else if(point[0] > 320 && point[0] < 640 && point[1] > 0 && point[1] < 240) {
          body.style.backgroundColor = "green";
        }
        else if(point[0] > 0 && point[0] < 320 && point[1] > 240 && point[1] < 480) {
          body.style.backgroundColor = "blue";
        }
        else if(point[0] > 320 && point[0] < 640 && point[1] > 240 && point[1] < 480) {
          body.style.backgroundColor = "yellow";
        }
      }
    }
  });

} else {
  alert("getUserMedia() is not supported by your browser");
}

