import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { Game } from './gamedata.model';

const knexNest = require('knexnest');

// Note: next time use snake case b/c of postgresql
//       and make enum name same as database column title
enum GameTableId {
    ID = 'id',
    NAME = 'name',
    DESCRIPTION = 'desc',
    RELEASEDATE = 'releaseDate',
    SERIESX = 'seriesX',
    XBONE = 'xbOne',
    WINDOWS = 'windows',
    CLOUD = 'cloud',
    GENRE = 'genre',
    CROSSPLATMULTI = 'crossplatMultiplayer',
    CROSSPLATCOOP = 'crossplatCoop',
    FAVORITE = 'favorite',
}

enum PlayerTableId {
    ID = 'id',
    PLAYERTYPE = 'playerType',
    MINPLAYERS = 'minPlayers',
    MAXPLAYERS = 'maxPlayers',
}

export class GamedataService {
    private readonly GAMEDATA_TABLE_NAME = 'gamedata_info';
    private readonly PLAYER_COUNT_TABLE_NAME = 'gamedata_player_count_info';

    constructor(@InjectConnection() private readonly knex: Knex) {}

    async addGameAsync(game: Game) {
        await this.verifyTablesAsync();
        // Each table requires the id as well
        const gameData = { id: game.id, ...game.data };
        await this.knex(this.GAMEDATA_TABLE_NAME).insert(gameData);
        await game.playerInfo.forEach(async (info) => {
            const playerInfo = { id: game.id, ...info };
            await this.knex(this.PLAYER_COUNT_TABLE_NAME).insert(playerInfo);
        });
    }

    async getGamesAsync(filters): Promise<Game[]> {
        await this.verifyTablesAsync();
        const gamesQuery = this.knex
            .select(
                `g.${GameTableId.ID} AS _${GameTableId.ID}`,
                `g.${GameTableId.NAME} AS _data_${GameTableId.NAME}`,
                `g.${GameTableId.DESCRIPTION} AS _data_${GameTableId.DESCRIPTION}`,
                `g.${GameTableId.RELEASEDATE} AS _data_${GameTableId.RELEASEDATE}`,
                `g.${GameTableId.SERIESX} AS _data_${GameTableId.SERIESX}`,
                `g.${GameTableId.XBONE} AS _data_${GameTableId.XBONE}`,
                `g.${GameTableId.WINDOWS} AS _data_${GameTableId.WINDOWS}`,
                `g.${GameTableId.CLOUD} AS _data_${GameTableId.CLOUD}`,
                `g.${GameTableId.GENRE} AS _data_${GameTableId.GENRE}`,
                `g.${GameTableId.CROSSPLATMULTI} AS _data_${GameTableId.CROSSPLATMULTI}`,
                `g.${GameTableId.CROSSPLATCOOP} AS _data_${GameTableId.CROSSPLATCOOP}`,
                `g.${GameTableId.FAVORITE} AS _data_${GameTableId.FAVORITE}`,
                `p.${PlayerTableId.PLAYERTYPE} AS _playerInfo__${PlayerTableId.PLAYERTYPE}`,
                `p.${PlayerTableId.MINPLAYERS} AS _playerInfo__${PlayerTableId.MINPLAYERS}`,
                `p.${PlayerTableId.MAXPLAYERS} AS _playerInfo__${PlayerTableId.MAXPLAYERS}`,
            )
            .from(`${this.GAMEDATA_TABLE_NAME} AS g`)
            .leftJoin(
                `${this.PLAYER_COUNT_TABLE_NAME} AS p`,
                `g.${GameTableId.ID}`,
                `p.${PlayerTableId.ID}`,
            );

        // Allows for properly filtering by player type
        // Can not currently filter min and max players
        if (filters?.PLAYERTYPE) {
            const innerQuery = this.knex
                .select(PlayerTableId.ID)
                .from(this.PLAYER_COUNT_TABLE_NAME)
                .where(PlayerTableId.PLAYERTYPE, filters.PLAYERTYPE);

            gamesQuery
                .leftJoin(
                    innerQuery.as('pt'),
                    `pt.${PlayerTableId.ID}`,
                    `g.${GameTableId.ID}`,
                )
                .whereNotNull(`pt.${PlayerTableId.ID}`);
        }
        for (const [key, value] of Object.entries(filters)) {
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
        const gameData = { id: game.id, ...game.data };
        await this.knex(this.GAMEDATA_TABLE_NAME)
            .where(GameTableId.ID, game.id)
            .update({ ...gameData });
        await game.playerInfo.forEach(async (info) => {
            const playerInfo = { id: game.id, ...info };
            await this.knex(this.PLAYER_COUNT_TABLE_NAME)
                .where(PlayerTableId.ID, game.id)
                .update({ ...playerInfo });
        });
    }

    async removeGameAsync(id: string) {
        await this.verifyTablesAsync();
        await this.knex(this.GAMEDATA_TABLE_NAME)
            .where(GameTableId.ID, id)
            .del();
        await this.knex(this.PLAYER_COUNT_TABLE_NAME)
            .where(PlayerTableId.ID, id)
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
        const gameTableExists = await this.knex.schema.hasTable(
            this.GAMEDATA_TABLE_NAME,
        );
        if (!gameTableExists) {
            await this.knex.schema.createTable(
                this.GAMEDATA_TABLE_NAME,
                (table) => {
                    table.string(GameTableId.ID);
                    table.string(GameTableId.NAME);
                    table.string(GameTableId.DESCRIPTION, 2500);
                    table.string(GameTableId.RELEASEDATE);
                    table.boolean(GameTableId.SERIESX);
                    table.boolean(GameTableId.XBONE);
                    table.boolean(GameTableId.WINDOWS);
                    table.boolean(GameTableId.CLOUD);
                    table.string(GameTableId.GENRE);
                    table.boolean(GameTableId.CROSSPLATMULTI);
                    table.boolean(GameTableId.CROSSPLATCOOP);
                    table.boolean(GameTableId.FAVORITE);
                },
            );
        }
        const playerTypeTableExists = await this.knex.schema.hasTable(
            this.PLAYER_COUNT_TABLE_NAME,
        );
        if (!playerTypeTableExists) {
            await this.knex.schema.createTable(
                this.PLAYER_COUNT_TABLE_NAME,
                (table) => {
                    table.string(PlayerTableId.ID);
                    table.string(PlayerTableId.PLAYERTYPE);
                    table.string(PlayerTableId.MINPLAYERS);
                    table.string(PlayerTableId.MAXPLAYERS);
                },
            );
        }
    }

    //#endregion
}
