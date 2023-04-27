import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';

@Module({
    imports: [
        KnexModule.forRootAsync({
            useFactory: () => ({
                config: {
                    client: 'postgresql',
                    version: '15.2',
                    connection: {
                        host: 'localhost',
                        user: 'postgres',
                        password: 'test',
                        database: 'postgres',
                    },
                },
            }),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
