$(window).bind('beforeunload', function () {
    return 'are you sure you want to leave?';
});
$(function () {
    const socket = io();
    const $message_form = $('#message-area');
    const $message_input = $('#message-text');
    const $chat_messages = $('#chat-messages');
    const $userForm = $('#user-login-form');
    const $userLoginPage = $('.login-page');
    const $mainChat = $('main');
    const $users = $('#users');
    const $typingStatus = $('.typing-status');
    const random = Math.floor(Math.random() * (5 - 1)) + 1;
    let messageClass;
    let usernameClass;
    let username;
    let timer;

    switch (random) {
        case 1:
            messageClass = 'message_color_1';
            usernameClass = 'username_color_1';
            break;
        case 2:
            messageClass = 'message_color_2';
            usernameClass = 'username_color_2';
            break;
        case 3:
            messageClass = 'message_color_3';
            usernameClass = 'username_color_3';
            break;
        case 4:
            messageClass = 'message_color_4';
            usernameClass = 'username_color_4';
            break;
    }

    // User Login
    $userForm.one('submit', function (e) {
        e.preventDefault();
        username = $('#username').val().trim();
        if (username) {
            $userLoginPage.fadeOut();
            $mainChat.fadeIn();
            socket.emit('new user', username);
            $message_input.focus();
            // Scroll to the bottom of chat
            $('.chat-window').animate({scrollTop: $('.chat-window').prop('scrollHeight')}, 1000);
        } else return false;
    });
    // Message Submit
    $message_form.submit(function (e) {
        e.preventDefault(); // prevents page reloading
        const messageInput = $message_input.val().trim();
        if (messageInput !== '') {
            socket.emit('chat message', {
                message: $message_input.val(),
                username: username,
                messageClass: messageClass,
                usernameClass: usernameClass,
            });
            $message_input.val('');
        } else {
            return false;
        }
    });

    // Displaying the message
    socket.on('chat message', function (data) {
        $typingStatus.html('');
        if (data.length) {
            for (let i = 0; i < data.length; i++) {
                $chat_messages.append(`<div class="message">
        <div class="username ${data[i].usernameClass}">${data[i].username}</div>
        <div class="single-message ${data[i].messageClass}">${data[i].message}</div>
        </div>`);

                $('.chat-window').scrollTop($('.chat-window')[0].scrollHeight);
            }
        }
    });
    // Display user joined
    socket.on('user joined', (data) => {
        if (data.username !== '') {
            $chat_messages.append(`<li class='log'>${data.username} joined</li>`);
        } else return false;
    });

    // Display user left
    socket.on('user left', (data) => {
        if (data.username !== undefined) {
            $chat_messages.append(`<li class='log'>${data.username} left</li>`);
        } else return false;
    });

    // Key Events
    $message_input.keydown(function () {
        socket.emit('typing', username);
    });
    socket.on('typing', function (data) {
        const typing = $typingStatus.html(`${data} is typing`);
        typing.fadeIn();
    });
    $message_input.keyup(function () {
        socket.emit('stop typing', username);
    });
    socket.on('stop typing', function (data) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            $typingStatus.fadeOut();
        }, 1000);
    });

    // Welcome message for a new user
    socket.on('new user', function (data) {
        $chat_messages.append(
            `<li class="welcome-message">Welcome to Simple Chat, ${data.username}</li>`,
        );
    });

    // Updating online users
    socket.on('fetch users', function (data) {
        let users = '';
        for (i = 0; i < data.length; i++) {
            users += `<li class="user">${data[i]}<i class="far fa-dot-circle"></i></li>`;
        }
        $users.html(users);
    });
    // Sending message with enter key
    $message_input.keypress(function (e) {
        if (e.which == 13 && !e.shiftKey) {
            $(this).closest('form').submit();
            e.preventDefault();
        }
    });

    $('#toggle').click(function () {
        $('.online-users').slideToggle('slow');
    });
});
