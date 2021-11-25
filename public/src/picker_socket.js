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
});

// on error
socket.on("error", function(err) {
    console.log("error: " + err);
});

// on picker_amount log the amount
socket.on("picker_amount", function(amount) {
    console.log(amount);
});