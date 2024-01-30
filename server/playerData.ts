export const Players = new Map<string, Player>();

export class Player {
    name: string;
    constructor(name: string) {
        this.name = name;
        if (!Players.has(name)) Players.set(name, this);
    }
}