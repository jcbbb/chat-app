var app = require("express")();
var express = require("express");
var path = require("path");
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
var OnlineUsers = [];
http.listen(port, () => {
  console.log("listening at port %d", port);
});

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket) {
  OnlineUsers.push(socket);
  socket.on("disconnect", function(data) {
    OnlineUsers.splice(OnlineUsers.indexOf(socket), 1);
    socket.broadcast.emit("user left", { username: socket.username });
  });

  socket.on("chat message", function(data) {
    io.emit("chat message", { message: data.message, username: data.username });
  });
  socket.on("new user", function(data) {
    socket.username = data;
    OnlineUsers.push(socket.username);
    socket.broadcast.emit("user joined", { username: socket.username });
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing", {
      username: socket.username
    });
  });
  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", {
      username: socket.username
    });
  });
  setTimeout(() => {
    console.log(OnlineUsers.length);
  }, 150);
});
