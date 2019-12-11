var app = require("express")();
var mongo = require("mongodb").MongoClient;
var express = require("express");
var path = require("path");
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
const uri =
  "mongodb+srv://avazkhan_:2157132a@cluster0-8xvgd.mongodb.net/test?retryWrites=true&w=majority";
const dbName = "simple-chat";

var connectedUsers = [];
var OnlineUsers = [];
http.listen(port);
app.use(express.static(path.join(__dirname, "public")));

mongo.connect(uri, function(err, client) {
  const db = client.db(dbName);
  if (err) {
    throw err;
  }
  io.on("connection", function(socket) {
    let messages = db.collection("messages");
    messages
      .find()
      .limit(100)
      .sort({ _id: 1 })
      .toArray(function(err, res) {
        if (err) {
          throw err;
        }
        io.emit("chat message", res);
      });
    socket.on("chat message", function(data) {
      let username = data.username;
      let message = data.message;
      let messageClass = data.messageClass;
      let usernameClass = data.usernameClass;
      messages.insert(
        {
          username: username,
          message: message,
          messageClass: messageClass,
          usernameClass: usernameClass
        },
        function() {
          io.emit("chat message", [data]);
        }
      );
    });
    connectedUsers.push(socket);
    socket.on("disconnect", function(data) {
      OnlineUsers.splice(OnlineUsers.indexOf(socket), 1);
      updateOnlineUsers();
      connectedUsers.splice(OnlineUsers.indexOf(socket), 1);
      socket.broadcast.emit("user left", { username: socket.username });
    });
    socket.on("new user", function(data) {
      socket.username = data;
      socket.emit("new user", {
        username: socket.username
      });
      OnlineUsers.push(socket.username);
      socket.broadcast.emit("user joined", { username: socket.username });
      updateOnlineUsers();
    });
    function updateOnlineUsers() {
      io.emit("fetch users", OnlineUsers);
    }
    socket.on("typing", data => {
      socket.broadcast.emit("typing", data);
    });
    socket.on("stop typing", data => {
      socket.broadcast.emit("stop typing", data);
    });
  });
});
