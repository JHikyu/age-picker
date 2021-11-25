

module.exports = function init(io) {
    io.on('connection', (socket) => {
    
        socket.on('disconnect', () => {
            // and send everyone the current socket amount in room picker
            io.to('picker').emit('picker_amount', io.sockets?.adapter?.rooms?.get('picker')?.size);

            // loop threw openDrafts
            for (let i = 0; i < openDrafts.length; i++) {
                // check if socket.id is in openDrafts[i].sockets
                if (openDrafts[i]?.sockets?.includes(socket)) {
                    // remove socket.id from openDrafts[i].sockets
                    openDrafts[i].sockets.splice(openDrafts[i].sockets.indexOf(socket), 1);
                    // if openDrafts[i].sockets.length == 0, remove openDrafts[i]
                    if (openDrafts[i].sockets.length == 0) {
                        openDrafts.splice(i, 1);
                        i--;
                    }
                }
            }



        });

        // on socket.emit("tool", "picker");
        socket.on('tool', (tool) => {
            if(tool !== 'picker') return;

            console.log('>> ' + tool);

            // add socket to group "picker"
            socket.join('picker');

            // and send everyone the current socket amount in room picker
            io.to('picker').emit('picker_amount', io.sockets?.adapter?.rooms?.get('picker')?.size);
        });

        // on socket.emit("picker_createGame", roomName, bannedCivilizations, draftOrder);
        socket.on('picker_createGame', (roomName, bannedCivilizations, draftOrder) => {
            console.log(roomName, bannedCivilizations, draftOrder);

            let draft = [];

            // loop draftOrder and push object with action0: null, action1: null, done: false, type: draftOrderEntry
            for(let i = 0; i < draftOrder.length; i++) {
                draft.push({
                    type: draftOrder[i],
                    action0: null,
                    action1: null,
                    done: false
                });
            }

            // generate random number from 111111 to 999999 that is not an code in openDrafts
            let code = Math.floor(Math.random() * (999 - 111 + 1)) + 111;
            while(openDrafts.includes(code)) {
                code = Math.floor(Math.random() * (999 - 111 + 1)) + 111;
            }

            const roomObj = {
                code,
                currentTimeout: new Date().getTime() + 5 * 60 * 1000, // timestamp in 5 minutes
                name: roomName,
                players: [socket],
                phase: 0,
                draft
            };

            // push roomObj to the drafts
            openDrafts.push(roomObj);

            // socket.emit code and seconds left until currentTimeout
            socket.emit('picker_createdRoom', roomName, roomObj.code, Math.floor((roomObj.currentTimeout - new Date().getTime()) / 1000));

        });

        // on socket.emit("picker_joinRoom", roomCode);
        socket.on('picker_joinRoom', (roomCode) => {
            console.log(roomCode);

            // loop openDrafts and check if roomCode is in code
            for(let i = 0; i < openDrafts.length; i++) {
                if(openDrafts[i].code == roomCode) {
                    // push socket to players array of roomObj
                    openDrafts[i].players.push(socket);
                    // emit to socket the roomObj

                    // set phase to 1
                    openDrafts[i].phase = 1;

                    // set openDrafts[i].currentTimeout to new Date in 30 seconds
                    openDrafts[i].currentTimeout = new Date().getTime() + 30 * 1000;

                    const toSendObj = {
                        name: openDrafts[i].name,
                        timeLeft: Math.floor((openDrafts[i].currentTimeout - new Date().getTime()) / 1000),
                        draft: openDrafts[i].draft,
                        phase: openDrafts[i].phase
                    };

                    socket.emit('picker_started', toSendObj);
                    openDrafts[i].players[0].emit('picker_started', toSendObj);
                    
                    // brak the loop
                    return;
                }
            }

            // if not found, emit 'picker_notFound'
            socket.emit('picker_notFound');
        });

        // on socket.emit("startedClick", civId);
        socket.on('startedClick', (civId) => {
            // loop threw openDrafts
            for(let i = 0; i < openDrafts.length; i++) {
                // find socket in openDrafts[i].players
                if(openDrafts[i].players.includes(socket)) {
                    // check the index of socket in players
                    const playerIndex = openDrafts[i].players.indexOf(socket);

                    // filter openDrafts[i].draft with entry done == false
                    let currentDraft = openDrafts[i].draft.filter(entry => entry.done == false)[0];

                    // if playerIndex == 0
                    if(playerIndex == 0) {
                        // set currentDraft.action0 to civId
                        currentDraft.action0 = civId;
                    } else {
                        // set currentDraft.action1 to civId
                        currentDraft.action1 = civId;
                    }

                    // if action0 and action1 are not null
                    if((currentDraft.action0 != null && currentDraft.action1 != null) || openDrafts[i].currentTimeout < new Date().getTime()) {
                        // set currentDraft.done to true
                        currentDraft.done = true;
                        
                        // set time to 30 seconds from now
                        openDrafts[i].currentTimeout = new Date().getTime() + 30 * 1000;
                    }

                    // if done
                    if(currentDraft.done) {
                        // emit openDrafts[i].draft to all players
                        openDrafts[i].players[0].emit('picker_draftUpdate', openDrafts[i].draft, 0);
                        openDrafts[i].players[1].emit('picker_draftUpdate', openDrafts[i].draft, 1);
                    }

                    


                }
            }

        });

    });


    
    // interval every second if object in openDrafts currentTimeout is less than currentTimestamp and phase is 0, delete it
    setInterval(() => {
        for(let i = 0; i < openDrafts.length; i++) {

            // if phase is not 0 and currentTimeout is not done
            if(openDrafts[i].phase != 0 && openDrafts[i].currentTimeout >= new Date().getTime()) {

                // emit to both sockets the timeLeft
                openDrafts[i].players[0].emit('picker_timeLeft', Math.floor((openDrafts[i].currentTimeout - new Date().getTime()) / 1000));
                openDrafts[i].players[1].emit('picker_timeLeft', Math.floor((openDrafts[i].currentTimeout - new Date().getTime()) / 1000));
            }
            else if(openDrafts[i].phase != 0) {
                // filter openDrafts[i].draft with entry done == false
                let currentDraft = openDrafts[i].draft.filter(entry => entry.done == false)[0];

                if(currentDraft) currentDraft.done = true;

                
                // set currentTimeout to new Date in 30 seconds
                openDrafts[i].currentTimeout = new Date().getTime() + 30 * 1000;
                openDrafts[i].players[0].emit('picker_timeLeft', Math.floor((openDrafts[i].currentTimeout - new Date().getTime()) / 1000));
                openDrafts[i].players[1].emit('picker_timeLeft', Math.floor((openDrafts[i].currentTimeout - new Date().getTime()) / 1000));

                openDrafts[i].players[0].emit('picker_draftUpdate', openDrafts[i].draft, 0);
                openDrafts[i].players[1].emit('picker_draftUpdate', openDrafts[i].draft, 1);

            }
            else if(openDrafts[i].currentTimeout < new Date().getTime() && openDrafts[i].phase === 0) {
                openDrafts.splice(i, 1);
            }
        }
    }, 1000);
};


let draftTemplates = [
    {
        name: 'Standard',
        list: ['ban', 'add', 'add', 'add', 'snipe', 'pick']
    },
    {
        name: 'Casual',
        list: ['ban', 'add', 'pick']
    },
    {
        name: 'Mirror',
        list: ['ban', 'pickRandomSame']
    }
];

let openDrafts = [
];
