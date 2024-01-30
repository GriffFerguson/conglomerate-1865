"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const fs_1 = require("fs");
const qrcode_1 = require("qrcode");
const app = (0, express_1.default)();
const port = 8080;
const address = require("my-local-ip");
const pages = {
    launcher: ((0, fs_1.readFileSync)((0, path_1.join)(__dirname, "../pages/launcher.html"), { encoding: "utf-8" })
        .replace("{ADDRESS}", address)
        .replace("{PORT}", port.toString()))
};
(0, qrcode_1.toDataURL)(`http://${address}:${port}`, { errorCorrectionLevel: "L" }, (err, code) => {
    pages.launcher = pages.launcher.replace("{QRCODE}", code);
});
// Serve static files
app.use("/static", express_1.default.static("public"));
// Start game
app.get("/launcher", (req, res) => {
    res.writeHead(200);
    res.end(pages.launcher);
});
app.listen(port);
