const express = require("express");
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(http);

let messages = [];
let users = [];
const maxMessages = 100;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/script.js', function (req, res) {
    res.sendFile(__dirname + '/script.js');
});

app.get('/assets/main.css', function (req, res) {
    res.sendFile(__dirname + '/assets/main.css');
});

io.on('connection', function (socket) {

    console.log("Client connected");

    socket.on("chat message", function (msg) {
        if (messages.length >= maxMessages) {
            messages.shift();
            messages.push(msg);
        } else {
            messages.push(msg);
        }
        io.emit('chat message', msg)
    });

    socket.on("user", function (user) {
        if(users.findIndex(u => u.nickName===user.nickName)===-1){
            users.push(user);
        }
    });

    socket.on("updateUser", function (user, status) {
            userIndex =  users.findIndex(u => u.nickName===user.nickName);
            users[userIndex].status = status;
    });

    socket.on('typing', (userNickname)=>{
        socket.broadcast.emit('typing', userNickname);
    });

    socket.on('not typing', (userNickname)=>{
        socket.broadcast.emit('not typing', userNickname);
    });

    socket.on('history', ()=>{
        socket.emit('history', messages);
    });

    socket.on('users', ()=>{
        socket.emit('users', users);
    });


});

http.listen(3000, function () {
    console.log('listening on port: 3000')
});