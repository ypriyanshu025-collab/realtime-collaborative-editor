import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';

const app = express();
const PORT = process.env.PORT || 5000;

const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

const docs = new Map();

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws, req) => {
  const docName = req.url.slice(1) || 'default';
  
  if (!docs.has(docName)) {
    docs.set(docName, { doc: new Y.Doc(), clients: new Set() });
  }

  const room = docs.get(docName);
  room.clients.add(ws);

  ws.on('message', (message) => {
    room.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    room.clients.delete(ws);
    if (room.clients.size === 0) {
      docs.delete(docName);
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', activeRooms: docs.size });
});

server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on http://localhost:${PORT}`);
});