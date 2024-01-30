import express from "express";
import expressWs from "express-ws";
import {join} from "path";
import { readFileSync } from "fs";
import {toDataURL} from "qrcode";
import * as Players from "./playerData";
import { EventEmitter } from "events";

const gameEvent = new EventEmitter();

var app = expressWs(express()).app;
const port = 8080;
const address = require("my-local-ip")();

function readPage(filename: string): string {
    return readFileSync(join(__dirname, `../pages/${filename}.html`), {encoding: "utf-8"})
        .replace(/\{ADDRESS\}/gm, address)
        .replace(/\{PORT\}/gm, port.toString());
}

const pages = {
    launcher: readPage("launcher"),
    playerJoin: readPage("player_join"),
    gameBoard: readPage("game_board"),
    playerSeat: readPage("player")
}

toDataURL(`http://${address}:${port}`, {errorCorrectionLevel: "L"}, (err, code) => {
    pages.launcher = pages.launcher.replace("{QRCODE}", code);
})

// Serve static files
app.use("/static", express.static("public"));

// Start game
app.get("/", (req, res) => {
    res.writeHead(200);
    res.end(pages.playerJoin);
})

app.get("/launcher", (req, res) => {
    res.writeHead(200);
    res.end(pages.launcher);
});

// Game media
app.get("/board", (req, res) => {
    res.end("works")
})

// WebSocket Handler
app.ws("/waitingRoom", (ws, req) => {
    setInterval(() => {
        var list = "";
        for (var player of Players.Players) {
            list += "<p>" + player[0] + "</p>";
        }
        ws.send(list);
    }, 1500);

    ws.on("message", (e) => {
        if (e.toString() == "start") {
            gameEvent.emit("gameStart");
            ws.close();
        }
    })
})

app.ws("/game-sync", (ws, req) => {
    gameEvent.on("gameStart", () => {
        ws.send("start_game");
    });
})

app.ws("/dealer", (ws, req) => {

})

app.ws("/game-board", (ws, req) => {

})

// API
app.post("/api/addPlayer/:name", (req, res) => {
    res.writeHead(200);
    new Players.Player(req.params.name);
    res.end();
})

app.listen(port)