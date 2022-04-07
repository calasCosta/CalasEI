require('dotenv').config();

const express = require('express');
const app = express();
const path = require("path");

const homeRouter = require("./public/scripts/home");
const gameRouter = require("./public/scripts/game");


app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use("/", homeRouter);
app.use("/game", gameRouter);

const PORT = process.env.PORT || 9000;
app.listen(PORT, (req, res) => {
    console.log(`Server running on port ${PORT}.`)
});

