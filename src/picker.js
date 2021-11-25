
module.exports = function init(io) {
    io.on('connection', (socket) => {
    
        socket.on('disconnect', () => {
            // and send everyone the current socket amount in group picker
            io.to('picker').emit('picker_amount', io.sockets.adapter.rooms.get('picker').size);
        });

        // on socket.emit("tool", "picker");
        socket.on('tool', (tool) => {
            console.log('>> ' + tool);

            // add socket to group "picker"
            socket.join('picker');

            // and send everyone the current socket amount in group picker
            io.to('picker').emit('picker_amount', io.sockets.adapter.rooms.get('picker').size);
        });

    });
};