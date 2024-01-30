import express from "express";
import {join} from "path";
import { readFileSync } from "fs";
import {toDataURL} from "qrcode";

const app = express();
const port = 8080;
const address = require("my-local-ip");

const pages = {
    launcher: (
        readFileSync(join(__dirname, "../pages/launcher.html"), {encoding: "utf-8"})
        .replace("{ADDRESS}", address)
        .replace("{PORT}", port.toString())
    )
}

toDataURL(`http://${address}:${port}`, {errorCorrectionLevel: "L"}, (err, code) => {
    pages.launcher = pages.launcher.replace("{QRCODE}", code)
})

// Serve static files
app.use("/static", express.static("public"));

// Start game
app.get("/launcher", (req, res) => {
    res.writeHead(200);
    res.end(pages.launcher);
});

app.listen(port)