export interface Asset {
    name: string
    pos: [number, number]
    value: number
    size: number
    trend: number
    owner: string
    investors: Array<string>
    bid: [string, string, number] | null
}

export const GameAssets: Array<Asset> = [
    {
        name: "Birmingham, Alabama",
        value: 12500000,
        pos: [1855, 1015],
        size: 1,
        trend: 0,
        owner: "",
        investors: [],
        bid: null
    },
    {
        name: "Memphis, Tennessee",
        value: 9500000,
        pos: [1855, 1015],
        size: 1,
        trend: 0,
        owner: "",
        investors: [],
        bid: null
    },
    {
        name: "Richmond, Virginia",
        value: 14000000,
        pos: [1855, 1015],
        size: 1,
        trend: 0,
        owner: "",
        investors: [],
        bid: null
    },
    {
        name: "R. H. Macy",
        value: 17000000,
        pos: [1855, 1015],
        size: 1,
        trend: 0,
        owner: "",
        investors: [],
        bid: null
    },
    {
        name: "Sears, Roebuck and Co.",
        value: 16200000,
        pos: [1855, 1015],
        size: 1,
        trend: 0,
        owner: "",
        investors: [],
        bid: null
    },
    {
        name: "Montgomery Ward",
        value: 16500000,
        pos: [1855, 1015],
        size: 1,
        trend: 0,
        owner: "",
        investors: [],
        bid: null
    },
    {
        name: "American Railroad Association",
        value: 25000000,
        pos: [1855, 1015],
        size: 1,
        trend: 0,
        owner: "",
        investors: [],
        bid: null
    },
    {
        name: "Standard Oil",
        value: 40000000,
        pos: [1855, 1015],
        size: 1,
        trend: 0,
        owner: "",
        investors: [],
        bid: null
    },
    {
        name: "United States Steel",
        value: 22000000,
        pos: [1855, 1015],
        size: 1,
        trend: 0,
        owner: "",
        investors: [],
        bid: null
    }
]