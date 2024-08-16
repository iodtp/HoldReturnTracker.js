// ==UserScript==
// @name         Bambi's Script
// @version      1.2
// @description  Print the hold time and add return counter
// @author       Catalyst, Iodized Salt
// @include      http://*.koalabeast.com:*
// @include      http://*.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @include      https://*.koalabeast.com/game
// @include      https://*.koalabeast.com/game?*
// @grant        none
// ==/UserScript==


tagpro.ready(function waitForId() {
    if (!tagpro.playerId) {
        return setTimeout(waitForId, 100);
    }
    //if (!tagpro.group.socket) return;//restrict to private games only
    const history = document.getElementById('chatHistory');
    let returnTotal = 0;
    const box = createBox();
    const chats = [];
    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            for (let i = 0; i < chats.length; i++) {
                const bigDiv = chats[i].message;
                if (bigDiv.style.display === 'none') {
                    bigDiv.style.display = "block";
                }
                else if (bigDiv.style.display === "block" || bigDiv.style.display === '' && chats[i].gone === true){
                    bigDiv.style.display = 'none';
                }
            }

        }
    });
    var fcid=-1;
    var grabtime=0;
    var grabping=0;
    tagpro.socket.on("p", function (data) {
        data = data.u || data;
        for (var i = 0, l = data.length; i != l; i++) {
            if (fcid==data[i].id){
                if (tagpro.players[fcid].flag==null){
                    var message = "Hold time: " + ((Date.now()-grabtime)/1000).toFixed(3) + " seconds. Pings: "+grabping+" ms, "+tagpro.ping.current+" ms";
                    createChat(message, history, chats);
                    fcid=-1;

                }
            }
            else if (data[i].flag==3 || data[i].flag==2 || data[i].flag==1){//CTF: 2/1, NF: 3
                if (data[i].id == tagpro.playerId){
                    fcid=data[i].id;
                    grabtime=Date.now();
                    grabping=tagpro.ping.current;
                }
            }

            if (data[i].id == tagpro.playerId && data[i]["s-returns"] != undefined) {
                returnTotal = data[i]["s-returns"];
                box.innerText = `Returns ${returnTotal}`;
            }
        }
    });
});

function createChat(message, history, chats) {
    const bigDiv = document.createElement("div");

    const chat = document.createElement("span");
    chat.innerText = message;
    bigDiv.appendChild(chat);
    history.appendChild(bigDiv);
    history.insertBefore(bigDiv, history.firstChild);
    const wholeChat = {message:bigDiv, gone:false};
    setTimeout(function () {
        bigDiv.style.display = "none";
        wholeChat.gone = true;
    }, 10000);
    chats.push(wholeChat);
}

function createBox() {
    const box = document.createElement("div");
    box.innerText = "Returns: 0";
    box.id = "returnBox";
    box.style.width = "200px";
    box.style.height = "100px";
    box.style.padding = "10px";
    box.style.margin = "10px";
    box.style.position = "fixed";
    box.style.bottom = "50px";
    box.style.right = "50px";
    document.getElementsByClassName("game-page")[0].appendChild(box);
    return box;
}



