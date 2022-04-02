const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

async function savePictureByURL(url, pathToFile, cb) {
    const img = await fetch(url);
    const imgBuffer = await img.buffer();
    let streamWrite = fs.createWriteStream(pathToFile)
    streamWrite.on("finish", async () => {
        await cb(pathToFile);
    });
    streamWrite.end(imgBuffer);
}


async function savePictureByBlob(blob, pathToFile, cb) {
    let streamWrite = fs.createWriteStream(pathToFile);
    streamWrite.end(Buffer.from(blob));
    streamWrite.on("finish", async () => {
        await cb(pathToFile);
    });

}

module.exports = {
    savePictureByURL,
    savePictureByBlob
}