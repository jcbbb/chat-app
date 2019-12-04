$(document).ready(function() {
  // Variables
  var $window = $(window);
  var $username = $("#username");
  var $chatMessages = $("#chat-messages");
  var $messageInput = $("#message-text");
  var $messageArea = $("#message-area");
  var $chatPage = $("main");
  var $loginPage = $(".login-page");
  var $userLoginForm = $("#user-login-form");
  // Username Settings
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $username.focus();
  var socket = io();

  // Add users
  const addUsers = data => {
    var message = "";
    if (data.numbers === 1) {
      message += "1 user online";
    } else {
      message += `${data.NumUsers} users online`;
    }
  };
  // Setting username

  const setUsername = () => {
    username = $username.val().trim();
    if (username) {
      $loginPage.fadeOut();
      $loginPage.off("click");
      $chatPage.show();
      socket.emit("add user", username);
    }
  };
  $userLoginForm.submit(function(e) {
    e.preventDefault();
    setUsername();
  });
  $messageArea.submit(function(e) {
    e.preventDefault();
    socket.emit("chat message", $messageInput.val());
    $messageInput.val("");
    return false;
  });
  socket.on("chat message", function(msg) {
    $chatMessages.append($("<li class='single-message'></li>").text(msg));
  });
  $window.keydown(function(event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit("stop typing");
        typing = false;
      } else {
        setUsername();
      }
    }
  });
});
