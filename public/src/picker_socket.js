var socket = io("localhost:3000");


// test if connection is established
socket.on("connect", function() {
    console.log("connected");

    // emit to server the current tool to identify
    socket.emit("tool", "picker");
});

// if not connected
socket.on("disconnect", function() {
    console.log("disconnected");
    // remove class hidden from mainSwitch div
    document.getElementById("mainSwitch").classList.remove("hidden");
    

    // add class hidden to createRoom div
    document.getElementById("createRoom").classList.add("hidden");
    // add class hidden from draftingRoom div
    document.getElementById("draftingRoom").classList.add("hidden");
    // add class hidden from draftingRoomStarted div
    document.getElementById("draftingRoomStarted").classList.add("hidden");
});

// on error
socket.on("error", function(err) {
    console.log("error: " + err);
});

// on picker_amount log the amount
socket.on("picker_amount", function(amount) {
    document.getElementById("draftCount").innerHTML = amount;
});

// on click on joinDraft
document.getElementById("joinDraft").addEventListener("click", function() {
    // check if socket is connected
    if (socket.connected) {
        // add class hidden to mainSwitch div
        document.getElementById("mainSwitch").classList.add("hidden");
        // remove class hidden from joinRoom div
        document.getElementById("joinRoom").classList.remove("hidden");
    }
});

// on click on createDraft
document.getElementById("createDraft").addEventListener("click", function() {
    // check if socket is connected
    if (socket.connected) {
        // add class hidden to mainSwitch div
        document.getElementById("mainSwitch").classList.add("hidden");
        // remove class hidden from createRoom div
        document.getElementById("createRoom").classList.remove("hidden");
    }
});

// on click on joinRoomCancel
document.getElementById("joinRoomCancel").addEventListener("click", function() {
    // add class hidden to joinRoom div
    document.getElementById("joinRoom").classList.add("hidden");
    // remove class hidden from mainSwitch div
    document.getElementById("mainSwitch").classList.remove("hidden");
    // add class hidden from draftingRoom div
    document.getElementById("draftingRoom").classList.add("hidden");
});

// on click on createRoomCancel
document.getElementById("createRoomCancel").addEventListener("click", function() {
    // add class hidden to createRoom div
    document.getElementById("createRoom").classList.add("hidden");
    // remove class hidden from mainSwitch div
    document.getElementById("mainSwitch").classList.remove("hidden");
    // add class hidden from draftingRoom div
    document.getElementById("draftingRoom").classList.add("hidden");
});


function createSwitchAllowed(e) {
    // check if this has class deactivated
    if (e.classList.contains("deactivated")) {

        // remove class deactivated
        e.classList.remove("deactivated");
        e.classList.remove("opacity-20");
        e.classList.remove("border-red-500");

    }
    // else add classes
    else {
        e.classList.add("deactivated");
        e.classList.add("opacity-20");
        e.classList.add("border-red-500");
    }
}

// on click #createGame
document.getElementById("createGame").addEventListener("click", function() {
    // check if socket is connected
    if (socket.connected) {
        
        // get roomName by element #createRoomName
        let roomName = document.getElementById("createRoomName").value;
        // get bannedCivilizations by #createCivilizations children if they have class deactivated
        let bannedCivilizations = [];
        document.getElementById("createCivilizations").childNodes.forEach(function(e) {
            if (e.classList.contains("deactivated")) {
                bannedCivilizations.push(e.name);
            }
        });

        // get draftOrder by #createDraftOrder children innerHTML without span tag
        let draftOrder = [];
        document.getElementById("createDraftOrder").childNodes.forEach(function(e) {
            draftOrder.push(e.innerHTML.replace("<span>", "").replace("</span>", ""));
        });


        // emit all 3 to the server with 'picker_createGame'
        socket.emit("picker_createGame", roomName, bannedCivilizations, draftOrder);

    }
});

// on socket.emit('picker_createdRoom', roomObj.code, Math.floor((roomObj.currentTimeout - new Date().getTime()) / 1000));
socket.on("picker_createdRoom", function(roomName, roomCode, timeLeft) {
    // add class hidden to createRoom div
    document.getElementById("createRoom").classList.add("hidden");
    // remove class hidden from draftingRoom div
    document.getElementById("draftingRoom").classList.remove("hidden");

    // replace innerHTML of #draftingRoomCode with roomCode at index 3 insert a -
    document.getElementById("draftingRoomCode").innerHTML = roomCode;

    // replace innerHTML of #draftingRoomCode with roomName
    document.getElementById("draftingRoomName").innerHTML = roomName;

    // log roomObj and timeLeft
    console.log(roomCode);
    console.log(timeLeft);
});

// on click #joinRoomButton
document.getElementById("joinRoomButton").addEventListener("click", function() {
    // check if socket is connected
    if (socket.connected) {
        // get roomCode by element #joinRoomCode
        let roomCode = document.getElementById("joinRoomCode").value;

        // emit to server with 'picker_joinRoom'
        socket.emit("picker_joinRoom", roomCode);
    }
});

// on socket.emit('picker_started', openDrafts[i]);
socket.on("picker_started", function(roomObj) {
    // add class hidden to joinRoom div
    document.getElementById("joinRoom").classList.add("hidden");
    // add class hidden from draftingRoom div
    document.getElementById("draftingRoom").classList.add("hidden");
    // remove class hidden from draftingRoomStarted
    document.getElementById("draftingRoomStarted").classList.remove("hidden");

    // set innterHTML of startedTimeLeft to seconds to roomObj.currentTimeout
    document.getElementById("startedTimeLeft").innerHTML = roomObj.timeLeft;

    document.getElementById("createDraftOrder").innerHTML = "";

    for (let i = 1; i < roomObj.draft.length; i++) {
        // create element
        let element = document.createElement("div");
        // add class
        element.className = "px-2 py-1 rounded-xl opacity-20";
        if(roomObj.draft[i].type == "BAN") element.classList.add("bg-red-500");
        if(roomObj.draft[i].type == "ADD") element.classList.add("bg-green-500");
        if(roomObj.draft[i].type == "SNIPE") element.classList.add("bg-purple-500");
        if(roomObj.draft[i].type == "PICK") element.classList.add("bg-blue-500");

        element.innerHTML = `<span>${roomObj.draft[i].type}</span>`;

        document.getElementById("createDraftOrder").appendChild(element);
    }
    
});

// on picker_notFound
socket.on("picker_notFound", function() {
    // log notFound
    alert("Code is wrong.");
});


// on picker_timeLeft
socket.on("picker_timeLeft", function(timeLeft) {
    // set innerHTML of startedTimeLeft to timeLeft
    document.getElementById("startedTimeLeft").innerHTML = timeLeft;
});


function startedClick(civId) {
    socket.emit("startedClick", civId);
}

// on player.emit('picker_draftUpdate', openDrafts[i].draft);
socket.on("picker_draftUpdate", function(draft, player) {

    // filter draft with entry.done == false
    let draftFiltered = draft.filter(entry => entry.done == false);

    // get first element of draftFiltered
    let draftNext = draftFiltered[0];

    if(draftNext) {
        // set innerHTML of startedType to draftNext.type
        document.getElementById("startedType").innerHTML = draftNext.type;
    }


    // filter every draft entry.done == true
    let draftDone = draft.filter(entry => entry.done == true);

    let youBans = [];
    let opponentBans = [];
    let youPicks = [];
    let opponentPicks = [];

    // loop draftDone
    draftDone.forEach(function(entry) {
        // if entry.type == ban
        if (entry.type == "BAN") {

            if(player == 0) {
                youBans.push(entry.action0);
                opponentBans.push(entry.action1);
            }
            else {
                youBans.push(entry.action1);
                opponentBans.push(entry.action0);
            }
        }

        // if entry.type == picks
        if (entry.type == "ADD") {
            if(player == 0) {
                youPicks.push(entry.action0);
                opponentPicks.push(entry.action1);
            }
            else {
                youPicks.push(entry.action1);
                opponentPicks.push(entry.action0);
            }
        }

        // if entry.type == snipe
        if (entry.type == "SNIPE") {
            if(player == 0) {
                // remove action0 from opponentPicks
                opponentPicks.splice(opponentPicks.indexOf(entry.action0), 1);
                // remove action1 from youPicks
                youPicks.splice(youPicks.indexOf(entry.action1), 1);
            }
            else {
                // remove action1 from opponentPicks
                opponentPicks.splice(opponentPicks.indexOf(entry.action1), 1);
                // remove action0 from youPicks
                youPicks.splice(youPicks.indexOf(entry.action0), 1);
            }

        }

        // set innerHTML of startedYouBans to ''
        document.getElementById("startedYouBans").innerHTML = "";

        // for each youBans
        youBans.forEach(function(ban) {
            // find civilization in civilizations with id ban
            let civ = civilizations.find(civ => civ.id == ban);


            // add img tag to startedYouBans
            document.getElementById("startedYouBans").innerHTML += "<img src='" + civ.flag + "'>";
        });

        // set innerHTML of startedOpponentBans to ''
        document.getElementById("startedOpponentBans").innerHTML = "";
            
        // for each opponentBans
        opponentBans.forEach(function(ban) {
            // find civilization in civilizations with id ban
            let civ = civilizations.find(civ => civ.id == ban);


            // add img tag to startedOpponentBans
            document.getElementById("startedOpponentBans").innerHTML += "<img src='" + civ.flag + "'>";
        });

        // set innerHTML of startedYouPicks to ''
        document.getElementById("startedYouPicks").innerHTML = "";

        // for each youPicks
        youPicks.forEach(function(pick) {
            // find civilization in civilizations with id pick
            let civ = civilizations.find(civ => civ.id == pick);


            // add img tag to startedYouPicks
            document.getElementById("startedYouPicks").innerHTML += "<img src='" + civ.flag + "'>";
        });


        // set innerHTML of startedOpponentPicks to ''
        document.getElementById("startedOpponentPicks").innerHTML = "";

        // for each opponentPicks
        opponentPicks.forEach(function(pick) {
            // find civilizations in civilizations with id pick
            let civ = civilizations.find(civ => civ.id == pick);


            // add img tag to startedOpponentPicks
            document.getElementById("startedOpponentPicks").innerHTML += "<img src='" + civ.flag + "'>";
        });


    });



    document.getElementById("startedDraftOrder").innerHTML = "";

    // loop draft and create element in createDraftOrder
    // create element
    let element = document.createElement("div");
    // add class
    element.className = "px-2 py-1 rounded-xl";
    if(draft[draftDone.length].type == "BAN") element.classList.add("bg-red-500");
    if(draft[draftDone.length].type == "ADD") element.classList.add("bg-green-500");
    if(draft[draftDone.length].type == "SNIPE") element.classList.add("bg-purple-500");
    if(draft[draftDone.length].type == "PICK") element.classList.add("bg-blue-500");
    element.innerHTML = `<span>${draft[draftDone.length].type}</span>`;

    document.getElementById("startedDraftOrder").appendChild(element);

    for (let i = draftDone.length+1; i < draft.length; i++) {
        // create element
        let element = document.createElement("div");
        // add class
        element.className = "px-2 py-1 rounded-xl opacity-20";
        if(draft[i].type == "BAN") element.classList.add("bg-red-500");
        if(draft[i].type == "ADD") element.classList.add("bg-green-500");
        if(draft[i].type == "SNIPE") element.classList.add("bg-purple-500");
        if(draft[i].type == "PICK") element.classList.add("bg-blue-500");

        element.innerHTML = `<span>${draft[i].type}</span>`;

        document.getElementById("startedDraftOrder").appendChild(element);
    }

});




let civilizations = [
    {
        id: 0,
        name: 'Rus',
        flag: '/src/flag_rus.png'
    },
    {
        id: 1,
        name: 'Holy Roman Empire',
        flag: '/src/flag_holyromanempire.png'
    },
    {
        id: 2,
        name: 'Chinese',
        flag: '/src/flag_chinese.png'
    },
    {
        id: 3,
        name: 'English',
        flag: '/src/flag_english.png'
    },
    {
        id: 4,
        name: 'Delhi Sultanate',
        flag: '/src/flag_delhisultanate.png'
    },
    {
        id: 5,
        name: 'Mongols',
        flag: '/src/flag_mongols.png'
    },
    {
        id: 6,
        name: 'Abbasid Dynasty',
        flag: '/src/flag_abbasiddynasty.png'
    },
    {
        id: 7,
        name: 'French',
        flag: '/src/flag_french.png'
    },
];