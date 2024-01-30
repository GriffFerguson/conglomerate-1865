import express from "express";
import expressWs from "express-ws";
import * as Players from "./playerData";
import { EventEmitter } from "events";
import {pages, templates , port} from "./pages";
import { GameAssets, Asset } from "./gameAssets";

const gameEvent = new EventEmitter();

var app = expressWs(express()).app;

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
    res.writeHead(200);
    res.end(pages.gameBoard);
})

app.get("/play", (req, res) => {
    res.writeHead(200);
    res.end(pages.playerSeat);
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
    
})

interface WebSocketMsg {
    type: string
    payload: Array<Asset> | any 
}

app.ws("/dealer", (ws, req) => {
    gameEvent.on("gameStart", () => {
        ws.send("start_game");
    });

    setInterval(() => {
        ws.send(`{"type": "assetRefresh", "payload": ${JSON.stringify(GameAssets)}}`)

        var balances = "{";
        for (var player of Players.Players) {
            balances += `"${player[0]}": ${player[1].balance},`;
        }
        balances = balances.replace(/.$/, "}");
        ws.send(`{"type": "balanceUpdate", "payload": ${balances}}`)
    }, 1000)
})

// API
app.post("/api/addPlayer/:name", (req, res) => {
    res.writeHead(200);
    new Players.Player(req.params.name);
    res.end();
})
app.post("/api/transaction/buy/:player/:asset")

app.listen(port)