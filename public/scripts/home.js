const express = require('express');
const router = express.Router();
const connection = require("./db/db");

router.get("/", function (req, res) {

    connection.query("select * from categories", function (err, rows) {
        if(err){throw err;}
        res.render("home", {categories:rows});
    });
});

router.post("/createCategory", function (req, res) {
    let category = req.body.txtCategory;

    let selectCategory = `select * from categories where category = "${category}"`
    connection.query(selectCategory, (err, result)=>{
        if(err){throw err;}

        if(result.length){
            throw new Error("Category already exists.");
        }

        let insertCategory = `insert into categories (category, state) values ?`
        connection.query(insertCategory, [[[category, true]]], function(err, rows){
            if (err) {throw err;}

            console.log("category " + category + " successfully inserted.")
        });
    })
    res.redirect("back");
});


router.get("/category/:categoryId", function (req, res) {
    
    let selectCategory = `select * from categories where category_id = ${req.params.categoryId}`;
    connection.query(selectCategory, function (err, result) {
        if(err){throw err;}

        res.render("category", {category:result[0].category});
    });
});

module.exports = router;