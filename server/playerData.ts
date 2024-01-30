export const Players = new Map<string, Player>();

export class Player {
    name: string;
    balance: number;
    investedAssets: Array<string>
    constructor(name: string) {
        this.name = name;
        this.balance = 10000000;
        this.investedAssets = [];
        if (!Players.has(name)) Players.set(name, this);
    }
}