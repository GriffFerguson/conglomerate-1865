import express from "express";
import expressWs from "express-ws";
import {join} from "path";
import { readFileSync } from "fs";
import {toDataURL} from "qrcode";
import * as Players from "./playerData";

var app = expressWs(express()).app;
const port = 8080;
const address = require("my-local-ip")();

const pages = {
    launcher: (
        readFileSync(join(__dirname, "../pages/launcher.html"), {encoding: "utf-8"})
        .replace(/\{ADDRESS\}/gm, address)
        .replace(/\{PORT\}/gm, port.toString())
    ),
    playerJoin: readFileSync(join(__dirname, "../pages/player_join.html"), {encoding: "utf-8"})
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

// WebSocket Handler
app.ws("/waitingRoom", (ws, req) => {
    setInterval(() => {
        var list = "";
        for (var player of Players.Players) {
            list += "<p>" + player[0] + "</p>";
        }
        ws.send(list);
    }, 1500)
})

app.ws("/dealer", (ws, req) => {
    
})

// API
app.post("/api/addPlayer/:name", (req, res) => {
    res.writeHead(200);
    new Players.Player(req.params.name);
})

app.listen(port)