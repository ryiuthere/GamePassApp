export interface Game {
    id: string;
    data: GameData;
    player_info: GamePlayerInfo[];
}

export interface GameData {
    name: string;
    desc: string;
    release_date: string;
    series_x: boolean;
    xbone: boolean;
    windows: boolean;
    cloud: boolean;
    genre: string;
    crossplat_multi: boolean;
    crossplat_coop: boolean;
    favorite: boolean;
}

export interface GamePlayerInfo {
    playerType: string;
    min_players: number;
    max_players: number;
}
