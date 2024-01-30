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
        ws.send(`{"type": "assetRefresh", "payload": ${JSON.stringify(gameAssets_1.GameAssets)}}`);
        var balances = "{";
        for (var player of Players.Players) {
            balances += `"${player[0]}": ${player[1].balance},`;
        }
        balances = balances.replace(/.$/, "}");
        ws.send(`{"type": "balanceUpdate", "payload": ${balances}}`);
    }, 1000);
});
// API
app.post("/api/addPlayer/:name", (req, res) => {
    res.writeHead(200);
    new Players.Player(req.params.name);
    res.end();
});
app.post("/api/transaction/buy/:player/:asset");
app.listen(pages_1.port);
