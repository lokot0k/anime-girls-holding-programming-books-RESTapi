const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

function setUpDB() {
    require("dotenv").config();
    // setup connection to MySql db
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    connection.connect(function (err) {
        if (err) {
            return console.error("Error: " + err.message);
        } else {
            console.log("MySQL connected successfully");
        }
    });
    // build database carcass
    //TODO: make two different tables with schemas id-url-languageID and id-languageName
    connection.query("CREATE TABLE `picture_information`" +
        " (`id` int(128) unsigned NOT NULL AUTO_INCREMENT,`language` text NOT NULL,`url`" +
        " text NOT NULL, `size` int(128) unsigned NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8", (err) => {
        if (err) {
            console.log("Error occurred while executing query: " + err);
        } else {
            console.log("Table created successfully")
        }
    });
    let pathToContent = path.join(__dirname, '..', 'public', 'images');
    const serverName = process.env.SERVER;
    const protocol = process.env.PROTOCOL

    // function to insert all of images data into databse
    function uploadContent(pathString, language = "") {
        fs.readdirSync(pathString).forEach((name) => {
            let newPath = path.join(pathString, name);
            let fileStat = fs.statSync(newPath);
            if (fileStat.isDirectory()) {
                uploadContent(newPath, name);
            } else {
                let url = protocol + "://" + serverName + "/" + language + "/" + name;
                connection.query("INSERT INTO `picture_information` (language,url,size) VALUES (?,?,?)",
                    [language, url, fileStat.size]);
            }
        });
    }

    uploadContent(pathToContent);
}

function getPictureById(id) {
    //TODO: implement this and add such api call
}

function getPictureByLanguage(language) {
    //TODO: implement this and rewrite such api call
}

module.exports = {setUpDB};