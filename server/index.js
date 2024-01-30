"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_ws_1 = __importDefault(require("express-ws"));
const Players = __importStar(require("./playerData"));
const events_1 = require("events");
const pages_1 = require("./pages");
const gameAssets_1 = require("./gameAssets");
const gameEvent = new events_1.EventEmitter();
var app = (0, express_ws_1.default)((0, express_1.default)()).app;
// Serve static files
app.use("/static", express_1.default.static("public"));
// Start game
app.get("/", (req, res) => {
    res.writeHead(200);
    res.end(pages_1.pages.playerJoin);
});
app.get("/launcher", (req, res) => {
    res.writeHead(200);
    res.end(pages_1.pages.launcher);
});
// Game media
app.get("/board", (req, res) => {
    res.writeHead(200);
    res.end(pages_1.pages.gameBoard);
});
app.get("/play", (req, res) => {
    res.writeHead(200);
    res.end(pages_1.pages.playerSeat);
});
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
    });
});
app.ws("/game-sync", (ws, req) => {
});
app.ws("/dealer", (ws, req) => {
    gameEvent.on("gameStart", () => {
        ws.send("start_game");
    });
    setInterval(() => {
        var cards = "";
        for (var player of Players.Players) {
            var owned = [];
            for (var asset of gameAssets_1.GameAssets) {
                if (asset.owner == player[0])
                    owned.push(asset.name);
            }
            var invested = [];
            for (var asset of gameAssets_1.GameAssets) {
                if (asset.investors.includes(player[0]))
                    invested.push(asset.name);
            }
            var card = pages_1.templates.playerCard({
                name: player[0],
                balance: Math.round(player[1].balance * 100) / 100,
                owned: owned,
                invested: invested
            });
            cards += card;
        }
        ws.send(`{"type": "cardTick", "payload": "${cards.replace(/"/gm, "\\\"")}"}`);
        var statCards = "";
        var bids = [];
        for (var asset of gameAssets_1.GameAssets) {
            statCards += `<p>${asset.name}: $${asset.value}</p>`;
            if (asset.bid != null) {
                bids.push([asset.name, asset.bid[0], asset.bid[1], asset.bid[2]]);
            }
        }
        ws.send(`{"type": "statsTick", "payload": "${statCards.replace(/"/gm, "\\\"")}"}`);
        ws.send(`{"type": "bids", "payload": "${JSON.stringify(bids)}"}`);
        var balances = "{";
        for (var player of Players.Players) {
            balances += `"${player[0]}": ${Math.round(player[1].balance * 100) / 100},`;
        }
        balances = balances.replace(/.$/, "}");
        ws.send(`{"type": "balanceUpdate", "payload": ${balances}}`);
        // OMG THE GAME CODE!!!!!!!
        for (var i = 0; i < gameAssets_1.GameAssets.length; i++) {
            // Determine new value
            gameAssets_1.GameAssets[i].trend = (Math.random() * 10) - 5;
            gameAssets_1.GameAssets[i].value += gameAssets_1.GameAssets[i].trend * gameAssets_1.GameAssets[i].size * (10000 + (Math.random() * 1000000));
            // Give investors some income
            for (var investor of gameAssets_1.GameAssets[i].investors) {
                Players.Players.get(investor).balance += gameAssets_1.GameAssets[i].value * (Math.random() * .05);
            }
            // Recurring payment for workers
            if (gameAssets_1.GameAssets[i].owner != "") {
                Players.Players.get(gameAssets_1.GameAssets[i].owner).balance -= 100 * gameAssets_1.GameAssets[i].size * 150;
            }
        }
    }, 1000);
});
// API
app.post("/api/addPlayer/:name", (req, res) => {
    res.writeHead(200);
    new Players.Player(req.params.name);
    res.end();
});
app.post("/api/transaction/buy/:player/:asset", (req, res) => {
    for (var i = 0; i < gameAssets_1.GameAssets.length; i++) {
        if (gameAssets_1.GameAssets[i].name == req.params.asset && gameAssets_1.GameAssets[i].owner == "") {
            res.writeHead(200);
            gameAssets_1.GameAssets[i].owner = req.params.player;
            gameAssets_1.GameAssets[i].investors = [];
            Players.Players.get(req.params.player).balance -= gameAssets_1.GameAssets[i].value;
            res.end();
            return;
        }
    }
    res.writeHead(404);
});
app.post("/api/transaction/invest/:player/:asset", (req, res) => {
    for (var i = 0; i < gameAssets_1.GameAssets.length; i++) {
        if (gameAssets_1.GameAssets[i].name == req.params.asset && !gameAssets_1.GameAssets[i].investors.includes(req.params.player) && gameAssets_1.GameAssets[i].owner == "") {
            res.writeHead(200);
            gameAssets_1.GameAssets[i].investors.push(req.params.player);
            Players.Players.get(req.params.player).balance -= gameAssets_1.GameAssets[i].value * .2;
            res.end();
            return;
        }
    }
    res.writeHead(404);
});
app.post("/api/transaction/bid/:player/:asset/create", (req, res) => {
    for (var i = 0; i < gameAssets_1.GameAssets.length; i++) {
        if (gameAssets_1.GameAssets[i].name == req.params.asset && gameAssets_1.GameAssets[i].owner != "" && gameAssets_1.GameAssets[i].owner != req.params.player) {
            res.writeHead(200);
            gameAssets_1.GameAssets[i].bid = [req.params.player, gameAssets_1.GameAssets[i].owner, gameAssets_1.GameAssets[i].value];
            Players.Players.get(req.params.player).balance -= gameAssets_1.GameAssets[i].value * .02;
            res.end();
            return;
        }
    }
    res.writeHead(404);
});
app.post("/api/transaction/bid/:asset/accept", (req, res) => {
    for (var i = 0; i < gameAssets_1.GameAssets.length; i++) {
        if (gameAssets_1.GameAssets[i].name == req.params.asset) {
            res.writeHead(200);
            Players.Players.get(gameAssets_1.GameAssets[i].bid[0]).balance -= gameAssets_1.GameAssets[i].bid[2];
            Players.Players.get(gameAssets_1.GameAssets[i].bid[1]).balance += gameAssets_1.GameAssets[i].bid[2];
            gameAssets_1.GameAssets[i].owner = gameAssets_1.GameAssets[i].bid[0];
            gameAssets_1.GameAssets[i].bid = null;
            res.end();
            return;
        }
    }
    res.writeHead(404);
});
app.post("/api/transaction/sell/:player/:asset", (req, res) => {
    for (var i = 0; i < gameAssets_1.GameAssets.length; i++) {
        if (gameAssets_1.GameAssets[i].name == req.params.asset && gameAssets_1.GameAssets[i].owner == req.params.player) {
            res.writeHead(200);
            Players.Players.get(req.params.player).balance += gameAssets_1.GameAssets[i].value;
            gameAssets_1.GameAssets[i].owner = "";
            res.end();
            return;
        }
    }
    res.writeHead(404);
});
app.post("/api/transaction/hire/:player/:asset/:amount", (req, res) => {
    for (var i = 0; i < gameAssets_1.GameAssets.length; i++) {
        if (gameAssets_1.GameAssets[i].name == req.params.asset && gameAssets_1.GameAssets[i].owner == req.params.player) {
            res.writeHead(200);
            Players.Players.get(gameAssets_1.GameAssets[i].bid[0]).balance -= parseInt(req.params.amount) * 5000;
            gameAssets_1.GameAssets[i].size += parseInt(req.params.amount) / 50;
            res.end();
            return;
        }
    }
    res.writeHead(404);
});
app.listen(pages_1.port);
