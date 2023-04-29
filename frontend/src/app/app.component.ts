import { Component, ViewChild } from '@angular/core';
import { GamedataService } from './gamedata/gamedata.service';
import { Game, GamePlayerInfo } from './gamedata/gamedata.model';
import { take } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    games: Game[];
    selectedGame: Game | null;
    @ViewChild('sidenav', { read: MatSidenav }) sideNav!: MatSidenav;
    constructor(private gamedataService: GamedataService) {
        this.games = [];
        this.selectedGame = null;
    }
    title = 'frontend';

    ngOnInit() {
        this.getAllGames();
    }

    getGameId(game: Game) {
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

    updateSelectedGame(game: Game | null) {
        if (
            this.selectedGame !== null &&
            game !== null &&
            this.selectedGame.id === game.id
        ) {
            this.sideNav.toggle();
            return;
        }

        this.selectedGame = game;
        if (this.selectedGame) {
            this.sideNav.open();
        } else {
            this.sideNav.close();
        }
    }

    getFormattedInfo(info: GamePlayerInfo) {
        var playerCount =
            info.minPlayers == info.maxPlayers
                ? info.maxPlayers == 1
                    ? ''
                    : ` ${info.minPlayers} players`
                : ` ${info.minPlayers}-${info.maxPlayers} players`;
        return `${info.playerType}${playerCount}`;
    }
}
