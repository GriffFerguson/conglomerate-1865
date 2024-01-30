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
        var cards = "";
        for (var player of Players.Players) {
            var owned = [];
            for (var asset of GameAssets) {
                if (asset.owner == player[0]) owned.push(asset.name);
            }
            
            var invested = [];
            for (var asset of GameAssets) {
                if (asset.investors.includes(player[0])) invested.push(asset.name);
            }

            var card = templates.playerCard({
                name: player[0],
                balance: Math.round(player[1].balance * 100) / 100,
                owned: owned,
                invested: invested
            })
            cards += card;
        }

        ws.send(`{"type": "cardTick", "payload": "${cards.replace(/"/gm, "\\\"")}"}`);

        var balances = "{";
        for (var player of Players.Players) {
            balances += `"${player[0]}": ${Math.round(player[1].balance * 100) / 100},`;
        }
        balances = balances.replace(/.$/, "}");
        ws.send(`{"type": "balanceUpdate", "payload": ${balances}}`);

        // OMG THE GAME CODE!!!!!!!
        for (var i = 0; i < GameAssets.length; i++) {
            // Determine new value
            GameAssets[i].trend = (Math.random() * 10) - 5
            GameAssets[i].value += GameAssets[i].trend * GameAssets[i].size * (10000 + (Math.random() * 1000000))
        
            // Give investors some income
            for (var investor of GameAssets[i].investors) {
                Players.Players.get(investor)!.balance += GameAssets[i].value * (Math.random() * .05);
            }

            // Recurring payment for workers
            if (GameAssets[i].owner != "") {
                Players.Players.get(GameAssets[i].owner)!.balance -= 100 * GameAssets[i].size * 150
            }
        }

    }, 1000)
})

// API
app.post("/api/addPlayer/:name", (req, res) => {
    res.writeHead(200);
    new Players.Player(req.params.name);
    res.end();
})
app.post("/api/transaction/buy/:player/:asset", (req, res) => {
    for (var i = 0; i < GameAssets.length; i++) {
        if (GameAssets[i].name == req.params.asset && GameAssets[i].owner == "") {
            res.writeHead(200);
            GameAssets[i].owner = req.params.player;
            GameAssets[i].investors = [];
            Players.Players.get(req.params.player)!.balance -= GameAssets[i].value;
            res.end();
            return;
        }
    }
    res.writeHead(404);
})
app.post("/api/transaction/invest/:player/:asset", (req, res) => {
    for (var i = 0; i < GameAssets.length; i++) {
        if (GameAssets[i].name == req.params.asset && !GameAssets[i].investors.includes(req.params.player) && GameAssets[i].owner == "") {
            res.writeHead(200);
            GameAssets[i].investors.push(req.params.player);
            Players.Players.get(req.params.player)!.balance -= GameAssets[i].value * .2;
            res.end();
            return;
        }
    }
    res.writeHead(404);
})
app.post("/api/transaction/bid/:player/:asset/create", (req, res) => {
    for (var i = 0; i < GameAssets.length; i++) {
        if (GameAssets[i].name == req.params.asset && GameAssets[i].owner != "" && GameAssets[i].owner != req.params.player) {
            res.writeHead(200);
            GameAssets[i].bid = [req.params.player, GameAssets[i].owner, GameAssets[i].value];
            Players.Players.get(req.params.player)!.balance -= GameAssets[i].value * .02;
            res.end();
            return;
        }
    }
    res.writeHead(404);
})
app.post("/api/transaction/bid/:asset/accept", (req, res) => {
    for (var i = 0; i < GameAssets.length; i++) {
        if (GameAssets[i].name == req.params.asset) {
            res.writeHead(200);
            Players.Players.get(GameAssets[i].bid![0])!.balance -= GameAssets[i].bid![2];
            Players.Players.get(GameAssets[i].bid![1])!.balance += GameAssets[i].bid![2];
            GameAssets[i].owner = GameAssets[i].bid![0]
            GameAssets[i].bid = null;
            res.end();
            return;
        }
    }
    res.writeHead(404);
})
app.post("/api/transaction/sell/:player/:asset", (req, res) => {
    for (var i = 0; i < GameAssets.length; i++) {
        if (GameAssets[i].name == req.params.asset && GameAssets[i].owner == req.params.player) {
            res.writeHead(200);
            Players.Players.get(req.params.player)!.balance += GameAssets[i].value;
            GameAssets[i].owner = "";
            res.end();
            return;
        }
    }
    res.writeHead(404);
})
app.post("/api/transaction/hire/:player/:asset/:amount", (req, res) => {
    for (var i = 0; i < GameAssets.length; i++) {
        if (GameAssets[i].name == req.params.asset && GameAssets[i].owner == req.params.player) {
            res.writeHead(200);
            Players.Players.get(GameAssets[i].bid![0])!.balance -= parseInt(req.params.amount) * 5000;
            GameAssets[i].size += parseInt(req.params.amount) / 50;
            res.end();
            return;
        }
    }
    res.writeHead(404);
})

app.listen(port)