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


function savePictureByBlob(blob, pathToFile) {
    let picBuffer = Buffer.from(blob);
    let streamWrite = fs.createWriteStream(pathToFile);
    streamWrite.end(picBuffer);
    return Buffer.byteLength(picBuffer);
}

function createDirectoryIfNotExists(pathToDirectory) {
    if (!fs.existsSync(pathToDirectory)) {
        fs.mkdirSync(pathToDirectory);
    }
}

module.exports = {
    savePictureByURL,
    savePictureByBlob,
    createDirectoryIfNotExists
}