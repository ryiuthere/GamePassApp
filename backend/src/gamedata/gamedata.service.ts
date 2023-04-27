import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { Game, GamePlayerInfo } from './gamedata.model';
import { KnexNest } from 'knexnest';

export class GamedataService {
    private readonly GAMEDATA_TABLE_NAME = 'gamedata-info';
    private readonly PLAYER_COUNT_TABLE_NAME = 'gamedata-player-count-info';

    constructor(
        @InjectConnection() private readonly knex: Knex,
        @InjectConnection() private readonly KnexNest: KnexNest,
    ) {}

    async addGameAsync(game: Game) {
        await this.verifyTablesAsync();
        await this.knex(this.GAMEDATA_TABLE_NAME).insert(game.data);
        await game.playerInfo.forEach(async (info) => {
            await this.knex(this.PLAYER_COUNT_TABLE_NAME).insert(info);
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
        return await this.KnexNest<Game>(games);
    }

    async updateGameAsync(game: Game) {
        await this.verifyTablesAsync();
        const query = this.GamesQuery().where(this.TableId.ID, game.data.id);
        query.update(game);
        await query;
    }

    async removeGameAsync(id: string) {
        await this.verifyTablesAsync();
        await this.GamesQuery().where(this.TableId.ID, id).del();
    }

    //#region Private functionality

    private readonly GamesQuery = () =>
        this.knex
            .select(
                `gameInfo.${this.TableId.ID} AS _data_${this.TableId.ID}`,
                `gameInfo.${this.TableId.NAME} AS _data_${this.TableId.NAME}`,
                `gameInfo.${this.TableId.RELEASEDATE} AS _data_${this.TableId.RELEASEDATE}`,
                `gameInfo.${this.TableId.SERIESX} AS _data_${this.TableId.SERIESX}`,
                `gameInfo.${this.TableId.XBONE} AS _data_${this.TableId.XBONE}`,
                `gameInfo.${this.TableId.WINDOWS} AS _data_${this.TableId.WINDOWS}`,
                `gameInfo.${this.TableId.CLOUD} AS _data_${this.TableId.CLOUD}`,
                `gameInfo.${this.TableId.GENRE} AS _data_${this.TableId.GENRE}`,
                `gameInfo.${this.TableId.CROSSPLATMULTI} AS _data_${this.TableId.CROSSPLATMULTI}`,
                `gameInfo.${this.TableId.CROSSPLATCOOP} AS _data_${this.TableId.CROSSPLATCOOP}`,
                `playerInfo.${this.TableId.PLAYERTYPE} AS _playerInfo__${this.TableId.PLAYERTYPE}`,
                `playerInfo.${this.TableId.MINPLAYERS} AS _playerInfo__${this.TableId.MINPLAYERS}`,
                `playerInfo.${this.TableId.MAXPLAYERS} AS _playerInfo__${this.TableId.MAXPLAYERS}`,
            )
            .from(`${this.GAMEDATA_TABLE_NAME} AS gameInfo`)
            .leftJoin(
                `${this.PLAYER_COUNT_TABLE_NAME} AS playerInfo`,
                `gameInfo.${this.TableId.ID}`,
                `playerInfo.${this.TableId.ID}`,
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
                function (table) {
                    table.string(this.TableId.ID);
                    table.string(this.TableId.NAME);
                    table.date(this.TableId.RELEASEDATE);
                    table.boolean(this.TableId.SERIESX);
                    table.boolean(this.TableId.XBONE);
                    table.boolean(this.TableId.WINDOWS);
                    table.boolean(this.TableId.CLOUD);
                    table.string(this.TableId.GENRE);
                    table.boolean(this.TableId.CROSSPLATMULTIPLAYER);
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
                function (table) {
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
