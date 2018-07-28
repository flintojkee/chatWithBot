const rp = require('request-promise');
const apiKeyWeather = 'd006883d2ab0b24253d4cfe0e5d9d237';
const apiKeyMoney = 'Dex5nDqb4PN8jcSN6czcPMdrhgTVnd';

let notes = [];

exports.bot = function (message, io) {
    let messageArray = parser(message);
    let botMessage = {
        name:"@bot",
        text:""
    };
    let options = {
        uri: "",
        json: true
    };

    if(messageArray[1]==="What"){
        let weatherRequest = BotRequestFactory.create("weather", message);
        options.uri = weatherRequest.url;
        rp(options)
            .then(function (res) {
                botMessage.text = `The weather is ${res.weather[0].main} in  ${res.name} ${weatherRequest.day}, it's ${res.main.temp} degrees `;
            })
            .catch(function (err) {
                botMessage.text = `${err.body.message}`;
            })
            .then(()=>{
                io.emit('chat message',  botMessage);
            })

    }else if(messageArray[1]==="Convert"){
        let moneyRequest = BotRequestFactory.create("money", messageArray);
        options.uri = moneyRequest.url;
        rp(options)
            .then(function (res) {
                botMessage.text = `${moneyRequest.amount} ${moneyRequest.from} = ${res.amount} ${moneyRequest.to}`;
            })
            .then(()=> {
                io.emit('chat message', botMessage);
            })
            .catch(function (err) {
                console.log(err);
            });
    }else if(messageArray[1]==="Show"){
        if(messageArray[2]==="quote"){
            let QuoteRequest = BotRequestFactory.create("quote", message);
            options.uri = QuoteRequest.url;
            rp(options)
                .then(function (res) {
                    botMessage.text = `${res[0].content}${res[0].title}`;
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

        } else if(messageArray[2]==="note" && messageArray[3]!=="list"){
            let title = message.substring(message.indexOf("note")+5);
            console.log(title);
            botMessage.text = JSON.stringify(
                notes.filter(note => {
                return note.title === title;
            }));
            console.log(message.text);
            io.emit('chat message', botMessage);
            botMessage.text = `Note search`;
            io.emit('chat message', botMessage);
        }
    } else if(messageArray[1]==="Save"){
        let note = {
            title:"",
            body:""
        };
        note.title = message.substring(message.indexOf("title")+7, message.indexOf("body")-2);
        note.body = message.substring(message.indexOf("body")+6);
        console.log(note);
        notes.push(note);
        botMessage.text = `Note: "${note.title}" successfully saved`;
        io.emit('chat message', botMessage);

    } else if(messageArray.indexOf("#@)₴?$0")>-1){
        let AdviceRequest = BotRequestFactory.create("advice", message);
        options.uri = AdviceRequest.url;
        rp(options)
            .then(function (res) {
               botMessage.text = res.slip.advice;
            })
            .then(()=> {
                io.emit('chat message', botMessage);
            })
            .catch(function (err) {
                console.log(err);
            });
    } else if(messageArray[1]==="Help"){
        botMessage.text = "1.What the weather 'day' in 'city'?\n" +
            "2.Convert 'amount' 'currency' to 'currency', where currency in format like USD, EUR and so on\n" +
            "3.Save note title: 'title', body: 'body'\n" +
            "4.Show note list\n" +
            "5.'question' 'space' #@)₴?$0\n" +
            "6.Show quote";
        io.emit('chat message', botMessage);
    }else if(botMessage.text === ""){
        botMessage.text = "No such command or wrong format. Use @+bot Help to getinformation about commands";
        io.emit('chat message', botMessage);
    }
};
//pure function
function parser(message) {
    return message.substring(message.indexOf("@bot")).split(" ");
}


//Implementation of factory
class BotRequestFactory{
    static create(type, message){
        if(type === 'weather'){
            return new WeatherRequest(message)
        }else if(type === 'money'){
            return new MoneyRequest(message)
        }else if(type === 'quote'){
            return new QuoteRequest(message)
        }else if(type === 'advice'){
            return new AdviceRequest(message)
        }
    }
}
class WeatherRequest {
    constructor (message) {
        this.day = message.substring(message.indexOf("weather")+8, message.indexOf("in"));
        let city = message.substring(message.indexOf("in")+3, message.indexOf("?"));
        this.url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKeyWeather}`;
    }
}

class MoneyRequest {
    constructor (message) {
        this.from = message[3];
        this.to = message[5];
        this.amount = message[2];
        this.url = `https://www.amdoren.com/api/currency.php?api_key=${apiKeyMoney}&from=${this.from}&to=${this.to}&amount=${this.amount}`;
    }
}

class QuoteRequest {
    constructor (message) {
        this.url = `http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1`;
    }
}

class AdviceRequest {
    constructor (message) {
        this.url = `http://api.adviceslip.com/advice`;
    }
}