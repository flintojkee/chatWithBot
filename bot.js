const rp = require('request-promise');
const apiKeyWeather = 'd006883d2ab0b24253d4cfe0e5d9d237';
const apiKeyMoney = 'Dex5nDqb4PN8jcSN6czcPMdrhgTVnd';
let notes = [];
exports.bot = function (message, io) {

    let botResponse = "";
    let botMessage = {
        name:"@bot",
        text:""
    };

    let messageArray = parser(message);

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
                console.log(err);
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
                console.log(err);
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
                    botResponse = `${res[0].content}${res[0].title}`;
                    botMessage.text = botResponse;
                })
                .then(()=> {
                    io.emit('chat message', botMessage);
                })
                .catch(function (err) {
                    console.log(err);
                });
        }else if(messageArray[2]==="note" && messageArray[3]==="list"){
            botMessage.text = "Notes list";
            io.emit('chat message', botMessage);
            botMessage.text = JSON.stringify(notes);
            io.emit('chat message', botMessage);
        }
    }
    if(messageArray[1]==="Save"){
        let note = {
            title:"",
            body:""
        };
        note.title = message.substring(message.indexOf("title")+7, message.indexOf("body")-2);
        note.body = message.substring(message.indexOf("body")+5);
        notes.push(note);
        botMessage.text = `Note: "${note.title}" successfully saved`;
        io.emit('chat message', botMessage);
    }


    if(messageArray.indexOf("#@)₴?$0")>-1){
        let urlAdvice = `http://api.adviceslip.com/advice`;
        let options = {
            uri: urlAdvice,
            json: true
        };
        rp(options)
            .then(function (res) {
                botResponse = res.slip.advice;
                botMessage.text = botResponse;
            })
            .then(()=> {
                io.emit('chat message', botMessage);
            })
            .catch(function (err) {
                console.log(err);
            });
    }
};

function parser(message) {
    return message.substring(message.indexOf("@bot")).split(" ");
}
