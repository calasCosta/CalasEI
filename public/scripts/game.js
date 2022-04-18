const express = require('express');
const router = express.Router();
const connection = require("./db/db");

router.get("/", function(req, res){
    res.render("game");
});

router.get("/vocabularyGame", function(req, res){
    res.render("vocabularyGame");
});

module.exports = router;