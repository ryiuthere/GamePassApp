import { Component } from '@angular/core';
import { GamedataService } from './gamedata/gamedata.service';
import { Game } from './gamedata/gamedata.model';
import { take } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    games: Game[];
    constructor(private gamedataService: GamedataService) {
        this.games = [];
    }
    title = 'frontend';

    ngOnInit() {
        this.getAllGames();
    }

    getGameId(index: number, game: Game) {
        return game.id;
    }

    getAllGames() {
        this.gamedataService
            .getAllGames()
            .pipe(take(1))
            .subscribe((data) => {
                this.games = data as Game[];
            });
    }
}
