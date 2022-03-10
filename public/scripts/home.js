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

        let selectContents = `select * from contents where category_id = ${req.params.categoryId}`;
        connection.query(selectContents, function (error, rows){
            if(error){throw error;}

            let url ="";

            if(rows.length){
               url = rows[0].videoUrl;
            }

            res.render("category", {
                category:result[0].category,
                categoryId: req.params.categoryId,
                contents : rows,
                urlContent : url
                }
            );
        });
    });
});


router.post("/category/:categoryId/content/:contentId", (req, res)=>{


    res.redirect("back")
});


router.post("/category/:categoryId/createContent", function (req, res) {
    let content = req.body.txtContent;
    let urlContent = req.body.txtUrlContent;

    let values = [[content, true, urlContent, req.params.categoryId]]
    let selectCategory = `insert into contents (content, state, videoUrl, category_id) values ?`;
    connection.query(selectCategory,[values], function (err, result) {
        if(err){throw err;}

        console.log("content " + content + " successfully inserted.")
    });
    res.redirect("back");
});


module.exports = router;