const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('public'));

const port = 3000;

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

const server = app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});