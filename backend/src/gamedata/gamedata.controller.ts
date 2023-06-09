import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { Game } from './gamedata.model';
import { GamedataService } from './gamedata.service';

@Controller('gamedata')
export class GamedataController {
    constructor(private readonly gamedataService: GamedataService) {}

    @Post()
    async addGame(@Body() game: Game) {
        await this.gamedataService.addGameAsync(game);
    }

    @Get()
    async getGames(@Query() filters) {
        return await this.gamedataService.getGamesAsync(filters);
    }

    @Patch()
    async updateGame(@Body() game: Game) {
        await this.gamedataService.updateGameAsync(game);
    }

    @Delete(':id')
    async removeGame(@Param('id') id: string) {
        await this.gamedataService.removeGameAsync(id);
    }
}
