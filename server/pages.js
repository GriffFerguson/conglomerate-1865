"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templates = exports.pages = exports.port = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const qrcode_1 = require("qrcode");
const pug_1 = require("pug");
const address = require("my-local-ip")();
exports.port = 8080;
// Static (or mostly static) pages
function readPage(filename) {
    return (0, fs_1.readFileSync)((0, path_1.join)(__dirname, `../pages/${filename}.html`), { encoding: "utf-8" })
        .replace(/\{ADDRESS\}/gm, address)
        .replace(/\{PORT\}/gm, exports.port.toString());
}
exports.pages = {
    launcher: readPage("launcher"),
    playerJoin: readPage("player_join"),
    gameBoard: readPage("game_board"),
    playerSeat: readPage("player")
};
(0, qrcode_1.toDataURL)(`http://${address}:${exports.port}`, { errorCorrectionLevel: "L" }, (err, code) => {
    exports.pages.launcher = exports.pages.launcher.replace("{QRCODE}", code);
});
// Pug templates
exports.templates = {
    playerCard: (0, pug_1.compileFile)((0, path_1.join)(__dirname, "../templates/playerCard.pug"))
};
