import { Component, ViewChild } from '@angular/core';
import { GamedataService } from './gamedata/gamedata.service';
import { Game, GamePlayerInfo } from './gamedata/gamedata.model';
import { take } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { CreateGameDialogComponent } from './create-game/create-game-dialog.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    games: Game[];
    selectedGame: Game | null;
    @ViewChild('sidenav', { read: MatSidenav })
    sideNav!: MatSidenav;
    constructor(
        public dialog: MatDialog,
        private gamedataService: GamedataService
    ) {
        this.games = [];
        this.selectedGame = null;
    }

    ngOnInit() {
        this.getAllGames();
    }

    getAllGames() {
        this.gamedataService
            .getGames()
            .pipe(take(1))
            .subscribe((data) => {
                this.games = data as Game[];
            });
    }

    getGames(filters: { filterName: string; value: string }[]) {
        this.gamedataService
            .getGames(filters)
            .pipe(take(1))
            .subscribe((data) => (this.games = data as Game[]));
    }

    addGame(game: Game) {
        this.gamedataService.addGame(game).pipe(take(1)).subscribe();
    }

    openCreateGameDialog() {
        const dialogRef = this.dialog.open(CreateGameDialogComponent);

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((result) => {
                if (result) {
                    this.addGame(result);
                    this.games.push(result);
                }
            });
    }

    toggleFavorite(game: Game | null) {
        if (!game) {
            return;
        }

        game.data.favorite = !game.data.favorite;
        this.gamedataService.updateGame(game).pipe(take(1)).subscribe();
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
