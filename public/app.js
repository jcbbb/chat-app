$(function() {
  var socket = io();
  var $message_form = $("#message-area");
  var $message_input = $("#message-text");
  var $chat_messages = $("#chat-messages");
  var username;
  var $userForm = $("#user-login-form");
  var $userLoginPage = $(".login-page");
  var $mainChat = $("main");
  var $users = $("#users");

  // User Login
  $userForm.submit(function(e) {
    e.preventDefault();
    username = $("#username")
      .val()
      .trim();
    if (username) {
      $userLoginPage.fadeOut();
      $mainChat.fadeIn();
      socket.emit("new user", username);
      $userForm.val("");
    } else return false;
  });
  // Message Submit
  $message_form.submit(function(e) {
    e.preventDefault(); // prevents page reloading
    socket.emit("chat message", {
      message: $message_input.val(),
      username: username
    });
    $message_input.val("");
    username.val("");
    return false;
  });
  socket.on("chat message", function(data) {
    $chat_messages.append(
      `<li class='single-message'><span class='username'>${data.username}</span>${data.message}</li>`
    );
  });

  socket.on("user joined", data => {
    if (data.username !== "") {
      $chat_messages.append(`<li class='log'>${data.username} joined</li>`);
    } else return false;
  });
  socket.on("user left", data => {
    if (data.username !== undefined) {
      $chat_messages.append(`<li class='log'>${data.username} left</li>`);
    } else return false;
  });
});
