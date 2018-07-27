const chatPage = document.getElementById("chat-page");
const loginPage = document.getElementById("login-page");
const socket = io.connect();
let userName, userNickname;


function main() {
    const userHeader = document.getElementById('userHeader');
    const nameButton = document.getElementById('nameButton');
    const nameInput = document.getElementById('nameInput');
    const messages = document.getElementById('messages');
    const messagesContainer = document.getElementById('messages-container');
    const users = document.getElementById('users');
    const text = document.getElementById('text');
    const textSubmit = document.getElementById('textSubmit');
    let typing = document.createElement('span');
    userHeader.innerText = "Name: "+userName+", NickName: "+userNickname;

    textSubmit.onclick = function () {
        let data = {
            name:userNickname,
            text: text.value
        };

        if (text.value.trim() === '') {
            text.value = '';
            return false;
        }else{
            text.value = '';
            socket.emit('chat message', data);
            isTyping = false;
            socket.emit('not typing', userNickname);
        }
    };

    socket.on('history', function (msg) {
        messages.innerHTML = '';
        for(let i in msg){
            if(msg.hasOwnProperty(i)){
                appendMessage(msg[i]);
            }
        }
    });

    socket.on("users", function (user) {
        users.innerHTML = '';
        for(let i in user){
            if(user.hasOwnProperty(i)){
                let el = document.createElement('li');
                el.innerText = "Name: "+user[i].name + " Nickname: " + user[i].nickName +", Status:"+user[i].status;
                users.appendChild(el);
            }
        }
    });


    socket.on('chat message', function (msg) {
        appendMessage(msg);
    });

    function appendMessage(msg) {
        let li = document.createElement('li');
        let el = new Proxy(li, validator);
        el.innerHTML = msg;
        messages.appendChild(li);
    }

    let isTyping = false;
    text.onkeypress = function () {
        socket.emit('typing', userNickname);
    };

    socket.on('typing', (userNickname) =>{
        if(!isTyping){
            typing.innerHTML = userNickname+" is typing... ";
            messagesContainer.appendChild(typing);
            isTyping = true;
        }
    });

    socket.on('not typing', (userNickname) =>{
        $("span:contains("+userNickname+")").remove();
        isTyping = false;
    });

}



function login() {
    let nameInput = document.getElementById('name-input');
    let nickNameInput = document.getElementById('nickname-input');

    if (nameInput.value.trim() === '' || nickNameInput.value.trim()==='') {
        return false
    } else {
        chatPage.classList.remove("hidden");
        loginPage.classList.add("hidden");
        userName = nameInput.value;
        userNickname = nickNameInput.value;
        let user ={
            name: userName,
            nickName: userNickname,
            status:"just appeared"
        };

        socket.emit('user', user);
        socket.emit('history');
        socket.emit('users');
        main();
        setOnline();
    }
}

function setOnline() {
    setTimeout(function(){
        let status = "online";
        let user ={
            name: userName,
            nickName: userNickname,
            status:"just appeared"
        };
        socket.emit('updateUser', user,status);
        socket.on("users", function (user) {
            users.innerHTML = '';
            console.log(user);
            for(let i in user){
                if(user.hasOwnProperty(i)){
                    let el = document.createElement('li');
                    el.innerText = "Name: "+user[i].name + " Nickname: " + user[i].nickName +", Status:"+user[i].status;
                    users.appendChild(el);
                }
            }
        });
        }, 3000);

}


function isMentioned(message,username) {
    let mention =  "@"+username;
    return message.includes(mention);
}

function isBotCommand(message) {
    let botName = "@bot";
    return message.includes(botName);
}

let validator = {
    set: function (obj, prop, value) {
        if(prop === 'innerHTML'){
            if(isMentioned(value.text, userNickname)){
                obj.classList.add("mention");
            }
            if(isBotCommand(value.text)){

            }
        }
        obj.innerHTML = value.name + ": " + value.text;
    }
};