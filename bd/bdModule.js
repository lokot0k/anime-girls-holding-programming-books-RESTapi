const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");


class DBOperator {
    constructor() {
        require("dotenv").config();
        // setup connection to MySql db
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        this.connection.connect(function (err) {
            if (err) {
                return console.error("Error: " + err.message);
            } else {
                console.log("MySQL connected successfully");
            }
        });
        this.#connectToTable();
        this.#uploadContent();
    }

    // function for creating table
    #connectToTable() {
        //TODO: make two different tables with schemas id-url-languageID and id-languageName
        this.connection.query("CREATE TABLE IF NOT EXISTS `picture_information`" +
            " (`id` int(128) unsigned NOT NULL AUTO_INCREMENT,`language` text NOT NULL,`url`" +
            " text NOT NULL, `size` int(128) unsigned NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8",
            (err) => {
                if (err) {
                    console.log("Error occurred while executing query: " + err);
                } else {
                    console.log("Table created successfully")
                }
            });
    }

    // function to insert all of images data into database
    #uploadContent() {
        let pathToContent = path.join(__dirname, '..', 'public', 'images');
        const serverName = process.env.SERVER;
        const protocol = process.env.PROTOCOL
        const connection = this.connection;

        //recursive inner function for fetching pictures and inserting into database
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

    getPictureById(id) {
        //TODO: implement this and add such api call
    }

    getPictureByLanguage(language) {
        //TODO: implement this and rewrite such api call
    }
}

DBModule = new DBOperator();
module.exports = DBModule;