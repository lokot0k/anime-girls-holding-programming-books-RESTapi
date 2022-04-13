const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const savePictureByUrl = require("../utils/utils.js").savePictureByURL;
const createDirectoryIfNotExists = require("../utils/utils.js").createDirectoryIfNotExists;
const fetch = require("node-fetch");

// static class for DB
class DBOperator {
    static #connection;

    static async setUpDB() {
        require("dotenv").config();

        // setup connection to MySql db
        try {
            DBOperator.#connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            });
            console.log("DB Connection set successfully");
        } catch (e) {
            console.log("Failed to connect to the DB");
            return
        }
        DBOperator.#connection.connect();
        await DBOperator.#createTable();
        // fetch all images from origin repo in case of empty table
        await DBOperator.fetchRepo();
    }

    // function for creating table
    static async #createTable() {
        //TODO: write a migration
        return await DBOperator.#connection.query("CREATE TABLE IF NOT EXISTS `picture_information`" +
            " (`id` int(128) unsigned NOT NULL AUTO_INCREMENT,`language` text NOT NULL,`url`" +
            " text NOT NULL, `size` int(128) unsigned NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8");

    }

    // function to insert all of local images into database
    static async #uploadLocalContent() {
        let pathToContent = path.join(__dirname, '..', 'public', 'images');
        const serverName = process.env.SERVER + ":" + process.env.PORT;
        const protocol = process.env.PROTOCOL
        const connection = DBOperator.#connection;

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

        try {
            await uploadContent(pathToContent);
        } catch (e) {
            console.log("Error in uploadContent function: " + e)
        }
    }

    // fetch picture with certain id from table
    static async getPictureById(id) {
        try {
            const [rows] = await DBOperator.#connection.query("SELECT * from `picture_information` where id=?", [id]);
            return rows[0];
        } catch (e) {
            console.log("Error in getPictureById function: " + e);
        }
    }

    //fetch pictures grouped by language from table
    static async getPictureByLanguage(language) {
        try {
            const [rows] = await DBOperator.#connection.query("SELECT * from `picture_information` where language=?",
                [language]);
            return {rows};
        } catch (e) {
            console.log("Error in getPictureByLanguage function: " + e);
        }
    }

    static async addPicture(obj) {
        require('dotenv').config();
        const url = process.env.PROTOCOL + "://" + process.env.SERVER + ":" + process.env.PORT + "/" + obj.language + "/"
            + obj.name;
        try {
            await DBOperator.#connection.query("insert into `picture_information` (language, url, size) values(?,?,?)",
                [obj.language, url, obj.size]);
            return true;
        } catch (e) {
            console.log("Error in addPicture function: " + e);
            return false;
        }
    }

    // function for updating changes
    static async fetchRepo() {
        require('dotenv').config();
        let options = {
            method: 'GET', headers: {
                'Authorization': 'Basic ' + Buffer.from(process.env.GH_KEY).toString('base64')
            }
        };
        let contentArray = null;
        try {
            let res = await fetch('https://api.github.com/repos/cat-milk/Anime-Girls-Holding-Programming-Books/contents/',
                options);
            contentArray = await res.json()
        } catch (e) {
            console.log(`Error while updating repo occurred ${e}`);
            return
        }
        for (const dir of contentArray) {
            let directoryContent = await fetch(dir.url, options);
            directoryContent = await directoryContent.json();
            if (dir.type !== "dir") {
                continue;
            }
            const pathToDirectory = path.join(__dirname, '..', 'public', 'images', dir.name);
            createDirectoryIfNotExists(pathToDirectory);
            for (const picJSON of directoryContent) {
                const obj = {
                    name: picJSON.name, language: dir.name, size: picJSON.size
                }
                const pathToFile = path.join(pathToDirectory, obj.name);
                await savePictureByUrl(picJSON.download_url, pathToFile, async () => {
                        const isAdded = await this.addPicture(obj);
                        console.log(isAdded ? `${obj.name} is inserted in DB` : `failed inserting ${obj.name} into DB`);
                    }
                );
            }
        }
    }
}

module.exports = DBOperator;
