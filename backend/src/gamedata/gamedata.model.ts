export class Game {
    constructor(
        public id: string,
        public data: GameData,
        public player_info: GamePlayerInfo[],
    ) {}
}

export class GameData {
    constructor(
        public name: string,
        public desc: string,
        public release_date: string,
        public series_x: boolean,
        public xbone: boolean,
        public windows: boolean,
        public cloud: boolean,
        public genre: string,
        public crossplat_multi: boolean,
        public crossplat_coop: boolean,
        public favorite: boolean,
    ) {}
}

export class GamePlayerInfo {
    constructor(
        public player_type: string,
        public min_players: number,
        public max_players: number,
    ) {}
}
