const express = require('express');
const router = express.Router();
const connection = require("./db/db");

router.get("/", function(req, res){
    res.render("game");
});

module.exports = router;