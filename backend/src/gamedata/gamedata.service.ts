import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { Game } from './gamedata.model';

const knexNest = require('knexnest');

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

    async getGamesAsync(
        filters?: { filterName: string; value: string }[],
    ): Promise<Game[]> {
        await this.verifyTablesAsync();
        const games = this.GamesQuery();
        if (filters) {
            filters.forEach((filter) => {
                games.where(filter.filterName, filter.value);
            });
        }
        return knexNest(games);
    }

    async updateGameAsync(game: Game) {
        await this.verifyTablesAsync();
        const query = this.GamesQuery().where(this.TableId.ID, game.id);
        query.update(game);
        await query;
    }

    async removeGameAsync(id: string) {
        await this.verifyTablesAsync();
        await this.knex(this.GAMEDATA_TABLE_NAME)
            .where(this.TableId.ID, id)
            .del();
        await this.knex(this.PLAYER_COUNT_TABLE_NAME)
            .where(this.TableId.ID, id)
            .del();
    }

    //#region Private functionality

    private readonly GamesQuery = () =>
        this.knex
            .select(
                `g.${this.TableId.ID} AS _${this.TableId.ID}`,
                `g.${this.TableId.NAME} AS _data_${this.TableId.NAME}`,
                `g.${this.TableId.RELEASEDATE} AS _data_${this.TableId.RELEASEDATE}`,
                `g.${this.TableId.SERIESX} AS _data_${this.TableId.SERIESX}`,
                `g.${this.TableId.XBONE} AS _data_${this.TableId.XBONE}`,
                `g.${this.TableId.WINDOWS} AS _data_${this.TableId.WINDOWS}`,
                `g.${this.TableId.CLOUD} AS _data_${this.TableId.CLOUD}`,
                `g.${this.TableId.GENRE} AS _data_${this.TableId.GENRE}`,
                `g.${this.TableId.CROSSPLATMULTI} AS _data_${this.TableId.CROSSPLATMULTI}`,
                `g.${this.TableId.CROSSPLATCOOP} AS _data_${this.TableId.CROSSPLATCOOP}`,
                `p.${this.TableId.PLAYERTYPE} AS _playerInfo__${this.TableId.PLAYERTYPE}`,
                `p.${this.TableId.MINPLAYERS} AS _playerInfo__${this.TableId.MINPLAYERS}`,
                `p.${this.TableId.MAXPLAYERS} AS _playerInfo__${this.TableId.MAXPLAYERS}`,
            )
            .as('x')
            .from(`${this.GAMEDATA_TABLE_NAME} AS g`)
            .leftJoin(
                `${this.PLAYER_COUNT_TABLE_NAME} AS p`,
                `g.${this.TableId.ID}`,
                `p.${this.TableId.ID}`,
            );

    // Table column values
    private readonly TableId = {
        ID: 'id',
        NAME: 'name',
        RELEASEDATE: 'releaseDate',
        SERIESX: 'seriesX',
        XBONE: 'xbOne',
        WINDOWS: 'windows',
        CLOUD: 'cloud',
        GENRE: 'genre',
        CROSSPLATMULTI: 'crossplatMultiplayer',
        CROSSPLATCOOP: 'crossplatCoop',
        PLAYERTYPE: 'playerType',
        MINPLAYERS: 'minPlayers',
        MAXPLAYERS: 'maxPlayers',
    };

    // Values for player type
    private readonly PlayerType = {
        SINGLE: 'singlePlayer',
        LOCALMULTIPLAYER: 'localMultiplayer',
        LOCALCOOP: 'localCoop',
        ONLINEMULTIPLAYER: 'onlineMultiplayer',
        ONLINECOOP: 'onlineCoop',
    };

    // Used to verify tables exist and create them if not
    private async verifyTablesAsync() {
        const gameTableExists = await this.knex.schema.hasTable(
            this.GAMEDATA_TABLE_NAME,
        );
        if (!gameTableExists) {
            await this.knex.schema.createTable(
                this.GAMEDATA_TABLE_NAME,
                (table) => {
                    table.string(this.TableId.ID);
                    table.string(this.TableId.NAME);
                    table.string(this.TableId.RELEASEDATE);
                    table.boolean(this.TableId.SERIESX);
                    table.boolean(this.TableId.XBONE);
                    table.boolean(this.TableId.WINDOWS);
                    table.boolean(this.TableId.CLOUD);
                    table.string(this.TableId.GENRE);
                    table.boolean(this.TableId.CROSSPLATMULTI);
                    table.boolean(this.TableId.CROSSPLATCOOP);
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
                    table.string(this.TableId.ID);
                    table.string(this.TableId.PLAYERTYPE);
                    table.string(this.TableId.MINPLAYERS);
                    table.string(this.TableId.MAXPLAYERS);
                },
            );
        }
    }

    //#endregion
}
