import {config} from "dotenv";
import express from 'express'
const app = express()
import http from 'http'
const server = http.createServer(app);
import {Server, Socket} from 'socket.io'
const io = Server(server);
import imgbbUploader from "imgbb-uploader";
import emoji from "discord-emoji-converter";
import monk from "monk";
const db = monk(process.env.DB);
import pkg from 'discord-markdown';
const { toHTML } = pkg;
import dice from 'dnd-dice-complete-set'
console.log(dice.rollAnySidedDice(2))
var users = [];
(async () => {
  const messages = db.get("messages");

  io.on("connection", async (socket) => {
    io.emit("users", users);
    socket.on("disconnect", (reason) => {
      users = users.filter(function(value, index, arr) {
        return value.id !== socket.id;
      });
      io.emit("users", users);
    });

    socket.on("login", async function(user) {
      users.push({ name: user.name, id: socket.id });
      io.emit("users", users);
          allMessages = await messages.find();

    for (message of allMessages) {
      message.old = true;
socket.emit('new_message', message);


    }

    });
    socket.on("chat message", async (msg) => {
      console.log('hiii')
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
        }
      } catch (err) {
        console.error(err)
      }
    });

  });
  app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
  });
  app.get("/ping.mp3", (req, res) => {
    res.sendFile(`${__dirname}/ping.mp3`);
  });
  app.get("/icon.svg", (req, res) => {
    res.sendFile(`${__dirname}/icon.svg`);
  });
})();
server.listen(3000);
console.log("Started");
