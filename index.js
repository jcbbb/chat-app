var app = require("express")();
var express = require("express");
var http = require("http").createServer(app);
var io = require("socket.io")(http);
users = [];
connections = [];

app.use(express.static("public"));

io.on("connection", function(socket) {
  socket.on("chat message", function(msg) {
    io.emit("chat message", msg);
  });
});
http.listen(process.env.PORT || 3000, function() {
  console.log("listening on *:3000");
});
