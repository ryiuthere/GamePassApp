export interface Game {
    id: string;
    data: GameData;
    playerInfo: GamePlayerInfo[];
}

export interface GameData {
    name: string;
    desc: string;
    releaseDate: string;
    seriesx: boolean;
    xbone: boolean;
    windows: boolean;
    cloud: boolean;
    genre: string;
    crossplatMultiplayer: boolean;
    crossplatCoop: boolean;
    favorite: boolean;
}

export interface GamePlayerInfo {
    playerType: string;
    minPlayers: number;
    maxPlayers: number;
}
