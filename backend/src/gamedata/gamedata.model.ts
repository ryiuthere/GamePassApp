export class Game {
    constructor(
        public id: string,
        public data: GameData,
        public playerInfo: GamePlayerInfo[],
    ) {}
}

export class GameData {
    constructor(
        public name: string,
        public releaseDate: string,
        public seriesX: boolean,
        public xbOne: boolean,
        public windows: boolean,
        public cloud: boolean,
        public genre: string,
        public crossplatMultiplayer: boolean,
        public crossplatCoop: boolean,
    ) {}
}

export class GamePlayerInfo {
    constructor(
        public playerType: string,
        public minPlayers: number,
        public maxPlayers: number,
    ) {}
}
