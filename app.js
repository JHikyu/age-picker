const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
server.listen(process.env.PORT || 3000, () => {
    console.log('listening on port ' + process.env.PORT || 3000);
});

require('dotenv').config();

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


// import ./src/picker.js
const picker = require('./src/picker')(io);


app.get('/', (req, res) => {
    res.render('index.pug');
});
app.get('/picker', (req, res) => {
    res.render('picker.pug');
});
app.get('/randomizer', (req, res) => {
    res.render('randomizer.pug');
});
app.get('/trial', (req, res) => {
    res.render('trial.pug');
});
app.get('/news', (req, res) => {
    res.render('news.pug');
});
app.get('/faq', (req, res) => {
    res.render('faq.pug');
});