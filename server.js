const { exec } = require("child_process");
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 9090 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  exec("docker ps --format '{{.Names}}'", (err, stdout) => {
    if (err) {
      ws.send(JSON.stringify({ type: "error", data: err.message }));
    } else {
      const containers = stdout
        .trim()
        .split("\n")
        .map((name) => name.replace(/'/g, "")); // Remove single quotes

      console.log("Containers (fixed):", containers);
      ws.send(JSON.stringify({ type: "container_list", data: containers }));
    }
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "start_logs") {
        const container = data.container;
        const logStream = exec(`docker logs -f ${container}`);

        logStream.stdout.on("data", (chunk) => {
          ws.send(JSON.stringify({ type: "logs", data: chunk.toString() }));
        });

        logStream.stderr.on("data", (chunk) => {
          ws.send(JSON.stringify({ type: "logs", data: chunk.toString() }));
        });

        ws.on("close", () => logStream.kill());
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });
});

console.log("WebSocket server running on ws://localhost:9090");
