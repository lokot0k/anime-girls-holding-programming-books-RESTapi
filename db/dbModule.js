const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// static class for DB
class DBOperator {
    static connection;

    static async setUpDB() {
        require("dotenv").config();
        // setup connection to MySql db
        DBOperator.connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        DBOperator.connection.connect(function (err) {
            if (err) {
                return console.error("Error: " + err.message);
            } else {
                console.log("MySQL connected successfully");
            }
        });
        await DBOperator.#connectToTable();
        await DBOperator.#uploadContent();
    }

    // function for creating table
    static async #connectToTable() {
        //TODO: make two different tables with schemas id-url-languageID and id-languageName
        await DBOperator.connection.query("CREATE TABLE IF NOT EXISTS `picture_information`" +
            " (`id` int(128) unsigned NOT NULL AUTO_INCREMENT,`language` text NOT NULL,`url`" +
            " text NOT NULL, `size` int(128) unsigned NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8");
    }

    // function to insert all of images data into database
    static async #uploadContent() {
        let pathToContent = path.join(__dirname, '..', 'public', 'images');
        const serverName = process.env.SERVER;
        const protocol = process.env.PROTOCOL
        const connection = DBOperator.connection;

        //recursive inner function for fetching pictures and inserting into database
        async function uploadContent(pathString, language = "") {
            for (const name of fs.readdirSync(pathString)) {
                let newPath = path.join(pathString, name);
                let fileStat = fs.statSync(newPath);
                if (fileStat.isDirectory()) {
                    await uploadContent(newPath, name);
                } else {
                    let url = protocol + "://" + serverName + "/" + language + "/" + name;
                    await connection.query("INSERT INTO `picture_information` (language,url,size) VALUES (?,?,?)",
                        [language, url, fileStat.size]);
                }
            }
        }

        await uploadContent(pathToContent);
    }

    // fetch picture with certain id from table
    static async getPictureById(id) {
        try {
            const [rows] = await DBOperator.connection.query("SELECT * from `picture_information` where id=?", [id]);
            return {rows};
        } catch (e) {
            console.log(e);
        }
    }

    //fetch pictures grouped by language from table
    static async getPictureByLanguage(language) {
        try {
            const [rows] = await DBOperator.connection.query("SELECT * from `picture_information` where language=?", [language]);
            console.log(rows);
            return {rows};
        } catch (e) {
            console.log(e);
        }
    }

}

module.exports = DBOperator;