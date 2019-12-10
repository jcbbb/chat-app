var app = require("express")();
var express = require("express");
var path = require("path");
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
var connectedUsers = [];
var OnlineUsers = [];
http.listen(port, () => {
  console.log("listening at port %d", port);
});

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket) {
  connectedUsers.push(socket);
  console.log("Connected users:", connectedUsers.length);
  socket.on("disconnect", function(data) {
    OnlineUsers.splice(OnlineUsers.indexOf(socket), 1);
    updateOnlineUsers();
    connectedUsers.splice(OnlineUsers.indexOf(socket), 1);
    console.log("Disconnected users:", connectedUsers.length);
    socket.broadcast.emit("user left", { username: socket.username });
  });

  socket.on("chat message", function(data) {
    io.emit("chat message", {
      message: data.message,
      username: data.username,
      messageClass: data.messageClass,
      usernameClass: data.usernameClass
    });
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
