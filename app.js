require('dotenv').config();

const express = require('express');
const app = express();
const path = require("path");





const PORT = process.env.PORT || 9000;
app.listen(PORT, (req, res) => {
    console.log(`Server running on port ${PORT}.`)
});

