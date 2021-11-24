const express = require('express');
const app = express();

require('dotenv').config();

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


app.get('/', (req, res) => {
    res.render('index.pug');
});



app.listen(process.env.PORT || 3000, () => {
    console.log('listening on port ' + process.env.PORT || 3000);
});