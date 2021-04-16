'use strict';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const body = document.querySelector('body');
let message = "loading the model...";
const widthOfCanvas = 1280;
const heightOfCanvas = 720;

canvas.width = widthOfCanvas;
canvas.height = heightOfCanvas;

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

const draw = (a, b) => {
  drawRect({x: 0,y: 0}, a, b, "#ff0000");
  drawRect({x: a,y: 0}, a, b, "#00ff00");
  drawRect({x: 0,y: b}, a, b, "#0000ff");
  drawRect({x: a,y: b}, a, b, "#ffff00");
  drawText();
}

draw(widthOfCanvas/2, heightOfCanvas/2);
drawTitle();

const hasGetUserMedia = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if(hasGetUserMedia()) {
  let predictions = [];
  const constraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
  }

  const video = document.querySelector('video');
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
  });

  const modelLoaded = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    message = "Show you hand within the color quadrants to change the background color of the body";
    draw(widthOfCanvas/2, heightOfCanvas/2);
    drawTitle();  
  }

  const drawPoints = (x, y) => {
    context.beginPath();
    context.fillStyle = "#000000";
    context.arc(x, y, 5, 0, Math.PI * 2, true);
    context.fill();
  }

  const handpose = ml5.handpose(video, modelLoaded); 

  handpose.on('predict', results => {
    predictions = results;
    for(const prediction of predictions) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      draw(widthOfCanvas/2, heightOfCanvas/2);
      drawTitle();
      const landmarks = prediction.landmarks;
      //const indexFingerLandmarks = [landmarks[5],landmarks[6],landmarks[7],landmarks[8]];
      for(const point of landmarks) {
        if(point[0] > 0 && point[0] < widthOfCanvas/2 && point[1] > 0 && point[1] < heightOfCanvas/2) {
          drawPoints(point[0], point[1]);
          body.style.backgroundColor = "red";
        }
        else if(point[0] > widthOfCanvas/2 && point[0] < widthOfCanvas && point[1] > 0 && point[1] < heightOfCanvas/2) {
          drawPoints(point[0], point[1]);
          body.style.backgroundColor = "green";
        }
        else if(point[0] > 0 && point[0] < widthOfCanvas/2 && point[1] > heightOfCanvas/2 && point[1] < heightOfCanvas) {
          drawPoints(point[0], point[1]);
          body.style.backgroundColor = "blue";
        }
        else if(point[0] > widthOfCanvas/2 && point[0] < widthOfCanvas && point[1] > heightOfCanvas/2 && point[1] < heightOfCanvas) {
          drawPoints(point[0], point[1]);
          body.style.backgroundColor = "yellow";
        }
      }
    }
  });

} else {
  alert("getUserMedia() is not supported by your browser");
}

