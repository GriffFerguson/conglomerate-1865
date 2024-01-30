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
const path_1 = require("path");
const fs_1 = require("fs");
const qrcode_1 = require("qrcode");
const Players = __importStar(require("./playerData"));
var app = (0, express_ws_1.default)((0, express_1.default)()).app;
const port = 8080;
const address = require("my-local-ip")();
const pages = {
    launcher: ((0, fs_1.readFileSync)((0, path_1.join)(__dirname, "../pages/launcher.html"), { encoding: "utf-8" })
        .replace(/\{ADDRESS\}/gm, address)
        .replace(/\{PORT\}/gm, port.toString())),
    playerJoin: (0, fs_1.readFileSync)((0, path_1.join)(__dirname, "../pages/player_join.html"), { encoding: "utf-8" })
};
(0, qrcode_1.toDataURL)(`http://${address}:${port}`, { errorCorrectionLevel: "L" }, (err, code) => {
    pages.launcher = pages.launcher.replace("{QRCODE}", code);
});
// Serve static files
app.use("/static", express_1.default.static("public"));
// Start game
app.get("/", (req, res) => {
    res.writeHead(200);
    res.end(pages.playerJoin);
});
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
    }, 1500);
});
// API
app.post("/api/addPlayer/:name", (req, res) => {
    res.writeHead(200);
    new Players.Player(req.params.name);
});
app.listen(port);
