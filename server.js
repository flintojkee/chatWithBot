const express = require("express");
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(http);
const rp = require('request-promise');

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

app.get('/bot.js', function (req, res) {
    res.sendFile(__dirname + '/bot.js');
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

    socket.on('bot message', function(message){
        bot(message);
    });

});

function bot(message) {
    let apiKeyWeather = 'd006883d2ab0b24253d4cfe0e5d9d237';
    let apiKeyMoney = 'Dex5nDqb4PN8jcSN6czcPMdrhgTVnd';

    let botResponse = "";
    let botMessage = {
        name:"@bot",
        text:""
    };

    let messageArray = parser(message);
    console.log(messageArray);

    if(messageArray[1]==="What"){
        let city = message.substring(message.indexOf("in")+3, message.indexOf("?"));
        let day = message.substring(message.indexOf("weather")+8, message.indexOf("in"));
        let urlWeather = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKeyWeather}`;
        let options = {
            uri: urlWeather,
            json: true
        };
        rp(options)
            .then(function (res) {
                botResponse = `The weather is ${res.weather[0].main} in  ${res.name} ${day}, it's ${res.main.temp} degrees `;
                botMessage.text = botResponse;
            })
            .then(()=>{
            console.log(botMessage);
                io.emit('chat message',  botMessage);
            })
            .catch(function (err) {
                alert(err);
            });
    }
    if(messageArray[1]==="Convert"){
        let from = messageArray[3];
        let to = messageArray[5];
        let amount = messageArray[2];
        let urlMoney = `https://www.amdoren.com/api/currency.php?api_key=${apiKeyMoney}&from=${from}&to=${to}&amount=${amount}`;
        let options = {
            uri: urlMoney,
            json: true
        };
        rp(options)
            .then(function (res) {
                botResponse = res.amount;
                botMessage.text = `${botResponse} ${to}`;
            })
            .then(()=> {
                io.emit('chat message', botMessage);
            })
            .catch(function (err) {
                    alert(err);
            });
    }
    if(messageArray[1]==="Show"){
        if(messageArray[2]==="quote"){
            let urlQuote = `http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1`;
            let options = {
                uri: urlQuote,
                json: true
            };
            rp(options)
                .then(function (res) {
                    console.log(res);
                    botResponse = `${res[0].content}${res[0].title}`;
                    botMessage.text = botResponse;
                })
                .then(()=> {
                    io.emit('chat message', botMessage);
                })
                .catch(function (err) {
                    alert(err);
                });
        }
    }
}

function parser(message) {
    return message.substring(message.indexOf("@bot")).split(" ");
}


http.listen(3000, function () {
    console.log('listening on port: 3000')
});