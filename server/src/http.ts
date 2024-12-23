import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(cors());

const serverHttp = http.createServer(app);

const io = new Server(serverHttp, {
  cors: {
    origin: "*",
    methods: ["GET", "PUT", "POST"],
  },
});

export { io, serverHttp };
