//const request = require('request');

/*export function bot(message) {
    let apiKeyWeather = 'd006883d2ab0b24253d4cfe0e5d9d237';
    let apiKeyMoney = 'Dex5nDqb4PN8jcSN6czcPMdrhgTVnd';

    let messageArray = parser(message);
    let botMessage = {
        name:"@bot",
        text:""
    };
    console.log(messageArray);
    if(messageArray[1]==="What"){
        let city = message.substring(message.indexOf("in")+3, message.indexOf("?"));
        let day = message.substring(message.indexOf("weather")+8, message.indexOf("in"));
        let urlWeather = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKeyWeather}`;
        request(urlWeather, function (err, response, body) {
            if(err){
                botMessage.text = err;
            } else {
                let weather = JSON.parse(body);
                let weatherMessage = `The weather is ${weather.weather[0].main} in  ${weather.name} ${day}, it's ${weather.main.temp} degrees `;
                botMessage.text = weatherMessage;
                console.log(weatherMessage);
                return botMessage;
            }
        });
    }
    return botMessage;
}


function parser(message) {
    message.substring(message.indexOf("@bot"));
    return message.split(" ");
}*/
