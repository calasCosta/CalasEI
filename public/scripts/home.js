const express = require('express');
const router = express.Router();
const connection = require("./db/db");
const fileupload = require("express-fileupload");

/**
 * Route method get to render the main page
 */
router.get("/", function (req, res) {
    connection.query("select * from categories", function (err, rows) {
        if(err){throw err;}
        res.render("home", {categories:rows});
    });
});


router.use(fileupload());
router.use(express.json());

/**
 * Route method post to create the categories
 */
router.post("/createCategory", function (req, res) {

    let category = req.body.txtCategory;

    if(!req.files){
        throw new Error("File not found");
    }
    let image = req.files.photoCategory;
    

    if(!!category){
        let selectCategory = `select * from categories where category = "${category}"`
        connection.query(selectCategory, (err, result)=>{
            if(err){throw err;}

            if(result.length){  throw new Error("Category already exists.");}

            image.mv(`public/images/${image.name}`, async(err)=>{
                if(err){throw err;}
                
                console.log(`${image.name} uploaded successfully`);
            });

            let imagePath = "../images/"+image.name;
            let insertCategory = `insert into categories (category, imagePath, state) values ?`
            connection.query(insertCategory, [[[category, imagePath, true]]], function(err, rows){
                if (err) {throw err;}

                console.log("category " + category + " successfully inserted.")
            });
        })
    }else{
        console.log("Cannot create a category width empty name");
    }

    
    res.redirect("back");
});

let url ="";
let contentId = 0;
/**
 * Route method get to render the contents page
 */
router.get("/category/:categoryId", function (req, res) {

    let selectCategory = `select category from categories where category_id = ${req.params.categoryId}`;
    connection.query(selectCategory, function (err, resultCategory) {
        if(err){throw err;}

        let selectContents = `select * from contents where category_id = ${req.params.categoryId}`;
        connection.query(selectContents, function (error, rows){
            if(error){throw error;}

            updateVideosUrl(rows);

            res.render("category", {
                category:resultCategory[0].category,
                categoryId: req.params.categoryId,
                contents : rows,
                urlContent : url,
                contentId: contentId}
            );
        });
    });
});

/**
 * Method to update the videoUrl. It receive an array of contents and then
 * 1- checks if its empty - if true reset url
 * 2 - else, it checks if url has a false boolean value, if true
 *     2.1 - it checks if this url belongs this category, if not it set url width the value of first element
 * 3 - else set the url and content id with the values of first element in array
 * @param {*} rows 
 */
 function updateVideosUrl(rows){
    if(!rows.length){
        url = ""; 
        contentId = 0;
    }else{

        let belongsToThisCategory = (function(){
            let belongsToThisCategory = false;
            for(let content of rows){
               if(url === content.videoUrl){
                    belongsToThisCategory = true;
               }
            }
            return belongsToThisCategory;
        }())

        if((!!url && !belongsToThisCategory) || !!url === false){
            url = rows[0].videoUrl;
            contentId = rows[0].content_id;
        }
    }
}

/**
 * Route method POST to create a new content
 * https://youtu.be/lBI98KmZLlc
 * https://www.youtube.com/embed/aILNoBMDdnU
 * https://www.youtube.com/watch?v=wOJmbQ0mvik
 */
router.post("/category/:categoryId/createContent", function (req, res) {
    let content = req.body.txtContent;
    let urlContent = req.body.txtUrlContent;

    

    let secureLink = (function(){
     
        if(urlContent.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/)){
            if(urlContent.includes("=")){
                return urlContent.split("=")[1]
            }else{
                let secure = urlContent.split("/");
                return secure[secure.length-1]
            }
        }else if(urlContent.match(/youtu\.be*(.{11})/)){
            let secure = urlContent.split("/");
            return secure[secure.length-1];
        }
        return "";
    }());

    if(!!content &&  !!secureLink){

        secureEmbedUrl = `https://www.youtube.com/embed/${secureLink}`;

        //console.log("yeeeeeeeeeessssssss  " + secureEmbedUrl)

        let values = [[content, true, secureEmbedUrl, req.params.categoryId]]
        let selectCategory = `insert into contents (content, state, videoUrl, category_id) values ?`;
        connection.query(selectCategory,[values], function (err, result) {
            if(err){throw err;}

            console.log("content " + content + " successfully inserted.")
        });
    }else{
        console.log("invalid url format or undefined content")
    }

    res.redirect("back");
});

/**
 * Route method POST to select a content on sidebar
 */
router.get("/category/:categoryId/content/:contentId", (req, res)=>{

    let selectContent = "select * from contents where content_id = "+req.params.contentId;
    connection.query(selectContent, function (err, result) {
        if(err){throw err;}

        url = result[0].videoUrl;
        contentId = req.params.contentId;
        
        let selectNotes  = `select * from notes where content_id= ${contentId}`;
        connection.query(selectNotes, function(error, notesResult){
            if(error){throw error;}

            res.render("content", {
                categoryId: req.params.categoryId, 
                contentId: req.params.contentId,
                notes: notesResult,
                urlContent: url,
                categoryId : req.params.categoryId
            });
        });
    });
    
});

/**
 * Route method POST to create notes for a specific content
 */
router.post("/category/:categoryId/content/:contentId/takeNote", (req, res)=>{

    let expression = req.body.expression;
    let meaning = req.body.meaning;
    let example = req.body.example;
    let pronunciation = req.body.pronunciation;

    if(!!expression){
        let values = [[expression, meaning, example, pronunciation, req.params.contentId]]
        let createNote = `insert into notes (expression, meaning, example, pronunciation, content_id) values ?`;

        connection.query(createNote, [values], function (err, result) {
            if(err){throw err;}

            console.log("content fk:  " + req.params.contentId)
            console.log("expression:  " + expression + "taken successfully")
        });
    }

    return;
    //res.redirect("back");
});

/**
 * Route method post to delete note of the receive parameter :noteId
 */
router.post("/category/:categoryId/content/:contentId/deleteNote/:noteId", function(req, res){
    let noteId = req.params.noteId;
    let deleteNoteQuery = "delete from notes where note_id="+noteId;
    connection.query(deleteNoteQuery,function(error, result){
        if(error){throw error;}
        console.log(result.affectedRows +"row affected");
    });
    return;
    //res.redirect("back");
});

router.get("/robotRoom", function(req, res){
    res.render("robotRoom");
});

module.exports = router;