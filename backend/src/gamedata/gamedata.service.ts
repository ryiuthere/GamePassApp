import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { Game } from './gamedata.model';
import { InternalServerErrorException } from '@nestjs/common';

const knexNest = require('knexnest');

enum GameTableId {
    id = 'id',
    name = 'name',
    description = 'desc',
    releaseDate = 'releaseDate',
    seriesx = 'seriesx',
    xbone = 'xbone',
    windows = 'windows',
    cloud = 'cloud',
    genre = 'genre',
    crossplatMultiplayer = 'crossplatMultiplayer',
    crossplatCoop = 'crossplatCoop',
    favorite = 'favorite',
}

enum PlayerTableId {
    internalId = 'internalId',
    id = 'id',
    playerType = 'playerType',
    minPlayers = 'minPlayers',
    maxPlayers = 'maxPlayers',
}

enum PlayerTypes {
    singlePlayer = 'singlePlayer',
    localMultiplayer = 'localMultiplayer',
    localCoop = 'localCoop',
    onlineMultiplayer = 'onlineMultiplayer',
    onlineCoop = 'onlineCoop',
}

export class GamedataService {
    private readonly GAMEDATA_TABLE_NAME = 'gamedata_info';
    private readonly PLAYER_COUNT_TABLE_NAME = 'gamedata_player_count_info';

    constructor(@InjectConnection() private readonly knex: Knex) {}

    async addGameAsync(game: Game) {
        await this.verifyTablesAsync();
        if (!this.isValid(game)) {
            throw new InternalServerErrorException('Incorrect formatting');
        }
        // Each table requires the id as well
        let gameData = { id: game.id, ...game.data };
        await this.knex(this.GAMEDATA_TABLE_NAME).insert(gameData);
        await game.playerInfo.forEach(async (info) => {
            let playerInfo = { id: game.id, ...info };
            await this.knex(this.PLAYER_COUNT_TABLE_NAME).insert(playerInfo);
        });
    }

    async getGamesAsync(filters): Promise<Game[]> {
        await this.verifyTablesAsync();
        let gamesQuery = this.knex
            .select(
                `g.${GameTableId.id} AS _${GameTableId.id}`,
                `g.${GameTableId.name} AS _data_${GameTableId.name}`,
                `g.${GameTableId.description} AS _data_${GameTableId.description}`,
                `g.${GameTableId.releaseDate} AS _data_${GameTableId.releaseDate}`,
                `g.${GameTableId.seriesx} AS _data_${GameTableId.seriesx}`,
                `g.${GameTableId.xbone} AS _data_${GameTableId.xbone}`,
                `g.${GameTableId.windows} AS _data_${GameTableId.windows}`,
                `g.${GameTableId.cloud} AS _data_${GameTableId.cloud}`,
                `g.${GameTableId.genre} AS _data_${GameTableId.genre}`,
                `g.${GameTableId.crossplatMultiplayer} AS _data_${GameTableId.crossplatMultiplayer}`,
                `g.${GameTableId.crossplatCoop} AS _data_${GameTableId.crossplatCoop}`,
                `g.${GameTableId.favorite} AS _data_${GameTableId.favorite}`,
                `p.${PlayerTableId.internalId} AS _${'playerInfo'}__${
                    PlayerTableId.internalId
                }`,
                `p.${PlayerTableId.playerType} AS _${'playerInfo'}__${
                    PlayerTableId.playerType
                }`,
                `p.${PlayerTableId.minPlayers} AS _${'playerInfo'}__${
                    PlayerTableId.minPlayers
                }`,
                `p.${PlayerTableId.maxPlayers} AS _${'playerInfo'}__${
                    PlayerTableId.maxPlayers
                }`,
            )
            .from(`${this.GAMEDATA_TABLE_NAME} AS g`)
            .leftJoin(
                `${this.PLAYER_COUNT_TABLE_NAME} AS p`,
                `g.${GameTableId.id}`,
                `p.${PlayerTableId.id}`,
            );

        // Allows for properly filtering by player type
        // Can not currently filter min and max players
        if (filters?.playerType) {
            let innerQuery = this.knex
                .select(PlayerTableId.id)
                .from(this.PLAYER_COUNT_TABLE_NAME)
                .where(PlayerTableId.playerType, filters.playerType);

            gamesQuery
                .leftJoin(
                    innerQuery.as('pt'),
                    `pt.${PlayerTableId.id}`,
                    `g.${GameTableId.id}`,
                )
                .whereNotNull(`pt.${PlayerTableId.id}`);
        }
        for (let [key, value] of Object.entries(filters)) {
            if (key == 'NAME') {
                gamesQuery.whereILike(`g.${GameTableId[key]}`, `%${value}%`);
            } else if (key in GameTableId) {
                gamesQuery.where(`g.${GameTableId[key]}`, value);
            }
        }

        return knexNest(gamesQuery);
    }

    async updateGameAsync(game: Game) {
        await this.verifyTablesAsync();
        // Each table requires the id as well
        let gameData = { id: game.id, ...game.data };
        await this.knex(this.GAMEDATA_TABLE_NAME)
            .where(GameTableId.id, game.id)
            .update({ ...gameData });

        await this.knex(this.PLAYER_COUNT_TABLE_NAME)
            .where(PlayerTableId.id, game.id)
            .del();
        game.playerInfo.forEach((playerInfo) => {
            (playerInfo as any).id = game.id;
        });
        await this.knex(this.PLAYER_COUNT_TABLE_NAME).insert(game.playerInfo);
    }

    async removeGameAsync(id: string) {
        await this.verifyTablesAsync();
        await this.knex(this.GAMEDATA_TABLE_NAME)
            .where(GameTableId.id, id)
            .del();
        await this.knex(this.PLAYER_COUNT_TABLE_NAME)
            .where(PlayerTableId.id, id)
            .del();
    }

    async rebuildTables() {
        await this.knex.schema.dropTable(this.GAMEDATA_TABLE_NAME);
        await this.knex.schema.dropTable(this.PLAYER_COUNT_TABLE_NAME);
        await this.verifyTablesAsync();
    }

    //#region Private functionality

    // Values for player type
    private readonly PlayerType = {
        SINGLE: 'singlePlayer',
        LOCALMULTIPLAYER: 'localMultiplayer',
        LOCALCOOP: 'localCoop',
        ONLINEMULTIPLAYER: 'onlineMultiplayer',
        ONLINECOOP: 'onlineCoop',
    };

    // Used to verify tables exist and create them if not
    // TODO: Migration
    private async verifyTablesAsync() {
        let gameTableExists = await this.knex.schema.hasTable(
            this.GAMEDATA_TABLE_NAME,
        );
        if (!gameTableExists) {
            await this.knex.schema.createTable(
                this.GAMEDATA_TABLE_NAME,
                (table) => {
                    table.string(GameTableId.id).primary();
                    table.string(GameTableId.name);
                    table.string(GameTableId.description, 2500);
                    table.string(GameTableId.releaseDate);
                    table.boolean(GameTableId.seriesx);
                    table.boolean(GameTableId.xbone);
                    table.boolean(GameTableId.windows);
                    table.boolean(GameTableId.cloud);
                    table.string(GameTableId.genre);
                    table.boolean(GameTableId.crossplatMultiplayer);
                    table.boolean(GameTableId.crossplatCoop);
                    table.boolean(GameTableId.favorite);
                },
            );
        }
        let playerTypeTableExists = await this.knex.schema.hasTable(
            this.PLAYER_COUNT_TABLE_NAME,
        );
        if (!playerTypeTableExists) {
            await this.knex.schema.createTable(
                this.PLAYER_COUNT_TABLE_NAME,
                (table) => {
                    table.primary([PlayerTableId.id, PlayerTableId.playerType]);
                    table.increments(PlayerTableId.internalId);
                    table.string(PlayerTableId.id);
                    table.string(PlayerTableId.playerType);
                    table.string(PlayerTableId.minPlayers);
                    table.string(PlayerTableId.maxPlayers);
                },
            );
        }
    }

    private isValid(game: Game) {
        var idRegex = /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g;
        var titleRegex = /[~!#$%\^&*+=\-\[\]\\;/{}|<>\?]/g;
        return !idRegex.test(game.id) || titleRegex.test(game.data.name);
    }
    //#endregion
}
