import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import { GamedataModule } from './gamedata/gamedata.module';

@Module({
    imports: [
        GamedataModule,
        KnexModule.forRootAsync({
            useFactory: () => ({
                config: {
                    client: 'postgresql',
                    version: '15.2',
                    connection:
                        process.env.DATABASE_URL ||
                        'postgres://user:password@localhost:5432/gamedb',
                },
            }),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
