let ws = new WebSocket("ws://localhost:8080");
const WIDTH = 400;
const HEIGHT = 400;
const SPEED = 4;
let canvas, ctx;
let player;
const entities = [];

ws.onmessage = e => {
  const fileReader = new FileReader();
  fileReader.onload = e => {
    object = JSON.parse(e.target.result.toString());
    entities[object.index] = object.removed ? null : new Entity(object.entityData);
  };
  fileReader.readAsText(e.data);
}

onload = () => {
  canvas = document.querySelector("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx = canvas.getContext("2d");

  while (!name) name = window.prompt("Enter your username:");
  player = new Entity({ name });

  window.onkeydown = e => {
    player.velX = e.code === "ArrowLeft" ? -SPEED : e.code === "ArrowRight" ? SPEED : 0;
    player.velY = e.code === "ArrowUp" ? -SPEED : e.code === "ArrowDown" ? SPEED : 0;
  };

  window.onkeyup = e => {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
      player.velX = 0;
    }
    if (e.code === "ArrowUp" || e.code === "ArrowDown") {
      player.velY = 0;
    }
  };

  update();
}

function update() {
  if (ws.readyState == ws.OPEN) {
    syncData();
  }

  player.update();
  for (let e of entities) {
    if (e) {
      e.update();
    }
  }

  draw();

  requestAnimationFrame(update);
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, 20, 20);

  ctx.fillStyle = "red";
  for (let e of entities) {
    if (e) {
      ctx.fillText(e.name, e.x, e.y - 10);
      ctx.fillRect(e.x, e.y, 20, 20);
    }
  }
}

function syncData() {
  ws.send(new Blob([JSON.stringify(player)]));
}