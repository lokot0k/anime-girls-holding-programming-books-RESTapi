const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

async function savePicture(url, pathToFile, cb) {
    const img = await fetch(url);
    const imgBuffer = await img.buffer();
    let streamWrite = fs.createWriteStream(pathToFile)
    streamWrite.on("finish", async () => {
        await cb(pathToFile);
    });
    streamWrite.end(imgBuffer);

}

module.exports = {
    savePicture
}