const app = require('express')()
const server = require('http').createServer(app);
const io = require('socket.io')(server);
let jsoning = require('jsoning');
let db = new jsoning(__dirname + "/database.json");
const imgbbUploader = require("imgbb-uploader");



(async() => {

io.on('connection', async (socket) => {
    messages = await db.get("messages")
  for (message of messages){
    socket.emit('new_message', message)
  }

  socket.on('chat message', async (msg) => {
    if (msg.password = process.env.PASS) {
      if (msg.images.length) {
let upload = await imgbbUploader({
  apiKey: process.env.IMGBB_API_KEY, // MANDATORY
  name: "image",
  base64string: msg.images[0].split(',')[1],
})
  .catch((error) => console.error(error));
console.log(upload)
msg.images = [upload.image.url]
}

      msg.password = 'REDACTED'
      console.log('message: ' + msg);
      console.log(msg.images)
      
      io.emit('new_message', msg)
      await db.push("messages", msg);
    }

  });
});
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`)
})
server.listen(3000);
})();