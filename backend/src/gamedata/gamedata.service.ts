import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { Game } from './gamedata.model';

const knexNest = require('knexnest');

enum GameTableId {
    id = 'id',
    name = 'name',
    description = 'desc',
    release_date = 'release_date',
    series_x = 'series_x',
    xbone = 'xbone',
    windows = 'windows',
    cloud = 'cloud',
    genre = 'genre',
    crossplat_multi = 'crossplat_multi',
    crossplat_coop = 'crossplat_coop',
    favorite = 'favorite',
}

enum PlayerTableId {
    id = 'id',
    player_type = 'player_type',
    min_players = 'min_players',
    max_players = 'max_players',
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
        await game.player_info.forEach(async (info) => {
            const playerInfo = { id: game.id, ...info };
            await this.knex(this.PLAYER_COUNT_TABLE_NAME).insert(playerInfo);
        });
    }

    async getGamesAsync(filters): Promise<Game[]> {
        await this.verifyTablesAsync();
        const gamesQuery = this.knex
            .select(
                `g.${GameTableId.id} AS _${GameTableId.id}`,
                `g.${GameTableId.name} AS _data_${GameTableId.name}`,
                `g.${GameTableId.description} AS _data_${GameTableId.description}`,
                `g.${GameTableId.release_date} AS _data_${GameTableId.release_date}`,
                `g.${GameTableId.series_x} AS _data_${GameTableId.series_x}`,
                `g.${GameTableId.xbone} AS _data_${GameTableId.xbone}`,
                `g.${GameTableId.windows} AS _data_${GameTableId.windows}`,
                `g.${GameTableId.cloud} AS _data_${GameTableId.cloud}`,
                `g.${GameTableId.genre} AS _data_${GameTableId.genre}`,
                `g.${GameTableId.crossplat_multi} AS _data_${GameTableId.crossplat_multi}`,
                `g.${GameTableId.crossplat_coop} AS _data_${GameTableId.crossplat_coop}`,
                `g.${GameTableId.favorite} AS _data_${GameTableId.favorite}`,
                `p.${PlayerTableId.player_type} AS _${'player_info'}__${
                    PlayerTableId.player_type
                }`,
                `p.${PlayerTableId.min_players} AS _${'player_info'}__${
                    PlayerTableId.min_players
                }`,
                `p.${PlayerTableId.max_players} AS _${'player_info'}__${
                    PlayerTableId.max_players
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
        if (filters?.player_type) {
            const innerQuery = this.knex
                .select(PlayerTableId.id)
                .from(this.PLAYER_COUNT_TABLE_NAME)
                .where(PlayerTableId.player_type, filters.player_type);

            gamesQuery
                .leftJoin(
                    innerQuery.as('pt'),
                    `pt.${PlayerTableId.id}`,
                    `g.${GameTableId.id}`,
                )
                .whereNotNull(`pt.${PlayerTableId.id}`);
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
            .where(GameTableId.id, game.id)
            .update({ ...gameData });
        await game.player_info.forEach(async (info) => {
            const playerInfo = { id: game.id, ...info };
            await this.knex(this.PLAYER_COUNT_TABLE_NAME)
                .where(PlayerTableId.id, game.id)
                .update({ ...playerInfo });
        });
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
        const gameTableExists = await this.knex.schema.hasTable(
            this.GAMEDATA_TABLE_NAME,
        );
        if (!gameTableExists) {
            await this.knex.schema.createTable(
                this.GAMEDATA_TABLE_NAME,
                (table) => {
                    table.string(GameTableId.id);
                    table.string(GameTableId.name);
                    table.string(GameTableId.description, 2500);
                    table.string(GameTableId.release_date);
                    table.boolean(GameTableId.series_x);
                    table.boolean(GameTableId.xbone);
                    table.boolean(GameTableId.windows);
                    table.boolean(GameTableId.cloud);
                    table.string(GameTableId.genre);
                    table.boolean(GameTableId.crossplat_multi);
                    table.boolean(GameTableId.crossplat_coop);
                    table.boolean(GameTableId.favorite);
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
                    table.string(PlayerTableId.id);
                    table.string(PlayerTableId.player_type);
                    table.string(PlayerTableId.min_players);
                    table.string(PlayerTableId.max_players);
                },
            );
        }
    }

    //#endregion
}
