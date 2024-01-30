import { templates } from "./pages";

interface AssetGraphicData {
    pos: [number, number]
    size: number
    color: string
}

export interface Asset {
    name: string
    pos: [number, number]
    value: number
    size: number
    trend: "up" | "neutral" | "down"
    owner: string
}

export const GameAssets = {
    birmingham: {
        name: "Birmingham, Alabama",
        value: 8500000,
        pos: [1855, 1015],
        size: 1,
        trend: "neutral",
        owner: ""
    }
}