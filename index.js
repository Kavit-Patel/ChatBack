import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import appRouter from "./routes/register.js";
import cookieParser from "cookie-parser";
config();
import { createServer } from "http";
import { Server } from "socket.io";
let chat = [];
const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(cookieParser());
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ["http://localhost:5173"] },
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(() => console.log("Error connecting Database"));

app.use("/user", appRouter);
app.get("/online", async (req, res) => {
  try {
    return res.json({ data: chat }).status(200);
  } catch (error) {
    console.log(error);
    return res.json({ error: error }).status(404);
  }
});

io.on("connection", (socket) => {
  socket.on("firstConnect", (data) => {
    const checkExistance = chat.filter((ele) => ele.name == data.sender);

    if (checkExistance.length > 0) {
      chat = chat.filter((ele) => ele.name !== data.sender);

      chat.push({ name: data.sender, id: socket.id });
    } else {
      chat.push({ name: data.sender, id: socket.id });
    }

    io.emit("conn", chat);
  });

  socket.on("send", (data) => {
    const checkExistance = chat.filter((ele) => ele.name == data.sender);

    if (checkExistance.length > 0) {
      chat = chat.filter((ele) => ele.name !== data.sender);

      chat.push({ name: data.sender, id: socket.id });
    } else {
      chat.push({ name: data.sender, id: socket.id });
    }

    console.log("data", data);
    if (data?.senderText.length > 0) {
      chat.map((elem) => {
        if (elem.name == data.receiver) {
          console.log("receive triggered on server side");
          console.log("elemid", elem.id, "value", data.value);
          socket.broadcast.to(elem.id).emit("receive", data);
        }
      });
    }
  });
  socket.on("disconnect", () => {
    chat = chat.filter((el) => el.id !== socket.id);
    io.emit("disc", chat);
  });
});
httpServer.listen(process.env.PORT || 5500, () =>
  console.log("Express is running")
);
