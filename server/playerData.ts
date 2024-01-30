export const Players = new Map<string, Player>();

export class Player {
    name: string;
    balance: number;
    constructor(name: string) {
        this.name = name;
        this.balance = 10000;
        if (!Players.has(name)) Players.set(name, this);
    }
}