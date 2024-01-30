import {join} from "path";
import { readFileSync } from "fs";
import {toDataURL} from "qrcode";
import {compileFile} from "pug";

const address = require("my-local-ip")();
export const port = 8080;

// Static (or mostly static) pages
function readPage(filename: string): string {
    return readFileSync(join(__dirname, `../pages/${filename}.html`), {encoding: "utf-8"})
        .replace(/\{ADDRESS\}/gm, address)
        .replace(/\{PORT\}/gm, port.toString());
}

export const pages = {
    launcher: readPage("launcher"),
    playerJoin: readPage("player_join"),
    gameBoard: readPage("game_board"),
    playerSeat: readPage("player")
}

toDataURL(`http://${address}:${port}`, {errorCorrectionLevel: "L"}, (err, code) => {
    pages.launcher = pages.launcher.replace("{QRCODE}", code);
})

// Pug templates
export const templates = {
    playerCard: compileFile(join(__dirname, "../templates/playerCard.pug")),
    assetGraphic: compileFile(join(__dirname, "../templates/assetGraphic.pug"))
}