"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = exports.Players = void 0;
exports.Players = new Map();
class Player {
    constructor(name) {
        this.name = name;
        if (!exports.Players.has(name))
            exports.Players.set(name, this);
    }
}
exports.Player = Player;
