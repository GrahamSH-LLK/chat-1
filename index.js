import { config } from "dotenv";
import express from "express";
import path from "path";
const app = express();
import http from "http";
const server = http.createServer(app);
import { Server, Socket } from "socket.io";
const io = new Server(server);
import imgbbUploader from "imgbb-uploader";
import emoji from "discord-emoji-converter";
import monk from "monk";
const db = monk(process.env.DB);
import pkg from "discord-markdown";
const { toHTML } = pkg;
import { anySidedDice } from "./dice.js";
console.log(anySidedDice(2));
var users = [];
(async () => {
  const messages = db.get("messages");

  io.on("connection", async (socket) => {
    io.emit("users", users);
    socket.on("disconnect", (reason) => {
      users = users.filter(function (value, index, arr) {
        return value.id !== socket.id;
      });
      io.emit("users", users);
    });

    socket.on("login", async function (user) {
      users.push({ name: user.name, id: socket.id });
      io.emit("users", users);
      let allMessages = await messages.find();

      for (let message of allMessages) {
        message.old = true;
        socket.emit("new_message", message);
      }
    });
    socket.on("chat message", async (msg) => {
      console.log("hiii");
      try {
        if (msg.password === process.env.PASS) {
          console.log("HI");
          if (msg.images.length) {
            let upload = await imgbbUploader({
              apiKey: process.env.IMGBB_API_KEY, // MANDATORY
              name: "image",
              base64string: msg.images[0].split(",")[1],
            }).catch((error) => console.error(error));
            console.log(upload);
            msg.images = [upload.image.url];
          }
          msg.msg = emoji.emojify(toHTML(msg.msg));
          msg.password = "REDACTED";
          console.log("message: " + msg);
          console.log(msg.images);

          io.emit("new_message", msg);
          
          messages.insert(msg);
          if (msg.msg.startsWith('roll ')) {
            let split = msg.msg.split('roll ')
            if (split[1]) {
              let number = parseInt(split[1])
              if (number) {
                
                let newMSG = {msg: `You rolled a d${number} and got ${anySidedDice(number)}`, images: [], channel: msg.channel, date: new Date(), username: 'bot'}
                io.emit("new_message", newMSG)
                messages.insert(newMSG);
              } 
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
  app.get("/", (req, res) => {
    res.sendFile(path.resolve(`index.html`));
  });
  app.get("/ping.mp3", (req, res) => {
    res.sendFile(path.resolve(`ping.mp3`));
  });
  app.get("/icon.svg", (req, res) => {
    res.sendFile(path.resolve(`icon.svg`));
  });
})();
server.listen(3000);
console.log("Started");
