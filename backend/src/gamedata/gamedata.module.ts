import { Module } from '@nestjs/common';
import { GamedataController } from './gamedata.controller';
import { GamedataService } from './gamedata.service';

@Module({
    controllers: [GamedataController],
    providers: [GamedataService],
})
export class GamedataModule {}
