const WebSocket = require("ws");
const http = require("http");
const url = require("url");
const fs = require("fs");

const port = 8080;

const server = http.createServer(function (req, res) {
  const q = url.parse(req.url, true);
  let filename = `.${q.pathname}`
  if (q.pathname == "/")
    filename = "./client-side/index.html";

  const stat = fs.statSync(filename);

  fs.readFile(filename, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end(`404 Not Found:</br>File: \'${filename.substr(2)}\' cannot be retrieved`);
    }

    res.writeHead(200, { "Content-Type": "text/html", "Content-Length": stat.size });
    res.write(data);
    return res.end();
  })
});

server.listen(port);

const websocket = new WebSocket.Server({ server });
let clients = 0;

websocket.on("connection", ws => {
  const index = clients++;
  console.log(`Client connected at index ${index}`);

  ws.on("message", data => {
    const object = JSON.parse(data.toString());

    websocket.clients.forEach(client => {
      if (client != ws && client.readyState === WebSocket.OPEN) {
        let data = { entityData: object, index };
        let buffer = Buffer.from(JSON.stringify(data));
        client.send(buffer);
      }
    });
  });

  ws.on("close", () => {
    websocket.clients.forEach(client => {
      if (client != ws && client.readyState === WebSocket.OPEN) {
        let data = { removed: true, index };
        let buffer = Buffer.from(JSON.stringify(data));
        client.send(buffer);
      }
    });
  });

  ws.on("pong", () => ws.alive = true);
});

setInterval(() => {
  websocket.clients.forEach(client => {
    if (client.alive === false) client.terminate();

    client.alive = false;
    client.ping();
  })
}, 500);