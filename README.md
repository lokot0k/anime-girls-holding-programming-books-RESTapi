README
-
This is restAPI and static file server of https://github.com/cat-milk/Anime-Girls-Holding-Programming-Books images. If
you need this, then you can ~~use current deployment~~ or deploy it yourself. In order to self-deployment you should
follow this guideline:

1. Clone this repo
2. Create MySQL schema and start MySQL server
3. Fill `.env` file with your settings
4. Run server by `node bin/www` command

You also can upload your own files in case of having any, just POST them to server!


What was done/will be done:
-

- [x]   Create GET by id route
- [x]   Create GET by language route
- [x]   Finish writing a documentation for api on `/` route
- [x]   Create POST route
- [ ]   Make auto-update of DB due to regular commits in the original repo of images
- [ ]   Create a program's arguments parser for changing server's settings
- [ ]   Deploy this on VPS
